import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import Ajv from "ajv";
import { loadProjectFiles } from "./catalog.js";
import {
  explicitExclusionNames,
  isEligibleRepository,
  loadCatalogPolicy,
  loadGithubDataset,
  type CatalogPolicy,
  type GithubDataset,
  type PublicRepository,
} from "./github-data.js";

export type RepositoryMetadataAction = {
  type: "repository-metadata";
  repo: string;
  description?: string;
  topics?: string[];
  homepage?: string;
};

export type ReadmeManagedIntroAction = {
  type: "readme-managed-intro";
  repo: string;
  path: string;
  baseSha: string;
  content: string;
};

export type ReadmeExactUrlRepairAction = {
  type: "readme-exact-url-repair";
  repo: string;
  path: string;
  baseSha: string;
  from: string;
  to: string;
};

export type RepoSeoAction = RepositoryMetadataAction | ReadmeManagedIntroAction | ReadmeExactUrlRepairAction;

export type RepoSeoPlan = {
  schemaVersion: 1;
  owner: "HSBL-ko-gyo";
  sourceCollectedAt: string;
  actions: RepoSeoAction[];
};

export type ValidatedPlanContext = {
  plan: RepoSeoPlan;
  policy: CatalogPolicy;
  dataset: GithubDataset;
  repositories: Map<string, PublicRepository>;
};

function countOccurrences(value: string, search: string): number {
  if (!search) return 0;
  let count = 0;
  let offset = 0;
  while ((offset = value.indexOf(search, offset)) !== -1) {
    count += 1;
    offset += search.length;
  }
  return count;
}

export function gitBlobSha(value: string): string {
  const body = Buffer.from(value, "utf8");
  return createHash("sha1").update(`blob ${body.length}\0`).update(body).digest("hex");
}

export function replaceManagedBlock(
  readme: string,
  block: string,
  startMarker: string,
  endMarker: string,
): string {
  const starts = countOccurrences(readme, startMarker);
  const ends = countOccurrences(readme, endMarker);
  if (starts > 1 || ends > 1 || starts !== ends) throw new Error("README has ambiguous managed markers");
  if (starts === 1) {
    const start = readme.indexOf(startMarker);
    const end = readme.indexOf(endMarker, start) + endMarker.length;
    if (end < start) throw new Error("README managed markers are reversed");
    return `${readme.slice(0, start)}${block}${readme.slice(end)}`;
  }

  const firstLineEnd = readme.indexOf("\n");
  if (readme.startsWith("# ") && firstLineEnd !== -1) {
    return `${readme.slice(0, firstLineEnd + 1)}\n${block}\n${readme.slice(firstLineEnd + 1)}`;
  }
  return `${block}\n\n${readme}`;
}

export function applyReadmeAction(
  readme: string,
  action: ReadmeManagedIntroAction | ReadmeExactUrlRepairAction,
  policy: CatalogPolicy,
): string {
  if (action.type === "readme-managed-intro") {
    return replaceManagedBlock(readme, action.content, policy.repoSeo.managedBlockStart, policy.repoSeo.managedBlockEnd);
  }
  if (action.from === action.to || countOccurrences(readme, action.from) !== 1) {
    throw new Error("Exact URL repair source must occur exactly once and differ from the target");
  }
  return readme.replace(action.from, action.to);
}

