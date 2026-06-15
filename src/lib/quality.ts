import type { ContentPackage } from "./types";

// ============================================================================
// Kalite-lint (anahtarsız öz-denetim).
// Üretilen paketi yasak kelimeler + AI-klişe kalıpları için tarar.
// Saf fonksiyon (test edilebilir). LLM tabanlı öz-eleştiri ayrı/Faz 2 (anahtar gerekir).
// ============================================================================

// Generic'lik sinyali veren, kaçınılması gereken kalıplar.
export const CLICHE_PATTERNS = [
  "günümüz dünyasında",
  "gunumuz dunyasinda",
  "bu yazıda",
  "bu gönderide",
  "sizler için",
  "sizler icin",
  "hayatınızı kolaylaştır",
  "çağ atla",
  "trendlere ayak uydur",
  "mihenk taşı",
];

export interface QualityIssue {
  where: string; // platform/alan
  type: "yasak" | "klise";
  term: string;
}

// Paketteki tüm metin alanlarını etiketleriyle düzleştir.
function fields(pkg: ContentPackage): { where: string; text: string }[] {
  const o = pkg.outputs;
  return [
    { where: "Instagram/caption", text: o.instagram.caption },
    { where: "Instagram/ilk yorum", text: o.instagram.firstComment },
    { where: "Instagram/görsel prompt", text: o.instagram.imagePrompt },
    { where: "Instagram/alt-text", text: o.instagram.altText },
    { where: "TikTok/hook", text: o.tiktok.hook },
    ...o.tiktok.scenes.map((s, i) => ({
      where: `TikTok/sahne ${i + 1}`,
      text: `${s.shot} ${s.voiceover}`,
    })),
    { where: "TikTok/CTA", text: o.tiktok.cta },
    { where: "LinkedIn/hook", text: o.linkedin.hookLine },
    { where: "LinkedIn/gövde", text: o.linkedin.body },
    { where: "LinkedIn/insight", text: o.linkedin.insight },
    { where: "LinkedIn/soru", text: o.linkedin.discussionQuestion },
    ...o.x.thread.map((t, i) => ({ where: `X/tweet ${i + 1}`, text: t })),
  ];
}

export function lintPackage(
  pkg: ContentPackage,
  bannedWords: string[] = [],
): QualityIssue[] {
  const banned = bannedWords.map((w) => w.trim().toLowerCase()).filter(Boolean);
  const issues: QualityIssue[] = [];
  for (const { where, text } of fields(pkg)) {
    const lower = text.toLowerCase();
    for (const w of banned) {
      if (lower.includes(w)) issues.push({ where, type: "yasak", term: w });
    }
    for (const c of CLICHE_PATTERNS) {
      if (lower.includes(c)) issues.push({ where, type: "klise", term: c });
    }
  }
  return issues;
}
