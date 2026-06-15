import type { Brand, ContentPackage, SectorId } from "./types";

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

// --- Marka ses-uyum skoru ---------------------------------------------------
export interface VoiceFit {
  score: number; // 0-100
  notes: string[];
}

// Yasak kelime ihlali, imza ifade kullanımı, emoji disiplini, kanıt kullanımını
// tek uyum skorunda topla (deterministik).
export function voiceFit(pkg: ContentPackage, brand: Brand): VoiceFit {
  const blob = packageBlob(pkg).toLowerCase();
  const notes: string[] = [];
  let score = 100;

  const banned = (brand.voice.bannedWords ?? []).map((w) => w.trim().toLowerCase()).filter(Boolean);
  const bannedHits = banned.filter((w) => blob.includes(w));
  if (bannedHits.length) {
    score -= 25 * bannedHits.length;
    notes.push(`Yasak kelime kullanılmış: ${bannedHits.join(", ")}`);
  }

  const sigs = (brand.voice.signaturePhrases ?? []).map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (sigs.length && !sigs.some((s) => blob.includes(s))) {
    score -= 15;
    notes.push("İmza ifade hiç kullanılmamış");
  }

  const nums = (brand.proof.numbers ?? []).map((n) => (n.match(/[\d.]+/)?.[0] ?? "")).filter((x) => x.length >= 2);
  if (nums.length && !nums.some((n) => blob.includes(n))) {
    score -= 10;
    notes.push("Gerçek kanıt rakamı işlenmemiş");
  }

  // Ton-emoji uyumu: resmi tonda (≤3) emoji olmamalı.
  const emojiCount = (packageBlob(pkg).match(/\p{Extended_Pictographic}/gu) ?? []).length;
  if (brand.voice.tone <= 3 && emojiCount > 0) {
    score -= 10;
    notes.push(`Resmi tonda ${emojiCount} emoji (ton sapması)`);
  }

  score = Math.max(0, Math.min(100, score));
  if (!notes.length) notes.push("Ses/ton uyumu temiz");
  return { score, notes };
}

// --- Birleşik governance notu (A–D) -----------------------------------------
export interface GovernanceInput {
  issues: number; // lint
  compliance: number; // hukuk riski (bloklayıcı)
  safety: number; // marka güvenliği (bloklayıcı)
  readability: number;
  access: number;
  voiceScore: number; // 0-100
  brain: number; // 0-100
}
export interface GovernanceGrade {
  grade: "A" | "B" | "C" | "D";
  score: number; // 0-100
  blocking: boolean;
  label: string;
}

export function governanceGrade(g: GovernanceInput): GovernanceGrade {
  const blocking = g.compliance + g.safety > 0;
  if (blocking) {
    return {
      grade: "D",
      score: Math.min(40, Math.round(g.voiceScore * 0.4)),
      blocking: true,
      label: "Yayın öncesi düzelt — hukuk/marka riski",
    };
  }
  const penalty = g.issues * 8 + g.readability * 5 + g.access * 5;
  const quality = Math.max(0, 100 - penalty);
  const score = Math.round(g.voiceScore * 0.4 + g.brain * 0.3 + quality * 0.3);
  const grade = score >= 85 ? "A" : score >= 70 ? "B" : score >= 50 ? "C" : "D";
  const label =
    grade === "A"
      ? "Yayına hazır"
      : grade === "B"
        ? "İyi — küçük rötuşlar"
        : grade === "C"
          ? "Geliştirilmeli"
          : "Yayın öncesi elden geçir";
  return { grade, score, blocking: false, label };
}

// --- Marka güvenliği (brand safety) -----------------------------------------
export interface SafetyIssue {
  term: string;
  reason: string;
}

const PROFANITY = ["aptal", "salak", "gerizekalı", "rezil", "berbat"];
const SENSITIVE = ["siyaset", "politik", "parti ", "iktidar", "muhalefet", "din ", "dini ", "irk", "etnik", "mezhep"];
const DISPARAGE = ["rakipler berbat", "diğerleri çöp", "hepsi dolandırıcı", "rakip kötü", "onlar beceriksiz"];

