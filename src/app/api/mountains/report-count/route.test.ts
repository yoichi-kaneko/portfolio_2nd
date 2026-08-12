// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}));

vi.mock("redis", () => ({
  createClient: createClientMock,
}));

import { GET } from "./route";

const YAMAP_ACTIVITIES_API =
  "https://api.yamap.com/v3/users/1027860/activities";

function createRedisClientMock() {
  return {
    connect: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue("OK"),
    del: vi.fn().mockResolvedValue(1),
    quit: vi.fn().mockResolvedValue(undefined),
  };
}

/** YAMAP API の成功レスポンスを模したモックを登録する */
function mockYamapResponse(totalCount: unknown) {
  return vi.spyOn(global, "fetch").mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ meta: { total_count: totalCount } }),
  } as Response);
}

describe("/api/mountains/report-count GET", () => {
  const originalRedisUrl = process.env.REDIS_URL;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.REDIS_URL = "redis://test";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalRedisUrl === undefined) {
      delete process.env.REDIS_URL;
    } else {
      process.env.REDIS_URL = originalRedisUrl;
    }
  });

  it("REDIS_URL 未設定時は Redis を使わず YAMAP API から取得する", async () => {
    delete process.env.REDIS_URL;

    const fetchMock = mockYamapResponse(42);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ count: 42 });
    expect(createClientMock).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith(
      YAMAP_ACTIVITIES_API,
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("Redis キャッシュがあればキャッシュ値を返す", async () => {
    const redisClient = createRedisClientMock();
    redisClient.get.mockResolvedValue(JSON.stringify({ count: 321 }));
    createClientMock.mockReturnValue(redisClient);

    const fetchMock = mockYamapResponse(42);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ count: 321 });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(redisClient.set).not.toHaveBeenCalled();
    expect(redisClient.quit).toHaveBeenCalledTimes(1);
  });

  it("キャッシュミス時は YAMAP API から取得して number で返し、キャッシュに保存する", async () => {
    const redisClient = createRedisClientMock();
    createClientMock.mockReturnValue(redisClient);

    const fetchMock = mockYamapResponse(1234);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ count: 1234 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      YAMAP_ACTIVITIES_API,
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(redisClient.set).toHaveBeenCalledWith(
      "mountains:report_count",
      JSON.stringify({ count: 1234 }),
      { EX: 24 * 60 * 60 },
    );
    expect(redisClient.quit).toHaveBeenCalledTimes(1);
  });

  it("YAMAP API がエラーを返した場合は 500 を返す", async () => {
    const redisClient = createRedisClientMock();
    createClientMock.mockReturnValue(redisClient);

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({}),
    } as Response);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: "YAMAP API error: 503" });
    expect(redisClient.set).not.toHaveBeenCalled();
    expect(redisClient.quit).toHaveBeenCalledTimes(1);
  });

  it("件数が数値として取り出せない場合は 500 を返す", async () => {
    const redisClient = createRedisClientMock();
    createClientMock.mockReturnValue(redisClient);

    mockYamapResponse("N/A");

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: "Failed to parse report count as number" });
    expect(redisClient.set).not.toHaveBeenCalled();
  });

  it("Redis 読み取り失敗時は YAMAP API にフォールバックする", async () => {
    const brokenRedisClient = createRedisClientMock();
    brokenRedisClient.connect.mockRejectedValue(new Error("redis down"));
    createClientMock.mockReturnValue(brokenRedisClient);

    const fetchMock = mockYamapResponse(555);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ count: 555 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    // 接続に失敗しているためキャッシュ保存は行われない
    expect(brokenRedisClient.set).not.toHaveBeenCalled();
    expect(brokenRedisClient.quit).toHaveBeenCalledTimes(1);
  });

  it("キャッシュが不正な JSON のときは YAMAP API にフォールバックする", async () => {
    const redisClient = createRedisClientMock();
    redisClient.get.mockResolvedValue("not-json{");
    createClientMock.mockReturnValue(redisClient);

    mockYamapResponse(777);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ count: 777 });
    expect(redisClient.set).toHaveBeenCalledWith(
      "mountains:report_count",
      JSON.stringify({ count: 777 }),
      { EX: 24 * 60 * 60 },
    );
  });

  it("キャッシュの count が有限数でないときは YAMAP API にフォールバックする", async () => {
    const redisClient = createRedisClientMock();
    redisClient.get.mockResolvedValue(JSON.stringify({ count: "x" }));
    createClientMock.mockReturnValue(redisClient);

    mockYamapResponse(888);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ count: 888 });
    expect(redisClient.set).toHaveBeenCalledWith(
      "mountains:report_count",
      JSON.stringify({ count: 888 }),
      { EX: 24 * 60 * 60 },
    );
  });

  it("Redis 書き込み失敗時でも取得した件数を返す", async () => {
    const redisClient = createRedisClientMock();
    redisClient.set.mockRejectedValue(new Error("redis write failed"));
    createClientMock.mockReturnValue(redisClient);

    mockYamapResponse(101);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ count: 101 });
    expect(redisClient.quit).toHaveBeenCalledTimes(1);
  });
});
