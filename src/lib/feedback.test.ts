import { describe, expect, it } from "vitest";
import {
  metricsAngleScores,
  mergeAngleScores,
  netScores,
  type FeedbackStore,
} from "./feedback";
import { recommendAngle } from "./strategy";
import { getSector } from "./sectors";
import type { CalendarEntry } from "./calendar";

const insaat = getSector("insaat");

describe("feedback netScores (pure)", () => {
  it("sektör için açı->net oy haritası döner", () => {
    const store: FeedbackStore = { insaat: { kazanc: 3, korku: -1 } };
    expect(netScores(store, "insaat").kazanc).toBe(3);
    expect(netScores(store, "kafe")).toEqual({});
  });
});

describe("metricsAngleScores (outcome öğrenmesi)", () => {
  const e = (
    angle: CalendarEntry["angle"],
    reach: number,
    engagement: number,
  ): CalendarEntry => ({
    id: Math.random().toString(),
    topic: "t",
    contentType: "deger",
    angle,
    sector: "insaat",
    date: "2026-06-10",
    status: "yayinlandi",
    reach,
    engagement,
  });

  it("yüksek etkileşim oranlı açıya +, düşüğe - verir", () => {
    const store = metricsAngleScores([
      e("kazanc", 1000, 200), // %20 — yüksek
      e("korku", 1000, 20), // %2 — düşük
    ]);
    const s = store.insaat!;
    expect((s.kazanc ?? 0)).toBeGreaterThan(0);
    expect((s.korku ?? 0)).toBeLessThan(0);
  });

  it("metriksiz/planlı kayıtları yok sayar", () => {
    const store = metricsAngleScores([
      { ...e("kazanc", 0, 0), status: "planlandi", reach: undefined, engagement: undefined },
    ]);
    expect(store.insaat).toBeUndefined();
  });
});

describe("mergeAngleScores", () => {
  it("iki haritayı toplar", () => {
    expect(mergeAngleScores({ korku: 2 }, { korku: -1, kazanc: 3 })).toEqual({
      korku: 1,
      kazanc: 3,
    });
  });
});

describe("feedback recommender'ı öğretir", () => {
  it("güçlü olumlu feedback, sinyalsiz konuda açıyı öne çeker", () => {
    const topic = "Yeni sevkiyat"; // sinyal yok → afinite + feedback belirler
    const base = recommendAngle(insaat, topic).value;
    const boosted = recommendAngle(insaat, topic, [], { sosyal_kanit: 3 }).value;
    // insaat afinitesinde sosyal_kanit en zayıf; +3 feedback onu öne almalı
    expect(base).not.toBe("sosyal_kanit");
    expect(boosted).toBe("sosyal_kanit");
  });

  it("olumsuz feedback varsayılan açıyı kısar", () => {
    const topic = "Yeni sevkiyat";
    const base = recommendAngle(insaat, topic).value; // korku (afinite ilk)
    const damped = recommendAngle(insaat, topic, [], { [base]: -3 }).value;
    expect(damped).not.toBe(base);
  });
});
