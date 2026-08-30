import { describe, expect, it } from "vitest";
import { loadProjectFiles } from "../scripts/lib/catalog.js";
import { isPublishedProject } from "../src/lib/project-schema.js";
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
    expect(canonicalUrl("/projects/demo/")).toBe("https://github.hsbl-ko-gyo.com/projects/demo/");
  });

  it("has unique public SEO metadata and owner-scoped GitHub links", async () => {
    const projects = (await loadProjectFiles(process.cwd())).filter(({ data }) => !data.draft);
    expect(projects.length).toBeGreaterThan(0);
    expect(new Set(projects.map(({ data }) => data.seoTitle)).size).toBe(projects.length);
    expect(new Set(projects.map(({ data }) => data.seoDescription)).size).toBe(projects.length);
    for (const { data } of projects) {
      expect(data.links.github).toBe(`https://github.com/HSBL-ko-gyo/${data.repo}`);
      expect(data.seoTitle.length).toBeGreaterThan(0);
      expect(data.seoDescription.length).toBeGreaterThan(0);
    }
  });
});
