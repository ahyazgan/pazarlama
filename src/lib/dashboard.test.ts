import { describe, expect, it } from "vitest";
import { buildDashboard, packageIssueCount } from "./dashboard";
import { HAMMADDEM_SAMPLE, emptyBrand } from "./brand-store";
import type { LibraryItem } from "./library";
import type { ContentPackage } from "./types";

function pkg(caption: string): ContentPackage {
  return {
    topic: "t",
    contentType: "deger",
    angle: "korku",
    outputs: {
      instagram: { caption, firstComment: "", imagePrompt: "", altText: "alt metin" },
      tiktok: { hook: "", scenes: [], soundSuggestion: "", cta: "" },
      linkedin: { hookLine: "", body: "", insight: "", discussionQuestion: "" },
      x: { thread: [] },
    },
  };
}

function libItem(brandName: string, caption: string): LibraryItem {
  return {
    id: `lib-${Math.random()}`,
    topic: "t",
    brandName,
    sector: "insaat",
    pkg: pkg(caption),
    at: Date.now(),
  };
}

describe("dashboard — yayın hazırlık paneli", () => {
  it("boş girdide sıfır özet", () => {
    const d = buildDashboard([], []);
    expect(d.brandCount).toBe(0);
    expect(d.packageCount).toBe(0);
    expect(d.readyCount).toBe(0);
  });

  it("marka özeti beyin skoru ve seviye taşır", () => {
    const d = buildDashboard([HAMMADDEM_SAMPLE], []);
    expect(d.brandCount).toBe(1);
    expect(d.brands[0].score).toBeGreaterThan(0);
    expect(["zayif", "orta", "iyi", "guclu"]).toContain(d.brands[0].level);
  });

  it("boş markada en yüksek getirili eksik alan raporlanır", () => {
    const d = buildDashboard([emptyBrand()], []);
    expect(d.brands[0].topMissing).not.toBeNull();
  });

  it("paket, ada göre marka beyin skoruyla eşleşir", () => {
    const d = buildDashboard([HAMMADDEM_SAMPLE], [libItem("Hammaddem", "Temiz başlık.")]);
    expect(d.packages[0].brainScore).toBe(d.brands[0].score);
  });

  it("eşleşmeyen marka adı → beyin skoru 0", () => {
    const d = buildDashboard([HAMMADDEM_SAMPLE], [libItem("Bilinmeyen", "Metin.")]);
    expect(d.packages[0].brainScore).toBe(0);
  });

  it("yüksek beyin + kusursuz paket yayına hazır sayılır", () => {
    const item = libItem("Hammaddem", "Şantiyede 2 günde tedarik. Gecikme sıfır.");
    const d = buildDashboard([HAMMADDEM_SAMPLE], [item]);
    expect(d.packages[0].readiness.ready).toBe(d.readyCount === 1);
  });

  it("packageIssueCount alt metni eksik görselde kusur sayar", () => {
    const noAlt = libItem("X", "Metin");
    noAlt.pkg.outputs.instagram.altText = "";
    expect(packageIssueCount(noAlt)).toBeGreaterThan(0);
  });
});
