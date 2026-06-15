import { describe, expect, it } from "vitest";
import { lintPackage } from "./quality";
import type { ContentPackage } from "./types";

function pkgWith(caption: string, thread: string[] = ["ok"]): ContentPackage {
  return {
    topic: "t",
    contentType: "deger",
    angle: "korku",
    outputs: {
      instagram: { caption, firstComment: "#x", imagePrompt: "p", altText: "a" },
      tiktok: { hook: "h", scenes: [{ timecode: "0", shot: "s", voiceover: "v" }], soundSuggestion: "snd", cta: "cta" },
      linkedin: { hookLine: "hl", body: "b", insight: "i", discussionQuestion: "q" },
      x: { thread },
    },
  };
}

describe("lintPackage", () => {
  it("temiz paket için sorun yok", () => {
    expect(lintPackage(pkgWith("Şantiyeye değer katıyoruz."), [])).toEqual([]);
  });

  it("yasak kelimeyi yakalar", () => {
    const issues = lintPackage(pkgWith("Çok ucuz fiyatlarla"), ["ucuz"]);
    expect(issues.some((i) => i.type === "yasak" && i.term === "ucuz")).toBe(true);
    expect(issues[0].where).toMatch(/Instagram\/caption/);
  });

  it("AI-klişe kalıbını yakalar", () => {
    const issues = lintPackage(pkgWith("Günümüz dünyasında herkes..."), []);
    expect(issues.some((i) => i.type === "klise")).toBe(true);
  });

  it("thread içindeki yasak kelimeyi de tarar", () => {
    const issues = lintPackage(pkgWith("temiz", ["bedava kargo"]), ["bedava"]);
    expect(issues.some((i) => i.where.startsWith("X/tweet"))).toBe(true);
  });
});
