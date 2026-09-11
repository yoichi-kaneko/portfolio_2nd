import { expect, type Locator, type Page } from "@playwright/test";

export async function expectImageLoaded(image: Locator) {
  await image.scrollIntoViewIfNeeded();
  await expect(image).toBeVisible();
  await expect
    .poll(() =>
      image.evaluate(
        (node: HTMLImageElement) => node.complete && node.naturalWidth > 0,
      ),
    )
    .toBe(true);
}

export async function expectInsideViewport(locator: Locator, page: Page) {
  await expect(locator).toBeInViewport({ ratio: 1 });
  const box = await locator.boundingBox();
  const viewport = page.viewportSize()!;
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height + 1);
}

export async function expectScrollLocked(page: Page) {
  // focus / scrollIntoView による smooth scroll が終了してからホイール入力を検証する。
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let previous = window.scrollY;
        let stable = 0;
        const check = () => {
          stable = window.scrollY === previous ? stable + 1 : 0;
          previous = window.scrollY;
          if (stable >= 3) resolve();
          else requestAnimationFrame(check);
        };
        requestAnimationFrame(check);
      }),
  );
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.move(2, 2);
  await page.mouse.wheel(0, 600);
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
}
