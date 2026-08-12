import { createClient } from "redis";

// redis クライアントは Node.js API に依存するため Node ランタイムで実行する
export const runtime = "nodejs";

/**
 * YAMAP の公開 API。`meta.total_count` に公開済み活動日記の総数が入る。
 *
 * プロフィールページの件数はクライアント側描画のため HTML には含まれない。
 * この API を直接叩くことでブラウザを介さずに件数を取得できる。
 */
const YAMAP_ACTIVITIES_API =
  "https://api.yamap.com/v3/users/1027860/activities";
const REDIS_KEY = "mountains:report_count";
const REDIS_TTL = 24 * 60 * 60; // 24時間
/** YAMAP API の応答待ち上限（ミリ秒） */
const FETCH_TIMEOUT_MS = 10_000;

type CachePayload = {
  count: number;
};

/** YAMAP API レスポンスのうち利用するフィールド */
type YamapActivitiesResponse = {
  meta?: {
    total_count?: unknown;
  };
};

type RedisClient = ReturnType<typeof createClient>;

/** Redis 接続を閉じる。切断の失敗は無視してよい。 */
async function quitQuietly(client: RedisClient): Promise<void> {
  try {
    await client.quit();
  } catch {
    // disconnect failure is ignorable
  }
}

/**
 * YAMAP の公開 API から活動日記の件数を取得する。
 *
 * @returns 公開済み活動日記の件数
 * @throws レスポンスが異常、または件数が数値として取り出せない場合
 */
async function fetchReportCount(): Promise<number> {
  const response = await fetch(YAMAP_ACTIVITIES_API, {
    // 件数のキャッシュは Redis 側で持つため、fetch 自体はキャッシュしない
    cache: "no-store",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`YAMAP API error: ${response.status}`);
  }

  const { meta }: YamapActivitiesResponse = await response.json();
  const count = meta?.total_count;
  if (typeof count !== "number" || !Number.isFinite(count)) {
    throw new Error("Failed to parse report count as number");
  }

  return count;
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

/**
 * 登山レポート件数を取得する。
 *
 * まず Redis キャッシュを参照し、有効な値があればそれを返す。
 * キャッシュミスまたは Redis エラー時は YAMAP API から取得し、
 * 取得成功時は TTL 付きで Redis に保存する。
 */
async function resolveReportCount(): Promise<number> {
  const redisUrl = process.env.REDIS_URL;

  // REDIS_URL が未設定/空の場合は Redis を使わず直接 YAMAP API から取得する
  if (!redisUrl) {
    return fetchReportCount();
  }

  let redisClient: RedisClient | undefined;
  try {
    redisClient = createClient({ url: redisUrl });
    await redisClient.connect();

    const cachedCount = await readCountFromCache(redisClient);
    if (cachedCount !== null) {
      await quitQuietly(redisClient);
      return cachedCount;
    }
  } catch (e) {
    console.error("[mountains] Redis read error, falling back to API:", e);
    if (redisClient) {
      await quitQuietly(redisClient);
    }
    return fetchReportCount();
  }

  // YAMAP API 取得 → キャッシュ保存（例外時も Redis 接続を必ず閉じる）
  try {
    const count = await fetchReportCount();

    try {
      const payload: CachePayload = { count };
      await redisClient.set(REDIS_KEY, JSON.stringify(payload), {
        EX: REDIS_TTL,
      });
    } catch (e) {
      console.error("[mountains] Redis write error (result not cached):", e);
    }

    return count;
  } finally {
    await quitQuietly(redisClient);
  }
}

/**
 * 登山レポート件数を JSON で返す API エンドポイント。
 *
 * 成功時は `{ count }`、失敗時は `{ error }` を返す。
 */
export async function GET() {
  try {
    const count = await resolveReportCount();
    return Response.json({ count });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
