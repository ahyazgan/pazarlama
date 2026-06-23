"use client";

import type { Angle, SectorId } from "./types";
import type { CalendarEntry } from "./calendar";

// ============================================================================
// Feedback Loop (yerel MVP — Constitution "gerçek unicorn katmanı").
// Gerçek yayın analitiği yerine kullanıcı işareti (👍/👎). Sektör+açı bazında
// net skor saklanır ve recommender'a beslenir → strateji zamanla öğrenir.
// Pure çekirdek (netScores) test edilebilir; storage ayrı.
// ============================================================================

const KEY = "content-os.feedback";

// sektör -> açı -> net oy (👍 +1, 👎 -1)
export type FeedbackStore = Partial<Record<SectorId, Partial<Record<Angle, number>>>>;

export function loadFeedback(): FeedbackStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as FeedbackStore) : {};
  } catch {
    return {};
  }
}

export function recordFeedback(sector: SectorId, angle: Angle, vote: 1 | -1): FeedbackStore {
  const store = loadFeedback();
  const bySector = (store[sector] ??= {});
  bySector[angle] = (bySector[angle] ?? 0) + vote;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  }
  return store;
}

// Pure: bir sektör için açı->net skor haritası (recommender'a verilir).
export function netScores(
  store: FeedbackStore,
  sector: SectorId,
): Partial<Record<Angle, number>> {
  return store[sector] ?? {};
}

// Pure: gerçek metriklerden (erişim/etkileşim) açı sinyali türet.
// Sektör içinde etkileşim oranı (engagement/reach) ortalamanın üstündeyse +1,
// altındaysa -1; açı bazında toplanır. Outcome-temelli öğrenme (manuel).
export function metricsAngleScores(entries: CalendarEntry[]): FeedbackStore {
  const usable = entries.filter(
    (e) => e.status === "yayinlandi" && (e.reach ?? 0) > 0 && (e.engagement ?? 0) >= 0,
  );
  const store: FeedbackStore = {};
  const bySector = new Map<SectorId, CalendarEntry[]>();
  for (const e of usable) {
    (bySector.get(e.sector) ?? bySector.set(e.sector, []).get(e.sector)!).push(e);
  }
  for (const [sector, list] of bySector) {
    const rates = list.map((e) => (e.engagement ?? 0) / (e.reach ?? 1));
    const mean = rates.reduce((s, r) => s + r, 0) / rates.length;
    const acc: Partial<Record<Angle, number>> = {};
    list.forEach((e, i) => {
      acc[e.angle] = (acc[e.angle] ?? 0) + (rates[i] >= mean ? 1 : -1);
    });
    store[sector] = acc;
  }
  return store;
}

// Pure: iki açı-skor haritasını birleştir (feedback + metrik).
export function mergeAngleScores(
  a: Partial<Record<Angle, number>>,
  b: Partial<Record<Angle, number>>,
): Partial<Record<Angle, number>> {
  const out: Partial<Record<Angle, number>> = { ...a };
  for (const k of Object.keys(b) as Angle[]) out[k] = (out[k] ?? 0) + (b[k] ?? 0);
  return out;
}
