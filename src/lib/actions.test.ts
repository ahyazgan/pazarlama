import { describe, expect, it } from "vitest";
import { buildActions } from "./actions";
import { buildDashboard } from "./dashboard";
import { HAMMADDEM_SAMPLE, emptyBrand } from "./brand-store";
import type { LibraryItem } from "./library";
import type { ContentPackage } from "./types";

function pkg(caption: string, altText = "alt"): ContentPackage {
  return {
    topic: "t",
    contentType: "deger",
    angle: "korku",
    outputs: {
      instagram: { caption, firstComment: "", imagePrompt: "", altText },
      tiktok: { hook: "", scenes: [], soundSuggestion: "", cta: "" },
      linkedin: { hookLine: "", body: "", insight: "", discussionQuestion: "" },
      x: { thread: [] },
    },
  };
}

function libItem(brandName: string, caption: string, altText = "alt"): LibraryItem {
  return {
    id: `lib-${Math.random()}`,
    topic: "t",
    brandName,
    sector: "insaat",
    pkg: pkg(caption, altText),
    at: Date.now(),
  };
}

describe("actions — sıradaki en iyi aksiyon", () => {
  it("marka yoksa tek yüksek öncelikli 'marka oluştur' aksiyonu", () => {
    const a = buildActions(buildDashboard([], []));
    expect(a).toHaveLength(1);
    expect(a[0].href).toBe("/onboarding");
    expect(a[0].severity).toBe("yuksek");
  });

  it("zayıf marka beyni için yüksek öncelikli aksiyon üretir", () => {
    const a = buildActions(buildDashboard([emptyBrand()], []));
    expect(a.some((x) => x.severity === "yuksek" && x.href === "/brand")).toBe(true);
  });

  it("güçlü marka + temiz paket → marka aksiyonu yok", () => {
    const item = libItem("Hammaddem", "Şantiyede 2 günde tedarik. Gecikme sıfır.");
    const a = buildActions(buildDashboard([HAMMADDEM_SAMPLE], [item]));
    expect(a.every((x) => x.id !== `brain-${HAMMADDEM_SAMPLE.name}`)).toBe(true);
  });

  it("hazır olmayan paket aksiyonu sayıyı taşır", () => {
    // Alt metni eksik paket → readiness ready=false + issues>0
    const item = libItem("Hammaddem", "Metin", "");
    const a = buildActions(buildDashboard([HAMMADDEM_SAMPLE], [item]));
    expect(a.some((x) => x.id === "pkg-not-ready" && /1 paket/.test(x.title))).toBe(true);
    expect(a.some((x) => x.id === "pkg-issues")).toBe(true);
  });

  it("aksiyonlar önceliğe göre azalan sıralı", () => {
    const a = buildActions(buildDashboard([emptyBrand()], [libItem("X", "Metin", "")]));
    const prios = a.map((x) => x.priority);
    expect(prios).toEqual([...prios].sort((p, q) => q - p));
  });
});
