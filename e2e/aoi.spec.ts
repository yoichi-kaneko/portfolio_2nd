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
  await expect(page).toHaveTitle(/碧衣（あおい）/);
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

  test("セクションへのナビリンクが6つ表示される", async ({ page }) => {
    const nav = page.locator("header");
    await expect(nav.getByRole("link", { name: "これは何か" })).toBeVisible();
    await expect(
      nav.getByRole("link", { name: "フレームワーク" }),
    ).toBeVisible();
    await expect(nav.getByRole("link", { name: "連携" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "登山×天気" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "登場人物" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "画像生成" })).toBeVisible();
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

test.describe("時間旅行きっぷ（TimeTravelTickets）の要素・動作確認", () => {
  // ブラウザ内時刻を JST 10:00（暁の時間帯）に固定してから遷移する。
  // 「いま」札がどの切符に付くかがテスト実行時刻に依存しなくなり、
  // 深夜の CI でも同じ結果になる。install 後も時間は普通に流れるため、
  // 切替時のスクランブル演出（700ms）は自然に終了する。
  test.beforeEach(async ({ page }) => {
    // dev サーバーへの並列アクセス時はハイドレーションが遅く、
    // 15 秒では足りないことがあるためテスト全体の制限時間ごと延ばす。
    test.setTimeout(60000);
    await page.clock.install({ time: new Date("2026-07-15T10:00:00+09:00") });
    await gotoAoi(page);
    // ウィジェットの時計が固定時刻を表示する＝ハイドレーション完了。
    // これを待たずにクリックすると、ハンドラー未接続で空振りする。
    await expect(page.getByText(/^10:00:\d{2}$/)).toBeVisible({
      timeout: 30000,
    });
  });

  test("行き先別の切符が3枚、出発時刻つきで表示される", async ({ page }) => {
    await expect(page.getByRole("button", { name: /暁ゆき/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /望ゆき/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /小夜ゆき/ })).toBeVisible();
    await expect(page.getByText("07:00 発")).toBeVisible();
    await expect(page.getByText("13:30 発")).toBeVisible();
    await expect(page.getByText("21:00 発")).toBeVisible();
  });

  test("現在時刻に対応する切符に「いま」札が付き、選択状態になる", async ({
    page,
  }) => {
    const akatsuki = page.getByRole("button", { name: /暁ゆき/ });
    await expect(akatsuki).toHaveAttribute("aria-pressed", "true");
    await expect(akatsuki.getByText("いま")).toBeVisible();
    await expect(page.getByRole("button", { name: /望ゆき/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(
      page.getByRole("button", { name: /小夜ゆき/ }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  test("現在でない切符に乗るとトラベルモードになり、仮時刻とほんとうの今が表示される", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /小夜ゆき/ }).click();
    await expect(
      page.getByRole("button", { name: /小夜ゆき/ }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("臨時ダイヤ")).toBeVisible();
    // スクランブル演出の終了後、小夜の代表時刻 21:00 から進む仮時刻になる
    await expect(page.getByText(/^21:00:\d{2}$/)).toBeVisible();
    await expect(
      page.getByText(/ほんとうの今 — 暁・10:00:\d{2}/),
    ).toBeVisible();
  });

  test("表示中のモードに合わせて部屋の画像が切り替わる", async ({ page }) => {
    // 3 枚の部屋画像のうち、表示中のモードの 1 枚だけが aria-hidden なし
    // （= img ロールで見える）になる。JST 10:00 固定 → 暁 → 朝の部屋。
    const room = page.getByRole("img", { name: "碧衣のプライベートルーム" });
    await expect(room).toHaveAttribute("src", /room_morning/);
    await expect(page.getByText(/ROOM_MORNING\.PNG/)).toBeVisible();

    await page.getByRole("button", { name: /小夜ゆき/ }).click();
    await expect(room).toHaveAttribute("src", /room_night/);
    await expect(page.getByText(/ROOM_NIGHT\.PNG/)).toBeVisible();

    await page.getByRole("button", { name: /望ゆき/ }).click();
    await expect(room).toHaveAttribute("src", /room_noon/);

    // 「いま」札（暁）に乗り直すと朝の部屋に帰還する
    await page.getByRole("button", { name: /暁ゆき/ }).click();
    await expect(room).toHaveAttribute("src", /room_morning/);
  });

  test("「いま」札の切符に乗り直すと現実の時刻に帰還する", async ({ page }) => {
    await page.getByRole("button", { name: /小夜ゆき/ }).click();
    await expect(page.getByText("臨時ダイヤ")).toBeVisible();

    await page.getByRole("button", { name: /暁ゆき/ }).click();
    await expect(page.getByText("臨時ダイヤ")).not.toBeVisible();
    await expect(page.getByText(/^10:00:\d{2}$/)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /小夜ゆき/ }),
    ).toHaveAttribute("aria-pressed", "false");
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

test.describe("GenerateImage セクションの要素確認", () => {
  // Cloudinary API のモックレスポンス（実アクセスさせない）。
  const MOCK_IMAGES = [
    {
      originalUrl: "https://res.cloudinary.com/demo/original/1.png",
      previewUrl: "https://res.cloudinary.com/demo/preview/1.png",
    },
    {
      originalUrl: "https://res.cloudinary.com/demo/original/2.png",
      previewUrl: "https://res.cloudinary.com/demo/preview/2.png",
    },
    {
      originalUrl: "https://res.cloudinary.com/demo/original/3.png",
      previewUrl: "https://res.cloudinary.com/demo/preview/3.png",
    },
  ];

  // 生成画像は unoptimized のため src はモック URL がそのまま入る。
  // res.cloudinary.com への実ネットワークアクセスを避けるため、画像本体も差し替える。
  async function stubCloudinaryAssets(page: Page): Promise<void> {
    await page.route("https://res.cloudinary.com/**", async (route) => {
      // 1x1 透過 PNG
      await route.fulfill({
        status: 200,
        contentType: "image/png",
        body: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/pLvAAAAAElFTkSuQmCC",
          "base64",
        ),
      });
    });
  }

  test("API成功時にプレビュー画像3枚が表示される", async ({ page }) => {
    await stubCloudinaryAssets(page);
    await page.route("/api/cloudinary/images", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ images: MOCK_IMAGES }),
      });
    });
    await gotoAoi(page);

    const section = page.locator("#generate-image");
    // 並列実行時は dev サーバーのハイドレーション完了（useEffect での取得開始）が
    // 遅れることがあるため、最初の描画確認だけ待ち時間を長めに取る。
    await expect(section.getByRole("img", { name: "生成画像 1" })).toBeVisible({
      timeout: 15000,
    });
    await expect(section.getByRole("button", { name: /拡大表示/ })).toHaveCount(
      3,
    );
    // プレビュー URL に差し替わっている。
    await expect(
      section.getByRole("img", { name: "生成画像 1" }),
    ).toHaveAttribute("src", MOCK_IMAGES[0].previewUrl);
  });

  test("プレビュークリックでオリジナル画像が Lightbox 表示され、閉じられる", async ({
    page,
  }) => {
    await stubCloudinaryAssets(page);
    await page.route("/api/cloudinary/images", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ images: MOCK_IMAGES }),
      });
    });
    await gotoAoi(page);

    const section = page.locator("#generate-image");
    await section
      .getByRole("button", { name: "生成画像 1 を拡大表示" })
      .click();

    // Lightbox が開き、オリジナル URL の画像が表示される。
    const lightbox = page.getByTestId("aoi-lightbox");
    await expect(lightbox).toBeVisible();
    await expect(lightbox.getByRole("img")).toHaveAttribute(
      "src",
      MOCK_IMAGES[0].originalUrl,
    );

    // ✕ ボタンで閉じる。
    await lightbox.getByRole("button", { name: "Close" }).click();
    await expect(lightbox).toBeHidden();

    // 再度開き、Escape キーでも閉じられる。
    await section
      .getByRole("button", { name: "生成画像 1 を拡大表示" })
      .click();
    await expect(lightbox).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(lightbox).toBeHidden();
  });

  test("Lightbox は body 直下に Portal 描画され、ナビより前面に重なる", async ({
    page,
  }) => {
    await stubCloudinaryAssets(page);
    await page.route("/api/cloudinary/images", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ images: MOCK_IMAGES }),
      });
    });
    await gotoAoi(page);

    await page
      .locator("#generate-image")
      .getByRole("button", { name: "生成画像 1 を拡大表示" })
      .click();

    // 親セクションのスタッキングコンテキスト（relative z-[2]）に閉じ込められず、
    // body 直下に描画される（レイヤー表示順序の回帰ガード）。
    const backdrop = page.getByTestId("aoi-lightbox-backdrop");
    await expect(backdrop).toBeVisible();
    expect(
      await backdrop.evaluate((el) => el.parentElement === document.body),
    ).toBe(true);

    // sticky ナビ（header）より大きい z-index を持ち、常に前面に出る。
    const backdropZ = await backdrop.evaluate((el) =>
      Number.parseInt(window.getComputedStyle(el).zIndex, 10),
    );
    const headerZ = await page
      .locator("header")
      .evaluate((el) =>
        Number.parseInt(window.getComputedStyle(el).zIndex, 10),
      );
    expect(backdropZ).toBeGreaterThan(headerZ);
  });

  test("API失敗時は仮画像（フォールバック）が表示される", async ({ page }) => {
    await page.route("/api/cloudinary/images", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });
    await gotoAoi(page);

    const section = page.locator("#generate-image");
    await expect(section.getByTestId("aoi-generate-skeleton")).toHaveCount(3);
    // 拡大表示ボタン（プレビュー）は生成されない。
    await expect(section.getByRole("button", { name: /拡大表示/ })).toHaveCount(
      0,
    );
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

  test("消灯中にポートフォリオトップへ戻るリンクが表示される", async ({
    page,
  }) => {
    await gotoAoi(page);
    await expect(page.getByText(/\d{2}:\d{2}:\d{2}/)).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole("button", { name: /灯りを落とす/ }).click();
    await expect(page.getByText("— 灯りを落としました")).toBeVisible();

    // 「>> ポートフォリオに戻る」がトップページへのリンクとして表示される。
    const backLink = page.getByRole("link", {
      name: ">> ポートフォリオに戻る",
    });
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute("href", "/");
  });

  test("消灯中に「ポートフォリオに戻る」リンクでトップページへ遷移できる", async ({
    page,
  }) => {
    await gotoAoi(page);
    await expect(page.getByText(/\d{2}:\d{2}:\d{2}/)).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole("button", { name: /灯りを落とす/ }).click();
    await expect(page.getByText("— 灯りを落としました")).toBeVisible();

    // 親要素は pointer-events-none だが、点灯中のリンクだけはクリックできる。
    await page.getByRole("link", { name: ">> ポートフォリオに戻る" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page).toHaveTitle(/Wanderlust/);
  });
});
