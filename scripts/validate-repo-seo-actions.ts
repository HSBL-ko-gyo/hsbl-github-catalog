import { resolve } from "node:path";
import { validateRepoSeoPlan } from "./lib/repo-seo.js";

const ROOT = resolve(import.meta.dirname, "..");

validateRepoSeoPlan(ROOT)
  .then(({ plan }) => process.stdout.write(`Validated ${plan.actions.length} repository SEO actions.\n`))
  .catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : "SEO action validation failed"}\n`);
    process.exitCode = 1;
  });
