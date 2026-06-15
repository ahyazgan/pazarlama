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
