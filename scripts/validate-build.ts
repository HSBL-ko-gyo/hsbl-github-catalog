import { access, readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import {
  formatTokyoDate,
  formatTokyoDateTime,
} from "../src/lib/date-time.js";
import {
  GITHUB_COLLECTED_AT,
  GITHUB_COLLECTED_AT_DISPLAY,
} from "../src/lib/github-collection.js";
import {
  isGithubProjectData,
  projectPublishedAt,
  sortProjects,
} from "../src/lib/project-schema.js";
import { loadProjectFiles } from "./lib/catalog.js";

const ROOT = resolve(import.meta.dirname, "..");
const DIST = resolve(ROOT, "dist");
const ORIGIN = "https://github.hsbl-ko-gyo.com";

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function localTarget(href: string): string | null {
  if (!href.startsWith("/") || href.startsWith("//")) return null;
  const pathname = href.split(/[?#]/, 1)[0];
  if (pathname === "/") return resolve(DIST, "index.html");
  if (pathname.endsWith("/"))
    return resolve(DIST, pathname.slice(1), "index.html");
  return resolve(DIST, pathname.slice(1));
}

async function main(): Promise<void> {
  const projects = await loadProjectFiles(ROOT);
  const published = sortProjects(projects.filter(({ data }) => !data.draft));
  const drafts = projects.filter(({ data }) => data.draft);
  const index = await readFile(resolve(DIST, "index.html"), "utf8");
  const sitemap = await readFile(resolve(DIST, "sitemap.xml"), "utf8");
  const collectedTimeMarkup = `<time datetime="${GITHUB_COLLECTED_AT}">${GITHUB_COLLECTED_AT_DISPLAY}</time>`;
  let previousProjectPosition = -1;

  if (!index.includes(`GitHub情報取得: ${collectedTimeMarkup}`)) {
    throw new Error("Homepage does not show the GitHub collection timestamp");
  }

  for (const project of published) {
    const pathname = `/projects/${project.data.slug}/`;
    const html = await readFile(
      resolve(DIST, "projects", project.data.slug, "index.html"),
      "utf8",
    );
    if (!html.includes(`<title>${project.data.seoTitle}</title>`))
      throw new Error(`Built title mismatch: ${project.data.slug}`);
    if (
      !html.includes(
        `<meta name="description" content="${project.data.seoDescription}">`,
      )
    )
      throw new Error(`Built description mismatch: ${project.data.slug}`);
    if (!html.includes(`<link rel="canonical" href="${ORIGIN}${pathname}">`))
      throw new Error(`Self canonical missing: ${project.data.slug}`);
    if (!index.includes(`href="${pathname}"`))
      throw new Error(
        `Homepage does not link to public project: ${project.data.slug}`,
      );
    const projectPosition = index.indexOf(`href="${pathname}"`);
    if (projectPosition <= previousProjectPosition)
      throw new Error(
        `Homepage project order is not newest-first: ${project.data.slug}`,
      );
    previousProjectPosition = projectPosition;
    if (!sitemap.includes(`${ORIGIN}${pathname}`))
      throw new Error(
        `Sitemap is missing public project: ${project.data.slug}`,
      );
    if (isGithubProjectData(project.data)) {
      const repositoryUpdateMarkup = `<dt>GitHub更新</dt><dd><time datetime="${project.data.repoUpdatedAt}">${formatTokyoDateTime(project.data.repoUpdatedAt)}</time></dd>`;
      if (!html.includes(repositoryUpdateMarkup))
        throw new Error(
          `GitHub update timestamp mismatch: ${project.data.slug}`,
        );
      if (!html.includes(`<dt>情報取得</dt><dd>${collectedTimeMarkup}</dd>`))
        throw new Error(
          `GitHub collection timestamp mismatch: ${project.data.slug}`,
        );
    } else {
      const publishedAt = projectPublishedAt(project.data);
      const publicationMarkup = `<dt>公開日</dt><dd><time datetime="${publishedAt}">${formatTokyoDate(publishedAt)}</time></dd>`;
      if (!html.includes(publicationMarkup))
        throw new Error(
          `External publication timestamp mismatch: ${project.data.slug}`,
        );
      if (!project.data.links.app || !html.includes(`href="${project.data.links.app}"`))
        throw new Error(`External app link missing: ${project.data.slug}`);
      if (html.includes('"codeRepository"'))
        throw new Error(
          `External project unexpectedly exposes codeRepository metadata: ${project.data.slug}`,
        );
    }
  }

  for (const project of drafts) {
    if (
      await exists(resolve(DIST, "projects", project.data.slug, "index.html"))
    )
      throw new Error(`Draft page was built: ${project.data.slug}`);
    if (
      index.includes(`/projects/${project.data.slug}/`) ||
      sitemap.includes(`/projects/${project.data.slug}/`)
    )
      throw new Error(
        `Draft leaked into public navigation: ${project.data.slug}`,
      );
  }

  for (const required of [
    "404.html",
    "robots.txt",
    "sitemap.xml",
    "about/index.html",
    "categories/index.html",
  ]) {
    if (!(await exists(resolve(DIST, required))))
      throw new Error(`Required build output is missing: ${required}`);
  }

  const htmlFiles: string[] = [];
  async function walk(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (entry.name.endsWith(".html")) htmlFiles.push(path);
    }
  }
  await walk(DIST);
  for (const file of htmlFiles) {
    const html = await readFile(file, "utf8");
    for (const match of html.matchAll(/href="([^"]+)"/g)) {
      const target = localTarget(match[1]);
      if (target && !(await exists(target)))
        throw new Error(`Broken local link in ${file}: ${match[1]}`);
    }
  }
  process.stdout.write(
    `Validated ${htmlFiles.length} built HTML files and ${published.length} public project routes.\n`,
  );
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : "Build validation failed"}\n`,
  );
  process.exitCode = 1;
});
