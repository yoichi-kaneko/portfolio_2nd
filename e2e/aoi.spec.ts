import { test, expect, type Page } from "@playwright/test";

// 要素の存在確認が目的のため、全画像の load 完了は待たず DOM 構築完了で遷移する。
// （aoi ページは next/image が多く、dev の都度最適化で load イベントの待機が遅い。）
async function gotoAoi(page: Page): Promise<void> {
  await page.goto("/aoi", { waitUntil: "domcontentloaded" });
}

// 夜オーバーレイ（NightOverlay）の現在の opacity を読む。
// オーバーレイは常時 DOM に存在し opacity の 0/1 で点灯を表現するため、
// toBeVisible() では区別できない。home.spec の背景画像探索と同じ要領で、
// オーバーレイ文言から fixed 配置の祖先まで遡って computed opacity を取得する。
async function readNightOverlayOpacity(page: Page): Promise<number> {
  return page
    .getByText("おやすみなさい。良い夢を。")
    .evaluate((el: Element) => {
      let node: Element | null = el;
      while (node) {
        const style = window.getComputedStyle(node);
        if (style.position === "fixed") {
          return Number.parseFloat(style.opacity);
        }
        node = node.parentElement;
      }
      return -1;
    });
}

test("碧衣ページが表示される", async ({ page }) => {
  await gotoAoi(page);
  await expect(page).toHaveTitle(/AOI/);
});

test.describe("ナビゲーション（AoiNav）の要素確認", () => {
  test.beforeEach(async ({ page }) => {
    await gotoAoi(page);
  });

  test("ブランド表記が表示される", async ({ page }) => {
    const nav = page.locator("header");
    await expect(nav.getByText("碧衣")).toBeVisible();
    await expect(nav.getByText("AOI")).toBeVisible();
  });

  test("セクションへのナビリンクが5つ表示される", async ({ page }) => {
    const nav = page.locator("header");
    await expect(nav.getByRole("link", { name: "これは何か" })).toBeVisible();
    await expect(
      nav.getByRole("link", { name: "フレームワーク" }),
    ).toBeVisible();
    await expect(nav.getByRole("link", { name: "連携" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "登山×天気" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "登場人物" })).toBeVisible();
  });

  test("夜モードトグルが表示される", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /灯りを落とす/ }),
    ).toBeVisible();
  });
});

test.describe("ヒーロー（AoiHero）の要素確認", () => {
  test.beforeEach(async ({ page }) => {
    await gotoAoi(page);
  });

  test("バッジ・見出し・リード文が表示される", async ({ page }) => {
    await expect(page.getByText("PERSONAL PROJECT")).toBeVisible();
    await expect(page.getByText("非売品・個人用途")).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 1, name: /碧衣/ }),
    ).toBeVisible();
  });

  test("CTA リンクが2つ表示される", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: "仕組みを見る" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "登場人物を見る" }),
    ).toBeVisible();
  });

  test("統計（連携サービス・実行モード・制作人数）が表示される", async ({
    page,
  }) => {
    await expect(page.getByText("15+")).toBeVisible();
    await expect(page.getByText("連携サービス")).toBeVisible();
    await expect(page.getByText("実行モード")).toBeVisible();
    await expect(page.getByText("人で制作中")).toBeVisible();
  });

  test("ヒーロー画像が表示される", async ({ page }) => {
    await expect(
      page.getByRole("img", { name: "碧衣のプライベートルーム" }),
    ).toBeVisible();
  });

  test("ライブモードウィジェットに判定モードと時計が表示される", async ({
    page,
  }) => {
    await expect(page.getByText("// ただいまの判定モード")).toBeVisible();
    // マウント後にクライアント時刻へ更新される（初期値 --:--:-- から実時刻へ）。
    // dev のハイドレーション完了までを許容するため待ち時間を長めに取る。
    await expect(page.getByText(/\d{2}:\d{2}:\d{2}/)).toBeVisible({
      timeout: 15000,
    });
  });
});

test.describe("About セクションの要素確認", () => {
  test.beforeEach(async ({ page }) => {
    await gotoAoi(page);
  });

  test("見出しが表示される", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 2, name: "これは、何なのか" }),
    ).toBeVisible();
  });

  test("上位レイヤー（運用目的）のカードが表示される", async ({ page }) => {
    await expect(page.getByText("UPPER LAYER ／ 運用目的")).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 3, name: "登山アシスタント AI" }),
    ).toBeVisible();
  });

  test("下位レイヤー（設計思想）のカードが表示される", async ({ page }) => {
    await expect(page.getByText("LOWER LAYER ／ 設計思想")).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 3,
        name: "アクティビティ駆動フレームワーク",
      }),
    ).toBeVisible();
  });
});

test.describe("Framework セクションの要素確認", () => {
  test.beforeEach(async ({ page }) => {
    await gotoAoi(page);
  });

  test("見出しが表示される", async ({ page }) => {
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "アクティビティ駆動フレームワーク",
      }),
    ).toBeVisible();
  });

  test("収集・解析・出力の3ステップが表示される", async ({ page }) => {
    await expect(page.getByText("STEP 01 ／ 収集")).toBeVisible();
    await expect(page.getByText("STEP 02 ／ 解析")).toBeVisible();
    await expect(page.getByText("STEP 03 ／ 出力")).toBeVisible();
  });

  test("収集・出力のチップ項目が表示される", async ({ page }) => {
    await expect(page.getByText("📅 Google カレンダーの予定")).toBeVisible();
    await expect(page.getByText("🎵 一週間から綴る楽曲")).toBeVisible();
  });
});

