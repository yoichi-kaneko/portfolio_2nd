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

test.describe("ProjectsModal の動作確認", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("View All ボタンをクリックするとモーダルが開く", async ({ page }) => {
    await page.getByRole("button", { name: "View All" }).click();
    await expect(
      page.getByRole("heading", { name: "All Projects" })
    ).toBeVisible();
  });

  test("モーダルにタブが4つ表示される", async ({ page }) => {
    await page.getByRole("button", { name: "View All" }).click();
    await expect(page.getByRole("button", { name: "All", exact: true })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "業務委託 / 受託" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "正社員" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "個人開発" })
    ).toBeVisible();
  });

  test("All タブでプロジェクトカードが複数表示される", async ({ page }) => {
    await page.getByRole("button", { name: "View All" }).click();
    const cards = page.locator('[data-testid="project-card"]');
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(1);
  });

  test("タブ切り替えで表示件数が絞り込まれる", async ({ page }) => {
    await page.getByRole("button", { name: "View All" }).click();
    const allCards = page.locator('[data-testid="project-card"]');
    const allCount = await allCards.count();

    await page.getByRole("button", { name: "正社員" }).click();
    const employeeCount = await allCards.count();
    expect(employeeCount).toBeLessThan(allCount);
  });

  test("カードをクリックすると詳細パネルが表示される", async ({ page }) => {
    await page.getByRole("button", { name: "View All" }).click();
    await page.locator('[data-testid="project-card"]').first().click();
    await expect(page.getByText("Technologies")).toBeVisible();
  });

  test("詳細パネルの ✕ で詳細が閉じる", async ({ page }) => {
    await page.getByRole("button", { name: "View All" }).click();
    await page.locator('[data-testid="project-card"]').first().click();
    await expect(page.getByText("Technologies")).toBeVisible();
    await page.getByRole("button", { name: "Close detail" }).click();
    await expect(page.getByText("Technologies")).not.toBeVisible();
  });

  test("✕ ボタンでモーダルが閉じる", async ({ page }) => {
    await page.getByRole("button", { name: "View All" }).click();
    await page.getByRole("button", { name: "Close" }).click();
    await expect(
      page.getByRole("heading", { name: "All Projects" })
    ).not.toBeVisible();
  });

  test("Esc キーでモーダルが閉じる", async ({ page }) => {
    await page.getByRole("button", { name: "View All" }).click();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("heading", { name: "All Projects" })
    ).not.toBeVisible();
  });

  test("バックドロップクリックでモーダルが閉じる", async ({ page }) => {
    await page.getByRole("button", { name: "View All" }).click();
    const backdrop = page.getByTestId("projects-modal-backdrop");
    await expect(backdrop).toBeVisible();
    await backdrop.click({ position: { x: 1, y: 1 } });
    await expect(
      page.getByRole("heading", { name: "All Projects" })
    ).not.toBeVisible();
  });
});

test.describe("MountainMapModal の動作確認", () => {
  test.beforeEach(async ({ page }) => {
    // Google Maps のスクリプトをブロックしてマップを読み込まない
    await page.route("**/maps.googleapis.com/**", (route) => route.abort());
    await page.goto("/");
  });

  test("🗺️ Map ボタンをクリックするとモーダルが開く", async ({ page }) => {
    await page.getByRole("button", { name: /Map/ }).click();
    await expect(page.getByTestId("mountain-map-modal")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Mountain Map" })
    ).toBeVisible();
  });

  test("モーダルにサブタイトルが表示される", async ({ page }) => {
    await page.getByRole("button", { name: /Map/ }).click();
    await expect(page.getByText("登頂した山々")).toBeVisible();
  });

  test("✕ ボタンでモーダルが閉じる", async ({ page }) => {
    await page.getByRole("button", { name: /Map/ }).click();
    await expect(page.getByTestId("mountain-map-modal")).toBeVisible();
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByTestId("mountain-map-modal")).not.toBeVisible();
  });

  test("Esc キーでモーダルが閉じる", async ({ page }) => {
    await page.getByRole("button", { name: /Map/ }).click();
    await expect(page.getByTestId("mountain-map-modal")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("mountain-map-modal")).not.toBeVisible();
  });

  test("バックドロップクリックでモーダルが閉じる", async ({ page }) => {
    await page.getByRole("button", { name: /Map/ }).click();
    await expect(page.getByTestId("mountain-map-modal")).toBeVisible();
    const backdrop = page.getByTestId("mountain-map-backdrop");
    await expect(backdrop).toBeVisible();
    await backdrop.click({ position: { x: 1, y: 1 } });
    await expect(page.getByTestId("mountain-map-modal")).not.toBeVisible();
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
