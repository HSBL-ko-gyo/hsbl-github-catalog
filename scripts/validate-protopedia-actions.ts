import { resolve } from "node:path";
import { access } from "node:fs/promises";
import { assertProjectThumbnail } from "./lib/png.js";
import { readProtopediaQueue } from "./lib/protopedia.js";

const ROOT = resolve(import.meta.dirname, "..");
async function main(): Promise<void> {
  const queue = await readProtopediaQueue(
    resolve(ROOT, "data/actions/protopedia-submissions.json"),
  );
  const slugs = queue.submissions.map(({ slug }) => slug);
  if (new Set(slugs).size !== slugs.length) {
    throw new Error("ProtoPedia submission slugs must be unique");
  }
  const titles = queue.submissions.map(({ form }) => form.title);
  const officialUrls = queue.submissions.map(({ form }) => form.officialUrl);
  if (new Set(titles).size !== titles.length) {
    throw new Error("ProtoPedia submission titles must be unique");
  }
  if (new Set(officialUrls).size !== officialUrls.length) {
    throw new Error("ProtoPedia submission official URLs must be unique");
  }
  for (const submission of queue.submissions) {
    if (!submission.form.thumbnailPath) continue;
    const expected = `public/images/projects/${submission.slug}.png`;
    if (submission.form.thumbnailPath !== expected) {
      throw new Error(`${submission.slug} thumbnailPath must be ${expected}`);
    }
    const thumbnail = resolve(ROOT, submission.form.thumbnailPath);
    await access(thumbnail);
    await assertProjectThumbnail(thumbnail);
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
