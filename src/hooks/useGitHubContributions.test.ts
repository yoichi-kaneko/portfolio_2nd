import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGitHubContributions } from "./useGitHubContributions";

describe("useGitHubContributions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("API成功時に weekly を表示用データへ変換する", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        weekly: [
          { week: "W1", count: 3 },
          { week: "W2", count: 7 },
          { week: "W3", count: 2 },
        ],
      }),
    } as Response);

    const { result } = renderHook(() => useGitHubContributions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual([
      { weekLabel: "3 weeks ago", count: 2 },
      { weekLabel: "2 weeks ago", count: 7 },
      { weekLabel: "1 week ago", count: 3 },
    ]);
  });

  it("API失敗時は data=null で終了する", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response);

    const { result } = renderHook(() => useGitHubContributions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
  });
});
