import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import { isIso8601DateTime } from "../../src/lib/date-time.js";

export type PublicRepository = {
  name: string;
  description: string | null;
  url: string;
  homepageUrl: string | null;
  isArchived: boolean;
  isPrivate?: boolean;
  isFork: boolean;
  forkSourceUrl: string | null;
  isEmpty: boolean;
  createdAt: string;
  updatedAt: string;
  pushedAt: string | null;
  primaryLanguage: string | null;
  topics: string[];
  defaultBranch: string;
  latestRelease: {
    tag: string;
    url: string;
    publishedAt: string | null;
  } | null;
  license: string | null;
  readmePath: string | null;
  readmeSha: string | null;
};

export type GithubDataset = {
  schemaVersion: 1;
  owner: string;
  visibility: "public";
  filters: { forksExcluded: true; allowedForks: string[] };
  collectedAt: string;
  repositories: PublicRepository[];
};

export type CatalogPolicy = {
  owner: string;
  site: { canonicalOrigin: string };
  publication?: {
    allowedForks?: Array<{ repo: string; source: string; reason: string }>;
    allowedExternalProjects?: Array<{
      slug: string;
      url: string;
      evidence: string;
      reason: string;
    }>;
  };
  filters: {
    explicitExclusions: Array<{ repo: string; reason: string }>;
  };
  repoSeo: {
    managedBlockStart: string;
    managedBlockEnd: string;
    descriptionMaxCharacters: number;
    topicsMaxCount: number;
    managedReadmeBlockMaxCharacters: number;
    directCommitMessage: string;
  };
  limits: {
    maxRepoMetadataEditsPerRun: number;
    maxManagedReadmeEditsPerRun: number;
    maxExactUrlRepairsPerRun: number;
  };
};

export async function loadGithubDataset(root: string): Promise<GithubDataset> {
  const value = JSON.parse(
    await readFile(
      resolve(root, "data/github/public-repositories.json"),
      "utf8",
    ),
  ) as GithubDataset;
  if (
    value.schemaVersion !== 1 ||
    value.owner !== "HSBL-ko-gyo" ||
    value.visibility !== "public" ||
    value.filters?.forksExcluded !== true ||
    !Array.isArray(value.filters?.allowedForks) ||
    !isIso8601DateTime(value.collectedAt) ||
    !Array.isArray(value.repositories)
  ) {
    throw new Error("GitHub collection header is invalid or unsafe");
  }
  const allowedForks = new Set(value.filters.allowedForks);
  if (
    value.repositories.some(
      (repo) =>
        repo.isPrivate === true ||
        (repo.isFork &&
          (!allowedForks.has(repo.name) ||
            !repo.forkSourceUrl?.startsWith("https://github.com/"))) ||
        (!repo.isFork && repo.forkSourceUrl !== null) ||
        repo.url !== `https://github.com/${value.owner}/${repo.name}`,
    )
  ) {
    throw new Error("GitHub collection contains an ineligible repository");
  }
  return value;
}

export async function loadCatalogPolicy(root: string): Promise<CatalogPolicy> {
  return parseYaml(
    await readFile(resolve(root, "config/catalog-policy.yml"), "utf8"),
  ) as CatalogPolicy;
}

export function explicitExclusionNames(policy: CatalogPolicy): Set<string> {
  return new Set(policy.filters.explicitExclusions.map(({ repo }) => repo));
}

export function allowedForkNames(policy: CatalogPolicy): Set<string> {
  return new Set(allowedForkSources(policy).keys());
}

export function allowedForkSources(policy: CatalogPolicy): Map<string, string> {
  return new Map(
    policy.publication?.allowedForks?.map(({ repo, source }) => [
      repo,
      source,
    ]) ?? [],
  );
}

export function allowedExternalProjects(
  policy: CatalogPolicy,
): Map<string, { url: string; evidence: string }> {
  return new Map(
    policy.publication?.allowedExternalProjects?.map(
      ({ slug, url, evidence }) => [slug, { url, evidence }],
    ) ?? [],
  );
}

export function isEligibleRepository(
  repository: PublicRepository | undefined,
  owner: string,
  exclusions: ReadonlySet<string>,
  allowedForks: ReadonlySet<string> = new Set(),
): repository is PublicRepository {
  return Boolean(
    repository &&
    owner === "HSBL-ko-gyo" &&
    repository.url === `https://github.com/${owner}/${repository.name}` &&
    repository.isPrivate !== true &&
    (!repository.isFork || allowedForks.has(repository.name)) &&
    !repository.isArchived &&
    !repository.isEmpty &&
    !exclusions.has(repository.name),
  );
}
