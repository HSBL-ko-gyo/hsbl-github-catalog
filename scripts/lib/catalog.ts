import { readFile, readdir } from "node:fs/promises";
import { basename, resolve } from "node:path";
import matter from "gray-matter";
import type { ProjectFrontmatter } from "../../src/lib/project-schema.js";
import { projectFrontmatterSchema } from "../../src/lib/project-schema.js";

export type ProjectFile = {
  path: string;
  filename: string;
  data: ProjectFrontmatter;
  body: string;
};

export async function loadProjectFiles(root: string): Promise<ProjectFile[]> {
  const directory = resolve(root, "src/content/projects");
  const entries = (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
  return Promise.all(
    entries.map(async (entry) => {
      const path = resolve(directory, entry.name);
      const parsed = matter(await readFile(path, "utf8"));
      return {
        path,
        filename: basename(path),
        data: projectFrontmatterSchema.parse(parsed.data),
        body: parsed.content,
      };
    }),
  );
}

export function markdownHeadings(body: string): string[] {
  return [...body.matchAll(/^##\s+(.+?)\s*$/gm)].map((match) => match[1]);
}
