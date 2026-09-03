import { appendFile, chmod, mkdir, open, readFile, rename, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { chromium, type Page } from "playwright-core";
import { assertProjectThumbnail } from "./lib/png.js";
import {
  type ProtopediaForm,
  type ProtopediaState,
  type ProtopediaSubmission,
  readProtopediaQueue,
  readProtopediaState,
  writeJsonAtomic,
} from "./lib/protopedia.js";

const ROOT = resolve(import.meta.dirname, "..");
const QUEUE_PATH = resolve(ROOT, "data/actions/protopedia-submissions.json");
const STATE_PATH = resolve(ROOT, "data/protopedia/publication-state.json");
const CDP_URL = process.env.HSBL_CATALOG_CDP_URL ?? "http://127.0.0.1:9222";
const RUNTIME_DIR =
  process.env.HSBL_CATALOG_STATE_DIR ??
  resolve(homedir(), ".local/state/hsbl-github-catalog/protopedia");
const PROTOPEDIA_ORIGIN = "https://protopedia.net";

type AttemptStatus =
  | "prepared"
  | "submission-started"
  | "verified"
  | "reconciled"
  | "failed"
  | "uncertain";

type Attempt = {
  slug: string;
  operation: ProtopediaSubmission["operation"];
  sourceHash: string;
  status: AttemptStatus;
  startedAt: string;
  updatedAt: string;
  prototypeUrl?: string;
  detail?: string;
};

function isoNow(): string {
  return new Date().toISOString();
}

async function logEvent(
  event: string,
  fields: Record<string, unknown> = {},
): Promise<void> {
  const date = new Date().toISOString().slice(0, 10);
  const path = resolve(RUNTIME_DIR, "runs", `${date}.jsonl`);
  await mkdir(resolve(RUNTIME_DIR, "runs"), { recursive: true, mode: 0o700 });
  await appendFile(
    path,
    `${JSON.stringify({ at: isoNow(), event, ...fields })}\n`,
    { mode: 0o600 },
  );
}

async function writeAttempt(attempt: Attempt): Promise<void> {
  const directory = resolve(RUNTIME_DIR, "attempts");
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const path = resolve(directory, `${attempt.slug}.json`);
  await writeJsonAtomic(path, attempt, 0o600);
  await chmod(path, 0o600);
}

function prototypeId(url: string): number {
  const match = url.match(/^https:\/\/protopedia\.net\/prototype\/(\d+)$/);
  if (!match) throw new Error(`Unexpected ProtoPedia public URL: ${url}`);
  return Number(match[1]);
}

function normalizedUrl(value: string): string {
  const url = new URL(value);
  url.hash = "";
  url.search = "";
  return url.href.replace(/\/$/, "");
}

async function assertAuthenticated(page: Page, account: string): Promise<void> {
  const response = await page.goto(`${PROTOPEDIA_ORIGIN}/settings/prototypes`, {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  if (!response || response.status() >= 400) {
    throw new Error(`ProtoPedia account page returned HTTP ${response?.status() ?? "unknown"}`);
  }
  await page.waitForTimeout(500);
  if (!page.url().startsWith(`${PROTOPEDIA_ORIGIN}/settings/prototypes`)) {
    throw new Error(
      `ProtoPedia automation profile is not signed in as @${account}; run automation/protopedia-auth-bootstrap.sh once`,
    );
  }
  const body = await page.locator("body").innerText();
  const accountLinkCount = await page
    .locator(`a[href="/prototyper/${account}"]`)
    .count();
  if (
    !body.includes("作品") ||
    body.includes("ログインしてください") ||
    accountLinkCount === 0
  ) {
    throw new Error(`Could not verify ProtoPedia session for @${account}`);
  }
}

async function ownPrototypeUrls(page: Page): Promise<string[]> {
  await page.goto(`${PROTOPEDIA_ORIGIN}/settings/prototypes`, {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  const hrefs = await page.locator('a[href*="/prototype/"]').evaluateAll((links) =>
    links.map((link) => (link as HTMLAnchorElement).href),
  );
  return [
    ...new Set(
      hrefs
        .map((href) => href.match(/^https:\/\/protopedia\.net\/prototype\/(\d+)/)?.[1])
        .filter((id): id is string => Boolean(id))
        .map((id) => `${PROTOPEDIA_ORIGIN}/prototype/${id}`),
    ),
  ];
}

async function inspectPrototype(
  page: Page,
  url: string,
  form: ProtopediaForm,
): Promise<{
  titleMatches: boolean;
  officialUrlMatches: boolean;
  thumbnailPresent: boolean;
}> {
  const response = await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  if (!response || response.status() >= 400) {
    throw new Error(`${url} returned HTTP ${response?.status() ?? "unknown"}`);
  }
  const titleMatches =
    (await page.getByRole("heading", { name: form.title, exact: true }).count()) > 0;
  const links = await page.locator("a[href]").evaluateAll((anchors) =>
    anchors.map((anchor) => (anchor as HTMLAnchorElement).href),
  );
  const expected = normalizedUrl(form.officialUrl);
  return {
    titleMatches,
    officialUrlMatches: links.some((href) => normalizedUrl(href) === expected),
    thumbnailPresent:
      (await page.locator('meta[property="og:image"]').getAttribute("content"))
        ?.includes("/assets/img/noimage.gif") === false,
  };
}

async function findExistingPrototype(
  page: Page,
  submission: ProtopediaSubmission,
): Promise<{ url: string; thumbnailPresent: boolean } | null> {
  const ownUrls = await ownPrototypeUrls(page);
  for (const url of ownUrls) {
    const result = await inspectPrototype(page, url, submission.form);
    if (result.titleMatches && result.officialUrlMatches) {
      return { url, thumbnailPresent: result.thumbnailPresent };
    }
    if (result.titleMatches || result.officialUrlMatches) {
      throw new Error(
        `ProtoPedia duplicate check found a partial collision at ${url}; title and official URL must both match`,
      );
    }
  }
  return null;
}

async function selectPublicVisibility(page: Page): Promise<void> {
  const selector = page.locator('select[name="releaseTYpe"], #releaseTYpe');
  await selector.first().selectOption("2");
}

async function waitForEditorReady(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const controller = (
        window as unknown as {
          EditCtrl?: { _freeComment?: unknown; _images?: unknown[] | null };
        }
      ).EditCtrl;
      return Boolean(controller?._freeComment && Array.isArray(controller._images));
    },
    undefined,
    { timeout: 20_000 },
  );
}

async function uploadThumbnail(page: Page, relativePath: string): Promise<void> {
  const path = resolve(ROOT, relativePath);
  await assertProjectThumbnail(path);
  await page.locator("#imageUpload").setInputFiles(path);
  const selector = page.locator('select[name="catchingImage"], #catchingImage');
  await selector.waitFor({ state: "attached", timeout: 15_000 });
  await page.waitForFunction(
    () => {
      const element = document.querySelector<HTMLSelectElement>(
        'select[name="catchingImage"], #catchingImage',
      );
      return Boolean(element && [...element.options].some((option) => option.value));
    },
    undefined,
    { timeout: 20_000 },
  );
  const option = await selector.first().locator("option").evaluateAll((options) =>
    options.map((item) => (item as HTMLOptionElement).value).filter(Boolean).at(-1),
  );
  if (!option) throw new Error("Uploaded thumbnail did not become an eye-catch option");
  await selector.first().selectOption(option, { force: true });
  await page.waitForFunction(
    () => {
      const controller = (
        window as unknown as {
          EditCtrl?: { getCatchingImage?: () => string | undefined };
        }
      ).EditCtrl;
      return Boolean(controller?.getCatchingImage?.()?.includes("/pic/"));
    },
    undefined,
    { timeout: 10_000 },
  );
}

async function fillCreateForm(
  page: Page,
  submission: ProtopediaSubmission,
): Promise<void> {
  const { form } = submission;
  await page.goto(`${PROTOPEDIA_ORIGIN}/prototype/edit/new`, {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  await waitForEditorReady(page);
  await page.locator(form.workStatus === "完成" ? "#status3" : "#status2").check();
  await page.locator("#prototypeNm").fill(form.title);
  await page.locator("#officialLink").fill(form.officialUrl);
  await page.locator("#summary").fill(form.summary);
  await page.locator("#licenseType2").check();
  await page.evaluate((storyMarkdown) => {
    const controller = (
      window as unknown as {
        EditCtrl: { _freeComment: { value: (value: string) => void } };
      }
    ).EditCtrl;
    controller._freeComment.value(storyMarkdown);
  }, form.storyMarkdown);

  const tagInput = page.locator("#addTagInput");
  for (const tag of form.tags) {
    await tagInput.fill(tag);
    await tagInput.press("Enter");
  }

  if (form.relatedLinks.length > 0) {
    const relatedLinkIds = [
      "#relatedLink",
      "#relatedLink2",
      "#relatedLink3",
      "#relatedLink4",
      "#relatedLink5",
    ];
    for (let index = 0; index < form.relatedLinks.length; index += 1) {
      await page.locator(relatedLinkIds[index]).fill(form.relatedLinks[index]);
    }
  }
  if (form.thumbnailPath) await uploadThumbnail(page, form.thumbnailPath);
  await selectPublicVisibility(page);
}

async function prepareThumbnailSync(
  page: Page,
  submission: Extract<ProtopediaSubmission, { operation: "sync-thumbnail" }>,
): Promise<void> {
  await page.goto(
    `${PROTOPEDIA_ORIGIN}/prototype/edit/${submission.existingPrototype.prototypeId}`,
    { waitUntil: "domcontentloaded", timeout: 30_000 },
  );
  await waitForEditorReady(page);
  if (!submission.form.thumbnailPath) {
    throw new Error(`${submission.slug} thumbnail sync has no thumbnailPath`);
  }
  await uploadThumbnail(page, submission.form.thumbnailPath);
  await selectPublicVisibility(page);
}

async function clickSubmitOnce(
  page: Page,
  submission: ProtopediaSubmission,
  attempt: Attempt,
): Promise<string> {
  const buttonName = submission.operation === "create" ? "作品を登録" : "作品を更新";
  const submitButton = page.locator("#postBtn");
  if ((await submitButton.innerText()).trim() !== buttonName) {
    throw new Error(`Unexpected ProtoPedia submit button label for ${submission.slug}`);
  }
  attempt.status = "submission-started";
  attempt.updatedAt = isoNow();
  await writeAttempt(attempt);
  await logEvent("submission-started", {
    slug: submission.slug,
    operation: submission.operation,
  });
  await submitButton.click();
  await page.waitForURL(/^https:\/\/protopedia\.net\/prototype\/\d+\/?$/, {
    timeout: 45_000,
  });
  return page.url().replace(/\/$/, "");
}

async function updateProjectFrontmatter(slug: string, url: string): Promise<void> {
  const path = resolve(ROOT, "src/content/projects", `${slug}.md`);
  let source = await readFile(path, "utf8");
  const frontmatterEnd = source.indexOf("\n---", 4);
  if (frontmatterEnd < 0) throw new Error(`${slug} has invalid frontmatter`);
  const frontmatter = source.slice(0, frontmatterEnd);
  const existing = frontmatter.match(/^\s{2}protopedia:\s*(\S+)\s*$/m)?.[1];
  if (existing && existing !== url) {
    throw new Error(`${slug} already references a different ProtoPedia URL`);
  }
  if (!existing) {
    const linksStart = source.indexOf("\nlinks:\n");
    if (linksStart < 0) throw new Error(`${slug} has no links mapping`);
    const afterLinks = linksStart + "\nlinks:\n".length;
    const nextTopLevel = source.slice(afterLinks).search(/^\S/m);
    if (nextTopLevel < 0) throw new Error(`${slug} links mapping has no end`);
    const insertion = afterLinks + nextTopLevel;
    source = `${source.slice(0, insertion)}  protopedia: ${url}\n${source.slice(insertion)}`;
  }
  const refreshedEnd = source.indexOf("\n---", 4);
  const refreshedFrontmatter = source.slice(0, refreshedEnd);
  if (!refreshedFrontmatter.includes(`  - ${url}`)) {
    const evidenceStart = source.indexOf("\nsourceEvidence:\n");
    if (evidenceStart < 0) throw new Error(`${slug} has no sourceEvidence list`);
    const afterEvidence = evidenceStart + "\nsourceEvidence:\n".length;
    const nextTopLevel = source.slice(afterEvidence).search(/^\S/m);
    const insertion =
      nextTopLevel < 0 ? refreshedEnd : afterEvidence + nextTopLevel;
    source = `${source.slice(0, insertion)}  - ${url}\n${source.slice(insertion)}`;
  }
  const temporary = `${path}.tmp-${process.pid}`;
  await writeFile(temporary, source);
  await rename(temporary, path);
}

async function recordSuccess(
  state: ProtopediaState,
  submission: ProtopediaSubmission,
  url: string,
  status: "verified" | "reconciled",
  thumbnailUploaded: boolean,
): Promise<void> {
  const now = isoNow();
  const entry = {
    slug: submission.slug,
    title: submission.form.title,
    prototypeId: prototypeId(url),
    url,
    officialUrl: submission.form.officialUrl,
    sourceHash: submission.sourceHash,
    thumbnailUploaded,
    ...(submission.operation === "create" ? { publishedAt: now } : {}),
    verifiedAt: now,
  };
  const index = state.published.findIndex(
    (record) =>
      record.slug === submission.slug || record.prototypeId === entry.prototypeId,
  );
  if (index >= 0) {
    state.published[index] = { ...state.published[index], ...entry };
  } else {
    state.published.push(entry);
  }
  await updateProjectFrontmatter(submission.slug, url);
  await writeJsonAtomic(STATE_PATH, state);
  await logEvent(status, { slug: submission.slug, prototypeUrl: url });
}

async function processSubmission(
  page: Page,
  state: ProtopediaState,
  submission: ProtopediaSubmission,
  dryRun: boolean,
): Promise<void> {
  const startedAt = isoNow();
  const attempt: Attempt = {
    slug: submission.slug,
    operation: submission.operation,
    sourceHash: submission.sourceHash,
    status: "prepared",
    startedAt,
    updatedAt: startedAt,
  };
  await writeAttempt(attempt);
  await logEvent("precheck-started", {
    slug: submission.slug,
    operation: submission.operation,
    dryRun,
  });

  try {
    if (submission.form.thumbnailPath) {
      await assertProjectThumbnail(resolve(ROOT, submission.form.thumbnailPath));
    }
    if (submission.operation === "create") {
      const existing = await findExistingPrototype(page, submission);
      if (existing) {
        if (!dryRun) {
          await recordSuccess(
            state,
            submission,
            existing.url,
            "reconciled",
            existing.thumbnailPresent,
          );
        }
        attempt.status = "reconciled";
        attempt.prototypeUrl = existing.url;
        attempt.updatedAt = isoNow();
        await writeAttempt(attempt);
        process.stdout.write(`Reconciled existing ProtoPedia work: ${submission.slug}\n`);
        return;
      }
    } else {
      const existingUrl = submission.existingPrototype.url;
      const ownUrls = await ownPrototypeUrls(page);
      if (!ownUrls.includes(existingUrl)) {
        throw new Error(`${existingUrl} is not present in the signed-in account`);
      }
      const before = await inspectPrototype(page, existingUrl, submission.form);
      if (!before.titleMatches || !before.officialUrlMatches) {
        throw new Error(`${existingUrl} does not match the queued work identity`);
      }
    }

    if (dryRun) {
      await logEvent("dry-run-ready", { slug: submission.slug });
      process.stdout.write(`ProtoPedia dry-run ready: ${submission.slug}\n`);
      return;
    }

    if (submission.operation === "create") {
      await fillCreateForm(page, submission);
    } else {
      await prepareThumbnailSync(page, submission);
    }
    const url = await clickSubmitOnce(page, submission, attempt);
    const after = await inspectPrototype(page, url, submission.form);
    if (!after.titleMatches || !after.officialUrlMatches) {
      throw new Error(`Post-submit verification failed at ${url}`);
    }
    if (submission.form.thumbnailPath && !after.thumbnailPresent) {
      throw new Error(`Post-submit thumbnail verification failed at ${url}`);
    }
    await recordSuccess(
      state,
      submission,
      url,
      "verified",
      after.thumbnailPresent,
    );
    attempt.status = "verified";
    attempt.prototypeUrl = url;
    attempt.updatedAt = isoNow();
    await writeAttempt(attempt);
    process.stdout.write(`Published ProtoPedia work: ${submission.slug} -> ${url}\n`);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown ProtoPedia failure";
    attempt.status =
      attempt.status === "submission-started" ? "uncertain" : "failed";
    attempt.detail = detail;
    attempt.updatedAt = isoNow();
    await writeAttempt(attempt);
    await logEvent(attempt.status, { slug: submission.slug, detail });
    throw error;
  }
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes("--dry-run");
  const [queue, state] = await Promise.all([
    readProtopediaQueue(QUEUE_PATH),
    readProtopediaState(STATE_PATH),
  ]);
  if (queue.account !== state.account) {
    throw new Error("ProtoPedia queue/state account mismatch");
  }
  if (queue.submissions.length === 0) {
    process.stdout.write("ProtoPedia queue is empty.\n");
    return;
  }

  await mkdir(RUNTIME_DIR, { recursive: true, mode: 0o700 });
  const lockPath = resolve(RUNTIME_DIR, "publisher.lock");
  let lock;
  try {
    lock = await open(lockPath, "wx", 0o600);
  } catch {
    throw new Error(`Another ProtoPedia publisher holds ${lockPath}`);
  }

  try {
    const browser = await chromium.connectOverCDP(CDP_URL, { timeout: 15_000 });
    const context = browser.contexts()[0];
    if (!context) throw new Error("CDP browser has no persistent context");
    const page = await context.newPage();
    try {
      await assertAuthenticated(page, queue.account);
      for (const submission of queue.submissions) {
        await processSubmission(page, state, submission, dryRun);
      }
    } finally {
      await page.close();
    }
  } finally {
    await lock.close();
    await rm(lockPath, { force: true });
  }
}

main().then(
  () => process.exit(0),
  (error: unknown) => {
    process.stderr.write(
      `${error instanceof Error ? error.message : "ProtoPedia publishing failed"}\n`,
    );
    // connectOverCDP intentionally leaves the shared persistent browser alive.
    // End this client process after all awaited writes and cleanup complete.
    process.exit(1);
  },
);
