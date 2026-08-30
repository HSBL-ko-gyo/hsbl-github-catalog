import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { SITE } from "../lib/site";
import { createSitemapPaths } from "../lib/sitemap";

export const prerender = true;

const escapeXml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

export const GET: APIRoute = async () => {
  const projects = await getCollection("projects");
  const urls = createSitemapPaths(projects).map((path) => `  <url><loc>${escapeXml(new URL(path, SITE.origin).toString())}</loc></url>`).join("\n");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
