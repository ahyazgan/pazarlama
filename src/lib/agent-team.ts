import type { Brand, ContentPackage, GenerateRequest } from "./types";
import { brainScore } from "./brain-score";
import { lintWithBrand } from "./quality";
import {
  accessibilityForPackage,
  brandSafety,
  complianceForPackage,
  disclaimerIssues,
  governanceGrade,
  readabilityForPackage,
  voiceFit,
} from "./governance";

// ============================================================================
// AJAN EKİBİ (pazarlama uzman ekibi) — Faz 1: Üret → Eleştir → Düzelt zinciri.
//
// Felsefe (constitution §0): derinlik ajan SAYISINDAN değil, her kararın bir
// öncekini DENETLEMESİNDEN gelir. Copywriter üretir, Kıdemli Editör marka
// beynine göre acımasızca puanlar, eşik altındaysa Düzeltmen geri besleme ile
// yeniden yazdırır. Editörün beyni anahtarsız da çalışır: mevcut deterministik
// quality + governance katmanı. Üretim (generate) bağımlılık olarak enjekte
// edilir → orkestrasyon mantığı saf ve test edilebilir kalır.
// ============================================================================

export interface AgentRole {
  id: string;
  label: string;
  job: string;
}

export const AGENT_TEAM: AgentRole[] = [
  {
    id: "copywriter",
    label: "Copywriter",
    job: "Marka beyni + sektör zekasıyla içerik paketini üretir",
  },
  {
    id: "editor",
    label: "Kıdemli Editör",
    job: "Paketi marka beynine göre puanlar, sorunları çıkarır (generic/ses/kanıt/uyum)",
  },
  {
    id: "reviser",
    label: "Düzeltmen",
    job: "Editör notlarını üretime enjekte edip paketi yeniden yazdırır",
  },
];

export interface EditorEvaluation {
  score: number; // 0-100
  grade: "A" | "B" | "C" | "D";
  blocking: boolean; // hukuk/marka riski — koşulsuz düzeltme gerek
  issues: string[]; // insan-okur editör notları
}

// Deterministik editör beyni: quality + governance katmanını birleştirip
// 0-100 not + okunur sorun listesi üretir (anahtarsız çalışır).
export function evaluatePackage(pkg: ContentPackage, brand: Brand): EditorEvaluation {
  const brain = brainScore(brand).score;
  const quality = lintWithBrand(pkg, brand);
  const compliance = [
    ...complianceForPackage(pkg, brand.sector, brand.governance?.extraBannedClaims ?? []),
    ...disclaimerIssues(pkg, brand.governance?.requiredDisclaimers ?? []),
  ];
  const safety = brandSafety(pkg);
  const readability = readabilityForPackage(pkg);
  const access = accessibilityForPackage(pkg);
  const voice = voiceFit(pkg, brand);

  const grade = governanceGrade({
    issues: quality.length,
    compliance: compliance.length,
    safety: safety.length,
    readability: readability.length,
    access: access.length,
    voiceScore: voice.score,
    brain,
  });

  const issues: string[] = [
    ...quality.map((q) => `${q.where}: ${q.term}`),
    ...compliance.map((c) => `Hukuk: ${c.term} — ${c.reason}`),
    ...safety.map((s) => `Marka güvenliği: ${s.term} — ${s.reason}`),
    ...readability.map((r) => `Okunabilirlik: ${r.where} — ${r.detail}`),
    ...access.map((a) => `Erişilebilirlik: ${a.where} — ${a.detail}`),
    ...(voice.score < 70 ? voice.notes.map((n) => `Ses: ${n}`) : []),
  ];

  return { score: grade.score, grade: grade.grade, blocking: grade.blocking, issues };
}

// Eşik altı veya bloklayıcı ise düzeltme turu gerekir.
export function shouldRevise(ev: EditorEvaluation, threshold = 80): boolean {
  return ev.blocking || ev.score < threshold;
}

// Editör notlarını üretime enjekte edilecek revizyon talimatına çevir (saf).
export function buildRevisionRequest(req: GenerateRequest, ev: EditorEvaluation): GenerateRequest {
  const notes = ev.issues.slice(0, 8).join("; ");
  return {
    ...req,
    revisionNotes: notes
      ? `Önceki taslakta editör şu sorunları buldu: ${notes}.`
      : "Önceki taslak marka sesine yeterince yakın değildi; daha keskin ve kanıta dayalı yaz.",
  };
}

export interface TeamStep {
  role: string;
  label: string;
  score?: number;
  note: string;
}

export interface TeamRunResult {
  steps: TeamStep[];
  final: ContentPackage;
  before: EditorEvaluation;
  after: EditorEvaluation;
  revised: boolean;
}

// Orkestratör: üret → editör puanı → (gerekirse) tek düzeltme turu.
// `generate` enjekte edilir (UI'da /api/generate, testte sahte). Düzeltme
// sonrası daha iyi olan paket korunur (regresyona karşı güvence).
export async function runAgentTeam(
  req: GenerateRequest,
  deps: { generate: (r: GenerateRequest) => Promise<ContentPackage>; threshold?: number },
): Promise<TeamRunResult> {
  const threshold = deps.threshold ?? 80;

  const draft = await deps.generate(req);
  const before = evaluatePackage(draft, req.brand);
  const steps: TeamStep[] = [
    { role: "copywriter", label: "Copywriter", note: "Taslak üretildi" },
    {
      role: "editor",
      label: "Kıdemli Editör",
      score: before.score,
      note: before.issues.length
        ? `${before.issues.length} sorun: ${before.issues.slice(0, 2).join("; ")}`
        : "Sorun bulunmadı",
    },
  ];

  if (!shouldRevise(before, threshold)) {
    return { steps, final: draft, before, after: before, revised: false };
  }

  const revised = await deps.generate(buildRevisionRequest(req, before));
  const after = evaluatePackage(revised, req.brand);
  const final = after.score >= before.score ? revised : draft;
  steps.push({
    role: "reviser",
    label: "Düzeltmen",
    score: after.score,
    note: `Yeniden yazıldı (${before.score} → ${after.score})${
      after.score < before.score ? " — taslak daha iyiydi, korundu" : ""
    }`,
  });

  return { steps, final, before, after: evaluatePackage(final, req.brand), revised: true };
}