test.describe("Services セクションの要素確認", () => {
  test.beforeEach(async ({ page }) => {
    await gotoAoi(page);
  });

  test("見出しが表示される", async ({ page }) => {
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "多様なサービスと、横断的に連携",
      }),
    ).toBeVisible();
  });

  test("入力・出力・基盤の凡例が表示される", async ({ page }) => {
    await expect(page.getByText("入力 ／ 情報収集")).toBeVisible();
    await expect(page.getByText("出力 ／ 生成・送信")).toBeVisible();
    await expect(page.getByText("基盤 ／ データ・実行")).toBeVisible();
  });

  test("連携サービスのカードが表示される", async ({ page }) => {
    // サービス名は Framework セクションの収集チップにも現れるため #services に限定する。
    const services = page.locator("#services");
    await expect(services.getByText("LINE Messaging API")).toBeVisible();
    await expect(
      services.getByText("OpenWeatherMap", { exact: true }),
    ).toBeVisible();
    await expect(services.getByText("Firebase / Firestore")).toBeVisible();
  });
});

test.describe("Mountain セクションの要素確認", () => {
  test.beforeEach(async ({ page }) => {
    await gotoAoi(page);
  });

  test("見出しと設定資料画像が表示される", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 2, name: "登山と天気に、強い。" }),
    ).toBeVisible();
    await expect(
      page.getByRole("img", { name: "碧衣 登山装備の設定資料" }),
    ).toBeVisible();
  });

  test("登山×天気の特徴3項目が表示される", async ({ page }) => {
    await expect(page.getByText("ルリが、数日先の空を偵察")).toBeVisible();
    await expect(page.getByText("門灯・帰灯 — 入山と下山の灯り")).toBeVisible();
    await expect(
      page.getByText("空模様から、コンディションを推察"),
    ).toBeVisible();
  });
});

test.describe("Modes セクションの要素確認", () => {
  test.beforeEach(async ({ page }) => {
    await gotoAoi(page);
  });

  test("見出しが表示される", async ({ page }) => {
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "一日を、6つのモードで歩く",
      }),
    ).toBeVisible();
  });

  test("モードカードが6枚表示される", async ({ page }) => {
    await expect(page.locator("#flow .grid > div")).toHaveCount(6);
  });

  test("代表的なモード名が表示される", async ({ page }) => {
    const modes = page.locator("#flow");
    await expect(modes.getByText("望")).toBeVisible();
    await expect(modes.getByText("小夜")).toBeVisible();
    await expect(modes.getByText("調べ")).toBeVisible();
  });
});

test.describe("Cast セクションの要素確認", () => {
  test.beforeEach(async ({ page }) => {
    await gotoAoi(page);
  });

  test("見出しが表示される", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 2, name: "登場人物" }),
    ).toBeVisible();
  });

  test("登場人物カードが3枚表示される", async ({ page }) => {
    await expect(page.locator("#cast .grid > div")).toHaveCount(3);
  });

  test("各登場人物の設定資料画像と肩書が表示される", async ({ page }) => {
    await expect(
      page.getByRole("img", { name: "碧衣 設定資料" }),
    ).toBeVisible();
    await expect(
      page.getByRole("img", { name: "ルリ 設定資料" }),
    ).toBeVisible();
    await expect(page.getByRole("img", { name: "蛍 設定資料" })).toBeVisible();

    await expect(page.getByText("あおい ／ 主")).toBeVisible();
    await expect(page.getByText("先遣観測員 ／ 相棒")).toBeVisible();
    await expect(page.getByText("ほたる ／ デジタルの友人")).toBeVisible();
  });
});

test.describe("フッター（AoiFooter）の要素確認", () => {
  test.beforeEach(async ({ page }) => {
    await gotoAoi(page);
  });

  test("非営利の宣言文とライセンス表記が表示される", async ({ page }) => {
    await expect(
      page.getByText("PERSONAL · NON-COMMERCIAL · BUILT FOR FUN"),
    ).toBeVisible();
    await expect(
      page.getByText("プロダクトとして売る予定は、ありません。"),
    ).toBeVisible();
    await expect(page.getByText("MIT License")).toBeVisible();
    await expect(page.getByText("© 2026 kaneko")).toBeVisible();
  });

  test("フッターの夜モードトグルが表示される", async ({ page }) => {
    await expect(page.getByRole("button", { name: /おやすみ/ })).toBeVisible();
  });
});

test.describe("夜モード（NightMode）の動作確認", () => {
  test("ナビのトグルで灯りが落ち、再操作で元に戻る", async ({ page }) => {
    await gotoAoi(page);
    // クライアント時刻に更新される時計を待ち、ハイドレーション完了を担保してから操作する。
    await expect(page.getByText(/\d{2}:\d{2}:\d{2}/)).toBeVisible({
      timeout: 15000,
    });

    const turnOff = page.getByRole("button", { name: /灯りを落とす/ });
    await expect(turnOff).toBeVisible();
    // 初期は灯り ON（オーバーレイは透明）。
    expect(await readNightOverlayOpacity(page)).toBe(0);

    await turnOff.click();
    // ラベルが反転し、夜オーバーレイが点灯する。
    const turnOn = page.getByRole("button", { name: /灯りをつける/ });
    await expect(turnOn).toBeVisible();
    await expect(page.getByText("おやすみなさい。良い夢を。")).toBeVisible();
    await expect.poll(() => readNightOverlayOpacity(page)).toBeGreaterThan(0.9);

    await turnOn.click();
    // 灯りが戻り、オーバーレイが消灯する。
    await expect(
      page.getByRole("button", { name: /灯りを落とす/ }),
    ).toBeVisible();
    await expect.poll(() => readNightOverlayOpacity(page)).toBeLessThan(0.1);
  });
});
