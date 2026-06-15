import { describe, expect, it } from "vitest";
import { buildSystemPrompt, buildUserPrompt, OUTPUT_SCHEMA } from "./prompt";
import { HAMMADDEM_SAMPLE } from "./brand-store";
import type { GenerateRequest } from "./types";

const req: GenerateRequest = {
  brand: HAMMADDEM_SAMPLE,
  topic: "Cimento stogu tazelendi",
  contentType: "deger",
  angle: "korku",
  personaIndex: 0,
};

describe("prompt enjeksiyonu — generic'ligi kiran katman", () => {
  it("system prompt sektore gore uzmanlasir ve generic'i yasaklar", () => {
    const sys = buildSystemPrompt(req);
    expect(sys).toMatch(/sektorunde uzman/);
    expect(sys).toMatch(/[Gg]eneric/);
  });

  it("marka beynini enjekte eder (kimlik, yasak kelime, persona acisi, rakam)", () => {
    const p = buildUserPrompt(req);
    expect(p).toContain("Hammaddem"); // marka adi
    expect(p).toContain("ucuz"); // yasak kelime listede
    expect(p).toMatch(/YASAK/);
    expect(p).toContain("Geç gelen malzeme"); // persona acisi
    expect(p).toContain("10.000+ ton teslimat"); // kanit rakami
  });

  it("sektor zekasini enjekte eder (terminoloji + hook + mevsimsellik)", () => {
    const p = buildUserPrompt(req);
    expect(p).toMatch(/agrega/); // insaat terminolojisi
    expect(p).toMatch(/Santiyede en pahali hata/); // insaat hook formulu
    expect(p).toMatch(/Mart-Kasim/); // mevsimsellik
  });

  it("gorev: konu + aci + 4 platformu icerir", () => {
    const p = buildUserPrompt(req);
    expect(p).toContain("Cimento stogu tazelendi");
    expect(p).toMatch(/Korku/); // aci etiketi
    for (const platform of ["Instagram", "TikTok", "LinkedIn", "X"]) {
      expect(p).toContain(platform);
    }
  });

  it("farkli persona secimi farkli aci enjekte eder", () => {
    const p0 = buildUserPrompt({ ...req, personaIndex: 0 });
    const p1 = buildUserPrompt({ ...req, personaIndex: 1 });
    expect(p0).not.toEqual(p1);
    expect(p1).toContain("Satinalma Sorumlusu");
  });

  it("OUTPUT_SCHEMA 4 platformu zorunlu kilar", () => {
    expect(OUTPUT_SCHEMA.required).toEqual(["instagram", "tiktok", "linkedin", "x"]);
  });
});
