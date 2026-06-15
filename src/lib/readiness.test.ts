import { describe, expect, it } from "vitest";
import { readiness } from "./readiness";

describe("readiness", () => {
  it("yüksek beyin + sıfır sorun → hazır", () => {
    const r = readiness(85, 0);
    expect(r.level).toBe("hazir");
    expect(r.ready).toBe(true);
  });

  it("orta beyin + az sorun → neredeyse", () => {
    expect(readiness(50, 2).level).toBe("neredeyse");
  });

  it("düşük beyin → geliştirilmeli", () => {
    expect(readiness(30, 0).level).toBe("gelismeli");
  });

  it("yüksek beyin ama çok sorun → geliştirilmeli", () => {
    expect(readiness(90, 5).level).toBe("gelismeli");
  });
});
