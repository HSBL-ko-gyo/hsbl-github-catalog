import { describe, expect, it } from "vitest";
import { isEligibleRepository, type PublicRepository } from "../scripts/lib/github-data.js";

const base: PublicRepository = {
  name: "demo",
  description: null,
  url: "https://github.com/HSBL-ko-gyo/demo",
  homepageUrl: null,
  isArchived: false,
  isPrivate: false,
  isFork: false,
  isEmpty: false,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  pushedAt: "2026-01-01T00:00:00Z",
  primaryLanguage: null,
  topics: [],
  defaultBranch: "main",
  latestRelease: null,
  license: null,
  readmePath: null,
  readmeSha: null,
};

describe("repository eligibility", () => {
  it("accepts only public owner nonfork nonarchived nonempty repositories", () => {
    expect(isEligibleRepository(base, "HSBL-ko-gyo", new Set())).toBe(true);
    expect(isEligibleRepository({ ...base, isPrivate: true }, "HSBL-ko-gyo", new Set())).toBe(false);
    expect(isEligibleRepository({ ...base, isFork: true }, "HSBL-ko-gyo", new Set())).toBe(false);
    expect(isEligibleRepository({ ...base, isArchived: true }, "HSBL-ko-gyo", new Set())).toBe(false);
    expect(isEligibleRepository({ ...base, isEmpty: true }, "HSBL-ko-gyo", new Set())).toBe(false);
    expect(isEligibleRepository(base, "someone-else", new Set())).toBe(false);
    expect(isEligibleRepository(base, "HSBL-ko-gyo", new Set(["demo"]))).toBe(false);
  });
});
