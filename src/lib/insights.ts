import type { CalendarEntry } from "./calendar";
import { ANGLE_LABELS, CONTENT_TYPE_LABELS, type Angle, type ContentType } from "./types";

// ============================================================================
// PERFORMANS / ÖĞRENME PANOSU (insights).
// Takvimde elle girilen gerçek metrikleri (erişim/etkileşim) açı ve içerik
// tipine göre sentezler → "ne işe yarıyor?" + somut öneri. Saf/test edilebilir;
// otomatik metrik çekmeye (BLOKE) bağlı değil — manuel veriyle çalışır.
// ============================================================================

export interface RatePerf<K> {
  key: K;
  label: string;
  count: number;
  avgRate: number; // ortalama etkileşim oranı (engagement/reach), 0-1
}

export interface WeekPoint {
  week: string; // hafta başı (Pazartesi) YYYY-MM-DD
  count: number;
  reach: number;
  avgRate: number; // 0-1
}

export interface Insights {
  publishedCount: number;
  totalReach: number;
  totalEngagement: number;
  avgRate: number; // genel etkileşim oranı (0-1)
  byAngle: RatePerf<Angle>[]; // avgRate'e göre azalan
  byContentType: RatePerf<ContentType>[];
  byPillar: RatePerf<string>[]; // içerik sütununa göre (pillar'ı olan girişler)
  weeklyTrend: WeekPoint[]; // haftalık etkileşim trendi (kronolojik)
  bestAngle: RatePerf<Angle> | null;
  worstAngle: RatePerf<Angle> | null;
  recommendations: string[];
}

// Tarihin ait olduğu haftanın başı (Pazartesi), YYYY-MM-DD.
function weekStart(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return dateStr;
  const day = (d.getUTCDay() + 6) % 7; // Pazartesi = 0
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().slice(0, 10);
}

function weeklyTrendOf(entries: CalendarEntry[]): WeekPoint[] {
  const acc = new Map<string, CalendarEntry[]>();
  for (const e of entries) {
    const w = weekStart(e.date);
    (acc.get(w) ?? acc.set(w, []).get(w)!).push(e);
  }
  return [...acc.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([week, list]) => ({
      week,
      count: list.length,
      reach: list.reduce((s, e) => s + (e.reach ?? 0), 0),
      avgRate: list.reduce((s, e) => s + rateOf(e), 0) / list.length,
    }));
}

const rateOf = (e: CalendarEntry) => (e.engagement ?? 0) / (e.reach ?? 1);

function groupRates<K extends string>(
  entries: CalendarEntry[],
  keyOf: (e: CalendarEntry) => K,
  labelOf: (k: K) => string,
): RatePerf<K>[] {
  const acc = new Map<K, number[]>();
  for (const e of entries) {
    const k = keyOf(e);
    (acc.get(k) ?? acc.set(k, []).get(k)!).push(rateOf(e));
  }
  return [...acc.entries()]
    .map(([key, rates]) => ({
      key,
      label: labelOf(key),
      count: rates.length,
      avgRate: rates.reduce((s, r) => s + r, 0) / rates.length,
    }))
    .sort((a, b) => b.avgRate - a.avgRate);
}

export function computeInsights(entries: CalendarEntry[]): Insights {
  const usable = entries.filter((e) => e.status === "yayinlandi" && (e.reach ?? 0) > 0);

  const totalReach = usable.reduce((s, e) => s + (e.reach ?? 0), 0);
  const totalEngagement = usable.reduce((s, e) => s + (e.engagement ?? 0), 0);
  const avgRate = usable.length
    ? usable.reduce((s, e) => s + rateOf(e), 0) / usable.length
    : 0;

  const byAngle = groupRates(usable, (e) => e.angle, (k) => ANGLE_LABELS[k]);
  const byContentType = groupRates(usable, (e) => e.contentType, (k) => CONTENT_TYPE_LABELS[k]);
  const byPillar = groupRates(
    usable.filter((e) => e.pillar && e.pillar.trim()),
    (e) => e.pillar!.trim(),
    (k) => k,
  );
  const weeklyTrend = weeklyTrendOf(usable);

  const bestAngle = byAngle[0] ?? null;
  const worstAngle = byAngle.length > 1 ? byAngle[byAngle.length - 1] : null;

  const recommendations: string[] = [];
  if (usable.length === 0) {
    recommendations.push(
      "Henüz metrikli yayın yok. Takvimde yayınlananları gerçek erişim/etkileşimle işaretle — pano buradan öğrenir.",
    );
  } else {
    if (usable.length < 3) {
      recommendations.push(
        "Daha güvenilir öğrenme için en az birkaç yayını daha metrikle işaretle (şimdilik az veri).",
      );
    }
    if (bestAngle && avgRate > 0 && bestAngle.avgRate > avgRate) {
      const pct = Math.round(((bestAngle.avgRate - avgRate) / avgRate) * 100);
      recommendations.push(
        `“${bestAngle.label}” açısı ortalamanın %${pct} üstünde — bu açıyı daha sık kullan.`,
      );
    }
    if (worstAngle && worstAngle.key !== bestAngle?.key && worstAngle.avgRate < avgRate) {
      recommendations.push(
        `“${worstAngle.label}” açısı ortalamanın altında — yaklaşımı değiştir ya da azalt.`,
      );
    }
    const bestType = byContentType[0];
    if (bestType && byContentType.length > 1) {
      recommendations.push(`En iyi içerik tipi: “${bestType.label}”. İçerik karışımında ağırlığını artır.`);
    }
    const bestPillar = byPillar[0];
    if (bestPillar && byPillar.length > 1) {
      recommendations.push(`En güçlü içerik sütunu: “${bestPillar.label}”. Bu temaya daha çok yaslan.`);
    }
  }

  return {
    publishedCount: usable.length,
    totalReach,
    totalEngagement,
    avgRate,
    byAngle,
    byContentType,
    byPillar,
    weeklyTrend,
    bestAngle,
    worstAngle,
    recommendations,
  };
}
