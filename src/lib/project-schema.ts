import { z } from "astro/zod";
import { CATEGORIES } from "./site.js";

const httpsUrl = z
  .url()
  .refine((value) => value.startsWith("https://"), "HTTPS URLのみ指定できます");
const githubUrl = httpsUrl.refine(
  (value) => value.startsWith("https://github.com/HSBL-ko-gyo/"),
  "GitHub URLはHSBL-ko-gyo配下である必要があります",
);

export const projectFrontmatterSchema = z.object({
  title: z.string().min(1).max(80),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  repo: z.string().min(1).max(100),
  summary: z.string().min(20).max(180),
  description: z.string().min(8).max(220),
  category: z.enum(
    Object.keys(CATEGORIES) as [
      keyof typeof CATEGORIES,
      ...(keyof typeof CATEGORIES)[],
    ],
  ),
  tags: z.array(z.string().min(1).max(40)).min(1).max(12),
  status: z.enum(["public", "beta", "development", "archived"]),
  draft: z.boolean(),
  featured: z.boolean(),
  isFork: z.boolean().default(false),
  forkSourceUrl: httpsUrl.optional(),
  createdYear: z.number().int().min(2000).max(2100).optional(),
  links: z.object({
    github: githubUrl,
    app: httpsUrl.optional(),
    release: httpsUrl.optional(),
    article: httpsUrl.optional(),
    shop: httpsUrl.optional(),
  }),
  seoTitle: z.string().min(20).max(80),
  seoDescription: z.string().min(50).max(160),
  searchIntents: z.array(z.string().min(2).max(60)).min(1).max(8),
  repoCreatedAt: z.iso.datetime({ offset: true }),
  repoUpdatedAt: z.iso.datetime({ offset: true }),
  repoPushedAt: z.iso.datetime({ offset: true }),
  primaryLanguage: z.string().min(1).max(40).nullable(),
  topics: z.array(z.string().regex(/^[a-z0-9][a-z0-9-]{0,49}$/)).max(12),
  sourceEvidence: z.array(httpsUrl).min(1).max(8),
});

export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>;

export function isPublishedProject(project: {
  data: Pick<ProjectFrontmatter, "draft">;
}): boolean {
  return !project.data.draft;
}

export function sortProjects<
  T extends { data: Pick<ProjectFrontmatter, "repoCreatedAt" | "title"> },
>(projects: T[]): T[] {
  return [...projects].sort(
    (a, b) =>
      Date.parse(b.data.repoCreatedAt) - Date.parse(a.data.repoCreatedAt) ||
      a.data.title.localeCompare(b.data.title, "ja"),
  );
}
