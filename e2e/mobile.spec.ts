import { test, expect } from "./fixtures";
import { expectImageLoaded, expectInsideViewport } from "./support/assertions";

test("モバイルでホームからAoiへ進み、切符・ナビ・消灯・帰還を操作できる", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-07-15T10:00:00+09:00"));
  await page.goto("/");
  const link = page.getByRole("link", { name: /Project Aoi/ });
  await link.scrollIntoViewIfNeeded();
  await expectInsideViewport(link, page);
  await link.tap();
  await expect(page).toHaveURL(/\/aoi$/);
  await expect(
    page.getByRole("heading", { level: 1, name: /碧衣/ }),
  ).toBeVisible();
  await expect(page.getByText(/^10:00:00$/)).toBeVisible();
  const night = page.getByRole("button", { name: /小夜ゆき/ });
  await night.scrollIntoViewIfNeeded();
  await expectInsideViewport(night, page);
  await night.tap();
  await expect(night).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("臨時ダイヤ")).toBeVisible();
  const navLink = page.getByRole("link", { name: "画像生成", exact: true });
  await navLink.scrollIntoViewIfNeeded();
  await navLink.tap();
  await expect(
    page.locator("#generate-image").getByRole("heading"),
  ).toBeInViewport();
  const toggle = page.getByRole("button", { name: /灯りを落とす/ });
  await expectInsideViewport(toggle, page);
  await toggle.tap();
  const back = page.getByRole("link", { name: ">> ポートフォリオに戻る" });
  await expectInsideViewport(back, page);
  await back.tap();
  await expect(page).toHaveURL(/\/$/);
});

test("モバイルでプロジェクト詳細を表示・閉鎖でき、操作ボタンが隠れない", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "View All" }).tap();
  const dialog = page.getByRole("dialog", { name: "All Projects" });
  const personal = dialog.getByRole("button", {
    name: "個人開発",
    exact: true,
  });
  await personal.scrollIntoViewIfNeeded();
  await personal.tap();
  await dialog.getByTestId("project-card").first().tap();
  const detail = dialog.getByRole("region", { name: "プロジェクト詳細" });
  await expect(detail.getByRole("heading")).toBeInViewport();
  const closeDetail = detail.getByRole("button", { name: "Close detail" });
  await expectInsideViewport(closeDetail, page);
  await closeDetail.tap();
  await expect(detail).toBeHidden();
  const close = dialog.getByRole("button", { name: "Close", exact: true });
  await expectInsideViewport(close, page);
  await close.tap();
  await expect(dialog).toBeHidden();
});

test("モバイルで山を選択し、前後移動とモーダル閉鎖ができる", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Map", exact: true }).tap();
  const dialog = page.getByRole("dialog", { name: "Mountain Map" });
  await dialog.getByTestId("mountain-list").getByRole("button").first().tap();
  const next = dialog.getByRole("button", { name: "次へ →" });
  await expectInsideViewport(next, page);
  await next.tap();
  await expect(
    dialog.getByTestId("mountain-list").getByRole("button").nth(1),
  ).toHaveAttribute("aria-pressed", "true");
  await dialog.getByRole("button", { name: "← 前へ" }).tap();
  await expect(dialog.getByRole("button", { name: "← 前へ" })).toBeDisabled();
  const close = dialog.getByRole("button", { name: "Close" });
  await expectInsideViewport(close, page);
  await close.tap();
  await expect(dialog).toBeHidden();
});

for (const index of [1, 2]) {
  test(`モバイルで生成画像${index}を拡大すると画像と閉じるボタンが画面内に収まる`, async ({
    page,
  }) => {
    await page.goto("/aoi", { waitUntil: "domcontentloaded" });
    const trigger = page.getByRole("button", {
      name: `生成画像 ${index} を拡大表示`,
    });
    await trigger.tap();
    const dialog = page.getByRole("dialog");
    const image = dialog.getByRole("img");
    await expectImageLoaded(image);
    await expectInsideViewport(image, page);
    const close = dialog.getByRole("button", { name: "Close" });
    await expectInsideViewport(close, page);
    await close.tap();
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
}
