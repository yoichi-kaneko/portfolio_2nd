import { fetchWeeklyContributions } from "@/lib/github";

/**
 * GitHub 週次コントリビューションを JSON で返す API エンドポイント。
 *
 * 成功時は `{ weekly }`、失敗時は `{ error }` を返す。
 */
export async function GET() {
  try {
    const weekly = await fetchWeeklyContributions();
    return Response.json({ weekly });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
