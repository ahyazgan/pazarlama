import { describe, expect, it } from "vitest";
import { templatesFor } from "./templates";
import type { SectorId } from "./types";

const SECTORS: SectorId[] = ["insaat", "kafe", "eticaret", "hizmet", "guzellik"];

describe("içerik şablonları", () => {
  it("her sektör için sektöre özel + evrensel kalıplar döner", () => {
    for (const s of SECTORS) {
      const t = templatesFor(s);
      expect(t.length).toBeGreaterThanOrEqual(4); // 3 sektör + 3 evrensel
      // İlk kalıplar sektöre özel, sonu evrensel ("Perde arkası" her zaman var).
      expect(t.some((x) => x.label === "Perde arkası")).toBe(true);
    }
  });

  it("kalıplar geçerli tip ve açı taşır", () => {
    const types = new Set(["deger", "urun", "hikaye", "kanit", "satis"]);
    const angles = new Set(["korku", "kazanc", "sosyal_kanit", "egitici", "karsitlik"]);
    for (const t of templatesFor("insaat")) {
      expect(types.has(t.contentType)).toBe(true);
      expect(angles.has(t.angle)).toBe(true);
      expect(t.topic.length).toBeGreaterThan(0);
    }
  });

  it("sektöre özel kalıplar evrensellerden önce gelir", () => {
    const t = templatesFor("kafe");
    expect(t[0].label).toBe("Günün özeli"); // kafe'ye özel ilk sırada
  });
});
