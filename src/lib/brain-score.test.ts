import { describe, expect, it } from "vitest";
import { brainScore } from "./brain-score";
import { emptyBrand, HAMMADDEM_SAMPLE } from "./brand-store";

describe("brainScore", () => {
  it("boş beyin düşük (zayıf) skor", () => {
    const s = brainScore(emptyBrand());
    expect(s.score).toBeLessThan(35);
    expect(s.level).toBe("zayif");
    expect(s.missing.length).toBeGreaterThan(5);
  });

  it("Hammaddem örneği güçlü skor", () => {
    const s = brainScore(HAMMADDEM_SAMPLE);
    expect(s.score).toBeGreaterThanOrEqual(80);
    expect(s.level).toBe("guclu");
  });

  it("alan eklemek skoru monoton artırır", () => {
    const base = emptyBrand();
    const before = brainScore(base).score;
    base.identity.valueProp = "Net değer önerisi";
    const after = brainScore(base).score;
    expect(after).toBeGreaterThan(before);
  });

  it("eksik alanlar getiriye göre azalan sıralı", () => {
    const s = brainScore(emptyBrand());
    for (let i = 1; i < s.missing.length; i++) {
      expect(s.missing[i - 1].points).toBeGreaterThanOrEqual(s.missing[i].points);
    }
  });

  it("ses örnekleri (few-shot) en yüksek getirili tek alan", () => {
    const top = brainScore(emptyBrand()).missing[0];
    expect(top.label).toMatch(/Ses örnekleri/);
  });

  it("skor 0-100 aralığında", () => {
    expect(brainScore(HAMMADDEM_SAMPLE).score).toBeLessThanOrEqual(100);
    expect(brainScore(emptyBrand()).score).toBeGreaterThanOrEqual(0);
  });
});
