import { resolve } from "node:path";
import { createGhRemoteClient, executeRepoSeoPlan } from "./lib/repo-seo-apply.js";
import { validateRepoSeoPlan } from "./lib/repo-seo.js";
import { writeTextAtomic } from "./lib/files.js";

const ROOT = resolve(import.meta.dirname, "..");
const args = new Set(process.argv.slice(2));
const dryRun = args.delete("--dry-run");
if (args.size > 0) {
  process.stderr.write(`Unknown arguments: ${[...args].join(", ")}\n`);
  process.exit(2);
}

function reportDate(): string {
  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tokyo",
  }).format(new Date());
}

async function main(): Promise<void> {
  const context = await validateRepoSeoPlan(ROOT);
  const results = await executeRepoSeoPlan(context, dryRun, createGhRemoteClient());
  const date = reportDate();
  const heading = dryRun ? "GitHub SEO適用 dry-run" : "GitHub SEO適用結果";
  const report = [
    `# ${heading} — ${date}`,
    "",
    `- action計画: ${results.length}件`,
    `- applied: ${results.filter(({ status }) => status === "applied").length}件`,
    `- skipped: ${results.filter(({ status }) => status === "skipped").length}件`,
    `- failed: ${results.filter(({ status }) => status === "failed").length}件`,
    `- planned (dry-run): ${results.filter(({ status }) => status === "planned").length}件`,
    "",
    "## 個別結果",
    "",
    ...results.map((result) => `- \`${result.repo}\` / ${result.type} / **${result.status}** — ${result.detail}`),
    "",
    dryRun
      ? "dry-runではGitHub CLIの認証確認、API取得、更新関数を一切呼び出していません。"
      : "各アクションの直前にowner、public、fork、archived状態と、README変更時はbase SHAを再確認しました。",
    "",
  ].join("\n");
  await writeTextAtomic(resolve(ROOT, "reports/repo-seo-applied", `${date}.md`), report);
  await writeTextAtomic(resolve(ROOT, "reports/repo-seo-applied/latest.md"), report);
  process.stdout.write(`${heading}: ${results.length} actions processed.\n`);
  if (!dryRun && results.some(({ status }) => status === "failed")) process.exitCode = 1;
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : "Repository SEO apply failed"}\n`);
  process.exitCode = 1;
});
