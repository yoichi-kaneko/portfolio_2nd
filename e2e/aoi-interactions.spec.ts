import { test, expect, MOCK_IMAGES } from "./fixtures";
import {
  expectImageLoaded,
  expectInsideViewport,
  expectScrollLocked,
} from "./support/assertions";

test("生成画像は取得中の仮画像から読み込み済みプレビューへ切り替わる", async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/cloudinary/images", async (route) => {
    await gate;
    await route.fulfill({ json: { images: MOCK_IMAGES } });
  });
  const response = page.waitForResponse("**/api/cloudinary/images");
  await page.goto("/aoi", { waitUntil: "domcontentloaded" });
  const section = page.locator("#generate-image");
  try {
    await expect(section).toHaveAttribute("aria-busy", "true");
    await expect(section.getByTestId("aoi-generate-skeleton")).toHaveCount(3);
    await expect(section.getByRole("button", { name: /拡大表示/ })).toHaveCount(
      0,
    );
  } finally {
    release();
  }
  expect((await response).status()).toBe(200);
  await expect(section).toHaveAttribute("aria-busy", "false");
  await expect(section.getByTestId("aoi-generate-skeleton")).toHaveCount(0);
  for (const [index, image] of MOCK_IMAGES.entries()) {
    const preview = section.getByRole("img", {
      name: `生成画像 ${index + 1}`,
      exact: true,
    });
    await expectImageLoaded(preview);
    await expect(preview).toHaveAttribute("src", image.previewUrl);
  }
});

for (const count of [0, 1, 2]) {
  test(`生成画像APIが${count}件の場合も取得完了後に適切な表示になる`, async ({
    page,
  }) => {
    await page.route("**/api/cloudinary/images", (route) =>
      route.fulfill({ json: { images: MOCK_IMAGES.slice(0, count) } }),
    );
    const response = page.waitForResponse("**/api/cloudinary/images");
    await page.goto("/aoi", { waitUntil: "domcontentloaded" });
    await response;
    const section = page.locator("#generate-image");
    await expect(section).toHaveAttribute("aria-busy", "false");
    await expect(section.getByRole("button", { name: /拡大表示/ })).toHaveCount(
      count,
    );
    await expect(section.getByTestId("aoi-generate-skeleton")).toHaveCount(
      count === 0 ? 3 : 0,
    );
  });
}

test("Lightboxはキーボード操作・背景クリック・スクロール制御・フォーカス復元ができる", async ({
  page,
}) => {
  await page.goto("/aoi", { waitUntil: "domcontentloaded" });
  const trigger = page.getByRole("button", { name: "生成画像 2 を拡大表示" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "生成画像の拡大表示" });
  const close = dialog.getByRole("button", { name: "Close" });
  await expect(close).toBeFocused();
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  for (const key of ["Tab", "Shift+Tab"]) {
    await page.keyboard.press(key);
    await expect(close).toBeFocused();
  }
  await expectImageLoaded(dialog.getByRole("img"));
  await expect(dialog.getByRole("img")).toHaveAttribute(
    "src",
    MOCK_IMAGES[1].originalUrl,
  );
  await dialog.getByRole("img").click();
  await expect(dialog).toBeVisible();
  await expectScrollLocked(page);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, -400);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeLessThan(before);
  await trigger.focus();
  await page.keyboard.press("Space");
  await expect(dialog).toBeVisible();
  await page
    .getByTestId("aoi-lightbox-backdrop")
    .click({ position: { x: 2, y: 2 } });
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

for (const [index, shape] of [
  [0, "縦長"],
  [1, "横長"],
] as const) {
  test(`Lightboxの${shape}画像と閉じるボタンが画面内に収まり、縦横比を保つ`, async ({
    page,
  }) => {
    await page.goto("/aoi", { waitUntil: "domcontentloaded" });
    await page
      .getByRole("button", { name: `生成画像 ${index + 1} を拡大表示` })
      .click();
    const dialog = page.getByRole("dialog");
    const image = dialog.getByRole("img");
    await expectImageLoaded(image);
    await expectInsideViewport(image, page);
    await expectInsideViewport(
      dialog.getByRole("button", { name: "Close" }),
      page,
    );
    const ratio = await image.evaluate((node: HTMLImageElement) => {
      const rect = node.getBoundingClientRect();
      return {
        rendered: rect.width / rect.height,
        natural: node.naturalWidth / node.naturalHeight,
      };
    });
    expect(ratio.rendered).toBeCloseTo(ratio.natural, 2);
  });
}

for (const failedMode of ["morning", "night"]) {
  test(`部屋画像の${failedMode}読込失敗でも待機が終わり、成功画像へ切替できる`, async ({
    page,
  }) => {
    await page.clock.setFixedTime(new Date("2026-07-15T10:00:00+09:00"));
    await page.route("**/_next/image?*", async (route) => {
      const source = new URL(route.request().url()).searchParams.get("url");
      if (source === `/aoi/room_${failedMode}.png`)
        await route.fulfill({ status: 404, body: "missing image" });
      else await route.fallback();
    });
    await page.goto("/aoi", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("LOADING ROOM…")).toBeHidden({
      timeout: 30000,
    });
    const error = page.getByRole("img", {
      name: "碧衣のプライベートルーム（読み込みに失敗しました）",
      exact: true,
    });
    if (failedMode === "morning") await expect(error).toBeVisible();
    else {
      await expectImageLoaded(
        page.getByRole("img", {
          name: "碧衣のプライベートルーム",
          exact: true,
        }),
      );
      await page.getByRole("button", { name: /小夜ゆき/ }).click();
      await expect(error).toBeVisible();
    }
    await expect(
      page.getByText("ROOM UNAVAILABLE", { exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: /望ゆき/ }).click();
    await expect(error).toBeHidden();
    const room = page.getByRole("img", {
      name: "碧衣のプライベートルーム",
      exact: true,
    });
    await expect(room).toHaveAttribute("src", /room_noon/);
    await expectImageLoaded(room);
    await expect(room).toHaveCSS("opacity", "1");
  });
}

test("部屋画像が未完了の間はプレースホルダを保ち、全画像の完了後に表示する", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-07-15T21:00:00+09:00"));
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/_next/image?*", async (route) => {
    const source = new URL(route.request().url()).searchParams.get("url");
    if (source === "/aoi/room_morning.png") await gate;
    await route.fallback();
  });
  await page.goto("/aoi", { waitUntil: "domcontentloaded" });
  try {
    await expect(page.getByText(/^21:00:00$/)).toBeVisible();
    await expect(page.getByText("LOADING ROOM…")).toBeVisible();
    await expect(
      page.getByRole("img", { name: "碧衣のプライベートルーム", exact: true }),
    ).toHaveCount(0);
  } finally {
    release();
  }
  await expect(page.getByText("LOADING ROOM…")).toBeHidden({ timeout: 30000 });
  const room = page.getByRole("img", {
    name: "碧衣のプライベートルーム",
    exact: true,
  });
  await expect(room).toHaveAttribute("src", /room_night/);
  await expectImageLoaded(room);
});

