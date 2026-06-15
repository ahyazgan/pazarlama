import { describe, expect, it } from "vitest";
import { lintPackage, lintWithBrand } from "./quality";
import { HAMMADDEM_SAMPLE } from "./brand-store";
import type { ContentPackage } from "./types";

const HASHTAGS = "#a #b #c #d #e #f #g #h"; // 8 — ideal
const THREE = ["a", "b", "c"];

function pkgWith(caption: string, thread: string[] = THREE): ContentPackage {
  return {
    topic: "t",
    contentType: "deger",
    angle: "korku",
    outputs: {
      instagram: { caption, firstComment: HASHTAGS, imagePrompt: "p", altText: "a" },
      tiktok: {
        hook: "Yeterince uzun bir hook cumlesi",
        scenes: [{ timecode: "0", shot: "s", voiceover: "v" }],
        soundSuggestion: "snd",
        cta: "cta",
      },
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
    const issues = lintPackage(pkgWith("temiz", ["bedava kargo", "b", "c"]), ["bedava"]);
    expect(issues.some((i) => i.where.startsWith("X/tweet"))).toBe(true);
  });

  it("az hashtag uyarısı verir", () => {
    const p = pkgWith("temiz");
    p.outputs.instagram.firstComment = "#tek";
    expect(lintPackage(p).some((i) => i.type === "hashtag")).toBe(true);
  });

  it("çok kısa X thread uyarısı verir", () => {
    expect(lintPackage(pkgWith("temiz", ["tek"])).some((i) => i.type === "thread")).toBe(true);
  });

  it("zayıf (kısa) hook uyarısı verir", () => {
    const p = pkgWith("temiz");
    p.outputs.tiktok.hook = "kısa";
    expect(lintPackage(p).some((i) => i.type === "zayif_hook")).toBe(true);
  });

  it("emoji aşırılığı uyarısı verir", () => {
    expect(lintPackage(pkgWith("🔥🔥🔥🔥🔥 indirim")).some((i) => i.type === "emoji")).toBe(true);
  });
});

describe("lintWithBrand", () => {
  it("kanıt rakamı işlenmemişse uyarır", () => {
    const issues = lintWithBrand(pkgWith("rakamsız caption"), HAMMADDEM_SAMPLE);
    expect(issues.some((i) => i.type === "kanit_yok")).toBe(true);
  });

  it("kanıt rakamı işlenmişse kanit_yok vermez", () => {
    const issues = lintWithBrand(pkgWith("10.000 ton teslim ettik"), HAMMADDEM_SAMPLE);
    expect(issues.some((i) => i.type === "kanit_yok")).toBe(false);
  });

  it("imza ifade hiç yoksa uyarır", () => {
    const issues = lintWithBrand(pkgWith("imzasız"), HAMMADDEM_SAMPLE);
    expect(issues.some((i) => i.type === "imza_yok")).toBe(true);
  });

  it("markada/kaynakta olmayan istatistik sayısını şüpheli işaretler", () => {
    const issues = lintWithBrand(pkgWith("Sektör %87 büyüdü, 4500 firma katıldı"), HAMMADDEM_SAMPLE);
    expect(issues.some((i) => i.type === "supheli_sayi")).toBe(true);
  });

  it("markanın gerçek rakamı şüpheli sayılmaz", () => {
    // HAMMADDEM proof: "10.000+ ton teslimat"
    const issues = lintWithBrand(pkgWith("10.000 ton teslim ettik"), HAMMADDEM_SAMPLE);
    expect(issues.some((i) => i.type === "supheli_sayi" && i.term.startsWith("10000"))).toBe(false);
  });
});
