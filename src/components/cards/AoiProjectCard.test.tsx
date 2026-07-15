import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AoiProjectCard } from "./AoiProjectCard";

// 発車時刻は new Date() の「ローカル時刻」の時・分をそのまま表示するため、
// タイムゾーン表記のないローカル Date で固定する。
const BASE_TIME = new Date(2026, 6, 15, 10, 5, 45);

/**
 * useAtPageBottom が参照するスクロール指標を差し替える。
 * jsdom は scrollHeight が常に 0 のため、明示的に定義しないと
 * 「常にページ末尾」と判定されてしまう。
 */
function setScrollMetrics({
  innerHeight,
  scrollY,
  scrollHeight,
}: {
  innerHeight: number;
  scrollY: number;
  scrollHeight: number;
}) {
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: innerHeight,
  });
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    value: scrollY,
  });
  Object.defineProperty(document.documentElement, "scrollHeight", {
    configurable: true,
    value: scrollHeight,
  });
}

describe("AoiProjectCard", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE_TIME);
    // ページ途中（末尾ではない）を初期状態とする
    setScrollMetrics({ innerHeight: 800, scrollY: 0, scrollHeight: 2000 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("切符の主要な表記（タイトル・行き先・半券の統計）が表示される", () => {
    render(<AoiProjectCard />);

    expect(screen.getByText("Project Aoi")).toBeInTheDocument();
    expect(screen.getByText("碧衣")).toBeInTheDocument();
    expect(screen.getByText("/aoi ・ 高層階の部屋")).toBeInTheDocument();

    // 半券の統計
    expect(screen.getByText("15+")).toBeInTheDocument();
    expect(screen.getByText("連携サービス")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("実行モード")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("人で制作中")).toBeInTheDocument();
  });

  it("マウント後に現在時刻が発車時刻（HH:MM）として表示される", () => {
    render(<AoiProjectCard />);
    expect(
      screen.getByText(/本日 10:05 発 ・ 全モード停車/),
    ).toBeInTheDocument();
  });

  it("発車時刻は 30 秒ごとに更新される", () => {
    render(<AoiProjectCard />);
    expect(screen.getByText(/本日 10:05 発/)).toBeInTheDocument();

    // 10:05:45 + 30秒 = 10:06:15 → 表示は 10:06 に進む
    act(() => vi.advanceTimersByTime(30_000));
    expect(screen.getByText(/本日 10:06 発/)).toBeInTheDocument();
  });

  it("ページ末尾に到達すると改札スタンプとひょっこり画像にモバイル表示クラスが付く", () => {
    render(<AoiProjectCard />);

    const stamp = screen.getByText("いってらっしゃい");
    const peek = screen.getByAltText("碧衣");

    // ページ途中では非表示（ホバー演出のみ）
    expect(stamp.className).not.toContain("max-md:opacity-100");
    expect(peek.className).not.toContain("max-md:translate-y-[6%]");

    // 末尾までスクロール（threshold 24px 以内）
    setScrollMetrics({ innerHeight: 800, scrollY: 1200, scrollHeight: 2000 });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(stamp.className).toContain("max-md:opacity-100");
    expect(peek.className).toContain("max-md:translate-y-[6%]");

    // 上に戻ると false に戻る
    setScrollMetrics({ innerHeight: 800, scrollY: 0, scrollHeight: 2000 });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(stamp.className).not.toContain("max-md:opacity-100");
    expect(peek.className).not.toContain("max-md:translate-y-[6%]");
  });
});
