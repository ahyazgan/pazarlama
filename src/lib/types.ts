// ============================================================================
// Content OS — Cekirdek tipler
// Constitution Bolum 2 (Marka Beyni) + Bolum 7 (Veri Modeli) ile hizali.
// ============================================================================

export type SectorId =
  | "insaat"
  | "kafe"
  | "eticaret"
  | "hizmet"
  | "guzellik";

export type ContentType = "deger" | "urun" | "hikaye" | "kanit" | "satis";

export type Angle =
  | "korku"
  | "kazanc"
  | "sosyal_kanit"
  | "egitici"
  | "karsitlik";

export type PlatformId = "instagram" | "tiktok" | "linkedin" | "x";

// --- Marka Beyni (5 katman) ---------------------------------------------------

export interface BrandIdentity {
  mission: string; // misyon: ne icin varsin?
  valueProp: string; // deger onerisi: neden sen?
  personality: string[]; // 5 sifat
  competitors?: string[]; // rakipler
  differentiation?: string; // neden onlardan farkliyiz (karsitlik acisini besler)
  primaryColor?: string; // marka ana rengi (hex) — gorsel prompt'ta kullanilir
  visualStyle?: string; // gorsel stil notu (ör. minimal, sicak, teknik)
  story?: string; // marka hikayesi / kurulus "neden"i — ozgunluk katar
  ctaGoal?: string; // donusum hedefi (ör. "DM at", "teklif al", "siteyi ziyaret et")
}

export interface BrandVoice {
  tone: number; // 0 (resmi) -> 10 (samimi)
  sentenceStyle: string; // cumle yapisi tercihi
  bannedWords: string[]; // yasak kelimeler
  signaturePhrases: string[]; // imza ifadeler
  goodExamples?: string[]; // markanin gercek "iyi" gonderileri (few-shot voice ogrenme)
  badExamples?: string[]; // "boyle yazma" — negatif ornek
}

export interface Persona {
  name: string;
  pain: string; // aci
  motivation: string; // motivasyon
  objections?: string; // itirazlar / satin almama nedenleri
  vocabulary?: string; // personanin kendi kullandigi kelimeler
  triggers?: string; // satin alma tetikleyicileri
}

export interface BrandProof {
  numbers: string[]; // gercek rakamlar
  cases: string[]; // vaka ornekleri
  references: string[]; // sosyal kanit / referanslar
}

export interface BrandGovernance {
  extraBannedClaims?: string[]; // markaya özel yasak/riskli iddialar
  requiredDisclaimers?: string[]; // her içerikte bulunması gereken zorunlu ibareler
}

export interface Brand {
  id?: string;
  name: string;
  sector: SectorId;
  identity: BrandIdentity;
  voice: BrandVoice;
  audience: Persona[];
  proof: BrandProof;
  pillars?: string[]; // icerik sutunlari — markanin sahip oldugu tekrar eden temalar
  governance?: BrandGovernance; // markaya özel governance kuralları
}

// --- Sektor Zekasi (sistem verisi) -------------------------------------------

export interface SectorIntelligence {
  sector: SectorId;
  label: string;
  terminology: string[]; // terim sozlugu
  contentMix: Record<ContentType, number>; // toplam 100
  hooks: string[]; // hook formulleri
  seasonality: string; // mevsimsellik notu
  platformEmphasis: PlatformId[]; // sektore gore oncelikli platform sirasi (en onemli ilk)
  angleAffinity: Angle[]; // sektorde en cok donus veren aci sirasi (en guclu ilk)
  knowledge?: SectorKnowledge; // derin bilgi tabani (mevzuat/hata/benchmark)
  defaultDisclaimers: string[]; // sektor icin onerilen zorunlu ibareler
}

export interface SectorKnowledge {
  regulations: string[]; // mevzuat / standart / uyum noktalari
  commonMistakes: string[]; // sektorde sik yapilan hatalar
  benchmarks: string[]; // kiyas/olcut bilgileri (genel, marka-disi)
}

// --- Uretim cikti paketi -----------------------------------------------------

export interface InstagramOutput {
  caption: string;
  firstComment: string; // hashtag yorumu
  imagePrompt: string;
  altText: string;
}

export interface TikTokScene {
  timecode: string; // or. "0-3sn"
  shot: string; // sahne / kamera
  voiceover: string; // konusma / ekran metni
}

export interface TikTokOutput {
  hook: string; // 0-3sn pattern interrupt
  scenes: TikTokScene[];
  soundSuggestion: string;
  cta: string;
}

export interface LinkedInOutput {
  hookLine: string;
  body: string;
  insight: string;
  discussionQuestion: string;
}

export interface XOutput {
  thread: string[]; // tweet 1..n
}

export interface ContentVariants {
  captions: string[]; // IG caption alternatifleri (A/B)
  tiktokHooks: string[]; // TikTok hook alternatifleri
  xOpeners: string[]; // X açılış tweet alternatifleri
}

export interface ContentOutputs {
  instagram: InstagramOutput;
  tiktok: TikTokOutput;
  linkedin: LinkedInOutput;
  x: XOutput;
  variants?: ContentVariants; // A/B test alternatifleri (opsiyonel — eski çıktılarla uyum)
}

