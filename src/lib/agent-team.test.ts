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
    expect(res.rounds).toBe(0);
  });

  // Scripted evaluate ile çok-turlu davranışı deterministik test et.
  const scriptedEval = (scores: number[]) => {
    let i = 0;
    return () => ev({ score: scores[Math.min(i++, scores.length - 1)] });
  };

  it("eşiğe ulaşana kadar birden çok tur döner, en iyiyi tutar", async () => {
    const res = await runAgentTeam(req, {
      threshold: 80,
      maxRounds: 3,
      evaluate: scriptedEval([50, 60, 90]), // taslak 50 → 60 → 90
      generate: async (r) => buildDemoPackage(r),
    });
    expect(res.rounds).toBe(2);
    expect(res.after.score).toBe(90);
    expect(res.steps.map((s) => s.role)).toEqual(["copywriter", "editor", "reviser", "reviser"]);
  });

  it("ilerleme yoksa erken durur", async () => {
    const res = await runAgentTeam(req, {
      threshold: 80,
      maxRounds: 5,
      evaluate: scriptedEval([50, 50]), // iyileşme yok
      generate: async (r) => buildDemoPackage(r),
    });
    expect(res.rounds).toBe(1);
    expect(res.after.score).toBe(50);
  });

  it("eşiğe ulaşmasa da maxRounds'u aşmaz, en iyiyi döndürür", async () => {
    const res = await runAgentTeam(req, {
      threshold: 90,
      maxRounds: 2,
      evaluate: scriptedEval([50, 55, 60, 65]),
      generate: async (r) => buildDemoPackage(r),
    });
    expect(res.rounds).toBe(2);
    expect(res.after.score).toBe(60); // 50→55→60, tur sınırı
  });
});
