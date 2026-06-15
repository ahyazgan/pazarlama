import type {
  Angle,
  Brand,
  ContentType,
  Persona,
  PlatformId,
  SectorIntelligence,
} from "./types";
import { ANGLE_LABELS } from "./types";
import { getSector } from "./sectors";
import type { HistoryEntry } from "./history";

// ============================================================================
// Strateji Engine — aktif öneri (Constitution Bölüm 3).
// "Boş sayfa sendromunu öldürür": sistem en güçlü açı + içerik tipini önerir.
// Saf, deterministik fonksiyonlar (test edilebilir). Kullanıcı yine değiştirebilir.
// ============================================================================

export interface Recommendation<T> {
  value: T;
  reason: string;
}

// Konu metnindeki sinyallere göre açı puanlama sözlüğü.
const ANGLE_SIGNALS: Record<Angle, string[]> = {
  korku: ["hata", "risk", "ceza", "gec", "geç", "kayip", "kayıp", "sorun", "tehlike", "kacir", "kaçır", "yanlis", "yanlış", "tukeniyor", "tükeniyor", "son"],
  kazanc: ["kazan", "tasarruf", "bonus", "firsat", "fırsat", "indirim", "avantaj", "hizli", "hızlı", "erken", "ucretsiz", "ücretsiz", "kampanya"],
  sosyal_kanit: ["musteri", "müşteri", "tercih", "referans", "yorum", "binlerce", "kisi", "kişi", "guven", "güven", "secti", "seçti"],
  egitici: ["nasil", "nasıl", "rehber", "ipucu", "adim", "adım", "faktor", "faktör", "bilmen", "ogren", "öğren", "neden", "yontem", "yöntem"],
  karsitlik: ["vs", "karsi", "karşı", "fark", "rakip", "kiyas", "kıyas", "onlar", "biz"],
};

// Sektör başına varsayılan (sinyal yoksa) açı eğilimi.
const SECTOR_DEFAULT_ANGLE: Record<string, Angle> = {
  insaat: "korku", // B2B: risk/ceza vurgusu güçlü çalışır
  kafe: "egitici",
  eticaret: "kazanc",
  hizmet: "egitici",
  guzellik: "egitici",
};

const ALL_ANGLES = Object.keys(ANGLE_LABELS) as Angle[];

function norm(s: string): string {
  return s.toLowerCase();
}

// Açı puanlama: konu sinyalleri + sektör varsayılanı + son kullanım rotasyonu.
function scoreAngles(
  sector: SectorIntelligence,
  topic: string,
  history: HistoryEntry[] = [],
): Map<Angle, number> {
  const t = norm(topic);
  const recent = history.slice(0, 5).map((h) => h.angle);
  const scores = new Map<Angle, number>();
  for (const angle of ALL_ANGLES) {
    let score = 0;
    for (const kw of ANGLE_SIGNALS[angle]) {
      if (t.includes(kw)) score += 2;
    }
    if (angle === SECTOR_DEFAULT_ANGLE[sector.sector]) score += 1;
    score -= recent.filter((a) => a === angle).length * 0.5;
    scores.set(angle, score);
  }
  return scores;
}

// En yüksek skorlu açı (eşitlikte ANGLE_LABELS sırasına göre stabil).
function topAngle(scores: Map<Angle, number>, exclude: Set<Angle> = new Set()): Angle {
  let best: Angle | null = null;
  for (const angle of ALL_ANGLES) {
    if (exclude.has(angle)) continue;
    if (best === null || (scores.get(angle) ?? 0) > (scores.get(best) ?? 0)) best = angle;
  }
  return best ?? ALL_ANGLES[0];
}

// En güçlü açıyı öner: konu sinyalleri + sektör varsayılanı + son kullanım rotasyonu.
export function recommendAngle(
  sector: SectorIntelligence,
  topic: string,
  history: HistoryEntry[] = [],
): Recommendation<Angle> {
  const t = norm(topic);
  const scores = scoreAngles(sector, topic, history);
  const best = topAngle(scores);

  const hit = ANGLE_SIGNALS[best].some((kw) => t.includes(kw));
  const reason = hit
    ? `Konudaki ifadeler "${ANGLE_LABELS[best]}" açısını işaret ediyor.`
    : best === SECTOR_DEFAULT_ANGLE[sector.sector]
      ? `${sector.label} için "${ANGLE_LABELS[best]}" açısı genelde en güçlü sonucu verir.`
      : `Çeşitlilik için "${ANGLE_LABELS[best]}" açısı öneriliyor.`;

  return { value: best, reason };
}

