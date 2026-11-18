import { expect, type Page } from "@playwright/test";

/**
 * `/aoi` を開き、ファーストビューの部屋画像が出てから、利用者が操作を始めた状態にする。
 *
 * 要素の存在確認が目的のため、全画像の load 完了は待たず DOM 構築完了で進める
 * （aoi ページは next/image が多く、dev の都度最適化で load イベントの待機が遅い）。
 *
 * 部屋画像が出たあとに移動量 0 のホイール入力を1回送るのは、LCP の計測を終わらせるため。
 * LCP は利用者の入力があるまで、後から描かれたより大きい要素へ更新され続ける。テストが行う
 * スクロール（`scrollIntoViewIfNeeded` など）はプログラムからのもので入力とみなされないため、
 * 入力なしで画面下の遅延読み込み画像（LINE スタンプの挿絵は部屋画像の約2倍の面積）を表示すると、
 * その画像が LCP になり、Next.js が「loading="eager" を付けよ」と警告する。実利用ではホイールや
 * タップでスクロールした時点で計測が終わるため、この警告は起きない。
 * 移動量 0 なのでスクロール位置は変わらない。
 */
export async function gotoAoi(page: Page, query = ""): Promise<void> {
  await page.goto(`/aoi${query}`, { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("img", { name: "碧衣のプライベートルーム", exact: true }),
  ).toBeVisible({ timeout: 30000 });
  await page.mouse.wheel(0, 0);
}
