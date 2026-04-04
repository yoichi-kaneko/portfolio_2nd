import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
    set: vi.fn().mockResolvedValue("OK"),
    del: vi.fn().mockResolvedValue(1),
    quit: vi.fn().mockResolvedValue(undefined),
  };
}

function createBrowserMock(html: string) {
  const page = {
    goto: vi.fn().mockResolvedValue(undefined),
    waitForSelector: vi.fn().mockResolvedValue(undefined),
    content: vi.fn().mockResolvedValue(html),
  };

  const browser = {
    newPage: vi.fn().mockResolvedValue(page),
    close: vi.fn().mockResolvedValue(undefined),
  };

  return { browser, page };
}

describe("/api/mountains/report-count GET", () => {
  const originalRedisUrl = process.env.REDIS_URL;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.REDIS_URL = "redis://test";
  });

  afterEach(() => {
    if (originalRedisUrl === undefined) {
      delete process.env.REDIS_URL;
    } else {
      process.env.REDIS_URL = originalRedisUrl;
    }
  });

  it("REDIS_URL 未設定時は Redis を使わずスクレイピングのみ行う", async () => {
    delete process.env.REDIS_URL;

    const { browser } = createBrowserMock(
      '<ul class="markuplint-ignore-permitted-contents"><li role="status">42 件</li></ul>',
    );
    launchMountainsBrowserMock.mockResolvedValue(browser);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ count: 42 });
    expect(createClientMock).not.toHaveBeenCalled();
    expect(launchMountainsBrowserMock).toHaveBeenCalledTimes(1);
    expect(browser.close).toHaveBeenCalledTimes(1);
  });

  it("REDIS_URL 未設定かつ同時リクエストでもブラウザは1回だけ起動する", async () => {
    delete process.env.REDIS_URL;

    const { browser } = createBrowserMock(
      '<ul class="markuplint-ignore-permitted-contents"><li role="status">42 件</li></ul>',
    );
    launchMountainsBrowserMock.mockImplementation(async () => browser);

    const [a, b] = await Promise.all([GET(), GET()]);
    expect(await a.json()).toEqual({ count: 42 });
    expect(await b.json()).toEqual({ count: 42 });
    expect(launchMountainsBrowserMock).toHaveBeenCalledTimes(1);
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
    const readClient = createRedisClientMock();
    const lockClient = createRedisClientMock();
    createClientMock
      .mockReturnValueOnce(readClient)
      .mockReturnValueOnce(lockClient);

    const { browser, page } = createBrowserMock(
      '<ul class="markuplint-ignore-permitted-contents"><li role="status">1,234 件</li></ul>',
    );
    launchMountainsBrowserMock.mockResolvedValue(browser);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ count: 1234 });
    expect(launchMountainsBrowserMock).toHaveBeenCalledTimes(1);
    expect(page.goto).toHaveBeenCalledWith(
      "https://yamap.com/users/1027860",
      expect.objectContaining({
        waitUntil: "domcontentloaded",
        timeout: 10_000,
      }),
    );
    expect(page.waitForSelector).toHaveBeenCalledWith(
      "ul.markuplint-ignore-permitted-contents [role='status']",
      { timeout: 5_000 },
    );
    expect(lockClient.set).toHaveBeenCalledWith(
      "mountains:report_count:lock",
      "1",
      { NX: true, EX: 45 },
    );
    expect(lockClient.set).toHaveBeenCalledWith(
      "mountains:report_count",
      JSON.stringify({ count: 1234 }),
      { EX: 24 * 60 * 60 },
    );
    expect(lockClient.del).toHaveBeenCalledWith("mountains:report_count:lock");
    expect(browser.close).toHaveBeenCalledTimes(1);
  });

  it("数値化できない文字列を取得した場合は 500 を返す", async () => {
    const readClient = createRedisClientMock();
    const lockClient = createRedisClientMock();
    createClientMock
      .mockReturnValueOnce(readClient)
      .mockReturnValueOnce(lockClient);

    const { browser } = createBrowserMock(
      '<ul class="markuplint-ignore-permitted-contents"><li role="status">N/A</li></ul>',
    );
    launchMountainsBrowserMock.mockResolvedValue(browser);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: "Failed to parse report count as number" });
    expect(lockClient.set).toHaveBeenCalledTimes(1);
    expect(lockClient.set).toHaveBeenCalledWith(
      "mountains:report_count:lock",
      "1",
      { NX: true, EX: 45 },
    );
    expect(lockClient.del).toHaveBeenCalledWith("mountains:report_count:lock");
  });

  it("Redis 読み取り失敗時はスクレイピングにフォールバックする", async () => {
    const brokenRedisClient = createRedisClientMock();
    brokenRedisClient.connect.mockRejectedValue(new Error("redis down"));

    const lockClient = createRedisClientMock();
    createClientMock
      .mockReturnValueOnce(brokenRedisClient)
      .mockReturnValueOnce(lockClient);

    const { browser } = createBrowserMock(
      '<ul class="markuplint-ignore-permitted-contents"><li role="status">555</li></ul>',
    );
    launchMountainsBrowserMock.mockResolvedValue(browser);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ count: 555 });
    expect(createClientMock).toHaveBeenCalledTimes(2);
    expect(lockClient.set).toHaveBeenCalledWith(
      "mountains:report_count",
      JSON.stringify({ count: 555 }),
      { EX: 24 * 60 * 60 },
    );
  });

  it("キャッシュが不正な JSON のときはスクレイピングにフォールバックする", async () => {
    const readClient = createRedisClientMock();
    readClient.get.mockResolvedValue("not-json{");

    const lockClient = createRedisClientMock();
    createClientMock
      .mockReturnValueOnce(readClient)
      .mockReturnValueOnce(lockClient);

    const { browser } = createBrowserMock(
      '<ul class="markuplint-ignore-permitted-contents"><li role="status">777</li></ul>',
    );
    launchMountainsBrowserMock.mockResolvedValue(browser);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ count: 777 });
    expect(launchMountainsBrowserMock).toHaveBeenCalledTimes(1);
    expect(lockClient.set).toHaveBeenCalledWith(
      "mountains:report_count",
      JSON.stringify({ count: 777 }),
      { EX: 24 * 60 * 60 },
    );
  });

  it("キャッシュの count が有限数でないときはスクレイピングにフォールバックする", async () => {
    const readClient = createRedisClientMock();
    readClient.get.mockResolvedValue(JSON.stringify({ count: "x" }));

    const lockClient = createRedisClientMock();
    createClientMock
      .mockReturnValueOnce(readClient)
      .mockReturnValueOnce(lockClient);

    const { browser } = createBrowserMock(
      '<ul class="markuplint-ignore-permitted-contents"><li role="status">888</li></ul>',
    );
    launchMountainsBrowserMock.mockResolvedValue(browser);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ count: 888 });
    expect(launchMountainsBrowserMock).toHaveBeenCalledTimes(1);
    expect(lockClient.set).toHaveBeenCalledWith(
      "mountains:report_count",
      JSON.stringify({ count: 888 }),
      { EX: 24 * 60 * 60 },
    );
  });

  it("分散ロック未取得時はポーリングでキャッシュが埋まるのを待つ", async () => {
    const readClient = createRedisClientMock();
    const lockClient = createRedisClientMock();
    lockClient.set.mockImplementation(async (key, _val, opts) => {
      if (opts && "NX" in opts && opts.NX) {
        return null;
      }
      return "OK";
    });

    const pollClient = createRedisClientMock();
    pollClient.get
      .mockResolvedValueOnce(null)
      .mockResolvedValue(JSON.stringify({ count: 42 }));

    createClientMock
      .mockReturnValueOnce(readClient)
      .mockReturnValueOnce(lockClient)
      .mockReturnValueOnce(pollClient);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ count: 42 });
    expect(launchMountainsBrowserMock).not.toHaveBeenCalled();
  });
});
