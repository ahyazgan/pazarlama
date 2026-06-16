import { describe, expect, it } from "vitest";
import { buildCritiqueSystem, buildCritiqueUser, CRITIQUE_SCHEMA } from "./critique";
import { HAMMADDEM_SAMPLE } from "./brand-store";
import type { ContentPackage } from "./types";

const pkg: ContentPackage = {
  topic: "Stok tazelendi",
  contentType: "deger",
  angle: "korku",
  outputs: {
    instagram: { caption: "CAP", firstComment: "#x", imagePrompt: "IMG", altText: "ALT" },
    tiktok: { hook: "HK", scenes: [], soundSuggestion: "S", cta: "C" },
    linkedin: { hookLine: "L", body: "B", insight: "I", discussionQuestion: "Q" },
    x: { thread: ["T1"] },
  },
};

describe("critique prompt", () => {
  it("system sektör editörü + JSON zorunlu", () => {
    const s = buildCritiqueSystem(HAMMADDEM_SAMPLE);
    expect(s).toMatch(/marka editoru/i);
    expect(s).toMatch(/JSON/);
  });

  it("user marka beynini + paketi denetime sokar", () => {
    const u = buildCritiqueUser(HAMMADDEM_SAMPLE, pkg);
    expect(u).toMatch(/MARKA BEYNI/);
    expect(u).toMatch(/Yasak kelimeler/);
    expect(u).toContain("CAP"); // paket içeriği denetime giriyor
    expect(u).toMatch(/0-100 puan/);
  });

  it("şema score + verdict + issues zorunlu", () => {
    expect(CRITIQUE_SCHEMA.required).toEqual(["score", "verdict", "issues"]);
  });
});