export function brandSafety(pkg: ContentPackage): SafetyIssue[] {
  const blob = packageBlob(pkg).toLowerCase();
  const out: SafetyIssue[] = [];
  for (const w of PROFANITY) if (blob.includes(w)) out.push({ term: w, reason: "Aşağılayıcı/argo ifade" });
  for (const w of SENSITIVE) if (blob.includes(w)) out.push({ term: w.trim(), reason: "Hassas konu (siyaset/din/etnik) — marka güvenliği riski" });
  for (const w of DISPARAGE) if (blob.includes(w)) out.push({ term: w, reason: "Rakip karalama — itibar/hukuk riski" });
  return out;
}

// --- Erişilebilirlik ---------------------------------------------------------
export interface AccessibilityIssue {
  where: string;
  detail: string;
}

export function accessibilityForPackage(pkg: ContentPackage): AccessibilityIssue[] {
  const out: AccessibilityIssue[] = [];
  const alt = pkg.outputs.instagram.altText.trim();
  if (alt.length < 15) {
    out.push({ where: "Instagram alt-text", detail: "eksik/yetersiz (görme engelliler için açıklayıcı olmalı)" });
  }
  const cap = pkg.outputs.instagram.caption;
  const letters = cap.replace(/[^A-Za-zÇĞİÖŞÜçğıöşü]/g, "");
  const upper = cap.replace(/[^A-ZÇĞİÖŞÜ]/g, "");
  if (letters.length > 20 && upper.length / letters.length > 0.6) {
    out.push({ where: "Instagram caption", detail: "aşırı BÜYÜK HARF (bağırma/erişilebilirlik sorunu)" });
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

// Paket için uyumluluk denetimi (benzersiz iddialar) + markaya özel yasak iddialar.
export function complianceForPackage(
  pkg: ContentPackage,
  sector: SectorId,
  extraBanned: string[] = [],
): ComplianceIssue[] {
  const blob = packageBlob(pkg);
  const found = scanText(blob, sector);
  const lower = blob.toLowerCase();
  for (const c of extraBanned.map((x) => x.trim()).filter(Boolean)) {
    if (lower.includes(c.toLowerCase())) {
      found.push({ term: c, reason: "Markaya özel yasak iddia" });
    }
  }
  const seen = new Set<string>();
  return found.filter((i) => {
    const k = i.term.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// Zorunlu ibare (disclaimer) denetimi: her gerekli ibare metinde var mı?
export function disclaimerIssues(pkg: ContentPackage, required: string[] = []): ComplianceIssue[] {
  const lower = packageBlob(pkg).toLowerCase();
  return required
    .map((d) => d.trim())
    .filter(Boolean)
    .filter((d) => !lower.includes(d.toLowerCase()))
    .map((d) => ({ term: d, reason: "Zorunlu ibare eksik (markaya özel)" }));
}

// Tek metin için (reklam/SEO/e-posta gibi diğer motorlar da kullanabilir).
export function complianceForText(text: string, sector: SectorId): ComplianceIssue[] {
  return scanText(text, sector);
}

// --- Okunabilirlik ----------------------------------------------------------
export interface ReadabilityIssue {
  where: string;
  detail: string;
}

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Çok uzun cümle / duvar metin uyarıları (kısa-net marka dili için).
export function readabilityForPackage(pkg: ContentPackage): ReadabilityIssue[] {
  const fields: [string, string][] = [
    ["Instagram caption", pkg.outputs.instagram.caption],
    ["LinkedIn gövde", pkg.outputs.linkedin.body],
  ];
  const out: ReadabilityIssue[] = [];
  for (const [where, text] of fields) {
    const ss = sentences(text);
    const longCount = ss.filter((s) => s.split(/\s+/).length > 25).length;
    if (longCount > 0) {
      out.push({ where, detail: `${longCount} çok uzun cümle (>25 kelime) — böl/kısalt` });
    }
  }
  return out;
}
