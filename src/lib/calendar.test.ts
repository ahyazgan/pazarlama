import { describe, expect, it } from "vitest";
import { groupByDate, type CalendarEntry } from "./calendar";

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
