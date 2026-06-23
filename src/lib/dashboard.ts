import type { Brand } from "./types";
import type { LibraryItem } from "./library";
import { brainScore, type BrainScore } from "./brain-score";
import { readiness, type Readiness } from "./readiness";
import {
  brandSafety,
  accessibilityForPackage,
  readabilityForPackage,
} from "./governance";

// ============================================================================
// Yayın-hazırlık paneli — dağınık deterministik motorları (beyin doluluğu +
// kalite/erişilebilirlik/okunabilirlik lint'leri) tek "yayınlayabilir miyim?"
// görünümünde toplar. Saf birleştirme (test edilebilir); yeni bağımlılık yok.
// ============================================================================

export interface BrandSummary {
  brand: Brand;
  score: number;
  level: BrainScore["level"];
  topMissing: string | null; // en yüksek getirili eksik alan (varsa)
}

export interface PackageSummary {
  item: LibraryItem;
  brainScore: number;
  issues: number;
  readiness: Readiness;
}

export interface DashboardData {
  brands: BrandSummary[];
  packages: PackageSummary[];
  brandCount: number;
  packageCount: number;
  readyCount: number; // yayına hazır paket sayısı
}

// Bir paketin yalnızca-paket (markadan bağımsız) deterministik kusur sayısı.
export function packageIssueCount(item: LibraryItem): number {
  return (
    brandSafety(item.pkg).length +
    accessibilityForPackage(item.pkg).length +
    readabilityForPackage(item.pkg).length
  );
}

export function buildDashboard(brands: Brand[], library: LibraryItem[]): DashboardData {
  const brandSummaries: BrandSummary[] = brands.map((brand) => {
    const s = brainScore(brand);
    return {
      brand,
      score: s.score,
      level: s.level,
      topMissing: s.missing[0]?.label ?? null,
    };
  });

  // Paket → ilgili markanın beyin skoru (ada göre eşle; yoksa 0).
  const scoreByName = new Map<string, number>();
  for (const bs of brandSummaries) {
    scoreByName.set((bs.brand.name || "").toLowerCase(), bs.score);
  }

  const packages: PackageSummary[] = library.map((item) => {
    const brain = scoreByName.get((item.brandName || "").toLowerCase()) ?? 0;
    const issues = packageIssueCount(item);
    return { item, brainScore: brain, issues, readiness: readiness(brain, issues) };
  });

  return {
    brands: brandSummaries,
    packages,
    brandCount: brands.length,
    packageCount: library.length,
    readyCount: packages.filter((p) => p.readiness.ready).length,
  };
}
