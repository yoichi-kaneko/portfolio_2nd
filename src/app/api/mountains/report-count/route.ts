import * as cheerio from "cheerio";
import { createClient } from "redis";
import { launchMountainsBrowser } from "@/lib/server/mountainsBrowser";

// Vercelのタイムアウト制限を回避するため（Hobbyプランは最大10秒、Proは最大30秒）
export const maxDuration = 30;
export const runtime = "nodejs";

const TARGET_URL = "https://yamap.com/users/1027860";
/** YAMAP プロフィール上のレポート件数が載る要素（Playwright / Cheerio 双方で使用） */
const REPORT_COUNT_SELECTOR =
  "ul.markuplint-ignore-permitted-contents [role='status']";
const REDIS_KEY = "mountains:report_count";
const REDIS_LOCK_KEY = `${REDIS_KEY}:lock`;
const REDIS_TTL = 24 * 60 * 60; // 24時間
/** スクレイプ中の多重起動・他インスタンスとの競合を抑える短期ロック（秒） */
const REDIS_LOCK_TTL_SEC = 45;
/** ロック未取得時にキャッシュ書き込みを待つ上限（ミリ秒） */
const CACHE_POLL_MAX_MS = 28_000;
const CACHE_POLL_INTERVAL_MS = 250;

type CachePayload = {
  count: number;
};

type RedisClient = ReturnType<typeof createClient>;

/** 同一 Node インスタンス上の同時キャッシュミスでブラウザを複数起動しない */
let inFlightScrape: Promise<number> | null = null;

/**
 * YAMAP ページから抜き出した件数テキストを数値に変換する。
 *
 * @param raw 表示用文字列（数字以外を含んでも可）
 * @returns パースした件数
 * @throws 数字が抽出できない、または有限数でない場合
 */
function parseReportCount(raw: string): number {
  const digitsOnly = raw.replace(/[^\d]/g, "");
  if (!digitsOnly) {
    throw new Error("Failed to parse report count as number");
  }

  const parsed = Number(digitsOnly);
  if (!Number.isFinite(parsed)) {
    throw new Error("Failed to parse report count as number");
  }

  return parsed;
}

function parseCachedPayload(cached: string): number | null {
  try {
    const payload: CachePayload = JSON.parse(cached);
    if (!Number.isFinite(payload.count)) {
      return null;
    }
    return payload.count;
  } catch {
    return null;
  }
}

async function readCountFromCache(client: RedisClient): Promise<number | null> {
  const cached = await client.get(REDIS_KEY);
  if (!cached) {
    return null;
  }
  return parseCachedPayload(cached);
}

async function tryAcquireScrapeLock(client: RedisClient): Promise<boolean> {
  const reply = await client.set(REDIS_LOCK_KEY, "1", {
    NX: true,
    EX: REDIS_LOCK_TTL_SEC,
  });
  return reply === "OK";
}

async function pollCachedCount(redisUrl: string): Promise<number> {
  const pollClient = createClient({ url: redisUrl });
  await pollClient.connect();
  try {
    const deadline = Date.now() + CACHE_POLL_MAX_MS;
    while (Date.now() < deadline) {
      const count = await readCountFromCache(pollClient);
      if (count !== null) {
        return count;
      }
      await new Promise((r) => setTimeout(r, CACHE_POLL_INTERVAL_MS));
    }
    throw new Error("Timed out waiting for mountains report count cache");
  } finally {
    try {
      await pollClient.quit();
    } catch {
      // disconnect failure is ignorable
    }
  }
}

/**
 * Playwright でページを取得し件数をパースする（Redis には書かない）。
 */
async function scrapeReportCountFromPage(): Promise<number> {
  const browser = await launchMountainsBrowser();
  try {
    const page = await browser.newPage();

    await page.goto(TARGET_URL, {
      waitUntil: "domcontentloaded",
      timeout: 10_000,
    });
    await page.waitForSelector(REPORT_COUNT_SELECTOR, { timeout: 5_000 });

    const html = await page.content();
    const $ = cheerio.load(html);
    const countText = $(REPORT_COUNT_SELECTOR).first().text();
    return parseReportCount(countText);
  } finally {
    await browser.close();
  }
}

/**
 * Redis 利用時: ロック取得済みクライアントでキャッシュ書込・ロック解放まで行う。
 */
async function persistCountAndReleaseLock(
  lockClient: RedisClient,
  count: number,
): Promise<void> {
  try {
    const payload: CachePayload = { count };
    await lockClient.set(REDIS_KEY, JSON.stringify(payload), {
      EX: REDIS_TTL,
    });
  } catch (e) {
    console.error("[mountains] Redis write error (result not cached):", e);
  }
  try {
    await lockClient.del(REDIS_LOCK_KEY);
  } catch {
    // lock release failure is ignorable (TTL で失効する)
  }
  try {
    await lockClient.quit();
  } catch {
    // disconnect failure is ignorable
  }
}

/**
 * キャッシュミス時に件数を解決する（インスタンス内 single-flight、Redis 時は分散ロック）。
 */
async function resolveCountAfterCacheMiss(
  redisUrl: string | undefined,
): Promise<number> {
  if (!redisUrl) {
    if (inFlightScrape) {
      return inFlightScrape;
    }
    inFlightScrape = (async () => {
      try {
        return await scrapeReportCountFromPage();
      } finally {
        inFlightScrape = null;
      }
    })();
    return inFlightScrape;
  }

  const lockClient = createClient({ url: redisUrl });
  await lockClient.connect();

  try {
    const locked = await tryAcquireScrapeLock(lockClient);
    if (!locked) {
      try {
        await lockClient.quit();
      } catch {
        // disconnect failure is ignorable
      }
      return pollCachedCount(redisUrl);
    }

    if (inFlightScrape) {
      try {
        await lockClient.del(REDIS_LOCK_KEY);
      } catch {
        // ignore
      }
      try {
        await lockClient.quit();
      } catch {
        // ignore
      }
      return inFlightScrape;
    }

    inFlightScrape = (async () => {
      try {
        const count = await scrapeReportCountFromPage();
        await persistCountAndReleaseLock(lockClient, count);
        return count;
      } catch (e) {
        try {
          await lockClient.del(REDIS_LOCK_KEY);
        } catch {
          // ignore
        }
        try {
          await lockClient.quit();
        } catch {
          // ignore
        }
        throw e;
      } finally {
        inFlightScrape = null;
      }
    })();

    return inFlightScrape;
  } catch (e) {
    try {
      await lockClient.quit();
    } catch {
      // ignore
    }
    throw e;
  }
}

/**
 * 登山レポート件数を JSON で返す API エンドポイント。
 *
 * 成功時は `{ count }`、失敗時は `{ error }` を返す。
 */
export async function GET() {
  const redisUrl = process.env.REDIS_URL;

  try {
    if (redisUrl) {
      let redisClient: RedisClient | undefined;
      try {
        redisClient = createClient({ url: redisUrl });
        await redisClient.connect();

        const cachedCount = await readCountFromCache(redisClient);
        if (cachedCount !== null) {
          try {
            await redisClient.quit();
          } catch {
            // disconnect failure is ignorable
          }
          return Response.json({ count: cachedCount });
        }
        try {
          await redisClient.quit();
        } catch {
          // disconnect failure is ignorable
        }
      } catch (e) {
        console.error(
          "[mountains] Redis read error, falling back to scrape:",
          e,
        );
        try {
          await redisClient?.quit();
        } catch {
          // disconnect failure is ignorable
        }
      }
    }

    const count = await resolveCountAfterCacheMiss(redisUrl);
    return Response.json({ count });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
