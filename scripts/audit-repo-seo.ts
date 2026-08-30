import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadProjectFiles, type ProjectFile } from "./lib/catalog.js";
import {
  explicitExclusionNames,
  isEligibleRepository,
  loadCatalogPolicy,
  loadGithubDataset,
} from "./lib/github-data.js";
import type { RepoSeoAction, RepoSeoPlan } from "./lib/repo-seo.js";
import { validateRepoSeoPlan } from "./lib/repo-seo.js";
import { writeJsonAtomic, writeTextAtomic } from "./lib/files.js";

const ROOT = resolve(import.meta.dirname, "..");
const PRIORITY = [
  "md-table-shot",
  "gdrive-pdf-ctrl-wheel-zoom",
  "easyeda2kicad_gui",
  "stereo-mic-tester",
  "gif-splitter",
  "Vision-filter-for-people-with-color-blindness",
  "mahjong-bootcamp",
  "enso",
  "unoq-codex-matrix",
  "kicad-step-just-1p6",
];
const MANAGED_INTRO_REPOSITORIES = new Set([
  "gdrive-pdf-ctrl-wheel-zoom",
  "unoq-codex-matrix",
]);
const TOPIC_HINTS: Record<string, string[]> = {
  "md-table-shot": [
    "browser-tool",
    "image-export",
    "markdown",
    "markdown-table",
    "png",
    "typescript",
  ],
  "gdrive-pdf-ctrl-wheel-zoom": [
    "browser-extension",
    "chrome-extension",
    "edge-extension",
    "google-drive",
    "javascript",
    "pdf",
    "zoom",
  ],
  easyeda2kicad_gui: [
    "easyeda",
    "electronics",
    "gui",
    "kicad",
    "lcsc",
    "python",
    "windows",
  ],
  "stereo-mic-tester": [
    "browser-tool",
    "microphone",
    "stereo-audio",
    "testing-tool",
    "web-audio",
  ],
  "gif-splitter": [
    "browser-tool",
    "gif",
    "image-processing",
    "javascript",
    "png",
    "zip",
  ],
  "Vision-filter-for-people-with-color-blindness": [
    "accessibility",
    "browser-tool",
    "color-vision",
    "image-processing",
    "web-app",
  ],
  "mahjong-bootcamp": [
    "browser-game",
    "learning-tool",
    "mahjong",
    "training",
    "web-app",
  ],
  enso: ["digital-art", "fire", "relaxation", "static-site", "web-art"],
  "unoq-codex-matrix": [
    "arduino-router",
    "arduino-uno-q",
    "codex",
    "codex-hooks",
    "embedded",
    "led-matrix",
    "python",
    "rpc",
    "stm32u585",
  ],
  "kicad-step-just-1p6": [
    "3d-cad",
    "electronics",
    "kicad",
    "pcb",
    "python",
    "step",
    "windows",
  ],
};

function managedBlock(
  project: ProjectFile,
  start: string,
  end: string,
): string {
  const links = [
    project.data.links.app
      ? `- [${project.data.title}を使う](${project.data.links.app})`
      : null,
    project.data.links.release
      ? `- [配布版を確認する](${project.data.links.release})`
      : null,
    `- [日本語の作品紹介を見る](https://github.hsbl-ko-gyo.com/projects/${project.data.slug}/)`,
  ].filter((line): line is string => Boolean(line));
  return [
    start,
    `**${project.data.title}** — ${project.data.summary}`,
    "",
    ...links,
    end,
  ].join("\n");
}

