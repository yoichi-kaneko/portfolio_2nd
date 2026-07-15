import { test, expect, type Page } from "@playwright/test";

type AudioMockState = {
  playCalls: number;
  pauseCalls: number;
  srcValues: string[];
};

async function installAudioPlaybackStub(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const globalWindow = window as unknown as Window & {
      __audioMockState?: AudioMockState;
    };

    globalWindow.__audioMockState = {
      playCalls: 0,
      pauseCalls: 0,
      srcValues: [] as string[],
    };

    const AudioMock = function AudioMock(this: HTMLAudioElement) {
      const element = document.createElement("audio");
      const mockState = globalWindow.__audioMockState as AudioMockState;
      let pausedState = true;
      let srcValue = "";

      Object.defineProperty(element, "paused", {
        configurable: true,
        get: () => pausedState,
      });
      Object.defineProperty(element, "src", {
        configurable: true,
        get: () => srcValue,
        set: (value: string) => {
          srcValue = value;
          mockState.srcValues.push(value);
        },
      });

      element.play = async () => {
        pausedState = false;
        mockState.playCalls += 1;
        element.dispatchEvent(new Event("play"));
      };
      element.pause = () => {
        pausedState = true;
        mockState.pauseCalls += 1;
        element.dispatchEvent(new Event("pause"));
      };

      return element as HTMLAudioElement;
    };
    window.Audio = AudioMock as unknown as typeof Audio;
  });
}

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
      page.getByRole("heading", { name: /Web Studio.*Wanderlust/i }),
    ).toBeVisible();
  });

  test("About カードが表示される", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "About" })).toBeVisible();
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
      page.getByRole("heading", { name: "Recent Projects" }),
    ).toBeVisible();
  });

  test("Project Aoi カードが表示され /aoi へのリンクになっている", async ({
    page,
  }) => {
    const aoiLink = page.getByRole("link", { name: /Project Aoi/ });
    await expect(aoiLink).toBeVisible();
    await expect(aoiLink).toHaveAttribute("href", "/aoi");
  });

  test("Project Aoi カードに発車時刻（現在時刻）が表示される", async ({
    page,
  }) => {
    const aoiLink = page.getByRole("link", { name: /Project Aoi/ });
    // マウント後にクライアント時刻へ更新される（初期値 --:-- から実時刻へ）。
    // dev のハイドレーション完了までを許容するため待ち時間を長めに取る。
    await expect(aoiLink.getByText(/本日 \d{2}:\d{2} 発/)).toBeVisible({
      timeout: 15000,
    });
  });

  test("Project Aoi カードをクリックすると /aoi ページへ遷移する", async ({
    page,
  }) => {
    await page.getByRole("link", { name: /Project Aoi/ }).click();
    await expect(page).toHaveURL(/\/aoi$/);
    await expect(page).toHaveTitle(/AOI/);
  });

  test("Life Log カードが表示される", async ({ page }) => {
    await expect(page.getByText(/Life Log/i)).toBeVisible();
    await expect(page.getByText(/Mountaineering/i)).toBeVisible();
  });

  test("Life Log カードの背景画像が参照されており配信される（リンク切れしない）", async ({
    page,
    request,
  }) => {
    await page.goto("/");
    const bgImage = await page
      .getByTestId("life-log-card")
      .evaluate((el: Element) => {
        let node: Element | null = el;
        while (node) {
          const bg = window.getComputedStyle(node).backgroundImage;
          if (bg && bg !== "none" && bg.includes("life-log-bg")) {
            return bg;
          }
          node = node.parentElement;
        }
        return "";
      });
    expect(bgImage).toContain("life-log-bg.jpg");

    const res = await request.get("/images/life-log-bg.jpg");
    expect(res.ok()).toBeTruthy();
    expect(res.headers()["content-type"]?.toLowerCase()).toMatch(/jpe?g|image/);
  });
});

test.describe("Life Log 音声トグルの動作確認", () => {
  test("実ファイルを取得せずに再生/停止の挙動を検証できる", async ({
    page,
  }) => {
    const audioRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().endsWith(".mp3")) {
        audioRequests.push(request.url());
      }
    });

    await installAudioPlaybackStub(page);
    await page.goto("/");

    const toggleButton = page.getByTestId("life-log-audio-toggle");
    await expect(toggleButton).toHaveAttribute("aria-label", "音声を再生");

    await toggleButton.click();
    await expect(toggleButton).toHaveAttribute("aria-label", "音声を一時停止");
    await expect(page.locator("canvas[aria-hidden='true']")).toBeVisible();

    await toggleButton.click();
    await expect(toggleButton).toHaveAttribute("aria-label", "音声を再生");
    await expect(page.locator("canvas[aria-hidden='true']")).toHaveCount(0);

    const audioMockState = await page.evaluate(() => {
      return (window as unknown as { __audioMockState: AudioMockState })
        .__audioMockState;
    });
    expect(audioMockState).toEqual({
      playCalls: 1,
      pauseCalls: 1,
      srcValues: [
        // 外部サービスにアップロードした読み上げファイル。マジックナンバーとしての指定が必要
        "https://res.cloudinary.com/damehnlii/video/upload/v1775359579/readout_u5ksqf.mp3",
      ],
    });
    expect(audioRequests).toHaveLength(0);
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

  test("API通信中はSkeleton表示、完了後にグラフへ切り替わる", async ({
    page,
  }) => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route("/api/github/contributions", async (route) => {
      await gate;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ weekly: MOCK_WEEKLY }),
      });
    });
    await page.goto("/");
    await expect(page.getByTestId("github-card-skeleton")).toBeVisible();
    release();
    await expect(page.getByTestId("github-card-skeleton")).not.toBeVisible();
    await expect(page.locator(".recharts-surface")).toBeVisible();
  });
});

