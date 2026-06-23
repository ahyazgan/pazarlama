import type { Angle, ContentType, SectorId } from "./types";
import { templatesFor } from "./templates";

// ============================================================================
// Otomatik haftalık plan önerici — sektör şablonları + feedback ağırlıklı
// açılardan boş bir haftayı doldurur. "Bu hafta ne paylaşayım?" sorusunu
// tek tıkla yanıtlar. Saf (test edilebilir); takvime entegrasyon ayrı.
// ============================================================================

export interface PlanSuggestion {
  date: string; // YYYY-MM-DD
  topic: string;
  contentType: ContentType;
  angle: Angle;
}

// ISO tarihe gün ekle (UTC, saf — DST sürüklenmesi yok).
export function addDaysISO(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export interface SuggestOptions {
  sector: SectorId;
  startDate: string; // YYYY-MM-DD
  count?: number; // kaç içerik (varsayılan 5)
  spacingDays?: number; // günler arası boşluk (varsayılan 1)
  angleScores?: Partial<Record<Angle, number>>; // feedback net skorları (yüksek = iyi)
}

// Feedback'i yüksek açıları öne alır; aynı açıyı ardışık tekrarlamaktan kaçınır.
export function suggestWeeklyPlan(opts: SuggestOptions): PlanSuggestion[] {
  const { sector, startDate, count = 5, spacingDays = 1, angleScores = {} } = opts;
  if (count <= 0) return [];

  // Şablonları açı feedback skoruna göre (yüksekten düşüğe) stabil sırala.
  const pool = templatesFor(sector)
    .map((t, i) => ({ t, i }))
    .sort((a, b) => {
      const sa = angleScores[a.t.angle] ?? 0;
      const sb = angleScores[b.t.angle] ?? 0;
      return sb - sa || a.i - b.i; // eşitlikte özgün sıra korunur
    })
    .map((x) => x.t);

  const out: PlanSuggestion[] = [];
  let cursor = 0;
  let lastAngle: Angle | null = null;

  for (let n = 0; n < count; n++) {
    // Ardışık aynı açıdan kaçınmak için havuzda bir sonraki uygun şablonu ara.
    let picked = pool[cursor % pool.length];
    if (pool.length > 1 && picked.angle === lastAngle) {
      for (let k = 1; k < pool.length; k++) {
        const cand = pool[(cursor + k) % pool.length];
        if (cand.angle !== lastAngle) {
          picked = cand;
          cursor += k;
          break;
        }
      }
    }
    out.push({
      date: addDaysISO(startDate, n * spacingDays),
      topic: picked.topic,
      contentType: picked.contentType,
      angle: picked.angle,
    });
    lastAngle = picked.angle;
    cursor += 1;
  }
  return out;
}
