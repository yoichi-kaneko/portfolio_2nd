import { fetchLatestImages } from "@/lib/cloudinary";

// Cloudinary SDK は Node.js API に依存するため Node ランタイムで実行する
export const runtime = "nodejs";

/**
 * Cloudinary の指定フォルダから最新画像 3 件の公開 URL を JSON で返す API エンドポイント。
 *
 * 成功時は `{ images }`、失敗時は `{ error }` を返す。
 */
export async function GET() {
  try {
    const images = await fetchLatestImages();
    return Response.json({ images });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
