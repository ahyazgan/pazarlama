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
}

export interface BrandVoice {
  tone: number; // 0 (resmi) -> 10 (samimi)
  sentenceStyle: string; // cumle yapisi tercihi
  bannedWords: string[]; // yasak kelimeler
  signaturePhrases: string[]; // imza ifadeler
}

export interface Persona {
  name: string;
  pain: string; // aci
  motivation: string; // motivasyon
}

export interface BrandProof {
  numbers: string[]; // gercek rakamlar
  cases: string[]; // vaka ornekleri
  references: string[]; // sosyal kanit / referanslar
}

export interface Brand {
  id?: string;
  name: string;
  sector: SectorId;
  identity: BrandIdentity;
  voice: BrandVoice;
  audience: Persona[];
  proof: BrandProof;
}

// --- Sektor Zekasi (sistem verisi) -------------------------------------------

export interface SectorIntelligence {
  sector: SectorId;
  label: string;
  terminology: string[]; // terim sozlugu
  contentMix: Record<ContentType, number>; // toplam 100
  hooks: string[]; // hook formulleri
  seasonality: string; // mevsimsellik notu
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

export interface ContentOutputs {
  instagram: InstagramOutput;
  tiktok: TikTokOutput;
  linkedin: LinkedInOutput;
  x: XOutput;
}

export interface GenerateRequest {
  brand: Brand;
  topic: string;
  contentType: ContentType;
  angle: Angle;
  personaIndex: number;
}

export interface ContentPackage {
  topic: string;
  contentType: ContentType;
  angle: Angle;
  outputs: ContentOutputs;
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
