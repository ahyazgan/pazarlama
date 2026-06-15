import type { ContentPackage, SectorId } from "./types";

// ============================================================================
// Governance / uyumluluk denetimi (ajansın hukuk/kalite gözden geçirmesi).
// Riskli/regüle iddiaları yakalar. Saf, deterministik (test edilebilir).
// Hukuki tavsiye değildir; insan onayı için işaretleme yapar.
// ============================================================================

export interface ComplianceIssue {
  term: string;
  reason: string;
}

// Genel riskli iddialar (ispatsız üstünlük, kesinlik, abartı).
const GENERIC: { pattern: RegExp; reason: string }[] = [
  { pattern: /\ben iyi\b|\bbir numara\b|\blider\b|\brakipsiz\b|\bpiyasanın en\b/i, reason: "İspatsız üstünlük iddiası (kanıt/kaynak gerekir)" },
  { pattern: /%\s?100|\bkesinlikle\b|\bher zaman\b|\bhiçbir zaman\b|\bgaranti ediyoruz\b/i, reason: "Mutlak/kesinlik iddiası — abartı riski" },
  { pattern: /\bmucize\b|\bsihirli\b|\banında çözüm\b/i, reason: "Abartılı/aldatıcı vaat" },
  { pattern: /\bbedava\b|\bücretsiz kazan\b/i, reason: "Aldatıcı 'bedava' algısı (koşulları net değilse)" },
];

// Sektöre özel regüle alanlar.
const SECTOR: Partial<Record<SectorId, { pattern: RegExp; reason: string }[]>> = {
  guzellik: [
    { pattern: /\btedavi eder\b|\biyileştirir\b|\bhastalı|\bdoktor onaylı\b|\bklinik olarak kanıtlanmış\b/i, reason: "Medikal/tıbbi iddia — kozmetikte yasak (sağlık beyanı)" },
    { pattern: /\bkalıcı\b.*\bsonuç\b|\b1 günde\b/i, reason: "Gerçekçi olmayan kalıcı/hızlı sonuç vaadi" },
  ],
  hizmet: [
    { pattern: /\bgarantili getiri\b|\brisksiz\b|\bkesin kazanç\b|\bzengin ol\b/i, reason: "Finansal garanti/risksiz getiri iddiası — regülasyon riski" },
  ],
  insaat: [
    { pattern: /%\s?100 güvenli|\bdeprem garantisi\b|\bhiç hata yapmaz\b|\bsıfır risk\b/i, reason: "Güvenlik/standart konusunda mutlak iddia — yanıltıcı/risla" },
  ],
  eticaret: [
    { pattern: /\ben ucuz garantisi\b|\bpiyasanın en ucuzu\b/i, reason: "İspatsız fiyat üstünlüğü garantisi" },
  ],
};

function scanText(text: string, sector: SectorId): ComplianceIssue[] {
  const out: ComplianceIssue[] = [];
  const rules = [...GENERIC, ...(SECTOR[sector] ?? [])];
  for (const r of rules) {
    const m = text.match(r.pattern);
    if (m) out.push({ term: m[0], reason: r.reason });
  }
  return out;
}

function packageBlob(pkg: ContentPackage): string {
  const o = pkg.outputs;
  return [
    o.instagram.caption,
    o.instagram.firstComment,
    o.tiktok.hook,
    o.tiktok.cta,
    o.linkedin.hookLine,
    o.linkedin.body,
    o.linkedin.insight,
    o.linkedin.discussionQuestion,
    ...o.x.thread,
    ...(o.variants?.captions ?? []),
  ].join(" \n ");
}

// Paket için uyumluluk denetimi (benzersiz iddialar).
export function complianceForPackage(pkg: ContentPackage, sector: SectorId): ComplianceIssue[] {
  const found = scanText(packageBlob(pkg), sector);
  const seen = new Set<string>();
  return found.filter((i) => {
    const k = i.term.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// Tek metin için (reklam/SEO/e-posta gibi diğer motorlar da kullanabilir).
export function complianceForText(text: string, sector: SectorId): ComplianceIssue[] {
  return scanText(text, sector);
}
