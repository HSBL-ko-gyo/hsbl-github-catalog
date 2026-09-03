import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadProjectFiles } from "./lib/catalog.js";

const ROOT = resolve(import.meta.dirname, "..");
const STATE_PATH = resolve(ROOT, "data/protopedia/publication-state.json");
const ACTIONS_PATH = resolve(ROOT, "data/actions/protopedia-submissions.json");
const CATALOG_ORIGIN = "https://github.hsbl-ko-gyo.com";

type PublicationState = {
  version: 1;
  account: string;
  baselineCatalogSlugs: string[];
  published: Array<{
    slug?: string;
    title: string;
    prototypeId: number;
    url: string;
  }>;
};

function publicationStatus(status: string): "完成" | "開発中" {
  return status === "public" ? "完成" : "開発中";
}

async function main(): Promise<void> {
  const [projects, stateSource] = await Promise.all([
    loadProjectFiles(ROOT),
    readFile(STATE_PATH, "utf8"),
  ]);
  const state = JSON.parse(stateSource) as PublicationState;
  const knownSlugs = new Set([
    ...state.baselineCatalogSlugs,
    ...state.published.flatMap(({ slug }) => (slug ? [slug] : [])),
  ]);
  const knownTitles = new Set(state.published.map(({ title }) => title));

  const submissions = projects
    .filter(
      ({ data }) =>
        !data.draft &&
        data.status !== "archived" &&
        !knownSlugs.has(data.slug) &&
        !knownTitles.has(data.title),
    )
    .sort((a, b) => a.data.slug.localeCompare(b.data.slug, "en"))
    .map(({ data, body }) => {
      const officialUrl =
        data.links.app ??
        data.links.shop ??
        data.links.release ??
        data.links.github ??
        data.links.article;
      if (!officialUrl) {
        throw new Error(`${data.slug} has no URL suitable for ProtoPedia`);
      }
      const catalogUrl = `${CATALOG_ORIGIN}/projects/${data.slug}/`;
      const relatedLinks = [
        ...new Set(
          [
            data.links.article,
            data.links.github,
            data.links.release,
            data.links.shop,
            data.links.protopedia,
            catalogUrl,
          ].filter(
            (url): url is string => Boolean(url && url !== officialUrl),
          ),
        ),
      ].slice(0, 5);
      const form = {
        workStatus: publicationStatus(data.status),
        title: data.title,
        officialUrl,
        summary: data.summary,
        displayCreativeCommonsLicense: false,
        tags: data.tags.slice(0, 5),
        storyMarkdown: body.trim(),
        slideMode: false,
        relatedLinks,
      };
      return {
        slug: data.slug,
        action: "prepare-in-logged-in-chrome",
        requestedVisibility: "general-public",
        requiresConfirmationBeforeSubmit: true,
        sourceHash: createHash("sha256")
          .update(JSON.stringify(form))
          .digest("hex"),
        form,
      };
    });

  const actions = {
    version: 1,
    account: state.account,
    note: "Chromeで重複と表示内容を確認し、登録ボタンの直前に利用者の確認を取る。認証情報は保存しない。",
    submissions,
  };
  await writeFile(ACTIONS_PATH, `${JSON.stringify(actions, null, 2)}\n`);
  process.stdout.write(
    `Prepared ${submissions.length} ProtoPedia submission candidate(s).\n`,
  );
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : "ProtoPedia preparation failed"}\n`,
  );
  process.exitCode = 1;
});
