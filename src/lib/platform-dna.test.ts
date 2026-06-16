import { describe, expect, it } from "vitest";
import { PLATFORM_DNA, platformDnaBlock } from "./platform-dna";
import type { PlatformId } from "./types";

describe("Platform DNA", () => {
  it("4 platformun her biri için tam spec içerir", () => {
    const ids: PlatformId[] = ["instagram", "tiktok", "linkedin", "x"];
    for (const id of ids) {
      const d = PLATFORM_DNA[id];
      expect(d.format).toBeTruthy();
      expect(d.hook).toBeTruthy();
      expect(d.structure).toBeTruthy();
      expect(d.cta).toBeTruthy();
      expect(d.rules.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("platformDnaBlock verilen sıraya göre üretir", () => {
    const block = platformDnaBlock(["linkedin", "instagram", "x", "tiktok"]);
    expect(block.indexOf("### LinkedIn")).toBeLessThan(block.indexOf("### Instagram"));
    expect(block).toMatch(/Hook:/);
    expect(block).toMatch(/Kurallar:/);
  });

  it("IG kuralları ~125 karakter ve hashtag-ilk-yorum içerir", () => {
    const block = platformDnaBlock(["instagram"]);
    expect(block).toMatch(/125 karakter/);
    expect(block.toLowerCase()).toMatch(/hashtag ilk yorumda/);
  });
});
