import { describe, expect, it } from "vitest";
import { computeInsights } from "./insights";
import type { CalendarEntry } from "./calendar";

const e = (over: Partial<CalendarEntry>): CalendarEntry => ({
  id: Math.random().toString(36).slice(2),
  topic: "t",
  contentType: "deger",
  angle: "egitici",
  sector: "insaat",
  date: "2026-06-10",
  status: "yayinlandi",
  reach: 1000,
  engagement: 50,
  ...over,
});

describe("computeInsights", () => {
  it("boş/metriksiz veride güvenli döner ve uyarı verir", () => {
    const r = computeInsights([]);
    expect(r.publishedCount).toBe(0);
    expect(r.avgRate).toBe(0);
    expect(r.bestAngle).toBeNull();
    expect(r.recommendations[0]).toMatch(/Henüz metrikli yayın yok/);
  });

  it("yalnızca yayınlanmış + erişimi olanları sayar", () => {
    const r = computeInsights([
      e({ reach: 1000, engagement: 100 }),
      e({ status: "planlandi" }), // sayılmaz
      e({ reach: 0 }), // sayılmaz
    ]);
    expect(r.publishedCount).toBe(1);
    expect(r.totalReach).toBe(1000);
  });

  it("açıları etkileşim oranına göre sıralar ve en iyiyi/öneriyi çıkarır", () => {
    const r = computeInsights([
      e({ angle: "korku", reach: 1000, engagement: 200 }), // %20
      e({ angle: "egitici", reach: 1000, engagement: 40 }), // %4
      e({ angle: "egitici", reach: 1000, engagement: 60 }), // %6 → ort %5
    ]);
    expect(r.byAngle[0].key).toBe("korku");
    expect(r.bestAngle?.key).toBe("korku");
    expect(r.worstAngle?.key).toBe("egitici");
    expect(r.recommendations.some((x) => /Korku/i.test(x) && /üstünde/.test(x))).toBe(true);
  });

  it("içerik tipini de gruplar", () => {
    const r = computeInsights([
      e({ contentType: "deger", reach: 1000, engagement: 100 }),
      e({ contentType: "urun", reach: 1000, engagement: 20 }),
    ]);
    expect(r.byContentType[0].key).toBe("deger");
  });
});
