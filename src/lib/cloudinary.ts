import { v2 as cloudinary } from "cloudinary";
import { createClient } from "redis";

const REDIS_KEY = "cloudinary:latest_images";
const REDIS_TTL = 12 * 60 * 60; // 12時間
const CACHE_TTL_MS = REDIS_TTL * 1000;

/** フォルダ内から取得する最新データの件数 */
const MAX_RESULTS = 3;
/** プレビュー（縮小）画像の縦幅（px） */
const PREVIEW_HEIGHT = 384;

type CachePayload = {
  cachedAt: number; // 取得時刻（epoch ミリ秒）
  result: CloudinaryImage[];
};

/** Cloudinary Search API のレスポンスから利用するフィールド */
type CloudinaryResource = {
  public_id: string;
  format: string;
};

export type CloudinaryImage = {
  // 画像オリジナルサイズの公開 URL
  originalUrl: string;
  // 縦幅を PREVIEW_HEIGHT に縮小した公開 URL
  previewUrl: string;
};

/**
 * Cloudinary SDK に認証情報を設定する。
 *
 * @throws `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` のいずれか未設定時
 */
function configureCloudinary(): void {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are not set");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

/**
 * Cloudinary Admin(Search) API から `CLOUDINARY_IMAGE_ASSET_FOLDER` 配下の
 * 最新 `MAX_RESULTS` 件を取得し、オリジナル/プレビューの公開 URL を組み立てて返す。
 *
 * @returns 取得順（新しい順）の画像 URL 配列
 * @throws `CLOUDINARY_IMAGE_ASSET_FOLDER` 未設定時、または認証情報未設定時
 */
async function fetchFromCloudinary(): Promise<CloudinaryImage[]> {
  const folder = process.env.CLOUDINARY_IMAGE_ASSET_FOLDER;
  if (!folder) {
    throw new Error("CLOUDINARY_IMAGE_ASSET_FOLDER is not set");
  }

  configureCloudinary();

  const { resources } = (await cloudinary.search
    .expression(`asset_folder="${folder}"`)
    .sort_by("created_at", "desc")
    .max_results(MAX_RESULTS)
    .execute()) as { resources?: CloudinaryResource[] };

  return (resources ?? []).map(({ public_id, format }) => {
    // オリジナルサイズの公開 URL
    const originalUrl = cloudinary.url(public_id, {
      secure: true,
      format,
    });
    // 縦幅を PREVIEW_HEIGHT に縮小（c_scale, h_<PREVIEW_HEIGHT>）した公開 URL
    const previewUrl = cloudinary.url(public_id, {
      secure: true,
      format,
      height: PREVIEW_HEIGHT,
      crop: "scale",
    });
    return { originalUrl, previewUrl };
  });
}

/**
 * フォルダ配下の最新画像 URL を取得する。
 *
 * まず Redis キャッシュを参照し、取得から 12 時間以内のキャッシュがあればそれを返す。
 * キャッシュミスまたは Redis エラー時は Cloudinary から取得し、
 * 取得成功時は TTL 付きで Redis に保存する。
 *
 * @returns 取得順（新しい順）の画像 URL 配列
 * @throws 認証情報 / フォルダ設定が未設定時
 */
export async function fetchLatestImages(): Promise<CloudinaryImage[]> {
  const redisUrl = process.env.REDIS_URL;

  // REDIS_URL が未設定/空の場合は Redis を使わず直接 Cloudinary から取得する
  if (!redisUrl) {
    return fetchFromCloudinary();
  }

  // Redis キャッシュを試みる
  let redisClient;
  try {
    redisClient = createClient({ url: redisUrl });
    await redisClient.connect();

    const cached = await redisClient.get(REDIS_KEY);
    if (cached) {
      const payload: CachePayload = JSON.parse(cached);
      if (Date.now() - payload.cachedAt < CACHE_TTL_MS) {
        await redisClient.quit();
        return payload.result;
      }
    }
  } catch (err) {
    console.error("[cloudinary] Redis error, falling back to Cloudinary:", err);
    try {
      await redisClient?.quit();
    } catch {
      // disconnect failure is ignorable
    }
    return fetchFromCloudinary();
  }

  // Cloudinary 取得 → キャッシュ保存
  const result = await fetchFromCloudinary();

  try {
    const payload: CachePayload = { cachedAt: Date.now(), result };
    await redisClient.set(REDIS_KEY, JSON.stringify(payload), {
      EX: REDIS_TTL,
    });
  } catch (err) {
    console.error("[cloudinary] Redis write error (result not cached):", err);
  } finally {
    await redisClient.quit();
  }

  return result;
}
