import { access, mkdir, rename, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium, type Browser } from "playwright-core";
import { loadProjectFiles } from "./lib/catalog.js";
import {
  assertProjectThumbnail,
  PROJECT_THUMBNAIL_HEIGHT,
  PROJECT_THUMBNAIL_WIDTH,
} from "./lib/png.js";

const ROOT = resolve(import.meta.dirname, "..");
const EXECUTABLE_CANDIDATES = [
  process.env.HSBL_CHROME_BIN,
  "/home/arduino/.local/bin/google-chrome-stable",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
].filter((value): value is string => Boolean(value));

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function findBrowserExecutable(): Promise<string> {
  for (const candidate of EXECUTABLE_CANDIDATES) {
    if (await exists(candidate)) return candidate;
  }
  throw new Error(
    "Chrome/Chromium executable not found; set HSBL_CHROME_BIN in the external automation environment",
  );
}

async function capture(
  browser: Browser,
  url: string,
  target: string,
): Promise<void> {
  const context = await browser.newContext({
    viewport: {
      width: PROJECT_THUMBNAIL_WIDTH,
      height: PROJECT_THUMBNAIL_HEIGHT,
    },
    deviceScaleFactor: 1,
    colorScheme: "light",
    reducedMotion: "reduce",
    locale: "ja-JP",
    timezoneId: "Asia/Tokyo",
  });
  const page = await context.newPage();
  const temporary = `${target}.tmp-${process.pid}`;
  try {
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 45_000,
    });
    if (!response || response.status() >= 400) {
      throw new Error(`${url} returned HTTP ${response?.status() ?? "unknown"}`);
    }
    await page.waitForTimeout(2_500);
    await page.addStyleTag({
      content:
        "html{scrollbar-width:none!important}body::-webkit-scrollbar{display:none!important}",
    });
    await page.screenshot({
      path: temporary,
      type: "png",
      fullPage: false,
      animations: "disabled",
    });
    await assertProjectThumbnail(temporary);
    await rename(temporary, target);
  } finally {
    await rm(temporary, { force: true });
    await context.close();
  }
}

async function main(): Promise<void> {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has("--dry-run");
  const force = args.has("--force");
  const slugArgument = process.argv.find((argument) =>
    argument.startsWith("--slug="),
  );
  const selectedSlug = slugArgument?.slice("--slug=".length);
  const projects = (await loadProjectFiles(ROOT)).filter(
    ({ data }) =>
      !data.draft &&
      data.category === "web-app" &&
      Boolean(data.links.app && data.thumbnail) &&
      (!selectedSlug || data.slug === selectedSlug),
  );
  if (selectedSlug && projects.length === 0) {
    throw new Error(`No published web-app found for slug ${selectedSlug}`);
  }

  const pending = [];
  for (const project of projects) {
    const target = resolve(
      ROOT,
      "public",
      project.data.thumbnail!.replace(/^\//, ""),
    );
    if (!force && (await exists(target))) {
      await assertProjectThumbnail(target);
      process.stdout.write(`Kept existing thumbnail: ${project.data.slug}\n`);
      continue;
    }
    pending.push({ project, target });
  }

  if (dryRun) {
    for (const { project } of pending) {
      process.stdout.write(
        `Would capture ${project.data.slug} from ${project.data.links.app}\n`,
      );
    }
    process.stdout.write(`Thumbnail dry-run: ${pending.length} capture(s).\n`);
    return;
  }
  if (pending.length === 0) {
    process.stdout.write("All web-app thumbnails already exist.\n");
    return;
  }

  const executablePath = await findBrowserExecutable();
  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ["--disable-dev-shm-usage", "--no-first-run"],
  });
  try {
    for (const { project, target } of pending) {
      await mkdir(resolve(target, ".."), { recursive: true });
      await capture(browser, project.data.links.app!, target);
      process.stdout.write(`Captured thumbnail: ${project.data.slug}\n`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : "Thumbnail capture failed"}\n`,
  );
  process.exitCode = 1;
});
