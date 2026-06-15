import { describe, expect, it } from "vitest";
import {
  accessibilityForPackage,
  brandSafety,
  complianceForPackage,
  complianceForText,
  readabilityForPackage,
  voiceFit,
} from "./governance";
import { HAMMADDEM_SAMPLE } from "./brand-store";
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

describe("governance — okunabilirlik", () => {
  it("çok uzun cümleyi işaretler", () => {
    const long = "kelime ".repeat(30) + "son.";
    expect(readabilityForPackage(pkg(long)).length).toBeGreaterThan(0);
  });
  it("kısa metin temiz", () => {
    expect(readabilityForPackage(pkg("Kısa ve net. İki cümle."))).toEqual([]);
  });
});

describe("governance — ses uyumu", () => {
  it("yasak kelime + imza yok → düşük skor", () => {
    const v = voiceFit(pkg("Çok ucuz fiyatlarla"), HAMMADDEM_SAMPLE);
    expect(v.score).toBeLessThan(80);
    expect(v.notes.some((n) => /Yasak kelime/.test(n))).toBe(true);
  });

  it("imza + kanıt içeren temiz metin → yüksek skor", () => {
    const v = voiceFit(
      pkg("Santiyeye deger katiyoruz. 10.000 ton teslim ettik."),
      HAMMADDEM_SAMPLE,
    );
    expect(v.score).toBeGreaterThanOrEqual(90);
  });
});

describe("governance — marka güvenliği", () => {
  it("hassas konu + rakip karalamayı yakalar", () => {
    const s1 = brandSafety(pkg("Bu konu tamamen siyaset meselesi"));
    expect(s1.some((i) => /Hassas/.test(i.reason))).toBe(true);
    const s2 = brandSafety(pkg("Rakipler berbat, onlardan uzak durun"));
    expect(s2.some((i) => /karalama/.test(i.reason))).toBe(true);
  });
  it("temiz metin güvenli", () => {
    expect(brandSafety(pkg("Garantili teslim ile şantiyeye değer."))).toEqual([]);
  });
});

describe("governance — erişilebilirlik", () => {
  it("kısa alt-text'i işaretler", () => {
    expect(accessibilityForPackage(pkg("x")).some((a) => /alt-text/.test(a.where))).toBe(true);
  });
  it("yeterli alt-text temiz (caps yok)", () => {
    const p = pkg("Normal bir caption metni.");
    p.outputs.instagram.altText = "Şantiyede beton mikseri ve irsaliye kontrolü yapılıyor.";
    expect(accessibilityForPackage(p)).toEqual([]);
  });
});