test.describe("ProjectsModal の動作確認", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("View All ボタンをクリックするとモーダルが開く", async ({ page }) => {
    await page.getByRole("button", { name: "View All" }).click();
    await expect(
      page.getByRole("heading", { name: "All Projects" }),
    ).toBeVisible();
  });

  test("モーダルにタブが4つ表示される", async ({ page }) => {
    await page.getByRole("button", { name: "View All" }).click();
    await expect(
      page.getByRole("button", { name: "All", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "業務委託 / 受託" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "正社員" })).toBeVisible();
    await expect(page.getByRole("button", { name: "個人開発" })).toBeVisible();
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
      page.getByRole("heading", { name: "All Projects" }),
    ).not.toBeVisible();
  });

  test("Esc キーでモーダルが閉じる", async ({ page }) => {
    await page.getByRole("button", { name: "View All" }).click();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("heading", { name: "All Projects" }),
    ).not.toBeVisible();
  });

  test("バックドロップクリックでモーダルが閉じる", async ({ page }) => {
    await page.getByRole("button", { name: "View All" }).click();
    const backdrop = page.getByTestId("projects-modal-backdrop");
    await expect(backdrop).toBeVisible();
    await backdrop.click({ position: { x: 1, y: 1 } });
    await expect(
      page.getByRole("heading", { name: "All Projects" }),
    ).not.toBeVisible();
  });
});

test.describe("MountainMapModal の動作確認", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("🗺️ Map ボタンをクリックするとモーダルが開く", async ({ page }) => {
    await page.getByRole("button", { name: /Map/ }).click();
    await expect(page.getByTestId("mountain-map-modal")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Mountain Map" }),
    ).toBeVisible();
  });

  test("モーダルにサブタイトルが表示される", async ({ page }) => {
    await page.getByRole("button", { name: /Map/ }).click();
    await expect(page.getByText("登頂した百名山")).toBeVisible();
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

test.describe("登山レポート件数の表示確認", () => {
  test("API成功時に件数が表示される", async ({ page }) => {
    await page.route("/api/mountains/report-count", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ count: 999 }),
      });
    });
    await page.goto("/");
    const lifeLogCard = page.getByTestId("life-log-card");
    await expect(lifeLogCard.getByText("999")).toBeVisible();
    await expect(lifeLogCard.getByText("登山レポート（総計）")).toBeVisible();
  });

  test("API失敗時に ??? が表示される", async ({ page }) => {
    await page.route("/api/mountains/report-count", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });
    await page.goto("/");
    const lifeLogCard = page.getByTestId("life-log-card");
    await expect(lifeLogCard.getByText("???")).toBeVisible();
  });

  test("API通信中はSkeleton表示、完了後に件数表示へ切り替わる", async ({
    page,
  }) => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route("/api/mountains/report-count", async (route) => {
      await gate;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ count: 999 }),
      });
    });
    await page.goto("/");
    await expect(page.getByTestId("report-count-skeleton")).toBeVisible();
    release();
    await expect(page.getByTestId("report-count-skeleton")).not.toBeVisible();
    const lifeLogCard = page.getByTestId("life-log-card");
    await expect(lifeLogCard.getByText("999")).toBeVisible();
  });
});

test.describe("TechStackCard の詳細確認", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Backend セクションがあり、説明項目が1つ以上ある", async ({ page }) => {
    await expect(page.getByText("Backend")).toBeVisible();
    const backendSection = page
      .locator("p", { hasText: "Backend" })
      .locator("..");
    await expect(backendSection.locator("span").first()).toBeVisible();
  });

  test("Frontend セクションがあり、説明項目が1つ以上ある", async ({ page }) => {
    await expect(page.getByText("Frontend")).toBeVisible();
    const frontendSection = page
      .locator("p", { hasText: "Frontend" })
      .locator("..");
    await expect(frontendSection.locator("span").first()).toBeVisible();
  });

  test("Infra & Tools セクションがあり、説明項目が1つ以上ある", async ({
    page,
  }) => {
    await expect(page.getByText("Infra & Tools")).toBeVisible();
    const infraSection = page
      .locator("p", { hasText: "Infra & Tools" })
      .locator("..");
    await expect(infraSection.locator("span").first()).toBeVisible();
  });
});
