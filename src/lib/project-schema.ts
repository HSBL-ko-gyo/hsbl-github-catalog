import { z } from "astro/zod";
import { CATEGORIES } from "./site.js";

const httpsUrl = z
  .url()
  .refine((value) => value.startsWith("https://"), "HTTPS URLのみ指定できます");
const githubUrl = httpsUrl.refine(
  (value) => value.startsWith("https://github.com/HSBL-ko-gyo/"),
  "GitHub URLはHSBL-ko-gyo配下である必要があります",
);
const protopediaUrl = httpsUrl.refine(
  (value) => /^https:\/\/protopedia\.net\/prototype\/\d+$/.test(value),
  "ProtoPedia URLは公開作品URLである必要があります",
);

export const projectFrontmatterSchema = z
  .object({
  sourceType: z.enum(["github", "external"]).default("github"),
  title: z.string().min(1).max(80),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  repo: z.string().min(1).max(100).optional(),
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
    github: githubUrl.optional(),
    app: httpsUrl.optional(),
    release: httpsUrl.optional(),
    article: httpsUrl.optional(),
    shop: httpsUrl.optional(),
    protopedia: protopediaUrl.optional(),
  }),
  thumbnail: z
    .string()
    .regex(
      /^\/images\/projects\/[a-z0-9]+(?:-[a-z0-9]+)*\.png$/,
      "thumbnailは作品slugに対応するPNGパスである必要があります",
    )
    .optional(),
  seoTitle: z.string().min(20).max(80),
  seoDescription: z.string().min(50).max(160),
  searchIntents: z.array(z.string().min(2).max(60)).min(1).max(8),
  publishedAt: z.iso.datetime({ offset: true }).optional(),
  repoCreatedAt: z.iso.datetime({ offset: true }).optional(),
  repoUpdatedAt: z.iso.datetime({ offset: true }).optional(),
  repoPushedAt: z.iso.datetime({ offset: true }).optional(),
  primaryLanguage: z.string().min(1).max(40).nullable().optional(),
  topics: z
    .array(z.string().regex(/^[a-z0-9][a-z0-9-]{0,49}$/))
    .max(12)
    .default([]),
  sourceEvidence: z.array(httpsUrl).min(1).max(8),
  })
  .superRefine((data, context) => {
    if (data.category === "web-app" && data.links.app) {
      const expectedThumbnail = `/images/projects/${data.slug}.png`;
      if (data.thumbnail !== expectedThumbnail) {
        context.addIssue({
          code: "custom",
          path: ["thumbnail"],
          message: `web-app thumbnail must be ${expectedThumbnail}`,
        });
      }
    }

    if (data.sourceType === "github") {
      for (const [field, value] of [
        ["repo", data.repo],
        ["links.github", data.links.github],
        ["repoCreatedAt", data.repoCreatedAt],
        ["repoUpdatedAt", data.repoUpdatedAt],
        ["repoPushedAt", data.repoPushedAt],
      ] as const) {
        if (!value) {
          context.addIssue({
            code: "custom",
            message: `${field} is required for GitHub projects`,
          });
        }
      }
      return;
    }

    if (!data.links.app) {
      context.addIssue({
        code: "custom",
        message: "links.app is required for external projects",
      });
    }
    if (!data.publishedAt) {
      context.addIssue({
        code: "custom",
        message: "publishedAt is required for external projects",
      });
    }
    if (
      data.repo ||
      data.links.github ||
      data.repoCreatedAt ||
      data.repoUpdatedAt ||
      data.repoPushedAt ||
      data.isFork ||
      data.forkSourceUrl
    ) {
      context.addIssue({
        code: "custom",
        message: "external projects must not contain GitHub repository fields",
      });
    }
  });

export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>;

export type GithubProjectFrontmatter = ProjectFrontmatter & {
  sourceType: "github";
  repo: string;
  links: ProjectFrontmatter["links"] & { github: string };
  repoCreatedAt: string;
  repoUpdatedAt: string;
  repoPushedAt: string;
};

export function isGithubProjectData(
  data: ProjectFrontmatter,
): data is GithubProjectFrontmatter {
  return data.sourceType === "github";
}

export function projectPublishedAt(
  data: Pick<ProjectFrontmatter, "publishedAt" | "repoCreatedAt">,
): string {
  const value = data.publishedAt ?? data.repoCreatedAt;
  if (!value) throw new Error("Project publication timestamp is missing");
  return value;
}

export function isPublishedProject(project: {
  data: Pick<ProjectFrontmatter, "draft">;
}): boolean {
  return !project.data.draft;
}

export function sortProjects<
  T extends {
    data: Pick<ProjectFrontmatter, "publishedAt" | "repoCreatedAt" | "title">;
  },
>(projects: T[]): T[] {
  return [...projects].sort(
    (a, b) =>
      Date.parse(projectPublishedAt(b.data)) -
        Date.parse(projectPublishedAt(a.data)) ||
      a.data.title.localeCompare(b.data.title, "ja"),
  );
}
