import { describe, expect, it } from "vitest";
import { buildICS, publishChecklist } from "./publish";
import type { CalendarEntry } from "./calendar";

const entry: CalendarEntry = {
  id: "abc",
  topic: "Çimento, stoğu tazelendi",
  contentType: "deger",
  angle: "korku",
  sector: "insaat",
  date: "2026-06-20",
  status: "planlandi",
};

describe("buildICS", () => {
  const ics = buildICS([entry]);

  it("geçerli VCALENDAR iskeleti", () => {
    expect(ics).toMatch(/^BEGIN:VCALENDAR/);
    expect(ics).toMatch(/END:VCALENDAR$/);
    expect(ics).toContain("BEGIN:VEVENT");
  });

  it("tarihi all-day formatına çevirir", () => {
    expect(ics).toContain("DTSTART;VALUE=DATE:20260620");
  });

  it("özel karakterleri (virgül) escape eder", () => {
    expect(ics).toMatch(/SUMMARY:.*Çimento\\, stoğu/);
  });

  it("boş liste yine geçerli takvim", () => {
    const empty = buildICS([]);
    expect(empty).toContain("BEGIN:VCALENDAR");
    expect(empty).not.toContain("BEGIN:VEVENT");
  });
});

describe("publishChecklist", () => {
  it("platform için manuel adımlar döner", () => {
    expect(publishChecklist("instagram").length).toBeGreaterThanOrEqual(3);
  });
});
