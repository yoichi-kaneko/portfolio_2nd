import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClientMock, launchMountainsBrowserMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  launchMountainsBrowserMock: vi.fn(),
}));

vi.mock("redis", () => ({
  createClient: createClientMock,
}));

vi.mock("@/lib/server/mountainsBrowser", () => ({
  launchMountainsBrowser: launchMountainsBrowserMock,
}));

import { GET } from "./route";

function createRedisClientMock() {
  return {
    connect: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    quit: vi.fn().mockResolvedValue(undefined),
  };
}

function createBrowserMock(html: string) {
  const page = {
    goto: vi.fn().mockResolvedValue(undefined),
    content: vi.fn().mockResolvedValue(html),
  };

  const browser = {
    newPage: vi.fn().mockResolvedValue(page),
    close: vi.fn().mockResolvedValue(undefined),
  };

  return { browser, page };
}

describe("/api/mountains/report-count GET", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Redis キャッシュがあればキャッシュ値を返す", async () => {
    const redisClient = createRedisClientMock();
    redisClient.get.mockResolvedValue(JSON.stringify({ count: 321 }));
    createClientMock.mockReturnValue(redisClient);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ count: 321 });
    expect(launchMountainsBrowserMock).not.toHaveBeenCalled();
    expect(redisClient.set).not.toHaveBeenCalled();
    expect(redisClient.quit).toHaveBeenCalledTimes(1);
  });

  it("キャッシュミス時はスクレイピングして number で返し、キャッシュに保存する", async () => {
    const redisClient = createRedisClientMock();
    createClientMock.mockReturnValue(redisClient);

    const { browser, page } = createBrowserMock(
      '<ul class="markuplint-ignore-permitted-contents"><li role="status">1,234 件</li></ul>'
    );
    launchMountainsBrowserMock.mockResolvedValue(browser);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ count: 1234 });
    expect(launchMountainsBrowserMock).toHaveBeenCalledTimes(1);
    expect(page.goto).toHaveBeenCalledTimes(1);
    expect(redisClient.set).toHaveBeenCalledWith(
      "mountains:report_count",
      JSON.stringify({ count: 1234 }),
      { EX: 24 * 60 * 60 }
    );
    expect(browser.close).toHaveBeenCalledTimes(1);
  });

  it("数値化できない文字列を取得した場合は 500 を返す", async () => {
    const redisClient = createRedisClientMock();
    createClientMock.mockReturnValue(redisClient);

    const { browser } = createBrowserMock(
      '<ul class="markuplint-ignore-permitted-contents"><li role="status">N/A</li></ul>'
    );
    launchMountainsBrowserMock.mockResolvedValue(browser);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: "Failed to parse report count as number" });
    expect(redisClient.set).not.toHaveBeenCalled();
  });

  it("Redis 読み取り失敗時はスクレイピングにフォールバックする", async () => {
    const brokenRedisClient = createRedisClientMock();
    brokenRedisClient.connect.mockRejectedValue(new Error("redis down"));

    const writeRedisClient = createRedisClientMock();
    createClientMock.mockReturnValueOnce(brokenRedisClient).mockReturnValueOnce(writeRedisClient);

    const { browser } = createBrowserMock(
      '<ul class="markuplint-ignore-permitted-contents"><li role="status">555</li></ul>'
    );
    launchMountainsBrowserMock.mockResolvedValue(browser);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ count: 555 });
    expect(createClientMock).toHaveBeenCalledTimes(2);
    expect(writeRedisClient.set).toHaveBeenCalledTimes(1);
  });
});
