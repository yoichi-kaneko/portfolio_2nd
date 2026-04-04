import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMountainReportCount } from "./useMountainReportCount";

describe("useMountainReportCount", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("初期状態では loading=true、count=null である", () => {
    vi.spyOn(global, "fetch").mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useMountainReportCount());

    expect(result.current.loading).toBe(true);
    expect(result.current.count).toBeNull();
  });

  it("API成功時に count が返る", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ count: 999 }),
    } as Response);

    const { result } = renderHook(() => useMountainReportCount());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.count).toBe(999);
  });

  it("API失敗時は count=null で終了する", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response);

    const { result } = renderHook(() => useMountainReportCount());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.count).toBeNull();
  });

  it("ネットワークエラー時は count=null で終了する", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network Error"));

    const { result } = renderHook(() => useMountainReportCount());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.count).toBeNull();
  });
});
