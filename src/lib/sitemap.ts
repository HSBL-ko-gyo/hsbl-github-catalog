import { CATEGORIES } from "./site.js";

export function createSitemapPaths(
  projects: Array<{ data: { slug: string; category: string; draft: boolean } }>,
): string[] {
  const published = projects.filter(({ data }) => !data.draft);
  const categories = [...new Set(published.map(({ data }) => data.category))]
    .filter((category) => category in CATEGORIES)
    .sort();
  return [
    "/",
    "/about/",
    "/categories/",
    ...categories.map((slug) => `/categories/${slug}/`),
    ...published.map(({ data }) => `/projects/${data.slug}/`).sort(),
  ];
}
