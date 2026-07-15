// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";
import { fetchLatestImages } from "@/lib/cloudinary";

vi.mock("@/lib/cloudinary", () => ({
  fetchLatestImages: vi.fn(),
}));

describe("/api/cloudinary/images GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("取得成功時は images を返す", async () => {
    const images = [
      {
        originalUrl: "https://example.com/a",
        previewUrl: "https://example.com/a/h384",
      },
      {
        originalUrl: "https://example.com/b",
        previewUrl: "https://example.com/b/h384",
      },
      {
        originalUrl: "https://example.com/c",
        previewUrl: "https://example.com/c/h384",
      },
    ];
    vi.mocked(fetchLatestImages).mockResolvedValue(images);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ images });
    expect(fetchLatestImages).toHaveBeenCalledTimes(1);
  });

  it("取得失敗時は 500 と error を返す", async () => {
    vi.mocked(fetchLatestImages).mockRejectedValue(new Error("boom"));

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: "boom" });
  });
});
