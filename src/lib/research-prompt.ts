import type { Brand, ResearchBrief } from "./types";
import { getSector } from "./sectors";

// ============================================================================
// Araştırma turu prompt'ları (web_search ile grounding).
// Pure builder + parser (test edilebilir); endpoint anahtar gerektirir.
// ============================================================================

export function buildResearchSystem(brand: Brand): string {
  const sector = getSector(brand.sector);
  return `Sen ${sector.label} sektorunde titiz bir arastirmacisin.
Verilen konu icin GUNCEL, dogrulanabilir bilgi topla: istatistik, mevzuat,
piyasa gelismesi, rakiplerin atladigi aci. web_search aracini kullan.
Yalnizca kaynagi olan bilgileri raporla; emin olmadigini ekleme.
Cevabini en sonda TEK bir JSON nesnesi olarak ver:
{"findings": string[], "sources": [{"title": string, "url": string, "note": string}], "competitorGap": string}
JSON disinda aciklama ekleyebilirsin ama JSON en sonda ve gecerli olmali.`;
}

export function buildResearchUser(brand: Brand, topic: string): string {
  return `Marka: ${brand.name}. Konu: "${topic}".
Bu konuda sosyal medya icerigini guclendirecek 3-6 kilit, guncel ve kaynakli bulgu ara.
Mumkunse somut sayi/oran ve tarih iceren bulgular sec. JSON'u en sonda ver.`;
}

// Modelin (kod bloklu/serbest) çıktısından son geçerli JSON nesnesini ayıkla.
export function parseResearchBrief(text: string, topic: string): ResearchBrief | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  let data: unknown;
  try {
    data = JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const findings = Array.isArray(d.findings)
    ? (d.findings.filter((x) => typeof x === "string") as string[])
    : [];
  const sources = Array.isArray(d.sources)
    ? (d.sources as unknown[])
        .filter((s): s is Record<string, unknown> => !!s && typeof s === "object")
        .map((s) => ({
          title: String(s.title ?? ""),
          url: String(s.url ?? ""),
          note: s.note ? String(s.note) : undefined,
        }))
        .filter((s) => s.title || s.url)
    : [];
  if (!findings.length && !sources.length) return null;
  return {
    topic,
    findings,
    sources,
    competitorGap: typeof d.competitorGap === "string" ? d.competitorGap : undefined,
    generatedAt: new Date().toISOString(),
  };
}
