import { describe, expect, it } from "vitest";
import { SECTORS, SECTOR_OPTIONS, getSector } from "./sectors";
import type { ContentType, SectorId } from "./types";

const CONTENT_TYPES: ContentType[] = ["deger", "urun", "hikaye", "kanit", "satis"];

describe("sector_intelligence seed", () => {
  it("her sektorun icerik karisimi toplami 100", () => {
    for (const id of Object.keys(SECTORS) as SectorId[]) {
      const mix = SECTORS[id].contentMix;
      const total = CONTENT_TYPES.reduce((sum, ct) => sum + (mix[ct] ?? 0), 0);
      expect(total, `${id} icerik karisimi`).toBe(100);
    }
  });

  it("insaat (MVP birincil sektor) tam dolu", () => {
    const insaat = SECTORS.insaat;
    expect(insaat.terminology.length).toBeGreaterThanOrEqual(6);
    expect(insaat.hooks.length).toBeGreaterThanOrEqual(5);
    expect(insaat.seasonality).toMatch(/Mart-Kasim/);
    // B2B insaat: deger agirlikli karisim
    expect(insaat.contentMix.deger).toBeGreaterThanOrEqual(40);
  });

  it("her sektor yeterince zengin (>=10 terim, >=5 hook, mevsimsellik notu)", () => {
    for (const id of Object.keys(SECTORS) as SectorId[]) {
      const s = SECTORS[id];
      expect(s.terminology.length, `${id} terminoloji`).toBeGreaterThanOrEqual(10);
      expect(s.hooks.length, `${id} hook`).toBeGreaterThanOrEqual(5);
      expect(s.seasonality.length, `${id} mevsimsellik`).toBeGreaterThan(20);
    }
  });

  it("getSector bilinmeyen icin insaat'a duser", () => {
    expect(getSector("yok" as SectorId).sector).toBe("insaat");
  });

  it("SECTOR_OPTIONS tum sektorleri listeler", () => {
    expect(SECTOR_OPTIONS.map((o) => o.id).sort()).toEqual(
      (Object.keys(SECTORS) as SectorId[]).sort(),
    );
  });
});
