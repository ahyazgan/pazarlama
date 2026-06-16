import { describe, expect, it } from "vitest";
import { approvalSummary, type Approval } from "./approvals";

const a = (score: number): Approval => ({ topic: "t", brand: "b", grade: "A", score, at: 1 });

describe("approvalSummary", () => {
  it("boş liste sıfır", () => {
    expect(approvalSummary([])).toEqual({ count: 0, avgScore: 0 });
  });
  it("ortalama skoru hesaplar", () => {
    expect(approvalSummary([a(80), a(90), a(100)])).toEqual({ count: 3, avgScore: 90 });
  });
});
