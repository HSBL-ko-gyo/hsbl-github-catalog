import { access, mkdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import { writeJsonAtomic, writeTextAtomic } from "./lib/files.js";

const OWNER = "HSBL-ko-gyo";
const API_ORIGIN = "https://api.github.com";
const ROOT = resolve(import.meta.dirname, "..");
const OUTPUT_PATH = resolve(ROOT, "data/github/public-repositories.json");
const README_DIR = resolve(ROOT, "data/github/readmes");
const POLICY_PATH = resolve(ROOT, "config/catalog-policy.yml");
const SEED_PATH = resolve(ROOT, "seed/initial-projects.yml");
const USER_AGENT = "hsbl-github-catalog-collector/1.0";

type GithubRepositoryResponse = {
  name: string;
  full_name: string;
  private: boolean;
  fork: boolean;
  size: number;
  archived: boolean;
  disabled: boolean;
  html_url: string;
  homepage: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  pushed_at: string | null;
  default_branch: string;
  language: string | null;
  topics?: string[];
  license: { spdx_id?: string | null } | null;
  owner: { login: string };
  parent?: { html_url: string } | null;
  source?: { html_url: string } | null;
};

type ReadmeResponse = {
  name: string;
  path: string;
  sha: string;
  content: string;
  encoding: string;
};

type ReleaseResponse = {
  tag_name: string;
  html_url: string;
  published_at: string | null;
};

type Policy = {
  publication?: {
    allowedForks?: Array<{ repo: string; source: string }>;
  };
  filters?: {
    denyNamePatterns?: string[];
    explicitExclusions?: Array<{ repo: string }>;
    supersededRepositories?: Array<{ repo: string }>;
  };
};

type Seed = {
  approved?: Array<{ repo: string }>;
  review?: Array<{ repo: string }>;
};

type NormalizedRepository = {
  name: string;
  description: string | null;
  url: string;
  homepageUrl: string | null;
  isArchived: boolean;
  isPrivate: boolean;
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

type ExistingDataset = {
  schemaVersion: number;
  owner: string;
  visibility: string;
  filters?: { forksExcluded?: boolean; allowedForks?: string[] };
  repositories: NormalizedRepository[];
};

function requestHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": USER_AGENT,
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function githubJson<T>(
  path: string,
  allowNotFound = false,
): Promise<T | null> {
  const response = await fetch(`${API_ORIGIN}${path}`, {
    headers: requestHeaders(),
  });
  if (allowNotFound && response.status === 404) return null;
  if (!response.ok) {
    throw new Error(
      `GitHub API request failed (${response.status}) for ${path.split("?")[0]}`,
    );
  }
  return (await response.json()) as T;
}

async function loadCollectionRules(): Promise<{
  candidates: Set<string>;
  allowedForks: Set<string>;
  allowedForkSources: Map<string, string>;
}> {
  const [policyText, seedText] = await Promise.all([
    readFile(POLICY_PATH, "utf8"),
    readFile(SEED_PATH, "utf8"),
  ]);
  const policy = parseYaml(policyText) as Policy;
  const seed = parseYaml(seedText) as Seed;
  const explicit = new Set(
    policy.filters?.explicitExclusions?.map(({ repo }) => repo) ?? [],
  );
  const superseded = new Set(
    policy.filters?.supersededRepositories?.map(({ repo }) => repo) ?? [],
  );
  const denied = (policy.filters?.denyNamePatterns ?? []).map(
    (pattern) => new RegExp(pattern, "i"),
  );
  const allowedForkSources = new Map(
    policy.publication?.allowedForks?.map(({ repo, source }) => [
      repo,
      source,
    ]) ?? [],
  );
  const allowedForks = new Set(allowedForkSources.keys());
  const candidates = new Set(
    [...(seed.approved ?? []), ...(seed.review ?? [])]
      .map(({ repo }) => repo)
      .filter(
        (repo) =>
          !explicit.has(repo) &&
          !superseded.has(repo) &&
          !denied.some((rule) => rule.test(repo)),
      ),
  );
  return { candidates, allowedForks, allowedForkSources };
}

async function loadExistingRepositories(
  allowedForks: ReadonlySet<string>,
): Promise<Map<string, NormalizedRepository>> {
  try {
    const value = JSON.parse(
      await readFile(OUTPUT_PATH, "utf8"),
    ) as ExistingDataset;
    if (
      value.schemaVersion !== 1 ||
      value.owner !== OWNER ||
      value.visibility !== "public" ||
      value.filters?.forksExcluded !== true ||
      !Array.isArray(value.repositories) ||
      value.repositories.some(
        (repo) =>
          repo.isPrivate === true ||
          (repo.isFork && !allowedForks.has(repo.name)) ||
          repo.url !== `https://github.com/${OWNER}/${repo.name}`,
      )
    ) {
      throw new Error("Existing GitHub collection is not safe to reuse");
    }
    return new Map(value.repositories.map((repo) => [repo.name, repo]));
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT")
      return new Map();
    throw error;
  }
}

async function readmeCacheExists(repo: string): Promise<boolean> {
  try {
    await access(resolve(README_DIR, `${repo}.md`));
    return true;
  } catch {
    return false;
  }
}

async function listPublicRepositories(
  allowedForks: ReadonlySet<string>,
): Promise<GithubRepositoryResponse[]> {
  const repositories: GithubRepositoryResponse[] = [];
  for (let page = 1; page <= 10; page += 1) {
    const batch = await githubJson<GithubRepositoryResponse[]>(
      `/users/${OWNER}/repos?type=public&sort=full_name&direction=asc&per_page=100&page=${page}`,
    );
    if (!batch) throw new Error("GitHub returned no repository list");
    repositories.push(...batch);
    if (batch.length < 100) break;
  }
  return repositories
    .filter(
      (repo) =>
        repo.owner.login === OWNER &&
        repo.full_name === `${OWNER}/${repo.name}` &&
        repo.private === false &&
        (repo.fork === false || allowedForks.has(repo.name)),
    )
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
}

async function fetchForkSource(
  repo: string,
  expectedSource: string | undefined,
): Promise<string> {
  const value = await githubJson<GithubRepositoryResponse>(
    `/repos/${OWNER}/${encodeURIComponent(repo)}`,
  );
  const sourceUrl = value?.source?.html_url ?? value?.parent?.html_url;
  if (
    !value ||
    value.private ||
    !value.fork ||
    !sourceUrl?.startsWith("https://github.com/") ||
    sourceUrl !== expectedSource
  ) {
    throw new Error(`Allowed fork source could not be verified for ${repo}`);
  }
  return sourceUrl;
}

async function fetchReadme(
  repo: string,
): Promise<{ path: string; sha: string; text: string } | null> {
  const value = await githubJson<ReadmeResponse>(
    `/repos/${OWNER}/${encodeURIComponent(repo)}/readme`,
    true,
  );
  if (!value) return null;
  if (value.encoding !== "base64" || !value.path || !value.sha) {
    throw new Error(`Unexpected README response for ${repo}`);
  }
  return {
    path: value.path,
    sha: value.sha,
    text: Buffer.from(value.content.replace(/\n/g, ""), "base64").toString(
      "utf8",
    ),
  };
}

async function fetchLatestRelease(
  repo: string,
): Promise<NormalizedRepository["latestRelease"]> {
  const value = await githubJson<ReleaseResponse>(
    `/repos/${OWNER}/${encodeURIComponent(repo)}/releases/latest`,
    true,
  );
  return value
    ? {
        tag: value.tag_name,
        url: value.html_url,
        publishedAt: value.published_at,
      }
    : null;
}

async function main(): Promise<void> {
  const { candidates, allowedForks, allowedForkSources } =
    await loadCollectionRules();
  const [existingRepositories, repositories] = await Promise.all([
    loadExistingRepositories(allowedForks),
    listPublicRepositories(allowedForks),
  ]);
  const normalized: NormalizedRepository[] = [];
  await mkdir(README_DIR, { recursive: true });

  for (const repo of repositories) {
    const isEmpty = repo.size === 0;
    const shouldInspect = !isEmpty && candidates.has(repo.name);
    const existing = existingRepositories.get(repo.name);
    const reuseInspection = Boolean(
      shouldInspect &&
      existing &&
      existing.updatedAt === repo.updated_at &&
      existing.readmePath &&
      existing.readmeSha &&
      (await readmeCacheExists(repo.name)),
    );
    const [fetchedReadme, latestRelease, forkSourceUrl] = await Promise.all([
      shouldInspect && !reuseInspection
        ? fetchReadme(repo.name)
        : Promise.resolve(null),
      shouldInspect && !reuseInspection
        ? fetchLatestRelease(repo.name)
        : Promise.resolve(
            reuseInspection ? (existing?.latestRelease ?? null) : null,
          ),
      repo.fork
        ? fetchForkSource(repo.name, allowedForkSources.get(repo.name))
        : Promise.resolve(null),
    ]);
    const readmePath =
      fetchedReadme?.path ??
      (reuseInspection ? (existing?.readmePath ?? null) : null);
    const readmeSha =
      fetchedReadme?.sha ??
      (reuseInspection ? (existing?.readmeSha ?? null) : null);

    if (fetchedReadme) {
      await writeTextAtomic(
        resolve(README_DIR, `${repo.name}.md`),
        fetchedReadme.text,
      );
    }

    normalized.push({
      name: repo.name,
      description: repo.description,
      url: repo.html_url,
      homepageUrl: repo.homepage?.startsWith("https://") ? repo.homepage : null,
      isArchived: repo.archived,
      isPrivate: false,
      isFork: repo.fork,
      forkSourceUrl,
      isEmpty,
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
      pushedAt: repo.pushed_at,
      primaryLanguage: repo.language,
      topics: [...(repo.topics ?? [])].sort((a, b) => a.localeCompare(b, "en")),
      defaultBranch: repo.default_branch,
      latestRelease,
      license:
        repo.license?.spdx_id && repo.license.spdx_id !== "NOASSERTION"
          ? repo.license.spdx_id
          : null,
      readmePath,
      readmeSha,
    });
  }

  const collectedAt = new Date().toISOString();
  await writeJsonAtomic(OUTPUT_PATH, {
    schemaVersion: 1,
    owner: OWNER,
    visibility: "public",
    filters: {
      forksExcluded: true,
      allowedForks: [...allowedForks].sort((a, b) => a.localeCompare(b, "en")),
    },
    collectedAt,
    repositories: normalized,
  });
  const forkCount = normalized.filter((repo) => repo.isFork).length;
  process.stdout.write(
    `Collected ${normalized.length} public repositories for ${OWNER} (${forkCount} explicitly allowed fork).\n`,
  );
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : "Unknown collection error";
  process.stderr.write(
    `Collection failed without replacing the existing dataset: ${message}\n`,
  );
  process.exitCode = 1;
});
