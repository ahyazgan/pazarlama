import { beforeEach, describe, expect, it } from "vitest";
import {
  addToPlan,
  groupByDate,
  loadPlan,
  reschedule,
  type CalendarEntry,
} from "./calendar";

const e = (id: string, date: string): CalendarEntry => ({
  id,
  date,
  topic: "t" + id,
  contentType: "deger",
  angle: "korku",
  sector: "insaat",
  status: "planlandi",
});

describe("groupByDate", () => {
  it("tarihe göre gruplar ve kronolojik sıralar", () => {
    const groups = groupByDate([e("1", "2026-06-20"), e("2", "2026-06-10"), e("3", "2026-06-20")]);
    expect(groups.map((g) => g.date)).toEqual(["2026-06-10", "2026-06-20"]);
    expect(groups[1].items).toHaveLength(2);
  });

  it("boş liste boş döner", () => {
    expect(groupByDate([])).toEqual([]);
  });
});

describe("reschedule", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    (globalThis as { window?: unknown }).window = {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => void store.set(k, v),
        clear: () => store.clear(),
      },
    };
  });

  const draft = (date: string) =>
    ({ topic: "t", contentType: "deger", angle: "korku", sector: "insaat", date }) as const;

  it("girdiyi yeni tarihe taşır", () => {
    addToPlan(draft("2026-06-10"));
    const id = loadPlan()[0].id;
    const moved = reschedule(id, "2026-06-25");
    expect(moved[0].date).toBe("2026-06-25");
    expect(loadPlan()[0].date).toBe("2026-06-25");
  });

  it("eşleşmeyen id'de liste değişmez", () => {
    addToPlan(draft("2026-06-10"));
    const before = loadPlan();
    expect(reschedule("yok", "2026-06-25")).toEqual(before);
  });
});
