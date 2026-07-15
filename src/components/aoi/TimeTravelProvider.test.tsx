import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TimeTravelProvider, useTimeTravel } from "./TimeTravelProvider";

// JST 10:00（= 暁の時間帯）に固定してテストする。
// スクランブル演出（700ms）を挟むため、時計の値は演出終了後に検証する。
const BASE_TIME = new Date("2026-07-15T10:00:00+09:00");

const renderTimeTravel = () =>
  renderHook(() => useTimeTravel(), { wrapper: TimeTravelProvider });

const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe("TimeTravelProvider", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE_TIME);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("初期状態は実時刻に従う（override なし）", () => {
    const { result } = renderTimeTravel();
    expect(result.current.override).toBeNull();
    expect(result.current.scrambling).toBe(false);
    expect(result.current.resolved.clock).toBe("10:00:00");
    expect(result.current.resolved.realModeKey).toBe("akatsuki");
  });

  it("travelTo で時間旅行が始まり、演出後に代表時刻から進む", () => {
    const { result } = renderTimeTravel();

    act(() => result.current.travelTo("sayo"));
    expect(result.current.override).toBe("sayo");
    expect(result.current.scrambling).toBe(true);

    advance(1000); // スクランブル演出（700ms）終了 + 実時刻 1 秒経過
    expect(result.current.scrambling).toBe(false);
    expect(result.current.resolved.clock).toBe("21:00:01");
    expect(result.current.resolved.modeJp).toBe("小夜");
    // 実時刻は併記され続ける
    expect(result.current.resolved.realClock).toBe("10:00:01");
  });

  it("同じモードを再クリックしても仮時刻はリセットされない", () => {
    const { result } = renderTimeTravel();

    act(() => result.current.travelTo("sayo"));
    advance(3000);
    expect(result.current.resolved.clock).toBe("21:00:03");

    act(() => result.current.travelTo("sayo"));
    // リセットもスクランブル演出も起きない
    expect(result.current.scrambling).toBe(false);
    expect(result.current.resolved.clock).toBe("21:00:03");

    advance(1000);
    expect(result.current.resolved.clock).toBe("21:00:04");
  });

  it("別のモードへ乗り換えると仮時刻は改めて初期化される", () => {
    const { result } = renderTimeTravel();

    act(() => result.current.travelTo("sayo"));
    advance(5000);
    expect(result.current.resolved.clock).toBe("21:00:05");

    act(() => result.current.travelTo("nozomi"));
    expect(result.current.scrambling).toBe(true);
    advance(1000);
    expect(result.current.resolved.clock).toBe("13:30:01");
    expect(result.current.resolved.modeJp).toBe("望");
  });

  it("「いま」のモードを選ぶと現実の時刻に帰還する", () => {
    const { result } = renderTimeTravel();

    act(() => result.current.travelTo("sayo"));
    advance(2000);
    expect(result.current.override).toBe("sayo");

    // BASE_TIME は暁の時間帯 → akatsuki が「いま」の切符
    act(() => result.current.travelTo("akatsuki"));
    expect(result.current.override).toBeNull();
    expect(result.current.scrambling).toBe(false);
    expect(result.current.resolved.clock).toBe("10:00:02");
    expect(result.current.resolved.modeJp).toBe("暁");
  });
});
