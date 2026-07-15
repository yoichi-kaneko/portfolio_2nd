import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/mountains/report-count": [
      "./node_modules/@sparticuz/chromium/bin/**/*",
      "./node_modules/.pnpm/@sparticuz+chromium@*/node_modules/@sparticuz/chromium/bin/**/*",
      "./node_modules/playwright-core/browsers.json",
      "./node_modules/.pnpm/playwright-core@*/node_modules/playwright-core/browsers.json",
    ],
  },
};

export default nextConfig;
