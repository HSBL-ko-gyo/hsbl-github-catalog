import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://github.hsbl-ko-gyo.com",
  output: "static",
  trailingSlash: "always",
  build: {
    format: "directory",
  },
});
