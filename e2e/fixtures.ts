import { test as base, expect, type Page } from "@playwright/test";

// API の契約順序は新しい週から。描画側で古い週からに変換する。
export const MOCK_WEEKLY = [
  { week: "W1", count: 30 },
  { week: "W2", count: 5 },
  { week: "W3", count: 15 },
  { week: "W4", count: 20 },
  { week: "W5", count: 10 },
];
export const MOCK_IMAGES = [1, 2, 3].map((id) => ({
  originalUrl: `https://res.cloudinary.com/demo/original/${id}.svg`,
  previewUrl: `https://res.cloudinary.com/demo/preview/${id}.svg`,
}));

export const test = base.extend<{ networkIsolation: void }>({
  networkIsolation: [
    async ({ context, baseURL }, use) => {
      const unexpected: string[] = [];
      const errors: string[] = [];
      const trackPageErrors = (page: Page) =>
        page.on("pageerror", (error) => errors.push(error.message));
      for (const page of context.pages()) trackPageErrors(page);
      context.on("page", trackPageErrors);
      await context.route("**/*", async (route) => {
        const url = new URL(route.request().url());
        if (url.origin !== new URL(baseURL!).origin) {
          // URL のクエリに秘密情報が含まれる場合もあるため、失敗ログには含めない。
          unexpected.push(`${url.origin}${url.pathname}`);
          await route.abort();
          return;
        }
        const responses: Record<string, unknown> = {
          "/api/github/contributions": { weekly: MOCK_WEEKLY },
          "/api/mountains/report-count": { count: 42 },
          "/api/cloudinary/images": { images: MOCK_IMAGES },
        };
        if (route.request().method() === "GET" && url.pathname in responses) {
          await route.fulfill({ json: responses[url.pathname] });
        } else if (url.pathname.startsWith("/api/")) {
          unexpected.push(url.pathname);
          await route.abort();
        } else {
          await route.continue();
        }
      });
      // アクセス解析は対象外。収集スクリプト自体を空で応答する。
      await context.route("https://va.vercel-scripts.com/**", (route) =>
        route.fulfill({ contentType: "application/javascript", body: "" }),
      );
      // 縦長・横長の固有サイズを持つ画像。画像のデコードと表示サイズも検証できる。
      await context.route(
        "https://res.cloudinary.com/demo/**",
        async (route) => {
          const portrait = route.request().url().endsWith("/1.svg");
          const [width, height] = portrait ? [800, 1200] : [1600, 900];
          await route.fulfill({
            contentType: "image/svg+xml",
            body: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#8fd2ff"/></svg>`,
          });
        },
      );
      await use();
      expect(unexpected, "未モックの API / 外部通信").toEqual([]);
      expect(errors, "ブラウザの未処理例外").toEqual([]);
    },
    { auto: true },
  ],
});
export { expect };
