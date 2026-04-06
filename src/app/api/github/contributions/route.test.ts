// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";
import { fetchWeeklyContributions } from "@/lib/github";

vi.mock("@/lib/github", () => ({
  fetchWeeklyContributions: vi.fn(),
}));

describe("/api/github/contributions GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("取得成功時は weekly を返す", async () => {
    vi.mocked(fetchWeeklyContributions).mockResolvedValue([
      { week: "W1", count: 11 },
      { week: "W2", count: 7 },
    ]);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      weekly: [
        { week: "W1", count: 11 },
        { week: "W2", count: 7 },
      ],
    });
    expect(fetchWeeklyContributions).toHaveBeenCalledTimes(1);
  });

  it("取得失敗時は 500 と error を返す", async () => {
    vi.mocked(fetchWeeklyContributions).mockRejectedValue(new Error("boom"));

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: "boom" });
  });
});
