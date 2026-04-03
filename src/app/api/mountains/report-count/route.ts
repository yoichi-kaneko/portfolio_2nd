import * as cheerio from "cheerio";
import { createClient } from "redis";
import { launchMountainsBrowser } from "@/lib/server/mountainsBrowser";

// Vercelのタイムアウト制限を回避するため（Hobbyプランは最大10秒、Proは最大30秒）
export const maxDuration = 30;
export const runtime = "nodejs";

const TARGET_URL = "https://yamap.com/users/1027860";
const REDIS_KEY = "mountains:report_count";
const REDIS_TTL = 24 * 60 * 60; // 24時間

type CachePayload = {
  count: number;
};

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

/**
 * 登山レポート件数を JSON で返す API エンドポイント。
 *
 * 成功時は `{ count }`、失敗時は `{ error }` を返す。
 */
export async function GET() {
  let browser: Awaited<ReturnType<typeof launchMountainsBrowser>> | undefined;
  let redisClient: ReturnType<typeof createClient> | undefined;

  try {
    try {
      redisClient = createClient({ url: process.env.REDIS_URL });
      await redisClient.connect();

      const cached = await redisClient.get(REDIS_KEY);
      if (cached) {
        const payload: CachePayload = JSON.parse(cached);
        if (!Number.isFinite(payload.count)) {
          throw new Error("Cached report count is invalid");
        }
        return Response.json({ count: payload.count });
      }
    } catch (e) {
      console.error("[mountains] Redis read error, falling back to scrape:", e);
      try {
        await redisClient?.quit();
      } catch {
        // disconnect failure is ignorable
      }
      redisClient = undefined;
    }

    browser = await launchMountainsBrowser();
    const page = await browser.newPage();
  
    await page.goto(TARGET_URL, { waitUntil: "networkidle" });

    const html = await page.content();

    const $ = cheerio.load(html);
    const countText = $("ul.markuplint-ignore-permitted-contents")
      .find("[role='status']:first")
      .text();
    const count = parseReportCount(countText);

    try {
      if (!redisClient) {
        redisClient = createClient({ url: process.env.REDIS_URL });
        await redisClient.connect();
      }

      const payload: CachePayload = { count };
      await redisClient.set(REDIS_KEY, JSON.stringify(payload), { EX: REDIS_TTL });
    } catch (e) {
      console.error("[mountains] Redis write error (result not cached):", e);
    }

    return Response.json({ count });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  } finally {
    await browser?.close();
    try {
      await redisClient?.quit();
    } catch {
      // disconnect failure is ignorable
    }
  }
}
