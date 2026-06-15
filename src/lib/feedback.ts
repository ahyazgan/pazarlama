"use client";

import type { Angle, SectorId } from "./types";

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
