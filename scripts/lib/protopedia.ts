import { readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { z } from "zod";

const httpsUrl = z
  .url()
  .refine((value) => value.startsWith("https://"), "HTTPS URLのみ指定できます");
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const prototypeUrl = httpsUrl.refine(
  (value) => /^https:\/\/protopedia\.net\/prototype\/\d+$/.test(value),
  "公開ProtoPedia作品URLが必要です",
);

export const protopediaFormSchema = z.object({
  workStatus: z.enum(["完成", "開発中"]),
  title: z.string().min(1).max(50),
  officialUrl: httpsUrl,
  summary: z.string().min(1).max(100),
  displayCreativeCommonsLicense: z.literal(false),
  tags: z.array(z.string().min(1).max(40)).min(1).max(5),
  storyMarkdown: z.string().min(1),
  slideMode: z.literal(false),
  relatedLinks: z.array(httpsUrl).max(5),
  thumbnailPath: z
    .string()
    .regex(/^public\/images\/projects\/[a-z0-9]+(?:-[a-z0-9]+)*\.png$/)
    .optional(),
});

const submissionBase = z.object({
  slug,
  requestedVisibility: z.literal("general-public"),
  sourceHash: z.string().regex(/^[a-f0-9]{64}$/),
  form: protopediaFormSchema,
});

export const protopediaQueueSchema = z.object({
  version: z.literal(2),
  account: z.string().min(1),
  note: z.string().min(1),
  submissions: z.array(
    z.discriminatedUnion("operation", [
      submissionBase.extend({ operation: z.literal("create") }),
      submissionBase.extend({
        operation: z.literal("sync-thumbnail"),
        form: protopediaFormSchema.extend({
          thumbnailPath: z
            .string()
            .regex(
              /^public\/images\/projects\/[a-z0-9]+(?:-[a-z0-9]+)*\.png$/,
            ),
        }),
        existingPrototype: z.object({
          prototypeId: z.number().int().positive(),
          url: prototypeUrl,
        }),
      }),
    ]),
  ),
});

export const protopediaStateSchema = z
  .object({
    version: z.literal(2),
    account: z.string().min(1),
    baselineCatalogSlugs: z.array(slug),
    published: z.array(
      z.object({
        slug: slug.optional(),
        title: z.string().min(1),
        prototypeId: z.number().int().positive(),
        url: prototypeUrl,
        officialUrl: httpsUrl.optional(),
        sourceHash: z.string().regex(/^[a-f0-9]{64}$/).optional(),
        thumbnailUploaded: z.boolean().optional(),
        publishedAt: z.iso.datetime({ offset: true }).optional(),
        verifiedAt: z.iso.datetime({ offset: true }).optional(),
      }),
    ),
  })
  .superRefine((state, context) => {
    for (const record of state.published) {
      if (record.url !== `https://protopedia.net/prototype/${record.prototypeId}`) {
        context.addIssue({
          code: "custom",
          message: `Prototype URL/ID mismatch for ${record.title}`,
        });
      }
    }
    for (const [label, values] of [
      ["prototypeId", state.published.map(({ prototypeId }) => String(prototypeId))],
      ["slug", state.published.flatMap(({ slug: value }) => (value ? [value] : []))],
    ] as const) {
      if (new Set(values).size !== values.length) {
        context.addIssue({ code: "custom", message: `Duplicate published ${label}` });
      }
    }
  });

export type ProtopediaForm = z.infer<typeof protopediaFormSchema>;
export type ProtopediaQueue = z.infer<typeof protopediaQueueSchema>;
export type ProtopediaSubmission = ProtopediaQueue["submissions"][number];
export type ProtopediaState = z.infer<typeof protopediaStateSchema>;

export async function readProtopediaQueue(path: string): Promise<ProtopediaQueue> {
  return protopediaQueueSchema.parse(JSON.parse(await readFile(path, "utf8")));
}

export async function readProtopediaState(path: string): Promise<ProtopediaState> {
  return protopediaStateSchema.parse(JSON.parse(await readFile(path, "utf8")));
}

export async function writeJsonAtomic(
  path: string,
  value: unknown,
  mode?: number,
): Promise<void> {
  const temporary = resolve(dirname(path), `.${path.split("/").at(-1)}.${process.pid}.tmp`);
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, {
    mode,
  });
  await rename(temporary, path);
}
