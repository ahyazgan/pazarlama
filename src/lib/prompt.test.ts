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

const sys = () => buildSystemPrompt(req.brand);
const usr = () => buildUserPrompt(req);

describe("system prompt — SABIT cache prefix (marka beyni + sektor + DNA)", () => {
  it("sektor uzmani + generic yasagi + AI-klise yasagi", () => {
    const s = sys();
    expect(s).toMatch(/sektorunde uzman/);
    expect(s).toMatch(/[Gg]eneric/);
    expect(s).toMatch(/gunumuz dunyasinda/);
  });

  it("marka beyni: kimlik, yasak kelime, kanit rakam, hikaye, CTA, gorsel kimlik", () => {
    const s = sys();
    expect(s).toContain("Hammaddem");
    expect(s).toMatch(/YASAK/);
    expect(s).toContain("ucuz");
    expect(s).toContain("10.000+ ton teslimat");
    expect(s).toMatch(/Marka hikayesi:/);
    expect(s).toMatch(/Donusum hedefi:/);
    expect(s).toMatch(/Gorsel kimlik: marka ana rengi #E8650A/);
  });

  it("konumlandirma + few-shot ornekler", () => {
    const s = sys();
    expect(s).toMatch(/KONUMLANDIRMA/);
    expect(s).toMatch(/yerel hirdavatçi/);
    expect(s).toMatch(/Karsitlik acisinda/);
    expect(s).toMatch(/SES ORNEKLERI/);
    expect(s).toMatch(/Beton dökümü bekleyen/);
    expect(s).toMatch(/KACINILACAK ORNEKLER/);
  });

  it("sektor zekasi + icerik sutunlari + ton kurallari", () => {
    const s = sys();
    expect(s).toMatch(/agrega/);
    expect(s).toMatch(/Santiyede en pahali hata/);
    expect(s).toMatch(/Mart-Kasim/);
    expect(s).toMatch(/Icerik sutunlari:/);
    expect(s).toMatch(/Tedarik guvenligi/);
    expect(s).toMatch(/Ton kurallari:/);
  });

  it("sektor derin bilgi tabanini (mevzuat/hata) enjekte eder", () => {
    const s = sys();
    expect(s).toMatch(/Mevzuat\/standart/);
    expect(s).toMatch(/sik hatalar/);
  });

  it("platform DNA + oncelik + kalite kurallari + A/B", () => {
    const s = sys();
    for (const p of ["Instagram", "TikTok", "LinkedIn", "X"]) expect(s).toContain(p);
    expect(s).toMatch(/PLATFORM ONCELIGI/);
    expect(s).toMatch(/LinkedIn > Instagram/);
    expect(s).toMatch(/KALITE KURALLARI/);
    expect(s).toMatch(/acisina degsin/);
    expect(s).toMatch(/rakam UYDURMA/i);
    expect(s).toMatch(/A\/B VARYANT/);
  });

  it("farkli marka rengi system'e yansir (sabit degil)", () => {
    const s = buildSystemPrompt({
      ...req.brand,
      identity: { ...req.brand.identity, primaryColor: "#0A66C2" },
    });
    expect(s).toMatch(/#0A66C2/);
  });

  it("ornek yoksa SES ORNEKLERI bloklari girmez", () => {
    const s = buildSystemPrompt({
      ...req.brand,
      voice: { ...req.brand.voice, goodExamples: [], badExamples: [] },
    });
    expect(s).not.toMatch(/SES ORNEKLERI/);
  });

  it("ayni marka icin system DETERMINISTIK (cache prefix sabit)", () => {
    expect(buildSystemPrompt(req.brand)).toEqual(buildSystemPrompt(req.brand));
  });
});

describe("user prompt — yalnizca DEGISEN gorev", () => {
  it("konu + aci + persona acisi/derinligi", () => {
    const u = usr();
    expect(u).toContain("Cimento stogu tazelendi");
    expect(u).toMatch(/Korku/);
    expect(u).toContain("Geç gelen malzeme"); // persona acisi
    expect(u).toMatch(/Persona derinligi/);
    expect(u).toMatch(/irsaliye/);
    expect(u).toMatch(/itirazi onceden karsila/);
  });

  it("user prompt marka beynini TEKRAR ETMEZ (cache prefix'te)", () => {
    const u = usr();
    expect(u).not.toMatch(/SES ORNEKLERI/);
    expect(u).not.toMatch(/PLATFORM DNA/);
  });

  it("farkli persona secimi farkli gorev uretir", () => {
    const p0 = buildUserPrompt({ ...req, personaIndex: 0 });
    const p1 = buildUserPrompt({ ...req, personaIndex: 1 });
    expect(p0).not.toEqual(p1);
    expect(p1).toContain("Satinalma Sorumlusu");
  });

  it("trend verilince enjekte eder, verilmeyince etmez", () => {
    expect(buildUserPrompt({ ...req, trend: "Deprem yonetmeligi guncellendi" })).toMatch(/TREND/);
    expect(usr()).not.toMatch(/TREND/);
  });

  it("Turkce disi dil verilince DIL talimati enjekte eder", () => {
    const p = buildUserPrompt({ ...req, language: "English" });
    expect(p).toMatch(/\[DIL\]/);
    expect(p).toContain("English");
  });

  it("Turkce (varsayilan) icin DIL talimati eklemez", () => {
    expect(buildUserPrompt({ ...req, language: "Türkçe" })).not.toMatch(/\[DIL\]/);
    expect(usr()).not.toMatch(/\[DIL\]/);
  });
});

describe("yardimcilar", () => {
  it("toneDirectives uca gore degisir", () => {
    expect(toneDirectives(1)).toMatch(/Resmi/);
    expect(toneDirectives(9)).toMatch(/Samimi/);
    expect(toneDirectives(5)).toMatch(/Dengeli/);
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
});
