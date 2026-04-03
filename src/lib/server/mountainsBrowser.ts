import { access } from "node:fs/promises";
import { constants } from "node:fs";
import chromium from "@sparticuz/chromium";
import { chromium as playwright } from "playwright-core";

type BrowserMode = "auto" | "local" | "serverless";

const MODE_ENV = "MOUNTAIN_SCRAPER_BROWSER_MODE";
const HEADLESS_ENV = "MOUNTAIN_SCRAPER_HEADLESS";
const LOCAL_PATH_ENV = "LOCAL_CHROMIUM_EXECUTABLE_PATH";

function parseMode(value: string | undefined): BrowserMode {
  if (value === "local" || value === "serverless" || value === "auto") {
    return value;
  }

  if (value) {
    throw new Error(
      `${MODE_ENV} must be one of: auto | local | serverless (received: "${value}")`
    );
  }

  return "auto";
}

function resolveMode(): Exclude<BrowserMode, "auto"> {
  const mode = parseMode(process.env[MODE_ENV]);
  if (mode === "local" || mode === "serverless") {
    return mode;
  }

  return process.env.VERCEL === "1" ? "serverless" : "local";
}

function resolveHeadless(): boolean {
  const value = process.env[HEADLESS_ENV];

  if (!value) {
    return true;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new Error(`${HEADLESS_ENV} must be "true" or "false" (received: "${value}")`);
}

async function existsExecutable(path: string): Promise<boolean> {
  try {
    await access(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

async function resolveLocalExecutablePath(): Promise<string> {
  const configuredPath = process.env[LOCAL_PATH_ENV];
  if (configuredPath && (await existsExecutable(configuredPath))) {
    return configuredPath;
  }

  if (configuredPath) {
    throw new Error(
      `${LOCAL_PATH_ENV} points to a non-executable path: "${configuredPath}"`
    );
  }

  const candidatesByPlatform: Partial<Record<NodeJS.Platform, string[]>> = {
    darwin: [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
    ],
    linux: ["/usr/bin/google-chrome", "/usr/bin/chromium-browser", "/usr/bin/chromium"],
    win32: [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    ],
    aix: [],
    android: [],
    freebsd: [],
    haiku: [],
    openbsd: [],
    sunos: [],
  };

  const candidates = candidatesByPlatform[process.platform] ?? [];
  for (const candidate of candidates) {
    if (await existsExecutable(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    [
      "Could not find a local Chrome/Chromium executable.",
      `Set ${LOCAL_PATH_ENV} in your environment.`,
      `Current platform: ${process.platform}`,
    ].join(" ")
  );
}

export async function launchMountainsBrowser() {
  const mode = resolveMode();
  const headless = resolveHeadless();

  if (mode === "serverless") {
    return playwright.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless,
    });
  }

  return playwright.launch({
    executablePath: await resolveLocalExecutablePath(),
    headless,
  });
}
