import { resolve } from "node:path";
import { createSitemapPaths } from "../src/lib/sitemap.js";
import { loadProjectFiles, markdownHeadings } from "./lib/catalog.js";
import { explicitExclusionNames, isEligibleRepository, loadCatalogPolicy, loadGithubDataset } from "./lib/github-data.js";

const ROOT = resolve(import.meta.dirname, "..");
const REQUIRED_SECTIONS = ["何ができるか", "こんな時に使う", "主な機能", "技術・構成", "公開先または使い方", "GitHubで見る"];

function assertUnique(values: Array<[string, string]>, label: string): void {
  const seen = new Map<string, string>();
  for (const [value, filename] of values) {
    const previous = seen.get(value);
    if (previous) throw new Error(`${label} is duplicated in ${previous} and ${filename}`);
    seen.set(value, filename);
  }
}

async function main(): Promise<void> {
  const [projects, dataset, policy] = await Promise.all([
    loadProjectFiles(ROOT),
    loadGithubDataset(ROOT),
    loadCatalogPolicy(ROOT),
  ]);
  const repositories = new Map(dataset.repositories.map((repo) => [repo.name, repo]));
  const exclusions = explicitExclusionNames(policy);

  assertUnique(projects.map(({ data, filename }) => [data.slug, filename]), "slug");
  assertUnique(projects.map(({ data, filename }) => [data.repo, filename]), "repo");
  assertUnique(projects.filter(({ data }) => !data.draft).map(({ data, filename }) => [data.seoTitle, filename]), "published seoTitle");
  assertUnique(projects.filter(({ data }) => !data.draft).map(({ data, filename }) => [data.seoDescription, filename]), "published seoDescription");

  for (const project of projects) {
    const { data, body, filename } = project;
    const repository = repositories.get(data.repo);
    if (!isEligibleRepository(repository, dataset.owner, exclusions)) {
      throw new Error(`${filename} targets a missing, forked, archived, empty, or excluded repository`);
    }
    if (data.links.github !== repository.url) {
      throw new Error(`${filename} GitHub URL does not match collected public metadata`);
    }
    if (data.repoUpdatedAt !== repository.updatedAt || data.repoPushedAt !== repository.pushedAt) {
      throw new Error(`${filename} repository timestamps are not synchronized`);
    }
    const headings = markdownHeadings(body);
    for (const required of REQUIRED_SECTIONS) {
      if (!headings.includes(required)) throw new Error(`${filename} is missing section: ${required}`);
    }
    for (const match of body.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      const target = match[1];
      if (target.startsWith("#")) continue;
      if (!target.startsWith("https://")) throw new Error(`${filename} contains a non-HTTPS or relative link: ${target}`);
      new URL(target);
    }
  }

  const sitemapPaths = createSitemapPaths(projects);
  if (projects.filter(({ data }) => data.draft).some(({ data }) => sitemapPaths.includes(`/projects/${data.slug}/`))) {
    throw new Error("Sitemap implementation exposed draft content");
  }
  process.stdout.write(`Validated ${projects.length} project files; ${projects.filter(({ data }) => !data.draft).length} are public.\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : "Content validation failed"}\n`);
  process.exitCode = 1;
});
