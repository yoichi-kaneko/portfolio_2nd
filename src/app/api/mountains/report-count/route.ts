import * as cheerio from "cheerio";
import { launchMountainsBrowser } from "@/lib/server/mountainsBrowser";

// Vercelのタイムアウト制限を回避するため（Hobbyプランは最大10秒、Proは最大30秒）
export const maxDuration = 30;
export const runtime = "nodejs";

const TARGET_URL = "https://yamap.com/users/1027860";

/**
 * 登山レポート件数を JSON で返す API エンドポイント。
 *
 * 成功時は `{ count }`、失敗時は `{ error }` を返す。
 */
export async function GET() {
  let browser: Awaited<ReturnType<typeof launchMountainsBrowser>> | undefined;

  try {
    browser = await launchMountainsBrowser();
    const page = await browser.newPage();
  
    await page.goto(TARGET_URL, { waitUntil: "networkidle" });

    const html = await page.content();

    const $ = cheerio.load(html);
    const count = $("ul.markuplint-ignore-permitted-contents").find("[role='status']:first").text();

    return Response.json({ count: count });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  } finally {
    await browser?.close();
  }
}
