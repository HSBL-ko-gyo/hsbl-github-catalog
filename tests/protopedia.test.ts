import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { readProtopediaQueue, readProtopediaState } from "../scripts/lib/protopedia.js";
import { readPngDimensions } from "../scripts/lib/png.js";

const ROOT = resolve(import.meta.dirname, "..");

describe("ProtoPedia unattended publication inputs", () => {
  it("uses the deterministic version 2 queue without confirmation actions", async () => {
    const queue = await readProtopediaQueue(
      resolve(ROOT, "data/actions/protopedia-submissions.json"),
    );
    expect(queue.version).toBe(2);
    expect(
      queue.submissions.every(({ operation }) =>
        ["create", "sync-thumbnail"].includes(operation),
      ),
    ).toBe(true);
    expect(JSON.stringify(queue)).not.toContain("requiresConfirmationBeforeSubmit");
    expect(JSON.stringify(queue)).not.toContain("prepare-in-logged-in-chrome");
  });

  it("keeps verified publications in a separate version 2 state", async () => {
    const state = await readProtopediaState(
      resolve(ROOT, "data/protopedia/publication-state.json"),
    );
    expect(state.version).toBe(2);
    expect(new Set(state.published.map(({ prototypeId }) => prototypeId)).size).toBe(
      state.published.length,
    );
  });

  it("stores web-service thumbnails at the fixed upload dimensions", async () => {
    for (const slug of [
      "aotori-575",
      "bakusoku-mahjong",
      "mahjong-bootcamp",
    ]) {
      await expect(
        readPngDimensions(resolve(ROOT, "public/images/projects", `${slug}.png`)),
      ).resolves.toEqual({ width: 880, height: 495 });
    }
  });
});
