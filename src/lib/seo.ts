import type { SeoContent, SeoRequest } from "./types";
import { getSector } from "./sectors";

// ============================================================================
// SEO içerik motoru (blog/uzun-form iskeleti + meta). Marka beyni system'den.
// ============================================================================

export function buildSeoUser(req: SeoRequest): string {
  const lines: string[] = [];
  lines.push("[SEO GOREVI]");
  lines.push(`Konu: ${req.topic}`);
  if (req.primaryKeyword?.trim()) lines.push(`Birincil anahtar kelime: ${req.primaryKeyword.trim()}`);
  lines.push("");
  lines.push("Marka beynine + sektor bilgisine gore SEO blog iskeleti uret:");
  lines.push("- title: ~60 karakter, birincil anahtar kelimeyi icersin.");
  lines.push("- metaDescription: ~155 karakter, tikla cagrisi olan.");
  lines.push("- primaryKeyword + keywords: ikincil/uzun-kuyruk kelimeler (5-8).");
  lines.push("- outline: 4-6 H2 basligi, her biri 2-4 alt madde (points).");
  lines.push("- intro: 2-3 cumlelik giris paragrafi.");
  lines.push("Arama niyetine uygun, bilgilendirici; marka tonunu koru; uydurma istatistik yok.");
  lines.push("Ciktiyi SADECE verilen JSON semasina gore ver.");
  return lines.join("\n");
}

export const SEO_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    metaDescription: { type: "string" },
    primaryKeyword: { type: "string" },
    keywords: { type: "array", items: { type: "string" } },
    outline: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          h2: { type: "string" },
          points: { type: "array", items: { type: "string" } },
        },
        required: ["h2", "points"],
      },
    },
    intro: { type: "string" },
  },
  required: ["title", "metaDescription", "primaryKeyword", "keywords", "outline", "intro"],
} as const;

// SEO denetimi: title/meta uzunluğu, anahtar kelime yerleşimi, outline derinliği.
export interface SeoCheck {
  label: string;
  ok: boolean;
  detail: string;
}
export interface SeoAudit {
  score: number; // 0-100
  checks: SeoCheck[];
}

export function auditSeo(seo: SeoContent): SeoAudit {
  const kw = seo.primaryKeyword.toLowerCase();
  const inTitle = seo.title.toLowerCase().includes(kw);
  const inIntro = seo.intro.toLowerCase().includes(kw);
  const checks: SeoCheck[] = [
    {
      label: "Title uzunluğu (≤60)",
      ok: seo.title.length > 0 && seo.title.length <= 60,
      detail: `${seo.title.length} karakter`,
    },
    {
      label: "Meta description (120-160)",
      ok: seo.metaDescription.length >= 120 && seo.metaDescription.length <= 160,
      detail: `${seo.metaDescription.length} karakter`,
    },
    {
      label: "Anahtar kelime title'da",
      ok: inTitle,
      detail: inTitle ? "var" : "yok",
    },
    {
      label: "Anahtar kelime girişte",
      ok: inIntro,
      detail: inIntro ? "var" : "yok",
    },
    {
      label: "Yeterli anahtar kelime (≥4)",
      ok: seo.keywords.filter(Boolean).length >= 4,
      detail: `${seo.keywords.filter(Boolean).length} kelime`,
    },
    {
      label: "Outline derinliği (≥4 H2)",
      ok: seo.outline.length >= 4,
      detail: `${seo.outline.length} H2`,
    },
  ];
  const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
  return { score, checks };
}

export function buildDemoSeo(req: SeoRequest): SeoContent {
  const sector = getSector(req.brand.sector);
  const kw = req.primaryKeyword?.trim() || req.topic;
  const terms = sector.terminology.slice(0, 6);
  return {
    title: `${req.topic} | ${req.brand.name} Rehberi`.slice(0, 60),
    metaDescription:
      `${req.topic} hakkında bilmeniz gereken her şey. ${req.brand.name} ile pratik rehber ve ipuçları.`.slice(
        0,
        155,
      ),
    primaryKeyword: kw,
    keywords: [kw, ...terms],
    outline: [
      { h2: `${req.topic} nedir?`, points: ["Tanım", "Neden önemli", "Sık yanılgılar"] },
      { h2: "Dikkat edilecek 5 nokta", points: terms.slice(0, 3) },
      { h2: `${req.brand.name} yaklaşımı`, points: ["Fark", "Süreç", "Kanıt"] },
      { h2: "Sık sorulan sorular", points: ["Maliyet", "Süre", "Garanti"] },
    ],
    intro: `${req.topic}, ${sector.label} için kritik bir konu. Bu rehberde pratik adımları ve sık hataları ele alıyoruz. (demo)`,
  };
}
