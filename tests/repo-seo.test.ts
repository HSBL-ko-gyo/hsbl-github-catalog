import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { CatalogPolicy, GithubDataset, PublicRepository } from "../scripts/lib/github-data.js";
import { executeRepoSeoPlan, type RemoteClient } from "../scripts/lib/repo-seo-apply.js";
import {
  replaceManagedBlock,
  validateRepoSeoPlan,
  type RepoSeoPlan,
  type ValidatedPlanContext,
} from "../scripts/lib/repo-seo.js";

const temporaryRoots: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

function repository(name: string): PublicRepository {
  return {
    name,
    description: null,
    url: `https://github.com/HSBL-ko-gyo/${name}`,
    homepageUrl: null,
    isArchived: false,
    isPrivate: false,
    isFork: false,
    isEmpty: false,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    pushedAt: "2026-01-01T00:00:00Z",
    primaryLanguage: null,
    topics: [],
    defaultBranch: "main",
    latestRelease: null,
    license: null,
    readmePath: null,
    readmeSha: null,
  };
}

function policy(): CatalogPolicy {
  return {
    owner: "HSBL-ko-gyo",
    site: { canonicalOrigin: "https://github.hsbl-ko-gyo.com" },
    filters: { explicitExclusions: [] },
    repoSeo: {
      managedBlockStart: "<!-- hsbl-catalog:seo-start -->",
      managedBlockEnd: "<!-- hsbl-catalog:seo-end -->",
      descriptionMaxCharacters: 160,
      topicsMaxCount: 12,
      managedReadmeBlockMaxCharacters: 1200,
      directCommitMessage: "docs: improve repository discoverability",
    },
    limits: {
      maxRepoMetadataEditsPerRun: 8,
      maxManagedReadmeEditsPerRun: 3,
      maxExactUrlRepairsPerRun: 5,
    },
  };
}

async function fixtureRoot(repositories: PublicRepository[]): Promise<string> {
  const root = await mkdtemp(resolve(tmpdir(), "hsbl-seo-test-"));
  temporaryRoots.push(root);
  await Promise.all([
    mkdir(resolve(root, "schemas"), { recursive: true }),
    mkdir(resolve(root, "config"), { recursive: true }),
    mkdir(resolve(root, "data/github/readmes"), { recursive: true }),
    mkdir(resolve(root, "src/content/projects"), { recursive: true }),
  ]);
  const schema = await readFile(resolve(process.cwd(), "schemas/repo-seo-actions.schema.json"), "utf8");
  const dataset: GithubDataset = {
    schemaVersion: 1,
    owner: "HSBL-ko-gyo",
    visibility: "public",
    filters: { forksExcluded: true },
    collectedAt: "2026-01-01T00:00:00Z",
    repositories,
  };
  await Promise.all([
    writeFile(resolve(root, "schemas/repo-seo-actions.schema.json"), schema),
    writeFile(resolve(root, "data/github/public-repositories.json"), JSON.stringify(dataset)),
    writeFile(
      resolve(root, "config/catalog-policy.yml"),
      [
        "owner: HSBL-ko-gyo",
        "site:",
        "  canonicalOrigin: https://github.hsbl-ko-gyo.com",
        "filters:",
        "  explicitExclusions: []",
        "repoSeo:",
        "  managedBlockStart: '<!-- hsbl-catalog:seo-start -->'",
        "  managedBlockEnd: '<!-- hsbl-catalog:seo-end -->'",
        "  descriptionMaxCharacters: 160",
        "  topicsMaxCount: 12",
        "  managedReadmeBlockMaxCharacters: 1200",
        "  directCommitMessage: 'docs: improve repository discoverability'",
        "limits:",
        "  maxRepoMetadataEditsPerRun: 8",
        "  maxManagedReadmeEditsPerRun: 3",
        "  maxExactUrlRepairsPerRun: 5",
      ].join("\n"),
    ),
  ]);
  return root;
}

