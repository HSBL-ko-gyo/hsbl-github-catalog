import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import publicRepositories from "../data/github/public-repositories.json";
import { loadProjectFiles, markdownHeadings } from "../scripts/lib/catalog.js";
import {
  formatTokyoDateTime,
  isIso8601DateTime,
} from "../src/lib/date-time.js";
import {
  GITHUB_COLLECTED_AT,
  GITHUB_COLLECTED_AT_DISPLAY,
} from "../src/lib/github-collection.js";
import { isPublishedProject, sortProjects } from "../src/lib/project-schema.js";
import { canonicalUrl } from "../src/lib/site.js";
import { createSitemapPaths } from "../src/lib/sitemap.js";

describe("public catalog boundaries", () => {
  it("filters drafts from public collections", () => {
    expect(isPublishedProject({ data: { draft: false } })).toBe(true);
    expect(isPublishedProject({ data: { draft: true } })).toBe(false);
  });

  it("keeps drafts out of sitemap paths", () => {
    const paths = createSitemapPaths([
      { data: { slug: "public-tool", category: "browser-tool", draft: false } },
      { data: { slug: "secret-draft", category: "browser-tool", draft: true } },
    ]);
    expect(paths).toContain("/projects/public-tool/");
    expect(paths).not.toContain("/projects/secret-draft/");
  });

  it("creates self-canonical URLs on the catalog origin", () => {
    expect(canonicalUrl("/projects/demo/")).toBe(
      "https://github.hsbl-ko-gyo.com/projects/demo/",
    );
  });

  it("sorts projects by GitHub publication time, newest first", () => {
    const projects = [
      { data: { title: "Older", repoCreatedAt: "2025-01-01T00:00:00Z" } },
      { data: { title: "Newest", repoCreatedAt: "2026-08-01T00:00:00Z" } },
      { data: { title: "Middle", repoCreatedAt: "2026-01-01T00:00:00Z" } },
    ];
    expect(sortProjects(projects).map(({ data }) => data.title)).toEqual([
      "Newest",
      "Middle",
      "Older",
    ]);
  });

  it("uses the collection timestamp recorded in the public GitHub dataset", () => {
    expect(isIso8601DateTime(publicRepositories.collectedAt)).toBe(true);
    expect(GITHUB_COLLECTED_AT).toBe(publicRepositories.collectedAt);
  });

  it("formats GitHub timestamps in Asia/Tokyo without seconds", () => {
    expect(formatTokyoDateTime("2026-08-29T22:50:39Z")).toBe(
      "2026/08/30 07:50",
    );
    expect(GITHUB_COLLECTED_AT_DISPLAY).toMatch(
      /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/,
    );
  });

  it("uses at least two content-specific H2 sections for every public project", async () => {
    const projects = (await loadProjectFiles(process.cwd())).filter(
      ({ data }) => !data.draft,
    );
    const legacySections = [
      "何ができるか",
      "こんな時に使う",
      "主な機能",
      "技術・構成",
      "公開先または使い方",
      "GitHubで見る",
    ];
    for (const { body, filename } of projects) {
      const headings = markdownHeadings(body);
      expect(headings.length, filename).toBeGreaterThanOrEqual(2);
      expect(
        legacySections.every((heading) => headings.includes(heading)),
        filename,
      ).toBe(false);
    }
  });

  it("does not keep the old top or About copy in public page sources", async () => {
    const paths = [
      "src/pages/index.astro",
      "src/pages/about.astro",
      "src/pages/categories/index.astro",
    ];
    const source = (
      await Promise.all(
        paths.map((path) => readFile(resolve(process.cwd(), path), "utf8")),
      )
    ).join("\n");
    for (const copy of [
      "つくった道具を、使う人の言葉で。",
      "リポジトリ名の向こうにある、使い道を伝える。",
      "用途の近い道具を、引き出しごとにまとめました。",
      "READMEの転載ではなく、入力・出力・使いどころを短く整理しています。",
    ]) {
      expect(source).not.toContain(copy);
    }
  });

  it("has unique public SEO metadata and owner-scoped GitHub links", async () => {
    const projects = (await loadProjectFiles(process.cwd())).filter(
      ({ data }) => !data.draft,
    );
    expect(projects.length).toBeGreaterThan(0);
    expect(new Set(projects.map(({ data }) => data.seoTitle)).size).toBe(
      projects.length,
    );
    expect(new Set(projects.map(({ data }) => data.seoDescription)).size).toBe(
      projects.length,
    );
    for (const { data } of projects) {
      expect(data.links.github).toBe(
        `https://github.com/HSBL-ko-gyo/${data.repo}`,
      );
      expect(data.seoTitle.length).toBeGreaterThan(0);
      expect(data.seoDescription.length).toBeGreaterThan(0);
    }
  });
});