// İçerik tipini öner: sektör içerik karışımında en yüksek paylı tip.
export function recommendContentType(
  sector: SectorIntelligence,
): Recommendation<ContentType> {
  const entries = (Object.entries(sector.contentMix) as [ContentType, number][])
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);
  const top = entries[0];
  const value = top?.[0] ?? "deger";
  const reason = top
    ? `${sector.label} içerik karışımında en yüksek pay: %${top[1]}.`
    : "Varsayılan içerik tipi.";
  return { value, reason };
}

// Her persona için FARKLI açı ata (Constitution Katman 3: her persona ayrı açı).
// Skora göre sırala, sonra her personaya kullanılmamış en güçlü açıyı ver; 5'i aşınca döner.
export function assignAnglesToPersonas(
  sector: SectorIntelligence,
  topic: string,
  count: number,
  history: HistoryEntry[] = [],
): Angle[] {
  const scores = scoreAngles(sector, topic, history);
  const out: Angle[] = [];
  let used = new Set<Angle>();
  for (let i = 0; i < count; i++) {
    if (used.size >= ALL_ANGLES.length) used = new Set(); // tüm açılar bittiyse döngüye sar
    const pick = topAngle(scores, used);
    out.push(pick);
    used.add(pick);
  }
  return out;
}

// Konu önerici — sektör hook'larından, son kullanılan konulara benzemeyen taze fikirler.
// "Boş sayfa sendromunu" daha da öldürür. Hook'taki "___" yer tutucusu temizlenir.
export function suggestTopics(
  sector: SectorIntelligence,
  history: HistoryEntry[] = [],
  count = 3,
): string[] {
  const recent = new Set(history.slice(0, 8).map((h) => h.topic.trim().toLowerCase()));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const hook of sector.hooks) {
    const idea = hook.replace(/_+/g, "").replace(/\s+/g, " ").trim().replace(/[:?]\s*$/, "");
    const key = idea.toLowerCase();
    if (!idea || seen.has(key) || recent.has(key)) continue;
    seen.add(key);
    out.push(idea);
    if (out.length >= count) break;
  }
  return out;
}

// En çok konuya değen persona (acı/motivasyon kelimeleri konuda geçiyorsa öne al).
function focusPersona(brand: Brand, topic: string): { index: number; persona: Persona } | null {
  if (!brand.audience.length) return null;
  const t = norm(topic);
  let bestIdx = 0;
  let bestScore = -1;
  brand.audience.forEach((p, i) => {
    const blob = `${p.pain} ${p.motivation}`.toLowerCase();
    const words = blob.split(/\W+/).filter((w) => w.length > 3);
    const score = words.filter((w) => t.includes(w)).length;
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  });
  return { index: bestIdx, persona: brand.audience[bestIdx] };
}

export interface StrategyBrief {
  contentType: Recommendation<ContentType>;
  primaryAngle: Recommendation<Angle>;
  secondaryAngle: Angle;
  platformPriority: PlatformId[];
  personaFocusIndex: number;
  personaFocusName: string;
  hookSeed: string;
}

// Strateji Engine'in zengin çıktısı — boş sayfa sendromunu tam öldürür (Bölüm 3).
export function buildStrategyBrief(
  brand: Brand,
  topic: string,
  history: HistoryEntry[] = [],
): StrategyBrief {
  const sector = getSector(brand.sector);
  const angles = assignAnglesToPersonas(sector, topic, 2, history);
  const focus = focusPersona(brand, topic);
  const seedRaw = suggestTopics(sector, history, 1)[0] ?? sector.hooks[0] ?? "";
  const hookSeed = seedRaw.replace(/_+/g, "…").trim();
  return {
    contentType: recommendContentType(sector),
    primaryAngle: recommendAngle(sector, topic, history),
    secondaryAngle: angles[1] ?? angles[0],
    platformPriority: sector.platformEmphasis,
    personaFocusIndex: focus?.index ?? 0,
    personaFocusName: focus?.persona.name || "hedef kitle",
    hookSeed,
  };
}

// Persona'ya göre kısa strateji notu (üretim öncesi yön).
export function personaStrategyNote(persona: Persona | undefined): string {
  if (!persona) return "";
  const pain = persona.pain?.trim();
  return pain
    ? `Hedef: ${persona.name || "persona"} — acıya ("${pain}") doğrudan değen bir hook kur.`
    : "";
}