function sameStrings(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

export async function validateRepoSeoPlan(root: string, suppliedPlan?: RepoSeoPlan): Promise<ValidatedPlanContext> {
  const [schemaText, planText, dataset, policy, projects] = await Promise.all([
    readFile(resolve(root, "schemas/repo-seo-actions.schema.json"), "utf8"),
    suppliedPlan ? Promise.resolve("") : readFile(resolve(root, "data/actions/repo-seo-actions.json"), "utf8"),
    loadGithubDataset(root),
    loadCatalogPolicy(root),
    loadProjectFiles(root),
  ]);
  const plan = suppliedPlan ?? (JSON.parse(planText) as RepoSeoPlan);
  const ajv = new Ajv({ allErrors: true, strict: true, strictRequired: false });
  const valid = ajv.compile(JSON.parse(schemaText))(plan);
  if (!valid) throw new Error(`SEO action schema validation failed: ${ajv.errorsText(ajv.errors)}`);
  if (plan.sourceCollectedAt !== dataset.collectedAt) throw new Error("Action plan does not match the latest collection timestamp");

  const repositories = new Map(dataset.repositories.map((repo) => [repo.name, repo]));
  const exclusions = explicitExclusionNames(policy);
  const projectsByRepo = new Map(projects.map((project) => [project.data.repo, project]));
  const counts = {
    "repository-metadata": 0,
    "readme-managed-intro": 0,
    "readme-exact-url-repair": 0,
  };
  const actionKeys = new Set<string>();
  const readmeRepos = new Set<string>();

  for (const action of plan.actions) {
    counts[action.type] += 1;
    const key = `${action.type}:${action.repo}`;
    if (actionKeys.has(key)) throw new Error(`Duplicate action: ${key}`);
    actionKeys.add(key);
    const repository = repositories.get(action.repo);
    if (!isEligibleRepository(repository, plan.owner, exclusions)) {
      throw new Error(`Ineligible SEO action target: ${action.repo}`);
    }

    if (action.type === "repository-metadata") {
      let changed = false;
      if (action.description !== undefined) {
        if ([...action.description].length > policy.repoSeo.descriptionMaxCharacters) throw new Error(`Description too long: ${action.repo}`);
        changed ||= action.description !== repository.description;
      }
      if (action.topics !== undefined) {
        if (action.topics.length > policy.repoSeo.topicsMaxCount) throw new Error(`Too many topics: ${action.repo}`);
        const sorted = [...action.topics].sort((a, b) => a.localeCompare(b, "en"));
        if (!sameStrings(action.topics, sorted)) throw new Error(`Topics must be deterministically sorted: ${action.repo}`);
        changed ||= !sameStrings(action.topics, repository.topics);
      }
      if (action.homepage !== undefined) {
        const project = projectsByRepo.get(action.repo);
        const verified = new Set<string>([
          repository.url,
          ...(repository.homepageUrl ? [repository.homepageUrl] : []),
          ...(repository.latestRelease ? [repository.latestRelease.url] : []),
          ...(project ? [
            ...Object.values(project.data.links).filter((value): value is string => typeof value === "string"),
            ...project.data.sourceEvidence,
            `${policy.site.canonicalOrigin}/projects/${project.data.slug}/`,
          ] : []),
        ]);
        if (!verified.has(action.homepage)) throw new Error(`Homepage is not supported by collected evidence: ${action.repo}`);
        changed ||= action.homepage !== repository.homepageUrl;
      }
      if (!changed) throw new Error(`Metadata action is not idempotent: ${action.repo}`);
      continue;
    }

    if (readmeRepos.has(action.repo)) throw new Error(`Only one README action per repository is allowed: ${action.repo}`);
    readmeRepos.add(action.repo);
    if (!repository.readmePath || !repository.readmeSha || repository.readmePath !== action.path || repository.readmeSha !== action.baseSha) {
      throw new Error(`README path or base SHA does not match collected data: ${action.repo}`);
    }
    const readme = await readFile(resolve(root, "data/github/readmes", `${action.repo}.md`), "utf8");
    if (gitBlobSha(readme) !== action.baseSha) throw new Error(`Cached README bytes do not match base SHA: ${action.repo}`);

    if (action.type === "readme-managed-intro") {
      if ([...action.content].length > policy.repoSeo.managedReadmeBlockMaxCharacters) throw new Error(`Managed README block too long: ${action.repo}`);
      if (
        countOccurrences(action.content, policy.repoSeo.managedBlockStart) !== 1 ||
        countOccurrences(action.content, policy.repoSeo.managedBlockEnd) !== 1 ||
        action.content.indexOf(policy.repoSeo.managedBlockStart) > action.content.indexOf(policy.repoSeo.managedBlockEnd)
      ) {
        throw new Error(`Managed README block markers are invalid: ${action.repo}`);
      }
    }
    const updated = applyReadmeAction(readme, action, policy);
    if (updated === readme) throw new Error(`README action is not idempotent: ${action.repo}`);
  }

  if (counts["repository-metadata"] > policy.limits.maxRepoMetadataEditsPerRun) throw new Error("Repository metadata action limit exceeded");
  if (counts["readme-managed-intro"] > policy.limits.maxManagedReadmeEditsPerRun) throw new Error("Managed README action limit exceeded");
  if (counts["readme-exact-url-repair"] > policy.limits.maxExactUrlRepairsPerRun) throw new Error("Exact URL repair action limit exceeded");
  return { plan, policy, dataset, repositories };
}
