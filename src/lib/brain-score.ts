import type { Brand } from "./types";

// ============================================================================
// Beyin Doluluk Skoru (brand brain completeness).
// Beyin ancak doldurulduğu kadar iyi. Skor zenginliği görünür/aksiyona dönük
// kılar ve eksik YÜKSEK-GETİRİLİ alanları söyler. Saf fonksiyon (test edilebilir).
// Ağırlıklar, çıktı kalitesine etkiye göre kabaca dağıtıldı.
// ============================================================================

export interface BrainCheck {
  label: string; // alan adı
  points: number; // bu alanın katkısı
  filled: boolean; // dolu mu
  hint: string; // nasıl doldurulur (eksikse gösterilir)
}

export interface BrainScore {
  score: number; // 0-100
  level: "zayif" | "orta" | "iyi" | "guclu";
  checks: BrainCheck[];
  missing: BrainCheck[]; // dolu olmayanlar, getiriye göre azalan
}

const has = (s?: string) => !!s && s.trim().length > 0;
const hasList = (a?: string[]) => !!a && a.filter((x) => has(x)).length > 0;
const countList = (a?: string[]) => (a ?? []).filter((x) => has(x)).length;

export function brainScore(brand: Brand): BrainScore {
  const v = brand.voice;
  const id = brand.identity;
  const p = brand.proof;
  const personas = brand.audience ?? [];
  const firstPersona = personas[0];

  const checks: BrainCheck[] = [
    {
      label: "Marka adı",
      points: 4,
      filled: has(brand.name),
      hint: "Marka adını gir.",
    },
    {
      label: "Misyon",
      points: 6,
      filled: has(id.mission),
      hint: "Ne için var olduğunu bir cümlede yaz.",
    },
    {
      label: "Değer önerisi",
      points: 8,
      filled: has(id.valueProp),
      hint: "Neden sen? Net fayda cümlesi.",
    },
    {
      label: "Kişilik (≥3 sıfat)",
      points: 6,
      filled: countList(id.personality) >= 3,
      hint: "En az 3 kişilik sıfatı ekle.",
    },
    {
      label: "Ses örnekleri (few-shot)",
      points: 16,
      filled: hasList(v.goodExamples),
      hint: "En iyi 2-3 gerçek gönderini yapıştır — sesi asıl bu öğretir.",
    },
    {
      label: "Kaçınılacak örnek",
      points: 5,
      filled: hasList(v.badExamples),
      hint: "'Böyle yazma' diyeceğin bir örnek ekle.",
    },
    {
      label: "Yasak kelimeler",
      points: 3,
      filled: hasList(v.bannedWords),
      hint: "Asla kullanılmasını istemediğin kelimeleri gir.",
    },
    {
      label: "İmza ifadeler",
      points: 4,
      filled: hasList(v.signaturePhrases),
      hint: "Markanın tekrar eden imza cümlelerini ekle.",
    },
    {
      label: "Konumlandırma (fark)",
      points: 10,
      filled: has(id.differentiation) || hasList(id.competitors),
      hint: "Rakipleri ve 'neden farklıyız'ı yaz — karşıtlık açısını besler.",
    },
    {
      label: "Persona (acı + motivasyon)",
      points: 10,
      filled: !!firstPersona && has(firstPersona.pain) && has(firstPersona.motivation),
      hint: "En az bir personanın acısını ve motivasyonunu doldur.",
    },
    {
      label: "Persona derinliği",
      points: 10,
      filled:
        !!firstPersona &&
        (has(firstPersona.objections) ||
          has(firstPersona.vocabulary) ||
          has(firstPersona.triggers)),
      hint: "Personanın itirazları / kullandığı kelimeler / tetikleyicileri ekle.",
    },
    {
      label: "Kanıt (gerçek rakam)",
      points: 12,
      filled: hasList(p.numbers),
      hint: "Gerçek rakamlar ekle (ör. '10.000+ ton') — somut kanıt güven verir.",
    },
    {
      label: "Vaka / referans",
      points: 6,
      filled: hasList(p.cases) || hasList(p.references),
      hint: "Bir vaka örneği veya referans ekle.",
    },
  ];

  const score = checks.reduce((s, c) => s + (c.filled ? c.points : 0), 0);
  const level: BrainScore["level"] =
    score >= 80 ? "guclu" : score >= 60 ? "iyi" : score >= 35 ? "orta" : "zayif";
  const missing = checks
    .filter((c) => !c.filled)
    .sort((a, b) => b.points - a.points);

  return { score, level, checks, missing };
}

export const LEVEL_LABEL: Record<BrainScore["level"], string> = {
  zayif: "Zayıf",
  orta: "Orta",
  iyi: "İyi",
  guclu: "Güçlü",
};
