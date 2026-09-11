import { test, expect, MOCK_WEEKLY } from "./fixtures";
import { projects } from "../data/projects.json";
import { mountains } from "../data/mountains.json";
import { installAudioPlaybackStub, type AudioMockState } from "./support/audio";
import { expectScrollLocked } from "./support/assertions";

test("GitHubグラフは5週を古い順に並べ、各週の件数をツールチップに表示する", async ({
  page,
}) => {
  await page.goto("/");
  const bars = page.locator(".recharts-bar-rectangle");
  await expect(bars).toHaveCount(5);
  const oldestFirst = [...MOCK_WEEKLY].reverse();
  for (const [index, week] of oldestFirst.entries()) {
    await bars.nth(index).hover();
    const label =
      week.week === "W1" ? "1 week ago" : `${week.week.slice(1)} weeks ago`;
    await expect(
      page.getByText(`${label}: ${week.count}`, { exact: true }),
    ).toBeVisible();
  }
});

test.describe("プロジェクトの絞り込みと詳細", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "View All" }).click();
  });

  for (const [category, label] of [
    ["contract", "業務委託 / 受託"],
    ["employee", "正社員"],
    ["personal", "個人開発"],
  ]) {
    test(`${label} は対象のカードだけを表示し、Allで全件に戻る`, async ({
      page,
    }) => {
      const dialog = page.getByRole("dialog", { name: "All Projects" });
      await dialog.getByRole("button", { name: label, exact: true }).click();
      const expected = projects.filter((project) => project.type === category);
      expect(expected.length).toBeGreaterThan(0);
      await expect(dialog.getByTestId("project-card")).toHaveCount(
        expected.length,
      );
      for (const project of projects) {
        const card = dialog
          .getByTestId("project-card")
          .filter({ has: page.getByText(project.name, { exact: true }) });
        await expect(card).toHaveCount(project.type === category ? 1 : 0);
      }
      await dialog.getByRole("button", { name: "All", exact: true }).click();
      await expect(dialog.getByTestId("project-card")).toHaveCount(
        projects.length,
      );
    });
  }

  test("カードと詳細が一致し、別カードへの切替・再クリック・タブ変更が反映される", async ({
    page,
  }) => {
    const dialog = page.getByRole("dialog", { name: "All Projects" });
    const cards = dialog.getByTestId("project-card");
    const detail = dialog.getByRole("region", { name: "プロジェクト詳細" });
    for (const index of [0, 1]) {
      await cards.nth(index).click();
      await expect(
        detail.getByRole("heading", {
          name: projects[index].name,
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        detail.getByText(projects[index].detail, { exact: true }),
      ).toBeVisible();
      await expect(
        detail.getByText(projects[index].period, { exact: true }),
      ).toBeVisible();
      for (const tag of projects[index].tags)
        await expect(detail.getByText(tag, { exact: true })).toBeVisible();
    }
    await cards.nth(1).click();
    await expect(detail).toBeHidden();
    await cards.first().click();
    await dialog.getByRole("button", { name: "正社員", exact: true }).click();
    await expect(detail).toBeHidden();
  });

  for (const closeMethod of ["button", "escape", "backdrop"]) {
    test(`${closeMethod}で閉じて開き直すとAll・未選択に戻る`, async ({
      page,
    }) => {
      const dialog = page.getByRole("dialog", { name: "All Projects" });
      await dialog
        .getByRole("button", { name: "個人開発", exact: true })
        .click();
      await dialog.getByTestId("project-card").first().click();
      if (closeMethod === "button")
        await dialog
          .getByRole("button", { name: "Close", exact: true })
          .click();
      else if (closeMethod === "escape") await page.keyboard.press("Escape");
      else
        await page
          .getByTestId("projects-modal-backdrop")
          .click({ position: { x: 1, y: 1 } });
      await expect(dialog).toBeHidden();
      await page.getByRole("button", { name: "View All" }).click();
      await expect(
        dialog.getByRole("button", { name: "All", exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
      await expect(dialog.getByTestId("project-card")).toHaveCount(
        projects.length,
      );
      await expect(
        dialog.getByRole("region", { name: "プロジェクト詳細" }),
      ).toBeHidden();
    });
  }

  test("キーボードでカードを選べ、フォーカスと背景スクロールがモーダル内に保たれる", async ({
    page,
  }) => {
    const dialog = page.getByRole("dialog", { name: "All Projects" });
    const close = dialog.getByRole("button", { name: "Close", exact: true });
    await expect(close).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(dialog.getByTestId("project-card").last()).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(close).toBeFocused();
    // Close → All → contract → employee → personal → 最初のカード
    for (let i = 0; i < 5; i++) await page.keyboard.press("Tab");
    await expect(dialog.getByTestId("project-card").first()).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(
      dialog.getByRole("heading", { name: projects[0].name, exact: true }),
    ).toBeVisible();
    await page.keyboard.press("Space");
    await expect(
      dialog.getByRole("region", { name: "プロジェクト詳細" }),
    ).toBeHidden();
    await expectScrollLocked(page);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "View All" })).toBeFocused();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  });
});

