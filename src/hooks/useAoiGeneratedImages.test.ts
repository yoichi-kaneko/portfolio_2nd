import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAoiGeneratedImages } from "./useAoiGeneratedImages";

const ENDPOINT = "/api/cloudinary/images";

const MOCK_IMAGES = [
  {
    originalUrl: "https://res.cloudinary.com/demo/original/1.jpg",
    previewUrl: "https://res.cloudinary.com/demo/preview/1.jpg",
  },
  {
    originalUrl: "https://res.cloudinary.com/demo/original/2.jpg",
    previewUrl: "https://res.cloudinary.com/demo/preview/2.jpg",
  },
  {
    originalUrl: "https://res.cloudinary.com/demo/original/3.jpg",
    previewUrl: "https://res.cloudinary.com/demo/preview/3.jpg",
  },
];

describe("useAoiGeneratedImages", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("初期状態では loading=true、images=null である", () => {
    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useAoiGeneratedImages());

    expect(result.current.loading).toBe(true);
    expect(result.current.images).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(ENDPOINT);
  });

  it("API成功時に images が返る", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ images: MOCK_IMAGES }),
    } as Response);

    const { result } = renderHook(() => useAoiGeneratedImages());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.images).toEqual(MOCK_IMAGES);
    expect(fetchMock).toHaveBeenCalledWith(ENDPOINT);
  });

  it("API失敗時は images=null で終了する", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response);

    const { result } = renderHook(() => useAoiGeneratedImages());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.images).toBeNull();
  });

  it("ネットワークエラー時は images=null で終了する", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network Error"));

    const { result } = renderHook(() => useAoiGeneratedImages());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.images).toBeNull();
  });
});
