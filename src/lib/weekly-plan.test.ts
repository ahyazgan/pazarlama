import { describe, expect, it } from "vitest";
import { weeklyPlan } from "./weekly-plan";
import { HAMMADDEM_SAMPLE } from "./brand-store";

describe("weeklyPlan", () => {
  it("istenen sayıda öğe, artan tarihlerle üretir", () => {
    const plan = weeklyPlan(HAMMADDEM_SAMPLE, 5, "2026-06-15");
    expect(plan).toHaveLength(5);
    expect(plan[0].date).toBe("2026-06-15");
    expect(plan[4].date).toBe("2026-06-19");
    for (let i = 1; i < plan.length; i++) {
      expect(plan[i].date > plan[i - 1].date).toBe(true);
    }
  });

  it("içerik sütunlarını rotasyonla dağıtır", () => {
    const plan = weeklyPlan(HAMMADDEM_SAMPLE, 3, "2026-06-15");
    expect(plan[0].pillar).toBe(HAMMADDEM_SAMPLE.pillars![0]);
    expect(plan[1].pillar).toBe(HAMMADDEM_SAMPLE.pillars![1]);
  });

  it("açıları afinite sırasıyla çeşitlendirir", () => {
    const plan = weeklyPlan(HAMMADDEM_SAMPLE, 3, "2026-06-15");
    expect(new Set(plan.map((p) => p.angle)).size).toBeGreaterThan(1);
  });

  it("deterministik", () => {
    expect(weeklyPlan(HAMMADDEM_SAMPLE, 4, "2026-06-15")).toEqual(
      weeklyPlan(HAMMADDEM_SAMPLE, 4, "2026-06-15"),
    );
  });

  it("sütun yoksa hook tohumuna düşer", () => {
    const noPillars = { ...HAMMADDEM_SAMPLE, pillars: [] };
    expect(weeklyPlan(noPillars, 2, "2026-06-15")[0].topicSeed.length).toBeGreaterThan(2);
  });
});
