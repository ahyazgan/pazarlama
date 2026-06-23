import type { DashboardData } from "./dashboard";

// ============================================================================
// "Sıradaki en iyi aksiyon" — panodaki hazırlık verisini önceliklendirilmiş
// yapılacaklar listesine çevirir. Kullanıcı "neyi düzeltsem en çok kazanırım?"
// sorusunu tek bakışta görür ve ilgili ekrana gider. Saf, deterministik.
// ============================================================================

export type ActionSeverity = "yuksek" | "orta" | "dusuk";

export interface ActionItem {
  id: string;
  title: string; // ne yapılmalı
  detail?: string; // nasıl yapılır (ipucu)
  severity: ActionSeverity;
  priority: number; // azalan sıralama anahtarı (yüksek = önce)
  href: string; // ilgili ekran
}

const SEVERITY_RANK: Record<ActionSeverity, number> = {
  yuksek: 1000,
  orta: 500,
  dusuk: 100,
};

export function buildActions(data: DashboardData): ActionItem[] {
  const items: ActionItem[] = [];

  // Hiç marka yoksa: tek ve en yüksek öncelikli aksiyon.
  if (data.brandCount === 0) {
    return [
      {
        id: "no-brand",
        title: "İlk markanı oluştur",
        detail: "5 adımlık hızlı kurulumla marka beynini doldur.",
        severity: "yuksek",
        priority: SEVERITY_RANK.yuksek + 100,
        href: "/onboarding",
      },
    ];
  }

  // Zayıf/eksik marka beyinleri — düşük skor daha yüksek öncelik.
  for (const b of data.brands) {
    if (b.score >= 70) continue; // yeterince güçlü
    const severity: ActionSeverity = b.score < 45 ? "yuksek" : "orta";
    const name = b.brand.name || "(isimsiz marka)";
    items.push({
      id: `brain-${b.brand.id ?? name}`,
      title: b.topMissing
        ? `${name}: beyni güçlendir — ${b.topMissing}`
        : `${name}: marka beynini geliştir`,
      detail: b.topMissingHint ?? undefined,
      severity,
      // Skor düştükçe öncelik artar (60 - score katkısı).
      priority: SEVERITY_RANK[severity] + Math.max(0, 60 - b.score),
      href: "/brand",
    });
  }

  // Yayına hazır olmayan paketler.
  const notReady = data.packageCount - data.readyCount;
  if (notReady > 0) {
    items.push({
      id: "pkg-not-ready",
      title: `${notReady} paket yayına hazır değil`,
      detail: "Kütüphanede uyarıları gider veya marka beynini güçlendir.",
      severity: "orta",
      priority: SEVERITY_RANK.orta + Math.min(notReady, 50),
      href: "/library",
    });
  }

  // Kalite uyarısı taşıyan paketler (alt metin, okunabilirlik, güvenlik).
  const withIssues = data.packages.filter((p) => p.issues > 0).length;
  if (withIssues > 0) {
    items.push({
      id: "pkg-issues",
      title: `${withIssues} pakette kalite uyarısı var`,
      detail: "Erişilebilirlik/okunabilirlik/güvenlik uyarılarını düzelt.",
      severity: "dusuk",
      priority: SEVERITY_RANK.dusuk + Math.min(withIssues, 50),
      href: "/library",
    });
  }

  return items.sort((a, b) => b.priority - a.priority);
}
