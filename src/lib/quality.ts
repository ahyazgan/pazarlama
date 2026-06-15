import type { Brand, ContentPackage } from "./types";

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

export type IssueType =
  | "yasak" // yasak kelime kullanilmis
  | "klise" // AI-klise kalip
  | "kanit_yok" // gercek kanit rakami metne islenmemis
  | "imza_yok" // imza ifade hic kullanilmamis
  | "hashtag" // IG hashtag sayisi ideal araligin disinda
  | "thread" // X thread uzunlugu ideal disinda
  | "emoji" // emoji asiriligi
  | "zayif_hook"; // hook cok kisa/zayif

export interface QualityIssue {
  where: string; // platform/alan
  type: IssueType;
  term: string; // detay
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

const EMOJI = /\p{Extended_Pictographic}/gu;

function countEmoji(s: string): number {
  return (s.match(EMOJI) ?? []).length;
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
    const ec = countEmoji(text);
    if (ec > 4) issues.push({ where, type: "emoji", term: `${ec} emoji (fazla)` });
  }

  const o = pkg.outputs;

  // IG hashtag sayisi (ideal 8-15).
  const tags = (o.instagram.firstComment.match(/#/g) ?? []).length;
  if (tags < 5 || tags > 20) {
    issues.push({
      where: "Instagram/ilk yorum",
      type: "hashtag",
      term: `${tags} hashtag (ideal 8-15)`,
    });
  }

  // X thread uzunlugu (ideal 3-5).
  const tn = o.x.thread.length;
  if (tn < 3 || tn > 6) {
    issues.push({ where: "X/thread", type: "thread", term: `${tn} tweet (ideal 3-5)` });
  }

  // Zayif hook (TikTok hook cok kisa).
  if (o.tiktok.hook.trim().length < 12) {
    issues.push({ where: "TikTok/hook", type: "zayif_hook", term: "hook cok kisa" });
  }

  return issues;
}

// Marka-bilincli derin lint: kanit rakami ve imza ifade kullanimini da dener.
export function lintWithBrand(pkg: ContentPackage, brand: Brand): QualityIssue[] {
  const issues = lintPackage(pkg, brand.voice.bannedWords);
  const blob = fields(pkg)
    .map((f) => f.text)
    .join(" ")
    .toLowerCase();

  const numbers = brand.proof.numbers.map((n) => n.trim()).filter(Boolean);
  if (numbers.length) {
    const used = numbers.some((n) => {
      const token = (n.match(/[\d.]+/)?.[0] ?? n).toLowerCase();
      return token.length >= 2 && blob.includes(token);
    });
    if (!used) {
      issues.push({
        where: "Genel",
        type: "kanit_yok",
        term: "Gerçek kanıt rakamı metne işlenmemiş",
      });
    }
  }

  const sigs = brand.voice.signaturePhrases.map((s) => s.trim()).filter(Boolean);
  if (sigs.length) {
    const used = sigs.some((s) => blob.includes(s.toLowerCase()));
    if (!used) {
      issues.push({
        where: "Genel",
        type: "imza_yok",
        term: "İmza ifade hiç kullanılmamış",
      });
    }
  }

  return issues;
}
