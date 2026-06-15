import { describe, expect, it } from "vitest";
import { recommendAngle, recommendContentType } from "./strategy";
import { getSector } from "./sectors";
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
