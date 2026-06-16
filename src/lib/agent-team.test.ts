import { describe, expect, it } from "vitest";
import {
  buildRevisionRequest,
  evaluatePackage,
  runAgentTeam,
  shouldRevise,
  type EditorEvaluation,
} from "./agent-team";
import { buildDemoPackage } from "./demo";
import type { Brand, GenerateRequest } from "./types";

const brand: Brand = {
  id: "b1",
  name: "Hammaddem",
  sector: "insaat",
  identity: { mission: "m", valueProp: "v", personality: ["net", "güvenilir"] },
  voice: { tone: 4, sentenceStyle: "kısa", bannedWords: [], signaturePhrases: [] },
  audience: [{ name: "Mühendis", pain: "tedarik gecikmesi", motivation: "zamanında teslim" }],
  proof: { numbers: ["%30 daha hızlı"], cases: [], references: [] },
} as Brand;

const req: GenerateRequest = {
  brand,
  topic: "tedarik süreci",
  contentType: "deger",
  angle: "kazanc",
  personaIndex: 0,
};

const ev = (over: Partial<EditorEvaluation> = {}): EditorEvaluation => ({
  score: 90,
  grade: "A",
  blocking: false,
  issues: [],
  ...over,
});

describe("evaluatePackage", () => {
  it("geçerli not + dereceyi döndürür", () => {
    const result = evaluatePackage(buildDemoPackage(req), brand);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(["A", "B", "C", "D"]).toContain(result.grade);
    expect(Array.isArray(result.issues)).toBe(true);
  });
});

describe("shouldRevise", () => {
  it("eşik altında düzeltme ister", () => {
    expect(shouldRevise(ev({ score: 60 }), 80)).toBe(true);
    expect(shouldRevise(ev({ score: 95 }), 80)).toBe(false);
  });

  it("bloklayıcı durumda eşikten bağımsız düzeltme ister", () => {
    expect(shouldRevise(ev({ score: 99, blocking: true }), 80)).toBe(true);
  });
});

describe("buildRevisionRequest", () => {
  it("editör notlarını enjekte eder, orijinal alanları korur", () => {
    const r = buildRevisionRequest(req, ev({ issues: ["Ses: ton sapması", "Hukuk: garanti iddiası"] }));
    expect(r.revisionNotes).toContain("ton sapması");
    expect(r.revisionNotes).toContain("garanti iddiası");
    expect(r.topic).toBe(req.topic);
  });
});

describe("runAgentTeam", () => {
  it("eşik aşılıysa düzeltme turu çalışır (3 adım)", async () => {
    let calls = 0;
    const res = await runAgentTeam(req, {
      threshold: 200, // her zaman düzeltme tetikle
      generate: async (r) => {
        calls++;
        return buildDemoPackage(r);
      },
    });
    expect(calls).toBe(2);
    expect(res.revised).toBe(true);
    expect(res.steps.map((s) => s.role)).toEqual(["copywriter", "editor", "reviser"]);
  });

  it("eşik altındaysa düzeltme atlanır (2 adım, tek üretim)", async () => {
    let calls = 0;
    const res = await runAgentTeam(req, {
      threshold: 0, // hiç düzeltme yok
      generate: async (r) => {
        calls++;
        return buildDemoPackage(r);
      },
    });
    expect(calls).toBe(1);
    expect(res.revised).toBe(false);
    expect(res.steps).toHaveLength(2);
  });
});
