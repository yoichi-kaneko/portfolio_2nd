// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Cloudinary SDK は実アクセスさせずモック化する
const { mockConfig, mockUrl, mockSearch } = vi.hoisted(() => {
  const mockSearch = {
    expression: vi.fn(),
    sort_by: vi.fn(),
    max_results: vi.fn(),
    execute: vi.fn(),
  };
  return { mockConfig: vi.fn(), mockUrl: vi.fn(), mockSearch };
});

vi.mock("cloudinary", () => ({
  v2: { config: mockConfig, url: mockUrl, search: mockSearch },
}));

// Redis も実接続させずモック化する
const { mockRedisClient, mockCreateClient } = vi.hoisted(() => {
  const mockRedisClient = {
    connect: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    quit: vi.fn(),
  };
  return { mockRedisClient, mockCreateClient: vi.fn(() => mockRedisClient) };
});

vi.mock("redis", () => ({ createClient: mockCreateClient }));

import { fetchLatestImages } from "./cloudinary";

const RESOURCES = [
  { public_id: "test-folder/img1", format: "jpg" },
  { public_id: "test-folder/img2", format: "png" },
  { public_id: "test-folder/img3", format: "webp" },
];

/** crop=scale をプレビュー用として区別する URL 生成モック */
function stubUrl() {
  mockUrl.mockImplementation(
    (publicId: string, opts: { crop?: string; format?: string }) =>
      opts?.crop === "scale"
        ? `https://res/preview/${publicId}.${opts.format}`
        : `https://res/original/${publicId}.${opts.format}`,
  );
}

describe("fetchLatestImages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // チェーン呼び出しが自身を返すよう再設定する
    mockSearch.expression.mockReturnValue(mockSearch);
    mockSearch.sort_by.mockReturnValue(mockSearch);
    mockSearch.max_results.mockReturnValue(mockSearch);
    mockCreateClient.mockReturnValue(mockRedisClient);
    stubUrl();

    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "demo");
    vi.stubEnv("CLOUDINARY_API_KEY", "key");
    vi.stubEnv("CLOUDINARY_API_SECRET", "secret");
    vi.stubEnv("CLOUDINARY_IMAGE_ASSET_FOLDER", "test-folder");
    vi.stubEnv("REDIS_URL", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("REDIS_URL 未設定時は Cloudinary から最新3件を取得し URL を組み立てる", async () => {
    mockSearch.execute.mockResolvedValue({ resources: RESOURCES });

    const result = await fetchLatestImages();

    expect(result).toEqual([
      {
        originalUrl: "https://res/original/test-folder/img1.jpg",
        previewUrl: "https://res/preview/test-folder/img1.jpg",
      },
      {
        originalUrl: "https://res/original/test-folder/img2.png",
        previewUrl: "https://res/preview/test-folder/img2.png",
      },
      {
        originalUrl: "https://res/original/test-folder/img3.webp",
        previewUrl: "https://res/preview/test-folder/img3.webp",
      },
    ]);

    // フォルダ条件・新しい順・3件のクエリを組み立てている
    expect(mockSearch.expression).toHaveBeenCalledWith(
      'asset_folder="test-folder"',
    );
    expect(mockSearch.sort_by).toHaveBeenCalledWith("created_at", "desc");
    expect(mockSearch.max_results).toHaveBeenCalledWith(3);

    // Redis は使わない
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("プレビュー URL は c_scale・縦幅384px で生成する", async () => {
    mockSearch.execute.mockResolvedValue({ resources: [RESOURCES[0]] });

    await fetchLatestImages();

    expect(mockUrl).toHaveBeenCalledWith("test-folder/img1", {
      secure: true,
      format: "jpg",
    });
    expect(mockUrl).toHaveBeenCalledWith("test-folder/img1", {
      secure: true,
      format: "jpg",
      height: 384,
      crop: "scale",
    });
  });

  it("有効なキャッシュがある場合は Cloudinary へアクセスせずキャッシュを返す", async () => {
    vi.stubEnv("REDIS_URL", "redis://localhost:6379");
    const cached = [
      {
        originalUrl: "https://res/original/cached.jpg",
        previewUrl: "https://res/preview/cached.jpg",
      },
    ];
    mockRedisClient.get.mockResolvedValue(
      JSON.stringify({ cachedAt: Date.now(), result: cached }),
    );

    const result = await fetchLatestImages();

    expect(result).toEqual(cached);
    expect(mockSearch.execute).not.toHaveBeenCalled();
    expect(mockRedisClient.quit).toHaveBeenCalled();
  });

  it("キャッシュが12時間より古い場合は再取得しキャッシュへ保存する", async () => {
    vi.stubEnv("REDIS_URL", "redis://localhost:6379");
    const staleAt = Date.now() - (12 * 60 * 60 * 1000 + 1000); // 12時間 + 1秒前
    mockRedisClient.get.mockResolvedValue(
      JSON.stringify({ cachedAt: staleAt, result: [] }),
    );
    mockSearch.execute.mockResolvedValue({ resources: [RESOURCES[0]] });

    const result = await fetchLatestImages();

    expect(result).toEqual([
      {
        originalUrl: "https://res/original/test-folder/img1.jpg",
        previewUrl: "https://res/preview/test-folder/img1.jpg",
      },
    ]);
    expect(mockSearch.execute).toHaveBeenCalledTimes(1);
    // TTL 12時間で保存する
    expect(mockRedisClient.set).toHaveBeenCalledWith(
      "cloudinary:latest_images",
      expect.any(String),
      { EX: 12 * 60 * 60 },
    );
  });

  it("Redis 読み取りエラー時は Cloudinary へフォールバックする", async () => {
    vi.stubEnv("REDIS_URL", "redis://localhost:6379");
    mockRedisClient.connect.mockRejectedValue(new Error("redis down"));
    mockSearch.execute.mockResolvedValue({ resources: [RESOURCES[0]] });

    const result = await fetchLatestImages();

    expect(result).toEqual([
      {
        originalUrl: "https://res/original/test-folder/img1.jpg",
        previewUrl: "https://res/preview/test-folder/img1.jpg",
      },
    ]);
    expect(mockSearch.execute).toHaveBeenCalledTimes(1);
  });

  it("フォルダ未設定時はエラーを投げる", async () => {
    vi.stubEnv("CLOUDINARY_IMAGE_ASSET_FOLDER", "");

    await expect(fetchLatestImages()).rejects.toThrow(
      "CLOUDINARY_IMAGE_ASSET_FOLDER is not set",
    );
  });

  it("認証情報未設定時はエラーを投げる", async () => {
    vi.stubEnv("CLOUDINARY_API_SECRET", "");

    await expect(fetchLatestImages()).rejects.toThrow(
      "Cloudinary credentials are not set",
    );
  });
});
