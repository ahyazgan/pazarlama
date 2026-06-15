import { describe, expect, it } from "vitest";
import { complianceForPackage, complianceForText } from "./governance";
import type { ContentPackage } from "./types";

function pkg(caption: string): ContentPackage {
  return {
    topic: "t",
    contentType: "deger",
    angle: "korku",
    outputs: {
      instagram: { caption, firstComment: "", imagePrompt: "", altText: "" },
      tiktok: { hook: "", scenes: [], soundSuggestion: "", cta: "" },
      linkedin: { hookLine: "", body: "", insight: "", discussionQuestion: "" },
      x: { thread: [] },
    },
  };
}

describe("governance — uyumluluk", () => {
  it("ispatsız üstünlük iddiasını yakalar", () => {
    const c = complianceForPackage(pkg("Türkiye'nin en iyi çimentosu bizde"), "insaat");
    expect(c.length).toBeGreaterThan(0);
    expect(c[0].reason).toMatch(/üstünlük/i);
  });

  it("inşaatta mutlak güvenlik iddiasını yakalar", () => {
    const c = complianceForText("Ürünümüz %100 güvenli, deprem garantisi sunar", "insaat");
    expect(c.some((i) => /güvenlik|mutlak|abart/i.test(i.reason))).toBe(true);
  });

  it("güzellikte medikal iddiayı yakalar", () => {
    const c = complianceForText("Bu krem akneyi tedavi eder, doktor onaylı", "guzellik");
    expect(c.some((i) => /medikal|sağlık/i.test(i.reason))).toBe(true);
  });

  it("temiz metin → sorun yok", () => {
    expect(complianceForText("Garantili teslim süresiyle şantiyeye değer katıyoruz.", "insaat")).toEqual([]);
  });
});
