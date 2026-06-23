import type { Brand, ContentPackage } from "./types";
import { getSector } from "./sectors";

// ============================================================================
// LLM Öz-Eleştiri Turu (üret → marka beynine göre eleştir → puanla → düzelt öner).
// Deterministik lint'in üstüne ikinci, akıl yürüten kalite turu.
// Pure prompt/şema (test edilebilir); endpoint anahtar gerektirir (generate gibi).
// ============================================================================

export function buildCritiqueSystem(brand: Brand): string {
  const sector = getSector(brand.sector);
  return `Sen ${sector.label} sektorunde kidemli bir marka editorusun.
Gorevin: verilen icerik paketini MARKA BEYNINE gore acimasizca denetlemek.
Generic'lik, marka sesinden sapma, yasak kelime, klise, kanitsiz iddia, zayif hook ve
CTA hedefi sapmasi ara. Yapici ol: her sorun icin somut bir duzeltme oner.
Turkce. Ciktiyi SADECE verilen JSON semasina gore ver.`;
}

export function buildCritiqueUser(brand: Brand, pkg: ContentPackage): string {
  const v = brand.voice;
  const banned = (v.bannedWords ?? []).filter(Boolean);
  const sigs = (v.signaturePhrases ?? []).filter(Boolean);
  const nums = (brand.proof.numbers ?? []).filter(Boolean);
  const lines: string[] = [];

  lines.push("[MARKA BEYNI — denetim olcutu]");
  lines.push(`Marka: ${brand.name}`);
  lines.push(`Ses tonu: ${v.tone}/10; cumle: ${v.sentenceStyle || "-"}`);
  if (banned.length) lines.push(`Yasak kelimeler: ${banned.join(", ")}`);
  if (sigs.length) lines.push(`Imza ifadeler: ${sigs.join(" | ")}`);
  if (brand.identity.differentiation?.trim())
    lines.push(`Fark: ${brand.identity.differentiation.trim()}`);
  if (nums.length) lines.push(`Gercek kanit: ${nums.join("; ")}`);
  if (brand.identity.ctaGoal?.trim())
    lines.push(`Donusum hedefi (CTA): ${brand.identity.ctaGoal.trim()}`);

  lines.push("");
  lines.push("[DENETLENECEK PAKET]");
  lines.push(JSON.stringify(pkg.outputs));

  lines.push("");
  lines.push(
    "Her platformu marka beynine gore degerlendir. 0-100 puan ver (100 = kusursuz marka uyumu).",
  );
  lines.push(
    "issues: her sorun icin where (platform/alan), severity (dusuk|orta|yuksek), problem, fix.",
  );
  lines.push("verdict: tek cumle genel karar.");
  return lines.join("\n");
}

export const CRITIQUE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    score: { type: "integer" },
    verdict: { type: "string" },
    issues: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          where: { type: "string" },
          severity: { type: "string", enum: ["dusuk", "orta", "yuksek"] },
          problem: { type: "string" },
          fix: { type: "string" },
        },
        required: ["where", "severity", "problem", "fix"],
      },
    },
  },
  required: ["score", "verdict", "issues"],
} as const;