test.describe("山の一覧と詳細", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Map", exact: true }).click();
  });

  test("一覧選択・前後ボタン・左右キーで詳細とリンクが同期し、端では越境しない", async ({
    page,
  }) => {
    const dialog = page.getByRole("dialog", { name: "Mountain Map" });
    const list = dialog.getByTestId("mountain-list");
    const assertMountain = async (index: number) => {
      await expect(
        dialog.getByRole("heading", {
          name: mountains[index].name,
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        dialog.getByText(`${index + 1} / ${mountains.length}`, { exact: true }),
      ).toBeVisible();
      await expect(
        dialog.getByRole("link", { name: "YAMAPで詳細を見る" }),
      ).toHaveAttribute("href", mountains[index].url);
      await expect(
        dialog.getByRole("link", { name: "YAMAPで詳細を見る" }),
      ).toHaveAttribute("target", "_blank");
      await expect(
        dialog
          .getByRole("link", { name: "YAMAPで詳細を見る" })
          .locator("..")
          .getByText(mountains[index].date, { exact: true }),
      ).toBeVisible();
      await expect(list.getByRole("button").nth(index)).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      // viewportだけでなく、一覧のスクロール領域によるクリップも確認する。
      await expect
        .poll(() =>
          list
            .getByRole("button")
            .nth(index)
            .evaluate((node) => {
              const item = node.getBoundingClientRect();
              const panel = node.parentElement!.getBoundingClientRect();
              return (
                item.top >= panel.top - 1 && item.bottom <= panel.bottom + 1
              );
            }),
        )
        .toBe(true);
    };
    await page.keyboard.press("ArrowRight");
    await expect(
      dialog.getByRole("link", { name: "YAMAPで詳細を見る" }),
    ).toHaveCount(0);
    await list.getByRole("button").first().click();
    await assertMountain(0);
    await expect(dialog.getByRole("button", { name: "← 前へ" })).toBeDisabled();
    await page.keyboard.press("ArrowLeft");
    await assertMountain(0);
    await dialog.getByRole("button", { name: "次へ →" }).click();
    await assertMountain(1);
    await dialog.getByRole("button", { name: "← 前へ" }).click();
    await assertMountain(0);
    await page.keyboard.press("ArrowRight");
    await assertMountain(1);
    await page.keyboard.press("ArrowLeft");
    await assertMountain(0);
    // 末尾直前からキーで進め、画面外の項目への自動スクロールも検証する。
    await list
      .getByRole("button")
      .nth(mountains.length - 2)
      .click();
    await page.keyboard.press("ArrowRight");
    await assertMountain(mountains.length - 1);
    await expect(dialog.getByRole("button", { name: "次へ →" })).toBeDisabled();
    await page.keyboard.press("ArrowRight");
    await assertMountain(mountains.length - 1);
  });

  test("フォーカスが循環し、閉じるとMapボタンとスクロール状態を復元する", async ({
    page,
  }) => {
    const dialog = page.getByRole("dialog", { name: "Mountain Map" });
    const close = dialog.getByRole("button", { name: "Close" });
    await expect(close).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(
      dialog.getByTestId("mountain-list").getByRole("button").last(),
    ).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(close).toBeFocused();
    await expectScrollLocked(page);
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("button", { name: "Map", exact: true }),
    ).toBeFocused();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  });
});

test.describe("音声の終了・失敗・画面遷移", () => {
  test("再生終了でUIが停止状態に戻り、再度再生できる", async ({ page }) => {
    await installAudioPlaybackStub(page);
    await page.goto("/");
    const toggle = page.getByTestId("life-log-audio-toggle");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-label", "音声を一時停止");
    await page.evaluate(() =>
      (
        window as unknown as { __audioElement: HTMLAudioElement }
      ).__audioElement.dispatchEvent(new Event("ended")),
    );
    await expect(toggle).toHaveAttribute("aria-label", "音声を再生");
    await expect(page.locator("canvas")).toHaveCount(0);
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-label", "音声を一時停止");
    await expect(page.locator("canvas")).toBeVisible();
  });

  test("再生拒否後も再操作で再生できる", async ({ page }) => {
    await installAudioPlaybackStub(page, true);
    await page.goto("/");
    const toggle = page.getByTestId("life-log-audio-toggle");
    await toggle.click();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as unknown as { __audioMockState: AudioMockState })
              .__audioMockState.playCalls,
        ),
      )
      .toBe(1);
    await expect(toggle).toHaveAttribute("aria-label", "音声を再生");
    await expect(page.locator("canvas")).toHaveCount(0);
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-label", "音声を一時停止");
    await expect(page.locator("canvas")).toBeVisible();
  });

  test("再生中にAoiへ遷移すると音声が停止する", async ({ page }) => {
    await installAudioPlaybackStub(page);
    await page.goto("/");
    await page.getByTestId("life-log-audio-toggle").click();
    await expect(page.getByTestId("life-log-audio-toggle")).toHaveAttribute(
      "aria-label",
      "音声を一時停止",
    );
    await page.getByRole("link", { name: /Project Aoi/ }).click();
    await expect(page).toHaveURL(/\/aoi$/);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as unknown as { __audioMockState: AudioMockState })
              .__audioMockState.pauseCalls,
        ),
      )
      .toBe(1);
    expect(
      await page.evaluate(
        () =>
          (window as unknown as { __audioElement: HTMLAudioElement })
            .__audioElement.paused,
      ),
    ).toBe(true);
    await expect(page.locator("canvas")).toHaveCount(0);
  });
});