describe("README safety", () => {
  it("changes only the managed marker range when markers exist", () => {
    const start = "<!-- hsbl-catalog:seo-start -->";
    const end = "<!-- hsbl-catalog:seo-end -->";
    const before = `# Title\n\nIntro\n${start}\nold\n${end}\n\nKeep this byte-for-byte.\n`;
    const block = `${start}\nnew\n${end}`;
    const updated = replaceManagedBlock(before, block, start, end);
    expect(updated).toBe(`# Title\n\nIntro\n${block}\n\nKeep this byte-for-byte.\n`);
  });

  it("rejects a README action whose cached bytes do not match baseSha", async () => {
    const repo = { ...repository("demo"), readmePath: "README.md", readmeSha: "a".repeat(40) };
    const root = await fixtureRoot([repo]);
    await writeFile(resolve(root, "data/github/readmes/demo.md"), "# Demo\n");
    const plan: RepoSeoPlan = {
      schemaVersion: 1,
      owner: "HSBL-ko-gyo",
      sourceCollectedAt: "2026-01-01T00:00:00Z",
      actions: [{
        type: "readme-managed-intro",
        repo: "demo",
        path: "README.md",
        baseSha: "a".repeat(40),
        content: "<!-- hsbl-catalog:seo-start -->\nDemo\n<!-- hsbl-catalog:seo-end -->",
      }],
    };
    await expect(validateRepoSeoPlan(root, plan)).rejects.toThrow("Cached README bytes do not match base SHA");
  });
});

describe("action plan safety", () => {
  it("rejects action counts above the policy limit", async () => {
    const repos = Array.from({ length: 9 }, (_, index) => repository(`demo-${index}`));
    const root = await fixtureRoot(repos);
    const plan: RepoSeoPlan = {
      schemaVersion: 1,
      owner: "HSBL-ko-gyo",
      sourceCollectedAt: "2026-01-01T00:00:00Z",
      actions: repos.map((repo) => ({ type: "repository-metadata", repo: repo.name, description: "公開ツールの安全な説明" })),
    };
    await expect(validateRepoSeoPlan(root, plan)).rejects.toThrow("Repository metadata action limit exceeded");
  });

  it("rejects forbidden repository operations at schema validation", async () => {
    const root = await fixtureRoot([repository("demo")]);
    const forbidden = {
      schemaVersion: 1,
      owner: "HSBL-ko-gyo",
      sourceCollectedAt: "2026-01-01T00:00:00Z",
      actions: [{ type: "repository-rename", repo: "demo", name: "renamed" }],
    } as unknown as RepoSeoPlan;
    await expect(validateRepoSeoPlan(root, forbidden)).rejects.toThrow("SEO action schema validation failed");
  });

  it("does not call any remote function during dry-run", async () => {
    const plan: RepoSeoPlan = {
      schemaVersion: 1,
      owner: "HSBL-ko-gyo",
      sourceCollectedAt: "2026-01-01T00:00:00Z",
      actions: [{ type: "repository-metadata", repo: "demo", description: "説明" }],
    };
    const dataset: GithubDataset = {
      schemaVersion: 1,
      owner: "HSBL-ko-gyo",
      visibility: "public",
      filters: { forksExcluded: true },
      collectedAt: plan.sourceCollectedAt,
      repositories: [repository("demo")],
    };
    const context: ValidatedPlanContext = { plan, policy: policy(), dataset, repositories: new Map([["demo", dataset.repositories[0]]]) };
    let calls = 0;
    const noRemote: RemoteClient = {
      async assertAvailable() { calls += 1; },
      async inspectRepository() { calls += 1; throw new Error("must not run"); },
      async updateMetadata() { calls += 1; },
      async getReadme() { calls += 1; throw new Error("must not run"); },
      async updateReadme() { calls += 1; },
    };
    const results = await executeRepoSeoPlan(context, true, noRemote);
    expect(calls).toBe(0);
    expect(results).toEqual([{ type: "repository-metadata", repo: "demo", status: "planned", detail: "安全検証済み。dry-runのためリモート操作なし。" }]);
  });
});
