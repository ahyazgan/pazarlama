import type { Brand, ContentPackage } from "./types";
import { ANGLE_LABELS, CONTENT_TYPE_LABELS, PLATFORM_LABELS } from "./types";
import { getSector } from "./sectors";
import { fields } from "./quality";

// ============================================================================
// "NEDEN BU İÇERİK?" — kanıt-temelli gerekçe.
// Yüzeysel bilgi dökümü değil: üretilen paketi sektör zekası + marka beyniyle
// ÇAPRAZLAR. Hangi sektör terimleri gerçekten kullanılmış, hangi kanıt/imza
// ifadeleri geçmiş, hangi yasak kelimeler kaçınılmış, hangi mevzuat/benchmark
// kararı beslemiş — hepsi metne dayalı. Saf/test edilebilir.
// ============================================================================

export interface RationaleSection {
  title: string;
  items: string[];
  tone?: "ok" | "warn"; // görsel vurgu için
}

export interface Rationale {
  sections: RationaleSection[];
}

const norm = (s: string) => s.toLowerCase();

// Bir kanıt rakamının sayısal çekirdeği metinde geçiyor mu? (quality.ts ile aynı mantık)
function numberUsed(num: string, blob: string): boolean {
  const token = (num.match(/[\d.]+/)?.[0] ?? num).toLowerCase();
  return token.length >= 2 && blob.includes(token);
}

export function buildRationale(pkg: ContentPackage, brand: Brand): Rationale {
  const sector = getSector(brand.sector);
  const blob = norm(fields(pkg).map((f) => f.text).join(" \n "));
  const sections: RationaleSection[] = [];

  // 1) Strateji kararı
  const affinityRank = sector.angleAffinity.indexOf(pkg.angle);
  const angleWhy =
    affinityRank === 0
      ? "sektörde en güçlü dönüş veren açı"
      : affinityRank > 0
        ? `sektörün güçlü açılarından (sıra ${affinityRank + 1})`
        : "konuya özgü seçim";
  const mixShare = sector.contentMix[pkg.contentType] ?? 0;
  sections.push({
    title: "Strateji kararı",
    items: [
      `Açı: ${ANGLE_LABELS[pkg.angle]} — ${angleWhy}.`,
      `İçerik tipi: ${CONTENT_TYPE_LABELS[pkg.contentType]} — sektör içerik karışımında %${mixShare} pay.`,
      `Platform önceliği: ${sector.platformEmphasis.map((p) => PLATFORM_LABELS[p]).join(" › ")}.`,
    ],
  });

  // 2) Sektör zekası izi (metne dayalı)
  const usedTerms = sector.terminology.filter((t) => blob.includes(norm(t)));
  sections.push({
    title: "Sektör zekası izi",
    tone: usedTerms.length ? "ok" : "warn",
    items: usedTerms.length
      ? [`Metinde geçen sektör terimleri (${usedTerms.length}): ${usedTerms.join(", ")}.`]
      : ["Belirgin sektör terimi tespit edilmedi — terminolojiyi güçlendirmeyi düşün."],
  });

  // 3) Marka beyni izi (metne dayalı)
  const brainItems: string[] = [];
  const usedSig = (brand.voice.signaturePhrases ?? []).filter((s) => s && blob.includes(norm(s)));
  if (usedSig.length) brainItems.push(`Kullanılan imza ifade: ${usedSig.join(" · ")}.`);
  const usedNums = (brand.proof.numbers ?? []).filter((n) => n && numberUsed(n, blob));
  if (usedNums.length) brainItems.push(`Metne işlenen gerçek kanıt: ${usedNums.join(", ")}.`);
  const banned = [
    ...(brand.voice.bannedWords ?? []),
    ...(brand.governance?.extraBannedClaims ?? []),
  ].filter(Boolean);
  const bannedHit = banned.filter((w) => blob.includes(norm(w)));
  if (banned.length) {
    brainItems.push(
      bannedHit.length
        ? `⚠ Yasak kelime geçti: ${bannedHit.join(", ")} — düzeltilmeli.`
        : `Yasak kelimelerden kaçınıldı (${banned.length} kural).`,
    );
  }
  if (!brainItems.length) brainItems.push("Marka izi zayıf — imza ifade ve kanıt rakamı eklenebilir.");
  sections.push({
    title: "Marka beyni izi",
    tone: bannedHit.length ? "warn" : "ok",
    items: brainItems,
  });

  // 4) Mevzuat & uyum
  const disclaimers = [
    ...(brand.governance?.requiredDisclaimers ?? []),
    ...sector.defaultDisclaimers,
  ].filter((d, i, a) => d && a.indexOf(d) === i);
  const complianceItems: string[] = [];
  if (sector.knowledge?.regulations?.length) {
    complianceItems.push(`Dikkat edilen mevzuat: ${sector.knowledge.regulations.join("; ")}.`);
  }
  if (disclaimers.length) {
    const applied = disclaimers.filter((d) => blob.includes(norm(d)));
    complianceItems.push(
      `Zorunlu/önerilen ibareler: ${disclaimers.join(" | ")}` +
        (applied.length ? ` (metinde uygulanan: ${applied.length}/${disclaimers.length}).` : "."),
    );
  }
  if (complianceItems.length) {
    sections.push({ title: "Mevzuat & uyum", items: complianceItems });
  }

  // 5) Kaçınılan yaygın hatalar
  if (sector.knowledge?.commonMistakes?.length) {
    sections.push({
      title: "Kaçınılan yaygın hatalar",
      items: sector.knowledge.commonMistakes,
    });
  }

  // 6) Benchmark dayanağı
  if (sector.knowledge?.benchmarks?.length) {
    sections.push({
      title: "Benchmark dayanağı",
      items: sector.knowledge.benchmarks,
    });
  }

  // 7) Araştırma kaynakları (varsa)
  if (pkg.sources?.length) {
    sections.push({
      title: "Araştırma dayanağı",
      tone: "ok",
      items: [`İçerik ${pkg.sources.length} araştırma kaynağıyla temellendirildi.`],
    });
  }

  return { sections };
}
