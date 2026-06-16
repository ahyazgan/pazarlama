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

export interface Insights {
  publishedCount: number;
  totalReach: number;
  totalEngagement: number;
  avgRate: number; // genel etkileşim oranı (0-1)
  byAngle: RatePerf<Angle>[]; // avgRate'e göre azalan
  byContentType: RatePerf<ContentType>[];
  bestAngle: RatePerf<Angle> | null;
  worstAngle: RatePerf<Angle> | null;
  recommendations: string[];
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
  }

  return {
    publishedCount: usable.length,
    totalReach,
    totalEngagement,
    avgRate,
    byAngle,
    byContentType,
    bestAngle,
    worstAngle,
    recommendations,
  };
}
