import { describe, expect, it } from "vitest";
import { researchContextBlock, buildUserPrompt } from "./prompt";
import { HAMMADDEM_SAMPLE } from "./brand-store";
import type { GenerateRequest, ResearchBrief } from "./types";

const brief: ResearchBrief = {
  topic: "Çimento fiyatları",
  findings: ["Çimento endeksi son çeyrekte %12 arttı", "Tedarik süreleri uzadı"],
  sources: [{ title: "TÜİK ÜFE", url: "https://example.gov/ufe" }],
  competitorGap: "Rakipler fiyat şeffaflığı vermiyor",
};

describe("researchContextBlock", () => {
  it("bulgu + kaynak + grounding kuralı içerir", () => {
    const b = researchContextBlock(brief);
    expect(b).toMatch(/ARASTIRMA BULGULARI/);
    expect(b).toContain("%12 arttı");
    expect(b).toMatch(/Kaynaklar:/);
    expect(b).toContain("https://example.gov/ufe");
    expect(b).toMatch(/uydurma sayi\/iddia URETME/i);
  });
});

describe("buildUserPrompt research entegrasyonu", () => {
  const req: GenerateRequest = {
    brand: HAMMADDEM_SAMPLE,
    topic: "Çimento fiyatları",
    contentType: "deger",
    angle: "egitici",
    personaIndex: 0,
  };
  it("research verilince enjekte eder, verilmeyince etmez", () => {
    expect(buildUserPrompt({ ...req, research: brief })).toMatch(/ARASTIRMA BULGULARI/);
    expect(buildUserPrompt(req)).not.toMatch(/ARASTIRMA BULGULARI/);
  });
});