test("実時刻が11時を跨ぐとモード・いま札・選択状態・部屋画像が自動更新される", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-07-15T10:00:00+09:00") });
  await page.goto("/aoi", { waitUntil: "domcontentloaded" });
  const morning = page.getByRole("button", { name: /暁ゆき/ });
  const noon = page.getByRole("button", { name: /望ゆき/ });
  const room = page.getByRole("img", {
    name: "碧衣のプライベートルーム",
    exact: true,
  });
  const widget = page.getByText("// ただいまの判定モード").locator("../..");
  // Reactの初期化に必要なタイマーを動かしたまま、部屋の準備完了を待つ。
  // 初期化前にpauseすると、低速なCIではhydrationが進まないことがある。
  await expect(room).toHaveAttribute("src", /room_morning/, { timeout: 30000 });
  await page.clock.pauseAt(new Date("2026-07-15T10:59:59+09:00"));
  await expect(widget.getByText("10:59:59", { exact: true })).toBeVisible();
  await expect(morning).toHaveAttribute("aria-pressed", "true");
  await expect(morning.getByText("いま")).toBeVisible();
  await expect(room).toHaveAttribute("src", /room_morning/, { timeout: 30000 });
  await page.clock.runFor(1000);
  await expect(widget.getByText("望", { exact: true })).toBeVisible();
  await expect(widget.getByText("11:00:00", { exact: true })).toBeVisible();
  await expect(morning).toHaveAttribute("aria-pressed", "false");
  await expect(morning.getByText("いま")).toHaveCount(0);
  await expect(noon).toHaveAttribute("aria-pressed", "true");
  await expect(noon.getByText("いま")).toBeVisible();
  await expect(room).toHaveAttribute("src", /room_noon/);
  await expect(room).toHaveCSS("opacity", "1");
  await expect(page.getByText("臨時ダイヤ")).toHaveCount(0);
});

for (const [label, target] of [
  ["これは何か", "about"],
  ["フレームワーク", "framework"],
  ["連携", "services"],
  ["登山×天気", "mountain"],
  ["登場人物", "cast"],
  ["画像生成", "generate-image"],
  ["仕組みを見る", "framework"],
  ["登場人物を見る", "cast"],
]) {
  test(`リンク「${label}」から対象セクションへ移動できる`, async ({ page }) => {
    await page.goto("/aoi", { waitUntil: "domcontentloaded" });
    await page
      .getByRole("link", { name: label, exact: label !== "仕組みを見る" })
      .click();
    await expect(page).toHaveURL(new RegExp(`#${target}$`));
    const heading = page
      .locator(`#${target}`)
      .getByRole("heading", { level: 2 });
    await expect(heading).toBeInViewport();
    await expect
      .poll(async () => {
        const header = await page.locator("header").boundingBox();
        const title = await heading.boundingBox();
        return title!.y >= header!.y + header!.height;
      })
      .toBe(true);
  });
}

test("フッターから消灯するとナビと両ボタンの状態が同期し、再点灯できる", async ({
  page,
}) => {
  await page.goto("/aoi", { waitUntil: "domcontentloaded" });
  await expect(page.getByText(/\d{2}:\d{2}:\d{2}/)).toBeVisible();
  const footer = page.getByRole("button", { name: /おやすみ/ });
  await expect(footer).toHaveAttribute("aria-pressed", "false");
  await footer.click();
  const nav = page.getByRole("button", { name: /灯りをつける/ });
  await expect(nav).toHaveAttribute("aria-pressed", "true");
  await expect(footer).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("link", { name: ">> ポートフォリオに戻る" }),
  ).toBeVisible();
  await nav.click();
  await expect(footer).toHaveAttribute("aria-pressed", "false");
  await expect(
    page.getByRole("button", { name: /灯りを落とす/ }),
  ).toHaveAttribute("aria-pressed", "false");
  await expect(
    page.getByRole("link", { name: ">> ポートフォリオに戻る" }),
  ).toHaveCount(0);
});
