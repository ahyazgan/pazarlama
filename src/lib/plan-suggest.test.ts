import { describe, expect, it } from "vitest";
import { addDaysISO, suggestWeeklyPlan } from "./plan-suggest";

describe("addDaysISO", () => {
  it("ay sınırını doğru aşar", () => {
    expect(addDaysISO("2026-01-30", 3)).toBe("2026-02-02");
  });
  it("negatif gün geri gider", () => {
    expect(addDaysISO("2026-03-01", -1)).toBe("2026-02-28");
  });
});

describe("suggestWeeklyPlan", () => {
  it("istenen sayıda öneri, doğru aralıkla üretir", () => {
    const plan = suggestWeeklyPlan({ sector: "insaat", startDate: "2026-06-01", count: 5 });
    expect(plan).toHaveLength(5);
    expect(plan[0].date).toBe("2026-06-01");
    expect(plan[4].date).toBe("2026-06-05"); // 1 gün aralık
  });

  it("spacingDays aralığı uygular", () => {
    const plan = suggestWeeklyPlan({
      sector: "kafe",
      startDate: "2026-06-01",
      count: 3,
      spacingDays: 2,
    });
    expect(plan.map((p) => p.date)).toEqual(["2026-06-01", "2026-06-03", "2026-06-05"]);
  });

  it("ardışık aynı açıdan kaçınır (çeşitlilik)", () => {
    const plan = suggestWeeklyPlan({ sector: "insaat", startDate: "2026-06-01", count: 4 });
    for (let i = 1; i < plan.length; i++) {
      expect(plan[i].angle).not.toBe(plan[i - 1].angle);
    }
  });

  it("feedback skoru yüksek açıyı öne alır", () => {
    const plan = suggestWeeklyPlan({
      sector: "insaat",
      startDate: "2026-06-01",
      count: 1,
      angleScores: { sosyal_kanit: 10 }, // en yüksek skor
    });
    expect(plan[0].angle).toBe("sosyal_kanit");
  });

  it("count 0 ise boş döner", () => {
    expect(suggestWeeklyPlan({ sector: "hizmet", startDate: "2026-06-01", count: 0 })).toEqual([]);
  });

  it("her öneri geçerli alanlar taşır", () => {
    for (const p of suggestWeeklyPlan({ sector: "guzellik", startDate: "2026-06-01" })) {
      expect(p.topic.length).toBeGreaterThan(0);
      expect(p.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
