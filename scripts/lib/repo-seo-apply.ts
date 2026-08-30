import { spawnSync } from "node:child_process";
import { Buffer } from "node:buffer";
import { explicitExclusionNames } from "./github-data.js";
import {
  applyReadmeAction,
  type ReadmeExactUrlRepairAction,
  type ReadmeManagedIntroAction,
  type RepoSeoAction,
  type RepositoryMetadataAction,
  type ValidatedPlanContext,
} from "./repo-seo.js";

type RemoteRepositoryState = {
  owner: string;
  isPrivate: boolean;
  isFork: boolean;
  isArchived: boolean;
  defaultBranch: string;
  description: string | null;
  homepage: string | null;
  topics: string[];
};

type RemoteReadme = { path: string; sha: string; text: string };

export type RemoteClient = {
  assertAvailable(): Promise<void>;
  inspectRepository(owner: string, repo: string): Promise<RemoteRepositoryState>;
  updateMetadata(owner: string, repo: string, action: RepositoryMetadataAction): Promise<void>;
  getReadme(owner: string, repo: string, path: string, branch: string): Promise<RemoteReadme>;
  updateReadme(owner: string, repo: string, readme: RemoteReadme, branch: string, content: string, message: string): Promise<void>;
};

export type ApplyResult = {
  type: RepoSeoAction["type"];
  repo: string;
  status: "planned" | "applied" | "skipped" | "failed";
  detail: string;
};

function runGh(args: string[], input?: string): string {
  const result = spawnSync("gh", args, {
    encoding: "utf8",
    input,
    env: process.env,
    maxBuffer: 4 * 1024 * 1024,
  });
  if (result.error || result.status !== 0) {
    throw new Error(`gh command failed (${args.slice(0, 3).join(" ")})`);
  }
  return result.stdout;
}

function contentEndpoint(owner: string, repo: string, path: string): string {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `repos/${owner}/${repo}/contents/${encodedPath}`;
}

export function createGhRemoteClient(): RemoteClient {
  return {
    async assertAvailable() {
      runGh(["auth", "status", "--hostname", "github.com"]);
    },
    async inspectRepository(owner, repo) {
      const value = JSON.parse(runGh(["api", `repos/${owner}/${repo}`])) as {
        owner: { login: string };
        private: boolean;
        fork: boolean;
        archived: boolean;
        default_branch: string;
        description: string | null;
        homepage: string | null;
        topics: string[];
      };
      return {
        owner: value.owner.login,
        isPrivate: value.private,
        isFork: value.fork,
        isArchived: value.archived,
        defaultBranch: value.default_branch,
        description: value.description,
        homepage: value.homepage,
        topics: [...value.topics].sort((a, b) => a.localeCompare(b, "en")),
      };
    },
    async updateMetadata(owner, repo, action) {
      const patch: Record<string, string> = {};
      if (action.description !== undefined) patch.description = action.description;
      if (action.homepage !== undefined) patch.homepage = action.homepage;
      if (Object.keys(patch).length > 0) {
        runGh(["api", "--method", "PATCH", `repos/${owner}/${repo}`, "--input", "-"], JSON.stringify(patch));
      }
      if (action.topics !== undefined) {
        runGh(["api", "--method", "PUT", `repos/${owner}/${repo}/topics`, "--input", "-"], JSON.stringify({ names: action.topics }));
      }
    },
    async getReadme(owner, repo, path, branch) {
      const value = JSON.parse(runGh(["api", `${contentEndpoint(owner, repo, path)}?ref=${encodeURIComponent(branch)}`])) as {
        path: string;
        sha: string;
        encoding: string;
        content: string;
      };
      if (value.encoding !== "base64") throw new Error("Remote README encoding is not base64");
      return {
        path: value.path,
        sha: value.sha,
        text: Buffer.from(value.content.replace(/\n/g, ""), "base64").toString("utf8"),
      };
    },
    async updateReadme(owner, repo, readme, branch, content, message) {
      const payload = {
        message,
        content: Buffer.from(content, "utf8").toString("base64"),
        sha: readme.sha,
        branch,
      };
      runGh(["api", "--method", "PUT", contentEndpoint(owner, repo, readme.path), "--input", "-"], JSON.stringify(payload));
    },
  };
}

function sameStrings(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function remoteStillEligible(state: RemoteRepositoryState, owner: string, excluded: boolean): boolean {
  return state.owner === owner && !state.isPrivate && !state.isFork && !state.isArchived && !excluded;
}

export async function executeRepoSeoPlan(
  context: ValidatedPlanContext,
  dryRun: boolean,
  remote: RemoteClient,
): Promise<ApplyResult[]> {
  if (dryRun) {
    return context.plan.actions.map((action) => ({
      type: action.type,
      repo: action.repo,
      status: "planned",
      detail: "安全検証済み。dry-runのためリモート操作なし。",
    }));
  }

  await remote.assertAvailable();
  const exclusions = explicitExclusionNames(context.policy);
  const results: ApplyResult[] = [];
  for (const action of context.plan.actions) {
    try {
      const state = await remote.inspectRepository(context.plan.owner, action.repo);
      if (!remoteStillEligible(state, context.plan.owner, exclusions.has(action.repo))) {
        throw new Error("Remote repository no longer satisfies the public owner/nonfork/nonarchived boundary");
      }

      if (action.type === "repository-metadata") {
        const effective: RepositoryMetadataAction = { type: action.type, repo: action.repo };
        if (action.description !== undefined && action.description !== state.description) effective.description = action.description;
        if (action.homepage !== undefined && action.homepage !== state.homepage) effective.homepage = action.homepage;
        if (action.topics !== undefined && !sameStrings(action.topics, state.topics)) effective.topics = action.topics;
        if (!("description" in effective) && !("homepage" in effective) && !("topics" in effective)) {
          results.push({ type: action.type, repo: action.repo, status: "skipped", detail: "リモートは既に計画内容と一致。" });
          continue;
        }
        await remote.updateMetadata(context.plan.owner, action.repo, effective);
        results.push({ type: action.type, repo: action.repo, status: "applied", detail: "Description / Topics / Homepageの許可範囲だけを更新。" });
        continue;
      }

      const readmeAction = action as ReadmeManagedIntroAction | ReadmeExactUrlRepairAction;
      const readme = await remote.getReadme(context.plan.owner, action.repo, readmeAction.path, state.defaultBranch);
      if (readme.path !== readmeAction.path || readme.sha !== readmeAction.baseSha) {
        results.push({ type: action.type, repo: action.repo, status: "skipped", detail: "READMEのpathまたはbase SHAが変更済み。" });
        continue;
      }
      const updated = applyReadmeAction(readme.text, readmeAction, context.policy);
      if (updated === readme.text) {
        results.push({ type: action.type, repo: action.repo, status: "skipped", detail: "READMEは既に計画内容と一致。" });
        continue;
      }
      await remote.updateReadme(
        context.plan.owner,
        action.repo,
        readme,
        state.defaultBranch,
        updated,
        context.policy.repoSeo.directCommitMessage,
      );
      results.push({ type: action.type, repo: action.repo, status: "applied", detail: "READMEだけの単独コミットを作成。" });
    } catch (error: unknown) {
      results.push({
        type: action.type,
        repo: action.repo,
        status: "failed",
        detail: error instanceof Error ? error.message : "Unknown action failure",
      });
    }
  }
  return results;
}
