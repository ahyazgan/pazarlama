import type {
  Brand,
  ContentPackage,
  CritiqueResult,
  GenerateRequest,
  PlatformId,
} from "./types";
import { PLATFORM_LABELS } from "./types";
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
    id: "strategist",
    label: "Stratejist",
    job: "Konuya en uygun açıyı seçer (sektör sinyali + geçmiş + geri bildirim)",
  },
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
  source?: string; // hangi editör beyni: "deterministik" | "LLM editör"
}

function gradeFromScore(score: number): EditorEvaluation["grade"] {
  return score >= 85 ? "A" : score >= 70 ? "B" : score >= 50 ? "C" : "D";
}

// LLM eleştiri sonucunu editör değerlendirmesine çevir (anahtar varsa kullanılır).
export function critiqueToEvaluation(crit: CritiqueResult): EditorEvaluation {
  return {
    score: crit.score,
    grade: gradeFromScore(crit.score),
    blocking: crit.issues.some((i) => i.severity === "yuksek"),
    issues: crit.issues.map((i) => `${i.where}: ${i.problem} → ${i.fix}`),
    source: "LLM editör",
  };
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

  return {
    score: grade.score,
    grade: grade.grade,
    blocking: grade.blocking,
    issues,
    source: "deterministik",
  };
}

// Eşik altı veya bloklayıcı ise düzeltme turu gerekir.
export function shouldRevise(ev: EditorEvaluation, threshold = 80): boolean {
  return ev.blocking || ev.score < threshold;
}

// Platform anahtar kelimeleri etiketlerden türetilir (örn. "TikTok / Reels" → tiktok, reels).
const PLATFORM_KEYWORDS = Object.fromEntries(
  (Object.keys(PLATFORM_LABELS) as PlatformId[]).map((id) => [
    id,
    PLATFORM_LABELS[id].toLowerCase().split(/[^a-z0-9]+/).filter(Boolean),
  ]),
) as Record<PlatformId, string[]>;

// Bir editör notunun (örn. "Instagram: ...") hangi platformu işaret ettiğini bul.
function platformOf(issue: string): PlatformId | null {
  const prefix = (issue.split(":")[0] ?? "").toLowerCase();
  const tokens = prefix.split(/[^a-zçğıiöşü0-9]+/).filter(Boolean);
  for (const id of Object.keys(PLATFORM_KEYWORDS) as PlatformId[]) {
    if (PLATFORM_KEYWORDS[id].some((kw) => tokens.includes(kw))) return id;
  }
  return null;
}

// Editör notlarını platforma göre say (hangi platform daha sorunlu?).
export function platformIssueCounts(issues: string[]): Record<PlatformId, number> {
  const counts = { instagram: 0, tiktok: 0, linkedin: 0, x: 0 } as Record<PlatformId, number>;
  for (const issue of issues) {
    const p = platformOf(issue);
    if (p) counts[p]++;
  }
  return counts;
}

// En çok sorunu olan platform (yoksa null). Düzeltme turunu oraya yöneltmek için.
export function weakestPlatform(issues: string[]): PlatformId | null {
  const counts = platformIssueCounts(issues);
  let best: PlatformId | null = null;
  let max = 0;
  for (const id of Object.keys(counts) as PlatformId[]) {
    if (counts[id] > max) {
      max = counts[id];
      best = id;
    }
  }
  return best;
}

// Editör notlarını üretime enjekte edilecek revizyon talimatına çevir (saf).
// En zayıf platform tespit edilirse düzeltmeyi oraya hedefler.
export function buildRevisionRequest(req: GenerateRequest, ev: EditorEvaluation): GenerateRequest {
  const notes = ev.issues.slice(0, 8).join("; ");
  const weak = weakestPlatform(ev.issues);
  const focus = weak
    ? ` Özellikle ${PLATFORM_LABELS[weak]} platformu en zayıf — düzeltmede oraya öncelik ver.`
    : "";
  return {
    ...req,
    revisionNotes:
      (notes
        ? `Önceki taslakta editör şu sorunları buldu: ${notes}.`
        : "Önceki taslak marka sesine yeterince yakın değildi; daha keskin ve kanıta dayalı yaz.") +
      focus,
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
  rounds: number;
}

export interface TeamDeps {
  generate: (r: GenerateRequest) => Promise<ContentPackage>;
  // Editör beyni: senkron (deterministik) ya da asenkron (LLM eleştirisi) olabilir.
  evaluate?: (pkg: ContentPackage, brand: Brand) => EditorEvaluation | Promise<EditorEvaluation>;
  // Stratejist ajanı: üretimden önce isteği rafine eder (örn. en uygun açı).
  strategist?: (r: GenerateRequest) => { req: GenerateRequest; note: string };
  threshold?: number;
  maxRounds?: number; // en fazla kaç düzeltme turu (varsayılan 1)
}

// Orkestratör: üret → editör puanı → eşik aşılana / tur dolana kadar düzelt.
// Her tur en iyi paketi korur; ilerleme yoksa erken durur (maliyet/ısraf koruması).
// `generate` ve `evaluate` enjekte edilir → orkestrasyon mantığı saf + test edilebilir.
export async function runAgentTeam(
  req: GenerateRequest,
  deps: TeamDeps,
): Promise<TeamRunResult> {
  const threshold = deps.threshold ?? 80;
  const maxRounds = Math.max(0, deps.maxRounds ?? 1);
  const evaluate = deps.evaluate ?? evaluatePackage;

  const steps: TeamStep[] = [];

  // Stratejist: üretimden önce isteği rafine et (açı seçimi vb.).
  let workReq = req;
  if (deps.strategist) {
    const plan = deps.strategist(req);
    workReq = plan.req;
    steps.push({ role: "strategist", label: "Stratejist", note: plan.note });
  }

  const draft = await deps.generate(workReq);
  const before = await evaluate(draft, workReq.brand);
  let best = draft;
  let bestEval = before;

  const weakBefore = weakestPlatform(before.issues);
  steps.push(
    { role: "copywriter", label: "Copywriter", note: "Taslak üretildi" },
    {
      role: "editor",
      label: "Kıdemli Editör",
      score: before.score,
      note: `${before.source ? `[${before.source}] ` : ""}${
        before.issues.length
          ? `${before.issues.length} sorun: ${before.issues.slice(0, 2).join("; ")}`
          : "Sorun bulunmadı"
      }${weakBefore ? ` · en zayıf: ${PLATFORM_LABELS[weakBefore]}` : ""}`,
    },
  );

  let rounds = 0;
  while (shouldRevise(bestEval, threshold) && rounds < maxRounds) {
    rounds++;
    const candidate = await deps.generate(buildRevisionRequest(workReq, bestEval));
    const candEval = await evaluate(candidate, workReq.brand);
    const improved = candEval.score > bestEval.score;
    steps.push({
      role: "reviser",
      label: "Düzeltmen",
      score: candEval.score,
      note: `Tur ${rounds}: ${bestEval.score} → ${candEval.score}${
        improved ? "" : " (iyileşme yok, durduruldu)"
      }`,
    });
    if (!improved) break; // ilerleme yok — tekrar denemek israf
    best = candidate;
    bestEval = candEval;
  }

  return { steps, final: best, before, after: bestEval, revised: rounds > 0, rounds };
}
