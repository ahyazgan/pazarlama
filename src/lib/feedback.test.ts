import { describe, expect, it } from "vitest";
import { netScores, type FeedbackStore } from "./feedback";
import { recommendAngle } from "./strategy";
import { getSector } from "./sectors";

const insaat = getSector("insaat");

describe("feedback netScores (pure)", () => {
  it("sektör için açı->net oy haritası döner", () => {
    const store: FeedbackStore = { insaat: { kazanc: 3, korku: -1 } };
    expect(netScores(store, "insaat").kazanc).toBe(3);
    expect(netScores(store, "kafe")).toEqual({});
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