export interface CritiqueIssue {
  where: string;
  severity: "dusuk" | "orta" | "yuksek";
  problem: string;
  fix: string;
}

export interface CritiqueResult {
  score: number;
  verdict: string;
  issues: CritiqueIssue[];
}

// Araştırma katmanı: doğrulanabilir dış bilgi + kaynaklar.
export interface Source {
  title: string;
  url: string;
  note?: string; // bu kaynaktan alınan kilit bilgi
}

export interface ResearchBrief {
  topic: string;
  findings: string[]; // doğrulanmış kilit bulgular
  sources: Source[]; // atıflar
  competitorGap?: string; // rakiplerin atladığı açı
  generatedAt?: string; // ISO
}

// Reklam metni (paid media creative — bütçe yönetimi DEĞİL, yalnızca kreatif).
export type AdObjective = "trafik" | "donusum" | "etkilesim" | "bilinirlik";

export interface AdCopy {
  meta: {
    primaryTexts: string[]; // Meta birincil metin varyantları
    headlines: string[]; // başlık varyantları (~40 karakter)
    descriptions: string[]; // açıklama varyantları (~30 karakter)
    cta: string; // önerilen buton (ör. "Teklif Al")
  };
  google: {
    headlines: string[]; // Google başlıkları (≤30 karakter, 3-5 adet)
    descriptions: string[]; // Google açıklamaları (≤90 karakter, 2 adet)
  };
  audience: string; // hedef-kitle önerisi (ilgi/demografi/davranış)
}

export interface AdsRequest {
  brand: Brand;
  topic: string;
  objective: AdObjective;
  personaIndex: number;
  demo?: boolean;
}

// SEO içerik (blog/uzun-form + meta).
export interface SeoOutline {
  h2: string;
  points: string[];
}

export interface SeoContent {
  title: string; // SEO başlığı (~60 karakter)
  metaDescription: string; // ~155 karakter
  primaryKeyword: string;
  keywords: string[]; // ikincil/uzun-kuyruk anahtar kelimeler
  outline: SeoOutline[]; // H2 + alt maddeler
  intro: string; // giriş paragrafı
}

export interface SeoRequest {
  brand: Brand;
  topic: string;
  primaryKeyword?: string;
  demo?: boolean;
}

// E-posta / funnel metni.
export type SequenceType = "hosgeldin" | "nurture" | "kampanya";

export interface EmailMessage {
  subject: string;
  preview: string; // preheader
  body: string;
  cta: string;
}

export interface EmailKit {
  emails: EmailMessage[];
  landingHeadline: string;
  landingSubhead: string;
  landingBullets: string[];
  landingCta: string;
}

export interface EmailRequest {
  brand: Brand;
  topic: string;
  sequenceType: SequenceType;
  personaIndex: number;
  demo?: boolean;
}

// Topluluk yönetimi: yorum/DM yanıt taslakları.
export interface ReplyDrafts {
  drafts: string[];
}

export interface ReplyRequest {
  brand: Brand;
  comment: string;
  personaIndex: number;
  demo?: boolean;
}

export interface GenerateRequest {
  brand: Brand;
  topic: string;
  contentType: ContentType;
  angle: Angle;
  personaIndex: number;
  demo?: boolean; // true ise API anahtari olmadan sablon (demo) cikti uretilir
  trend?: string; // opsiyonel guncel trend/haber — icerik buna baglanir (Trend Enjeksiyonu)
  research?: ResearchBrief; // opsiyonel araştırma bulguları (grounding)
}

export interface ContentPackage {
  topic: string;
  contentType: ContentType;
  angle: Angle;
  outputs: ContentOutputs;
  demo?: boolean; // sablon (demo) icerik mi?
  platformEmphasis?: PlatformId[]; // sektore gore onerilen platform sirasi (cikti vurgusu)
  sources?: Source[]; // araştırma kullanıldıysa atıflar
}

// Coklu persona uretimi: her persona icin ayri paket (Constitution Katman 3).
export interface PersonaPackage {
  personaName: string;
  pkg: ContentPackage;
}

// --- UI yardimci etiketleri ---------------------------------------------------

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  deger: "Deger",
  urun: "Urun",
  hikaye: "Hikaye",
  kanit: "Kanit",
  satis: "Satis",
};

export const ANGLE_LABELS: Record<Angle, string> = {
  korku: "Korku",
  kazanc: "Kazanc",
  sosyal_kanit: "Sosyal Kanit",
  egitici: "Egitici",
  karsitlik: "Karsitlik",
};

export const ANGLE_HINTS: Record<Angle, string> = {
  korku: "Kayip / risk vurgusu (ör. geç teslimat = ceza)",
  kazanc: "Somut kazanc vurgusu (ör. 2 gün erken = bonus)",
  sosyal_kanit: "Kalabalik / referans (ör. 500 müsteri neden bizi seçti)",
  egitici: "Ögretici, faydali bilgi (ör. teslimati etkileyen 5 faktör)",
  karsitlik: "Biz vs onlar kiyaslamasi (ör. onlar 1 hafta, biz 2 gün)",
};

export const PLATFORM_LABELS: Record<PlatformId, string> = {
  instagram: "Instagram",
  tiktok: "TikTok / Reels",
  linkedin: "LinkedIn",
  x: "X / Twitter",
};
