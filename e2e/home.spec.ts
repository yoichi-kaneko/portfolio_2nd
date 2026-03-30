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

const MOCK_WEEKLY = [
  { week: "W5", count: 10 },
  { week: "W4", count: 20 },
  { week: "W3", count: 15 },
  { week: "W2", count: 5 },
  { week: "W1", count: 30 },
];

test.describe("GitHubContributionChart の詳細確認", () => {
  test("BarChart 要素が表示される", async ({ page }) => {
    await page.route("/api/github/contributions", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ weekly: MOCK_WEEKLY }),
      });
    });
    await page.goto("/");
    await expect(page.locator(".recharts-surface")).toBeVisible();
  });

  test("API通信で失敗した場合にNo Dataが表示される", async ({ page }) => {
    await page.route("/api/github/contributions", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });
    await page.goto("/");
    await expect(page.getByText("No Data")).toBeVisible();
  });

  test("API通信の結果が返ってくるまではSkeletonが表示される", async ({ page }) => {
    await page.route("/api/github/contributions", async (route) => {
      // レスポンスを遅延させてスケルトンが表示される時間を確保
      await new Promise<void>((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ weekly: MOCK_WEEKLY }),
      });
    });
    await page.goto("/");
    await expect(page.getByTestId("github-card-skeleton")).toBeVisible();
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
