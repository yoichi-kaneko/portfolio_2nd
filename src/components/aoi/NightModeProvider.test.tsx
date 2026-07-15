import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NightModeProvider, useNightMode } from "./NightModeProvider";

describe("NightModeProvider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("初期状態は灯り ON（night=false）", () => {
    const { result } = renderHook(() => useNightMode(), {
      wrapper: NightModeProvider,
    });
    expect(result.current.night).toBe(false);
  });

  it("toggleNight で夜モードが反転する", () => {
    const { result } = renderHook(() => useNightMode(), {
      wrapper: NightModeProvider,
    });

    act(() => result.current.toggleNight());
    expect(result.current.night).toBe(true);

    act(() => result.current.toggleNight());
    expect(result.current.night).toBe(false);
  });

  it("Provider の外で useNightMode を使うとエラーになる", () => {
    // React が render エラーを console.error に出力するため抑制する
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => renderHook(() => useNightMode())).toThrow(
      "useNightMode must be used within a NightModeProvider",
    );
  });
});
