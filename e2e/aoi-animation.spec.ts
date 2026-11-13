import { type Locator, type Page } from "@playwright/test";
import { test, expect } from "./fixtures";

const PLAY = "画像生成プロセスのアニメーションを再生";
const PAUSE = "画像生成プロセスのアニメーションを一時停止";

// aoi.spec.ts の gotoAoi と同じく、ファーストビューの部屋画像が出てから先へ進む
// （LCP が確定する前に画面外へスクロールすると、Next.js が遅延読み込みの画像について警告するため）。
async function gotoAoi(page: Page, query = ""): Promise<Locator> {
  await page.goto(`/aoi${query}`, { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("img", { name: "碧衣のプライベートルーム", exact: true }),
  ).toBeVisible({ timeout: 30000 });
  return page.locator("#generate-image").getByTestId("aoi-generate-animation");
}

/** タイムライン表示（`?debug`）から、ループ内の時刻（秒）を読む。 */
async function readTime(timeline: Locator): Promise<number> {
  const text = (await timeline.textContent()) ?? "";
  const match = /^(\d+\.\d{2})s \/ 40s {2}\d+\. /.exec(text);
  expect(match, `タイムライン表示: ${text}`).not.toBeNull();
  return Number(match![1]);
}

/** 固定時間ではなく、ブラウザの描画フレームを指定数だけ待つ。 */
async function waitFrames(page: Page, count: number): Promise<void> {
  await page.evaluate(
    (frames) =>
      new Promise<void>((resolve) => {
        let left = frames;
        const step = () => {
          left -= 1;
          if (left <= 0) resolve();
          else requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }),
    count,
  );
}

/** 指定数のフレームを待つ間に、タイムラインの時刻が進んだ量。 */
async function timeAdvancedOver(
  page: Page,
  timeline: Locator,
  frames: number,
): Promise<number> {
  const before = await readTime(timeline);
  await waitFrames(page, frames);
  return (await readTime(timeline)) - before;
}

test("アクセス直後は再生されず、生成画像の上に同じ横幅で表示され、中央に再生ボタンがある", async ({
  page,
}) => {
  const animation = await gotoAoi(page);
  const section = page.locator("#generate-image");
  const first = section.getByRole("button", { name: "生成画像 1 を拡大表示" });
  const last = section.getByRole("button", { name: "生成画像 3 を拡大表示" });
  await animation.scrollIntoViewIfNeeded();
  await expect(last).toBeVisible();

  await expect(animation).toHaveAttribute("data-state", "idle");
  await expect(animation.getByRole("button", { name: PLAY })).toBeVisible();
  await expect(animation.getByRole("button", { name: PAUSE })).toHaveCount(0);
  // 再生ボタンを押すまでは、描画先の canvas も置かない。
  await expect(animation.locator("canvas")).toHaveCount(0);

  // 生成画像（3枚）の左端・右端と揃い、その上に 16:9 で置かれる。
  const box = (await animation.boundingBox())!;
  const firstBox = (await first.boundingBox())!;
  const lastBox = (await last.boundingBox())!;
  expect(Math.abs(box.x - firstBox.x)).toBeLessThanOrEqual(1);
  expect(
    Math.abs(box.x + box.width - (lastBox.x + lastBox.width)),
  ).toBeLessThanOrEqual(1);
  expect(box.y + box.height).toBeLessThanOrEqual(firstBox.y);
  expect(Math.abs(box.height - (box.width * 9) / 16)).toBeLessThanOrEqual(1);

  // 再生ボタンの図柄が表示要素の中心にある。
  const icon = animation.getByTestId("aoi-generate-animation-play-icon");
  const iconBox = (await icon.boundingBox())!;
  expect(
    Math.abs(iconBox.x + iconBox.width / 2 - (box.x + box.width / 2)),
  ).toBeLessThanOrEqual(1);
  expect(
    Math.abs(iconBox.y + iconBox.height / 2 - (box.y + box.height / 2)),
  ).toBeLessThanOrEqual(1);
});

test("debug 付きでは、再生ボタンで再生が始まり、表示要素を押すと一時停止し、再び押すと続きから進む", async ({
  page,
}) => {
  const animation = await gotoAoi(page, "?debug");
  const timeline = animation.getByTestId("aoi-generate-animation-timeline");
  const icon = animation.getByTestId("aoi-generate-animation-play-icon");
  await animation.scrollIntoViewIfNeeded();

  // 再生前は 0 秒の最初の場面で止まっていて、フレームが進んでも動かない。
  await expect(timeline).toHaveText(/^0\.00s \/ 40s {2}1\. .+ {2}\[paused\]$/);
  await waitFrames(page, 10);
  await expect(timeline).toHaveText(/^0\.00s /);
  await expect(animation).toHaveAttribute("data-state", "idle");

  await animation.getByRole("button", { name: PLAY }).click();
  await expect(animation).toHaveAttribute("data-state", "playing");
  await expect(animation.getByRole("button", { name: PAUSE })).toBeVisible();
  await expect(animation.locator("canvas")).toBeVisible();
  await expect(icon).toHaveCount(0);
  await expect(timeline).not.toContainText("[paused]");
  await expect.poll(() => readTime(timeline)).toBeGreaterThan(0.5);

  // 再生中は、中央の図柄ではない場所を押しても一時停止する。
  await animation.click({ position: { x: 40, y: 40 } });
  await expect(animation).toHaveAttribute("data-state", "paused");
  await expect(animation.getByRole("button", { name: PLAY })).toBeVisible();
  await expect(icon).toBeVisible();
  await expect(timeline).toContainText("[paused]");
  const pausedAt = await readTime(timeline);
  expect(await timeAdvancedOver(page, timeline, 10)).toBe(0);

  // 再び押すと、0 秒へ戻らずに一時停止した時刻から進む。
  await animation.getByRole("button", { name: PLAY }).click();
  await expect(animation).toHaveAttribute("data-state", "playing");
  await expect(timeline).not.toContainText("[paused]");
  expect(await readTime(timeline)).toBeGreaterThanOrEqual(pausedAt);
  await expect.poll(() => readTime(timeline)).toBeGreaterThan(pausedAt);
});

test("キーボードの Enter / Space でも再生と一時停止を切り替えられ、フォーカスとスクロール位置が保たれる", async ({
  page,
}) => {
  const animation = await gotoAoi(page);
  const play = animation.getByRole("button", { name: PLAY });
  await play.focus();
  await page.keyboard.press("Enter");
  await expect(animation).toHaveAttribute("data-state", "playing");
  const pause = animation.getByRole("button", { name: PAUSE });
  await expect(pause).toBeFocused();

  const scrollY = await page.evaluate(() => window.scrollY);
  await page.keyboard.press("Space");
  await expect(animation).toHaveAttribute("data-state", "paused");
  await expect(play).toBeFocused();
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);

  await page.keyboard.press("Enter");
  await expect(animation).toHaveAttribute("data-state", "playing");
  await expect(pause).toBeFocused();
});

test("debug を付けない URL では、再生してもタイムラインを表示しない", async ({
  page,
}) => {
  const animation = await gotoAoi(page);
  await animation.getByRole("button", { name: PLAY }).click();
  await expect(animation).toHaveAttribute("data-state", "playing");
  await expect(
    animation.getByTestId("aoi-generate-animation-timeline"),
  ).toHaveCount(0);
});

test("再生中に画面外へスクロールすると進行が止まり、画面内へ戻ると続きから進む", async ({
  page,
}) => {
  const animation = await gotoAoi(page, "?debug");
  const timeline = animation.getByTestId("aoi-generate-animation-timeline");
  await animation.getByRole("button", { name: PLAY }).click();
  await expect.poll(() => readTime(timeline)).toBeGreaterThan(0.3);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(animation).not.toBeInViewport();
  // 画面外になったことの通知は非同期に届くため、進まなくなるまで待つ。
  await expect.poll(() => timeAdvancedOver(page, timeline, 10)).toBe(0);
  // 一時停止したわけではない。
  await expect(animation).toHaveAttribute("data-state", "playing");
  await expect(timeline).not.toContainText("[paused]");

  const hiddenAt = await readTime(timeline);
  await animation.scrollIntoViewIfNeeded();
  await expect.poll(() => readTime(timeline)).toBeGreaterThan(hiddenAt);
});

test("WebGL を使えない環境では、再生できなかったことを表示する", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      configurable: true,
      value: function (
        this: HTMLCanvasElement,
        type: string,
        options?: unknown,
      ) {
        if (type === "webgl" || type === "webgl2") return null;
        return original.call(this, type, options);
      },
    });
  });
  const animation = await gotoAoi(page);
  await animation.getByRole("button", { name: PLAY }).click();
  await expect(animation).toHaveAttribute("data-state", "error");
  await expect(
    animation.getByText("この環境ではアニメーションを再生できませんでした。"),
  ).toBeVisible();
  await expect(animation.getByRole("button")).toHaveCount(0);
  await expect(animation.locator("canvas")).toHaveCount(0);
});
