import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createSitemapPaths } from "../src/lib/sitemap.js";
import { loadProjectFiles, markdownHeadings } from "./lib/catalog.js";
import {
  allowedForkNames,
  allowedForkSources,
  explicitExclusionNames,
  isEligibleRepository,
  loadCatalogPolicy,
  loadGithubDataset,
} from "./lib/github-data.js";

const ROOT = resolve(import.meta.dirname, "..");
const LEGACY_SECTIONS = [
  "何ができるか",
  "こんな時に使う",
  "主な機能",
  "技術・構成",
  "公開先または使い方",
  "GitHubで見る",
];
const STALE_PUBLIC_COPY = [
  "つくった道具を、使う人の言葉で。",
  "リポジトリ名の向こうにある、使い道を伝える。",
  "用途の近い道具を、引き出しごとにまとめました。",
  "READMEの転載ではなく、入力・出力・使いどころを短く整理しています。",
];
const FIXED_COPY_FILES = [
  "src/pages/index.astro",
  "src/pages/about.astro",
  "src/pages/categories/index.astro",
  "src/pages/categories/[slug].astro",
  "src/pages/404.astro",
  "src/layouts/BaseLayout.astro",
  "src/components/ProjectCard.astro",
  "src/pages/projects/[slug].astro",
  "src/lib/site.ts",
];

function assertUnique(values: Array<[string, string]>, label: string): void {
  const seen = new Map<string, string>();
  for (const [value, filename] of values) {
    const previous = seen.get(value);
    if (previous)
      throw new Error(`${label} is duplicated in ${previous} and ${filename}`);
    seen.set(value, filename);
  }
}

async function main(): Promise<void> {
  const [projects, dataset, policy] = await Promise.all([
    loadProjectFiles(ROOT),
    loadGithubDataset(ROOT),
    loadCatalogPolicy(ROOT),
  ]);
  const repositories = new Map(
    dataset.repositories.map((repo) => [repo.name, repo]),
  );
  const exclusions = explicitExclusionNames(policy);
  const allowedForks = allowedForkNames(policy);
  const configuredForkSources = allowedForkSources(policy);
  const fixedCopySources = await Promise.all(
    FIXED_COPY_FILES.map(async (path) => ({
      path,
      source: await readFile(resolve(ROOT, path), "utf8"),
    })),
  );

  assertUnique(
    projects.map(({ data, filename }) => [data.slug, filename]),
    "slug",
  );
  assertUnique(
    projects.map(({ data, filename }) => [data.repo, filename]),
    "repo",
  );
  assertUnique(
    projects
      .filter(({ data }) => !data.draft)
      .map(({ data, filename }) => [data.seoTitle, filename]),
    "published seoTitle",
  );
  assertUnique(
    projects
      .filter(({ data }) => !data.draft)
      .map(({ data, filename }) => [data.seoDescription, filename]),
    "published seoDescription",
  );

  for (const project of projects) {
    const { data, body, filename } = project;
    const repository = repositories.get(data.repo);
    if (
      !isEligibleRepository(repository, dataset.owner, exclusions, allowedForks)
    ) {
      throw new Error(
        `${filename} targets a missing, forked, archived, empty, or excluded repository`,
      );
    }
    if (data.links.github !== repository.url) {
      throw new Error(
        `${filename} GitHub URL does not match collected public metadata`,
      );
    }
    if (
      data.repoCreatedAt !== repository.createdAt ||
      data.repoUpdatedAt !== repository.updatedAt ||
      data.repoPushedAt !== repository.pushedAt
    ) {
      throw new Error(`${filename} repository timestamps are not synchronized`);
    }
    if (
      data.isFork !== repository.isFork ||
      data.forkSourceUrl !== (repository.forkSourceUrl ?? undefined) ||
      (repository.isFork &&
        data.forkSourceUrl !== configuredForkSources.get(repository.name))
    ) {
      throw new Error(
        `${filename} fork attribution does not match collected public metadata`,
      );
    }
    const headings = markdownHeadings(body);
    if (!data.draft && headings.length < 2) {
      throw new Error(`${filename} must have at least two H2 sections`);
    }
    if (
      !data.draft &&
      LEGACY_SECTIONS.every((heading) => headings.includes(heading))
    ) {
      throw new Error(`${filename} still uses all six legacy sections`);
    }
    for (const match of body.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      const target = match[1];
      if (target.startsWith("#")) continue;
      if (!target.startsWith("https://"))
        throw new Error(
          `${filename} contains a non-HTTPS or relative link: ${target}`,
        );
      new URL(target);
    }
  }

  for (const copy of STALE_PUBLIC_COPY) {
    const project = projects.find(
      ({ data, body }) => !data.draft && body.includes(copy),
    );
    if (project)
      throw new Error(
        `${project.filename} contains stale public copy: ${copy}`,
      );
    const fixed = fixedCopySources.find(({ source }) => source.includes(copy));
    if (fixed)
      throw new Error(`${fixed.path} contains stale public copy: ${copy}`);
  }

  const sitemapPaths = createSitemapPaths(projects);
  if (
    projects
      .filter(({ data }) => data.draft)
      .some(({ data }) => sitemapPaths.includes(`/projects/${data.slug}/`))
  ) {
    throw new Error("Sitemap implementation exposed draft content");
  }
  process.stdout.write(
    `Validated ${projects.length} project files; ${projects.filter(({ data }) => !data.draft).length} are public.\n`,
  );
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : "Content validation failed"}\n`,
  );
  process.exitCode = 1;
});
