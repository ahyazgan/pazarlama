// ============================================================================
// Yayına hazırlık skoru — beyin doluluğu + kalite-lint sorunlarını birleştirir.
// "Bu paketi yayınlayabilir miyim?" sorusunu tek bakışta yanıtlar. Saf fonksiyon.
// ============================================================================

export type ReadinessLevel = "hazir" | "neredeyse" | "gelismeli";

export interface Readiness {
  level: ReadinessLevel;
  label: string;
  ready: boolean;
}

export function readiness(brainScore: number, issueCount: number): Readiness {
  if (brainScore >= 60 && issueCount === 0) {
    return { level: "hazir", label: "Yayına hazır", ready: true };
  }
  if (brainScore >= 45 && issueCount <= 2) {
    return {
      level: "neredeyse",
      label: "Neredeyse hazır — küçük düzeltmeler",
      ready: false,
    };
  }
  return {
    level: "gelismeli",
    label: "Geliştirilmeli — beyni doldur / uyarıları gider",
    ready: false,
  };
}
