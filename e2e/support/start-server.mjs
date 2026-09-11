import { spawn } from "node:child_process";
import { createRequire } from "node:module";

// Playwright の webServer.env は親 env にマージされるため、起動境界で作り直す。
const allowed = [
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
  "SYSTEMROOT",
  "COMSPEC",
  "WINDIR",
  "APPDATA",
  "LOCALAPPDATA",
  "NODE_EXTRA_CA_CERTS",
  "SSL_CERT_FILE",
  "CI",
];
const env = Object.fromEntries(
  allowed
    .filter((key) => process.env[key] !== undefined)
    .map((key) => [key, process.env[key]]),
);
// 空文字を明示し、Next.js が .env* から実サービスの認証情報を補充するのも防ぐ。
Object.assign(env, {
  NODE_ENV: "development",
  TZ: "UTC",
  PORT: "3001",
  NEXT_TELEMETRY_DISABLED: "1",
  VERCEL: "",
  VERCEL_ENV: "",
  REDIS_URL: "",
  GITHUB_PAT: "",
  CLOUDINARY_CLOUD_NAME: "",
  CLOUDINARY_API_KEY: "",
  CLOUDINARY_API_SECRET: "",
  CLOUDINARY_IMAGE_ASSET_FOLDER: "",
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: "",
  NEXT_PUBLIC_DISABLE_EXTERNAL_MAPS: "1",
});
const require = createRequire(import.meta.url);
const child = spawn(
  process.execPath,
  [require.resolve("next/dist/bin/next"), "dev"],
  {
    env,
    stdio: "inherit",
  },
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
child.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
