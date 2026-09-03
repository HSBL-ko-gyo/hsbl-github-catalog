import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "zod";

const ROOT = resolve(import.meta.dirname, "..");
const httpsUrl = z
  .url()
  .refine((value) => value.startsWith("https://"), "HTTPS URLのみ指定できます");
const queueSchema = z.object({
  version: z.literal(1),
  account: z.string().min(1),
  note: z.string().min(1),
  submissions: z.array(
    z.object({
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      action: z.literal("prepare-in-logged-in-chrome"),
      requestedVisibility: z.literal("general-public"),
      requiresConfirmationBeforeSubmit: z.literal(true),
      sourceHash: z.string().regex(/^[a-f0-9]{64}$/),
      form: z.object({
        workStatus: z.enum(["完成", "開発中"]),
        title: z.string().min(1).max(50),
        officialUrl: httpsUrl,
        summary: z.string().min(1).max(100),
        displayCreativeCommonsLicense: z.literal(false),
        tags: z.array(z.string().min(1).max(40)).min(1).max(5),
        storyMarkdown: z.string().min(1),
        slideMode: z.literal(false),
        relatedLinks: z.array(httpsUrl).max(5),
      }),
    }),
  ),
});

async function main(): Promise<void> {
  const source = await readFile(
    resolve(ROOT, "data/actions/protopedia-submissions.json"),
    "utf8",
  );
  const queue = queueSchema.parse(JSON.parse(source));
  const slugs = queue.submissions.map(({ slug }) => slug);
  if (new Set(slugs).size !== slugs.length) {
    throw new Error("ProtoPedia submission slugs must be unique");
  }
  process.stdout.write(
    `Validated ${queue.submissions.length} ProtoPedia submission candidate(s).\n`,
  );
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : "ProtoPedia validation failed"}\n`,
  );
  process.exitCode = 1;
});
