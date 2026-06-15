import { describe, expect, it } from "vitest";
import {
  buildSystemPrompt,
  buildUserPrompt,
  OUTPUT_SCHEMA,
  toneDirectives,
} from "./prompt";
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

  it("icerik sutunlarini enjekte eder", () => {
    const p = buildUserPrompt(req);
    expect(p).toMatch(/Icerik sutunlari:/);
    expect(p).toMatch(/Tedarik guvenligi/);
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

  it("kalite kurallari: anti-generic + aci-odakli hook + rakam uydurma yasagi", () => {
    const p = buildUserPrompt(req);
    expect(p).toMatch(/KALITE KURALLARI/);
    expect(p).toMatch(/acisina degsin/);
    expect(p).toMatch(/rakam UYDURMA/i);
  });

  it("platform onceligini enjekte eder (insaat -> LinkedIn once)", () => {
    const p = buildUserPrompt(req);
    expect(p).toMatch(/PLATFORM ONCELIGI/);
    expect(p).toMatch(/LinkedIn > Instagram/);
  });

  it("system prompt AI-klise kaliplarini yasaklar", () => {
    expect(buildSystemPrompt(req)).toMatch(/gunumuz dunyasinda/);
  });

  it("ton kurallari prompt'a girer (tone=4 -> dengeli)", () => {
    const p = buildUserPrompt(req);
    expect(p).toMatch(/Ton kurallari:/);
  });

  it("trend verilince enjekte eder, verilmeyince etmez", () => {
    expect(buildUserPrompt({ ...req, trend: "Deprem yonetmeligi guncellendi" })).toMatch(
      /TREND ENJEKSIYONU/,
    );
    expect(buildUserPrompt(req)).not.toMatch(/TREND ENJEKSIYONU/);
  });

  it("toneDirectives uca gore degisir", () => {
    expect(toneDirectives(1)).toMatch(/Resmi/);
    expect(toneDirectives(9)).toMatch(/Samimi/);
    expect(toneDirectives(5)).toMatch(/Dengeli/);
  });

  it("persona derinligini (itiraz/kelime/tetikleyici) enjekte eder", () => {
    const p = buildUserPrompt(req);
    expect(p).toMatch(/Persona derinligi/);
    expect(p).toMatch(/irsaliye/); // Saha Mudur vocabulary
    expect(p).toMatch(/itirazi onceden karsila/);
  });

  it("marka hikayesini enjekte eder", () => {
    expect(buildUserPrompt(req)).toMatch(/Marka hikayesi:/);
  });

  it("donusum hedefini (CTA) enjekte eder", () => {
    expect(buildUserPrompt(req)).toMatch(/Donusum hedefi:/);
  });

  it("gorsel kimligi (marka rengi + stil) enjekte eder", () => {
    const p = buildUserPrompt(req);
    expect(p).toMatch(/Gorsel kimlik: marka ana rengi #E8650A/);
  });

  it("farkli marka rengi prompt'a yansir (sabit degil)", () => {
    const custom = {
      ...req,
      brand: {
        ...req.brand,
        identity: { ...req.brand.identity, primaryColor: "#0A66C2" },
      },
    };
    expect(buildUserPrompt(custom)).toMatch(/#0A66C2/);
  });

  it("konumlandirma (rakip + fark) enjekte eder", () => {
    const p = buildUserPrompt(req);
    expect(p).toMatch(/KONUMLANDIRMA/);
    expect(p).toMatch(/yerel hirdavatçi/); // HAMMADDEM competitor
    expect(p).toMatch(/Karsitlik acisinda/);
  });

  it("altin ornekleri (few-shot) ve kacinilacak ornekleri enjekte eder", () => {
    const p = buildUserPrompt(req);
    expect(p).toMatch(/SES ORNEKLERI/);
    expect(p).toMatch(/Beton dökümü bekleyen/); // HAMMADDEM good example
    expect(p).toMatch(/KACINILACAK ORNEKLER/);
  });

  it("ornek yoksa ilgili bloklar girmez", () => {
    const noEx = {
      ...req,
      brand: { ...req.brand, voice: { ...req.brand.voice, goodExamples: [], badExamples: [] } },
    };
    expect(buildUserPrompt(noEx)).not.toMatch(/SES ORNEKLERI/);
  });

  it("OUTPUT_SCHEMA 4 platform + variants zorunlu kilar", () => {
    expect(OUTPUT_SCHEMA.required).toEqual([
      "instagram",
      "tiktok",
      "linkedin",
      "x",
      "variants",
    ]);
  });

  it("A/B varyant direktifi prompt'a girer", () => {
    expect(buildUserPrompt(req)).toMatch(/A\/B VARYANT/);
  });
});