function compareStrings(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

async function main(): Promise<void> {
  const [dataset, policy, projects] = await Promise.all([
    loadGithubDataset(ROOT),
    loadCatalogPolicy(ROOT),
    loadProjectFiles(ROOT),
  ]);
  const repositories = new Map(
    dataset.repositories.map((repo) => [repo.name, repo]),
  );
  const exclusions = explicitExclusionNames(policy);
  const priorityIndex = new Map(PRIORITY.map((repo, index) => [repo, index]));
  const orderedProjects = [...projects]
    .filter(({ data }) => !data.draft)
    .sort(
      (a, b) =>
        (priorityIndex.get(a.data.repo) ?? 999) -
          (priorityIndex.get(b.data.repo) ?? 999) ||
        a.data.repo.localeCompare(b.data.repo, "en"),
    );
  const actions: RepoSeoAction[] = [];
  let metadataCount = 0;
  let managedCount = 0;
  let repairCount = 0;

  for (const project of orderedProjects) {
    const repository = repositories.get(project.data.repo);
    if (!isEligibleRepository(repository, dataset.owner, exclusions)) continue;

    if (metadataCount < policy.limits.maxRepoMetadataEditsPerRun) {
      const description = project.data.summary;
      const topics = [
        ...new Set(TOPIC_HINTS[project.data.repo] ?? repository.topics),
      ]
        .sort((a, b) => a.localeCompare(b, "en"))
        .slice(0, policy.repoSeo.topicsMaxCount);
      const homepage =
        project.data.links.app ??
        repository.homepageUrl ??
        `${policy.site.canonicalOrigin}/projects/${project.data.slug}/`;
      const action: RepoSeoAction = {
        type: "repository-metadata",
        repo: project.data.repo,
      };
      if (description !== repository.description)
        action.description = description;
      if (!compareStrings(topics, repository.topics)) action.topics = topics;
      if (homepage !== repository.homepageUrl) action.homepage = homepage;
      if (
        "description" in action ||
        "topics" in action ||
        "homepage" in action
      ) {
        actions.push(action);
        metadataCount += 1;
      }
    }

    if (
      MANAGED_INTRO_REPOSITORIES.has(project.data.repo) &&
      managedCount < policy.limits.maxManagedReadmeEditsPerRun &&
      repository.readmePath &&
      repository.readmeSha
    ) {
      const content = managedBlock(
        project,
        policy.repoSeo.managedBlockStart,
        policy.repoSeo.managedBlockEnd,
      );
      const current = await readFile(
        resolve(ROOT, "data/github/readmes", `${project.data.repo}.md`),
        "utf8",
      );
      if (!current.includes(content)) {
        actions.push({
          type: "readme-managed-intro",
          repo: project.data.repo,
          path: repository.readmePath,
          baseSha: repository.readmeSha,
          content,
        });
        managedCount += 1;
      }
    }

    if (
      project.data.repo === "easyeda2kicad_gui" &&
      repairCount < policy.limits.maxExactUrlRepairsPerRun &&
      repository.readmePath &&
      repository.readmeSha
    ) {
      const from =
        "https://github.com/YOUR_USERNAME/easyeda2kicad_gui/releases";
      const to = "https://github.com/HSBL-ko-gyo/easyeda2kicad_gui/releases";
      const current = await readFile(
        resolve(ROOT, "data/github/readmes", `${project.data.repo}.md`),
        "utf8",
      );
      if (current.split(from).length === 2) {
        actions.push({
          type: "readme-exact-url-repair",
          repo: project.data.repo,
          path: repository.readmePath,
          baseSha: repository.readmeSha,
          from,
          to,
        });
        repairCount += 1;
      }
    }
  }

  actions.sort(
    (a, b) =>
      a.repo.localeCompare(b.repo, "en") || a.type.localeCompare(b.type, "en"),
  );
  const plan: RepoSeoPlan = {
    schemaVersion: 1,
    owner: "HSBL-ko-gyo",
    sourceCollectedAt: dataset.collectedAt,
    actions,
  };
  await writeJsonAtomic(
    resolve(ROOT, "data/actions/repo-seo-actions.json"),
    plan,
  );
  await validateRepoSeoPlan(ROOT, plan);

  for (const project of orderedProjects) {
    const repository = repositories.get(project.data.repo);
    if (!repository) continue;
    const repoActions = actions.filter(
      (action) => action.repo === project.data.repo,
    );
    const report = [
      `# ${project.data.repo} — GitHub SEO監査`,
      "",
      `- 公開URL: ${repository.url}`,
      `- Description: ${repository.description ?? "未設定"}`,
      `- Homepage: ${repository.homepageUrl ?? "未設定"}`,
      `- Topics: ${repository.topics.length ? repository.topics.join(", ") : "未設定"}`,
      `- README SHA: ${repository.readmeSha ?? "READMEなし"}`,
      "",
      "## 計画した変更",
      "",
      ...(repoActions.length
        ? repoActions.map((action) => `- ${action.type}`)
        : ["- なし（今回の件数上限、または現状維持）"]),
      "",
      "公開メタデータとカタログ本文だけを根拠に監査しています。ソース、設定、workflow、Release、Issue、PRは変更対象外です。",
      "",
    ].join("\n");
    await writeTextAtomic(
      resolve(ROOT, "reports/repo-seo", `${project.data.repo}.md`),
      report,
    );
  }

  const reportDate = new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tokyo",
  }).format(new Date());
  const allowedForkCount = dataset.repositories.filter(
    (repository) => repository.isFork,
  ).length;
  const originalRepositoryCount =
    dataset.repositories.length - allowedForkCount;
  const discoveryReport = [
    `# GitHub作品発掘レポート — ${reportDate}`,
    "",
    `- 収集対象: owner一致のpublic ${dataset.repositories.length}件（通常 ${originalRepositoryCount}件 / 明示許可fork ${allowedForkCount}件）`,
    `- 公開作品: ${projects.filter(({ data }) => !data.draft).length}件`,
    `- SEOアクション計画: metadata ${metadataCount}件 / README管理ブロック ${managedCount}件 / 完全一致URL修正 ${repairCount}件`,
    "",
    "## 公開状況",
    "",
    "用途・自作性・現行性が公開READMEから明確な通常作品22件と、派生元・独自変更・制約を明記できる明示許可fork 1件を公開しています。",
    "",
    "## 明示許可fork",
    "",
    "- `easyeda2kicad-digimou`: `uPesy/easyeda2kicad.py` の非公式派生版。販売元メタデータ対応という独自変更を確認できるため、fork表記と派生元リンク付きで掲載。GitHub SEO自動変更の対象外。",
    "",
    "## スキップ",
    "",
    "- `HSBL_touka_Exhibition-plan`: publicだがREADMEが題名だけで、作品ページとしての用途と公開範囲を説明できないため見送り。",
    "- `enso-WEBApp-BETA`: ポリシーで現行版 `enso` の旧版として指定されているため除外。",
    "- `kicad1.6mm`: 空の公開リポジトリで、ポリシーの明示的除外にも該当するため除外。",
    "",
    "privateリポジトリは問い合わせ・集計・記録の対象にしていません。",
    "",
  ].join("\n");
  await writeTextAtomic(
    resolve(ROOT, "reports/discovery", `${reportDate}.md`),
    discoveryReport,
  );
  await writeTextAtomic(
    resolve(ROOT, "reports/discovery/latest.md"),
    discoveryReport,
  );
  process.stdout.write(
    `Wrote ${orderedProjects.length} repository audits and ${actions.length} validated actions.\n`,
  );
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : "Repository SEO audit failed"}\n`,
  );
  process.exitCode = 1;
});
