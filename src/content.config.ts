import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { projectFrontmatterSchema } from "./lib/project-schema";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: projectFrontmatterSchema,
});

export const collections = { projects };
