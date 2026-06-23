import type { Angle, Brand, ContentType } from "./types";
import { getSector } from "./sectors";

// ============================================================================
// Haftalık içerik planı üreteci (Strateji Engine derinliği).
// Sektör içerik karışımı + içerik sütunları + açı afinitesini rotasyonla
// dağıtarak N günlük planı tek seferde üretir. Boş sayfayı hafta düzeyinde öldürür.
// Saf, deterministik (test edilebilir).
// ============================================================================

export interface PlanItem {
  date: string; // YYYY-MM-DD
  topicSeed: string;
  contentType: ContentType;
  angle: Angle;
  pillar: string;
  personaName: string;
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function weeklyPlan(brand: Brand, count = 5, startISO?: string): PlanItem[] {
  const sector = getSector(brand.sector);
  const start = startISO ?? new Date().toISOString().slice(0, 10);

  const types = (Object.entries(sector.contentMix) as [ContentType, number][])
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([t]) => t);
  const angles = sector.angleAffinity.length ? sector.angleAffinity : (["egitici"] as Angle[]);
  const pillars = (brand.pillars ?? []).filter((p) => p && p.trim());
  const personas = brand.audience.length ? brand.audience : [{ name: "hedef kitle" } as Brand["audience"][number]];

  const items: PlanItem[] = [];
  for (let i = 0; i < count; i++) {
    const pillar = pillars.length ? pillars[i % pillars.length] : "";
    const seed = pillar || sector.hooks[i % sector.hooks.length]?.replace(/_+/g, "").trim() || "Yeni içerik";
    items.push({
      date: addDays(start, i),
      topicSeed: seed,
      contentType: types.length ? types[i % types.length] : "deger",
      angle: angles[i % angles.length],
      pillar,
      personaName: personas[i % personas.length].name || `Persona ${(i % personas.length) + 1}`,
    });
  }
  return items;
}
