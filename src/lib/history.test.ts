import { describe, expect, it } from "vitest";
import { findDuplicate, type HistoryEntry } from "./history";

const entry = (topic: string, angle: HistoryEntry["angle"], at: number): HistoryEntry => ({
  topic,
  angle,
  contentType: "deger",
  personaIndex: 0,
  at,
});

describe("icerik hafizasi — tekrari onleme", () => {
  const history: HistoryEntry[] = [
    entry("Cimento stogu tazelendi", "korku", 1000),
    entry("Cimento stogu tazelendi", "korku", 3000), // daha yeni eslesme
    entry("Yeni donati teslimi", "kazanc", 2000),
  ];

  it("ayni konu + aci icin en yeni eslesmeyi bulur", () => {
    const dup = findDuplicate(history, "Cimento stogu tazelendi", "korku");
    expect(dup?.at).toBe(3000);
  });

  it("buyuk/kucuk harf ve bosluk farkini yok sayar", () => {
    expect(findDuplicate(history, "  CIMENTO STOGU TAZELENDI ", "korku")).not.toBeNull();
  });

  it("ayni konu farkli aci -> tekrar degil", () => {
    expect(findDuplicate(history, "Cimento stogu tazelendi", "egitici")).toBeNull();
  });

  it("bos konu -> null", () => {
    expect(findDuplicate(history, "   ", "korku")).toBeNull();
  });
});
