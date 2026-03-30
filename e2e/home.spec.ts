import { test, expect } from "@playwright/test";

test("トップページが表示される", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Wanderlust/);
});

test.describe("Bento Grid 各要素の存在確認", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("ヘッダーが表示される", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /Web Studio.*Wanderlust/i })
    ).toBeVisible();
  });

  test("About カードが表示される", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "About" })
    ).toBeVisible();
  });

  test("稼働ステータスバッジが表示される", async ({ page }) => {
    await expect(page.getByText(/Available/)).toBeVisible();
  });

  test("GitHub Contributions カードが表示される", async ({ page }) => {
    await expect(page.getByText(/GitHub Contributions/i)).toBeVisible();
  });

  test("Tech Stack カードが表示される", async ({ page }) => {
    await expect(page.getByText(/Tech Stack/i)).toBeVisible();
  });

  test("Social カードが表示される", async ({ page }) => {
    await expect(page.getByText(/Social/i)).toBeVisible();
  });

  test("Recent Projects カードが表示される", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Recent Projects" })
    ).toBeVisible();
  });

  test("Life Log カードが表示される", async ({ page }) => {
    await expect(page.getByText(/Life Log/i)).toBeVisible();
    await expect(page.getByText(/Mountaineering/i)).toBeVisible();
  });
});

test.describe("GitHubContributionChart の詳細確認", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("BarChart 要素が表示される", async ({ page }) => {
    await expect(page.locator(".recharts-surface")).toBeVisible();
  });
});

test.describe("TechStackCard の詳細確認", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Backend セクションがあり、説明項目が1つ以上ある", async ({ page }) => {
    await expect(page.getByText("Backend")).toBeVisible();
    const backendSection = page.locator("p", { hasText: "Backend" }).locator("..");
    await expect(backendSection.locator("span").first()).toBeVisible();
  });

  test("Frontend セクションがあり、説明項目が1つ以上ある", async ({ page }) => {
    await expect(page.getByText("Frontend")).toBeVisible();
    const frontendSection = page.locator("p", { hasText: "Frontend" }).locator("..");
    await expect(frontendSection.locator("span").first()).toBeVisible();
  });

  test("Infra & Tools セクションがあり、説明項目が1つ以上ある", async ({
    page,
  }) => {
    await expect(page.getByText("Infra & Tools")).toBeVisible();
    const infraSection = page.locator("p", { hasText: "Infra & Tools" }).locator("..");
    await expect(infraSection.locator("span").first()).toBeVisible();
  });
});
