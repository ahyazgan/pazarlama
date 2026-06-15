import { describe, expect, it } from "vitest";
import {
  assignAnglesToPersonas,
  buildStrategyBrief,
  recommendAngle,
  recommendContentType,
  suggestTopics,
} from "./strategy";
import { getSector } from "./sectors";
import { HAMMADDEM_SAMPLE } from "./brand-store";
import type { HistoryEntry } from "./history";

const insaat = getSector("insaat");
const eticaret = getSector("eticaret");

describe("recommendContentType", () => {
  it("sektör karışımında en yüksek paylı tipi seçer (insaat -> deger %50)", () => {
    const r = recommendContentType(insaat);
    expect(r.value).toBe("deger");
    expect(r.reason).toMatch(/%50/);
  });

  it("eticaret -> urun (%40)", () => {
    expect(recommendContentType(eticaret).value).toBe("urun");
  });
});

describe("buildStrategyBrief", () => {
  const brief = buildStrategyBrief(HAMMADDEM_SAMPLE, "Geç teslimat cezası riski");

  it("birincil ve ikincil açı farklı", () => {
    expect(brief.secondaryAngle).not.toBe(brief.primaryAngle.value);
  });

  it("platform önceliği sektörden gelir (insaat -> LinkedIn ilk)", () => {
    expect(brief.platformPriority[0]).toBe("linkedin");
  });

  it("konuya en çok değen personayı odak seçer", () => {
    // 'Geç teslimat' Saha Müdür'ün acısı -> 0. persona
    expect(brief.personaFocusIndex).toBe(0);
    expect(brief.personaFocusName).toMatch(/Saha/);
  });

  it("hook tohumu yer tutucusuz", () => {
    expect(brief.hookSeed).not.toMatch(/_/);
    expect(brief.hookSeed.length).toBeGreaterThan(3);
  });
});

describe("suggestTopics", () => {
  it("hook'lardan yer tutucusuz taze fikirler üretir", () => {
    const ideas = suggestTopics(insaat);
    expect(ideas.length).toBe(3);
    expect(ideas.every((i) => !i.includes("_"))).toBe(true);
    expect(ideas[0].length).toBeGreaterThan(5);
  });

  it("son kullanılan konuları eler", () => {
    const first = suggestTopics(insaat, [], 1)[0];
    const filtered = suggestTopics(insaat, [
      { topic: first, angle: "korku", contentType: "deger", personaIndex: 0, at: 1 },
    ]);
    expect(filtered.map((s) => s.toLowerCase())).not.toContain(first.toLowerCase());
  });
});

describe("assignAnglesToPersonas", () => {
  it("ilk açı önerilen açıyla aynı; sonrakiler farklı (çeşitlilik)", () => {
    const angles = assignAnglesToPersonas(insaat, "Geç teslimat riski", 3);
    expect(angles[0]).toBe(recommendAngle(insaat, "Geç teslimat riski").value);
    expect(new Set(angles).size).toBe(3); // hepsi farklı
  });

  it("5'ten fazla persona olunca açılar döner (sarmalama)", () => {
    const angles = assignAnglesToPersonas(insaat, "Yeni sevkiyat", 6);
    expect(angles.length).toBe(6);
    expect(new Set(angles).size).toBe(5); // 5 evrensel açı, 6. tekrar eder
  });

  it("deterministik", () => {
    expect(assignAnglesToPersonas(insaat, "Stok", 4)).toEqual(
      assignAnglesToPersonas(insaat, "Stok", 4),
    );
  });
});

describe("recommendAngle", () => {
  it("konudaki risk sinyalini yakalar -> korku", () => {
    const r = recommendAngle(insaat, "Geç teslimat cezası riski");
    expect(r.value).toBe("korku");
    expect(r.reason).toMatch(/Korku/);
  });

  it("kazanç sinyali -> kazanc", () => {
    expect(recommendAngle(eticaret, "Büyük indirim fırsatı, ücretsiz kargo").value).toBe(
      "kazanc",
    );
  });

  it("eğitici sinyali -> egitici", () => {
    expect(recommendAngle(insaat, "Teslimatı etkileyen 5 faktör nasıl yönetilir").value).toBe(
      "egitici",
    );
  });

  it("sinyal yoksa sektör varsayılanına düşer (insaat -> korku)", () => {
    const r = recommendAngle(insaat, "Yeni sevkiyat");
    expect(r.value).toBe("korku");
  });

  it("son kullanımları rotasyonla cezalandırır (çeşitlilik)", () => {
    const heavyKorku: HistoryEntry[] = Array.from({ length: 4 }, (_, i) => ({
      topic: "x",
      angle: "korku",
      contentType: "deger",
      personaIndex: 0,
      at: i,
    }));
    // Nötr konu + son 4 korku -> korku artık önerilmemeli
    const r = recommendAngle(insaat, "Yeni sevkiyat", heavyKorku);
    expect(r.value).not.toBe("korku");
  });

  it("deterministik (ayni girdi ayni cikti)", () => {
    expect(recommendAngle(insaat, "Stok tazelendi").value).toBe(
      recommendAngle(insaat, "Stok tazelendi").value,
    );
  });
});
