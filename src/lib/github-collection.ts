import publicRepositories from "../../data/github/public-repositories.json";
import { formatTokyoDateTime, parseIso8601DateTime } from "./date-time.js";

export const GITHUB_COLLECTED_AT = parseIso8601DateTime(
  publicRepositories.collectedAt,
);
export const GITHUB_COLLECTED_AT_DISPLAY = formatTokyoDateTime(
  GITHUB_COLLECTED_AT,
);
