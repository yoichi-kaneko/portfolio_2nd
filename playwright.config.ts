import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  timeout: 60000,
  expect: { timeout: 10000 },
  reporter: "html",
  use: {
    baseURL: "http://localhost:3001",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    serviceWorkers: "block",
  },
  projects: [
    {
      name: "chromium",
      testIgnore: "**/mobile.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      testMatch: "**/mobile.spec.ts",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command: "node e2e/support/start-server.mjs",
    url: "http://localhost:3001",
    // 通常の開発サーバーを再利用すると E2E 用 env が適用されない。
    reuseExistingServer: false,
    timeout: 120000,
  },
});
