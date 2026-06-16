import type { AdCopy, AdObjective, AdsRequest } from "./types";

// Platform reklam karakter limitleri (sert/önerilen). Aşım → platform reddi/kırpma riski.
export interface AdLimitIssue {
  where: string;
  len: number;
  limit: number;
}

const overLimit = (where: string, text: string, limit: number, out: AdLimitIssue[]) => {
  if (text.length > limit) out.push({ where, len: text.length, limit });
};

export function lintAds(ad: AdCopy): AdLimitIssue[] {
  const out: AdLimitIssue[] = [];
  ad.google.headlines.forEach((h, i) => overLimit(`Google başlık ${i + 1}`, h, 30, out));
  ad.google.descriptions.forEach((d, i) => overLimit(`Google açıklama ${i + 1}`, d, 90, out));
  ad.meta.headlines.forEach((h, i) => overLimit(`Meta başlık ${i + 1}`, h, 40, out));
  ad.meta.descriptions.forEach((d, i) => overLimit(`Meta açıklama ${i + 1}`, d, 30, out));
  ad.meta.primaryTexts.forEach((p, i) => overLimit(`Meta birincil metin ${i + 1}`, p, 200, out));
  return out;
}

// ============================================================================
// Reklam metni motoru (paid media CREATIVE). Marka beyni system prefix'ten gelir
// (buildSystemPrompt); burada yalnizca reklam gorevi + sema. Butce/yayin DEGIL.
// ============================================================================

const OBJECTIVE_LABEL: Record<AdObjective, string> = {
  trafik: "Web sitesi trafigi",
  donusum: "Donusum (teklif/satis)",
  etkilesim: "Etkilesim",
  bilinirlik: "Marka bilinirligi",
};

export function buildAdsUser(req: AdsRequest): string {
  const persona = req.brand.audience[req.personaIndex] ?? req.brand.audience[0];
  const lines: string[] = [];
  lines.push("[REKLAM GOREVI]");
  lines.push(`Kampanya hedefi: ${OBJECTIVE_LABEL[req.objective]}`);
  lines.push(`Konu/teklif: ${req.topic}`);
  if (persona) {
    lines.push(`Hedef persona: ${persona.name} — acisi: ${persona.pain || "-"}`);
  }
  lines.push("");
  lines.push("Marka beynine gore PERFORMANS reklam metni uret. Platform limitlerine UY:");
  lines.push("- Meta: primaryTexts (2-3, ~125 karakter), headlines (3, ~40 karakter), descriptions (2, ~30 karakter), cta (tek buton onerisi).");
  lines.push("- Google: headlines (3-5, her biri <=30 karakter), descriptions (2, her biri <=90 karakter).");
  lines.push("- audience: ilgi/demografi/davranis temelli kisa hedef-kitle onerisi.");
  lines.push("Net fayda + tek cagri; yasakli kelimeleri kullanma; donusum hedefine yonlendir.");
  lines.push("Ciktiyi SADECE verilen JSON semasina gore ver.");
  return lines.join("\n");
}

export const AD_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    meta: {
      type: "object",
      additionalProperties: false,
      properties: {
        primaryTexts: { type: "array", items: { type: "string" } },
        headlines: { type: "array", items: { type: "string" } },
        descriptions: { type: "array", items: { type: "string" } },
        cta: { type: "string" },
      },
      required: ["primaryTexts", "headlines", "descriptions", "cta"],
    },
    google: {
      type: "object",
      additionalProperties: false,
      properties: {
        headlines: { type: "array", items: { type: "string" } },
        descriptions: { type: "array", items: { type: "string" } },
      },
      required: ["headlines", "descriptions"],
    },
    audience: { type: "string" },
  },
  required: ["meta", "google", "audience"],
} as const;

export function buildDemoAds(req: AdsRequest): AdCopy {
  const b = req.brand;
  const persona = b.audience[req.personaIndex] ?? b.audience[0];
  const sig = b.voice.signaturePhrases?.find(Boolean) ?? b.name;
  const num = b.proof.numbers.find(Boolean) ?? b.name;
  const cta = b.identity.ctaGoal?.trim() || "Teklif Al";
  const pn = persona?.name || "hedef kitle";
  return {
    meta: {
      primaryTexts: [
        `${req.topic} — ${pn} için fark yaratır. ${sig}. (${num})`,
        `${persona?.pain || "Sorununu"} çöz: ${req.topic}. Hemen başla.`,
      ],
      headlines: [`${b.name} ile ${req.topic}`, `${num}`, "Garantili çözüm"],
      descriptions: [`${sig}.`, "Bugün teklif al."],
      cta,
    },
    google: {
      headlines: [b.name, req.topic.slice(0, 28), "Hızlı teslim"],
      descriptions: [
        `${req.topic} için ${b.name}. ${sig}.`.slice(0, 90),
        `${num}. Hemen teklif alın.`.slice(0, 90),
      ],
    },
    audience: `${pn} ve benzeri; ${b.sector} sektörü karar vericileri; ilgi: tedarik/proje yönetimi.`,
  };
}
