import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright の webServer 用環境変数。
 * 親プロセスの env をそのまま引き継ぐと VERCEL / REDIS_URL などが子に伝播し、
 * E2E 用の Next が本番相当の分岐や実 Redis に触れる可能性があるため、必要なキーのみ複製する。
 */
function createWebServerEnv(): Record<string, string> {
  const keys = [
    "PATH",
    "PATHEXT",
    "HOME",
    "USER",
    "LOGNAME",
    "SHELL",
    "TMPDIR",
    "TEMP",
    "LANG",
    "LC_ALL",
    "LC_MESSAGES",
    "NODE_OPTIONS",
    "NODE_EXTRA_CA_CERTS",
    "SSL_CERT_FILE",
    "REQUESTS_CA_BUNDLE",
    "CI",
    "GITHUB_ACTIONS",
    "RUNNER_OS",
    "SYSTEMROOT",
    "COMSPEC",
    "WINDIR",
    "ProgramFiles",
    "ProgramFiles(x86)",
    "APPDATA",
    "LOCALAPPDATA",
    "XDG_RUNTIME_DIR",
    "PNPM_HOME",
    "COREPACK_HOME",
    "NVM_DIR",
    "NVM_BIN",
  ] as const;

  const env: Record<string, string> = {};
  for (const key of keys) {
    const value = process.env[key];
    if (value !== undefined) {
      env[key] = value;
    }
  }

  env.PORT = "3001";
  env.NEXT_PUBLIC_DISABLE_EXTERNAL_MAPS = "1";
  env.NODE_ENV = process.env.NODE_ENV ?? "development";

  return env;
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
    env: createWebServerEnv(),
  },
});
