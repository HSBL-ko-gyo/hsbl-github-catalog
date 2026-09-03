import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadProjectFiles } from "./lib/catalog.js";
import {
  type ProtopediaForm,
  readProtopediaState,
} from "./lib/protopedia.js";

const ROOT = resolve(import.meta.dirname, "..");
const STATE_PATH = resolve(ROOT, "data/protopedia/publication-state.json");
const ACTIONS_PATH = resolve(ROOT, "data/actions/protopedia-submissions.json");
const CATALOG_ORIGIN = "https://github.hsbl-ko-gyo.com";

function publicationStatus(status: string): "完成" | "開発中" {
  return status === "public" ? "完成" : "開発中";
}

async function main(): Promise<void> {
  const [projects, state] = await Promise.all([
    loadProjectFiles(ROOT),
    readProtopediaState(STATE_PATH),
  ]);
  const knownSlugs = new Set([
    ...state.baselineCatalogSlugs,
    ...state.published.flatMap(({ slug }) => (slug ? [slug] : [])),
  ]);
  const knownTitles = new Set(state.published.map(({ title }) => title));

  function buildForm(data: (typeof projects)[number]["data"], body: string): ProtopediaForm {
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
        ].filter((url): url is string => Boolean(url && url !== officialUrl)),
      ),
    ].slice(0, 5);
    return {
      workStatus: publicationStatus(data.status),
      title: data.title,
      officialUrl,
      summary: data.summary,
      displayCreativeCommonsLicense: false,
      tags: data.tags.slice(0, 5),
      storyMarkdown: body.trim(),
      slideMode: false,
      relatedLinks,
      ...(data.thumbnail
        ? { thumbnailPath: `public${data.thumbnail}` }
        : {}),
    };
  }

  const createSubmissions = projects
    .filter(
      ({ data }) =>
        !data.draft &&
        data.status !== "archived" &&
        !knownSlugs.has(data.slug) &&
        !knownTitles.has(data.title),
    )
    .sort((a, b) => a.data.slug.localeCompare(b.data.slug, "en"))
    .map(({ data, body }) => {
      const form = buildForm(data, body);
      return {
        slug: data.slug,
        operation: "create" as const,
        requestedVisibility: "general-public",
        sourceHash: createHash("sha256")
          .update(JSON.stringify(form))
          .digest("hex"),
        form,
      };
    });

  const publishedBySlug = new Map(
    state.published.flatMap((record) =>
      record.slug ? ([[record.slug, record]] as const) : [],
    ),
  );
  const thumbnailSubmissions = projects
    .filter(({ data }) => {
      const published = publishedBySlug.get(data.slug);
      return Boolean(
        !data.draft &&
          data.thumbnail &&
          published &&
          published.thumbnailUploaded !== true,
      );
    })
    .sort((a, b) => a.data.slug.localeCompare(b.data.slug, "en"))
    .map(({ data, body }) => {
      const published = publishedBySlug.get(data.slug)!;
      const form = buildForm(data, body);
      return {
        slug: data.slug,
        operation: "sync-thumbnail" as const,
        requestedVisibility: "general-public" as const,
        sourceHash: createHash("sha256")
          .update(JSON.stringify(form))
          .digest("hex"),
        form,
        existingPrototype: {
          prototypeId: published.prototypeId,
          url: published.url,
        },
      };
    });

  const submissions = [...thumbnailSubmissions, ...createSubmissions];

  const actions = {
    version: 2,
    account: state.account,
    note: "固定Playwright投稿処理の入力。投稿前後の重複確認と成功検証後にだけ公開台帳を更新する。認証情報はリポジトリ外で管理する。",
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
