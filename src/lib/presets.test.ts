import { describe, expect, it } from "vitest";
import { BRAND_PRESETS } from "./presets";
import { brainScore } from "./brain-score";
import { SECTORS } from "./sectors";
import type { SectorId } from "./types";

describe("BRAND_PRESETS", () => {
  it("her sektör için tam bir preset var", () => {
    const ids = BRAND_PRESETS.map((p) => p.id).sort();
    expect(ids).toEqual((Object.keys(SECTORS) as SectorId[]).sort());
  });

  it("her preset derin ve sektörüyle tutarlı (çok-sektörlü kalite invaryantı)", () => {
    for (const { id, brand } of BRAND_PRESETS) {
      expect(brand.sector, `${id} sector eşleşmesi`).toBe(id);
      expect(brand.name.length, `${id} ad`).toBeGreaterThan(0);
      expect(brand.audience.length, `${id} persona`).toBeGreaterThanOrEqual(2);
      expect(brand.proof.numbers.length, `${id} kanıt`).toBeGreaterThanOrEqual(1);
      expect(brand.pillars?.length ?? 0, `${id} sütun`).toBeGreaterThanOrEqual(1);
      expect(brand.voice.signaturePhrases.length, `${id} imza`).toBeGreaterThanOrEqual(1);
      expect(brainScore(brand).score, `${id} beyin doluluğu`).toBeGreaterThanOrEqual(80);
    }
  });
});
