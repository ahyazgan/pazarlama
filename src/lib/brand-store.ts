"use client";

import type { Brand, ContentType, SectorId } from "./types";

// ============================================================================
// Marka Beyni saklama (MVP).
// Birincil: localStorage (her zaman calisir).
// Supabase yapilandirilmissa ek olarak oraya da yazilir (best-effort).
// Bu sayede uretim endpoint'i DB'ye bagimli olmaz; marka body ile gecer.
// ============================================================================

const KEY = "content-os.brand";

export function emptyBrand(): Brand {
  return {
    name: "",
    sector: "insaat" as SectorId,
    identity: { mission: "", valueProp: "", personality: ["", "", "", "", ""] },
    voice: {
      tone: 5,
      sentenceStyle: "",
      bannedWords: [""],
      signaturePhrases: [""],
      goodExamples: [""],
      badExamples: [""],
    },
    audience: [{ name: "", pain: "", motivation: "" }],
    proof: { numbers: [""], cases: [""], references: [""] },
  };
}

export function loadBrand(): Brand | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Brand) : null;
  } catch {
    return null;
  }
}

export function saveBrandLocal(brand: Brand): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(brand));
}

export const HAMMADDEM_SAMPLE: Brand = {
  name: "Hammaddem",
  sector: "insaat",
  identity: {
    mission: "Insaat malzemesi tedarikini hizli, seffaf ve guvenilir hale getirmek.",
    valueProp:
      "Tek pazaryerinden, dogrulanmis tedarikçilerden, zamaninda teslimatla malzeme tedariki.",
    personality: ["guvenilir", "hizli", "seffaf", "teknik", "cozum-odakli"],
  },
  voice: {
    tone: 4,
    sentenceStyle: "Kisa, fiil-oncelikli, nokta ile ayrik cumleler.",
    bannedWords: ["ucuz", "bedava"],
    signaturePhrases: ["Santiyeye deger katiyoruz", "Zamaninda, eksiksiz, dogrulanmis"],
    goodExamples: [
      "Beton dökümü bekleyen 3 santiye. Bizden 2 günde tedarik. Gecikme sifir.",
      "Müteahhitin en pahali hatasi: tedarikçiyi son anda aramak. Stok bizde hazir.",
    ],
    badExamples: [
      "Günümüz insaat dünyasinda en uygun fiyatli çözümler için bize ulasin! 🏗️🔥",
    ],
  },
  audience: [
    {
      name: "Saha Mudur (Muteahhit)",
      pain: "Geç gelen malzeme santiyeyi durduruyor, ceza riski doguruyor.",
      motivation: "Teslimati garanti alarak isi zamaninda bitirmek.",
    },
    {
      name: "Satinalma Sorumlusu",
      pain: "Tedarikçi kalitesi ve fiyat seffafligini dogrulamak zor.",
      motivation: "Dogrulanmis tedarikçiyle riski ve evrak yukunu azaltmak.",
    },
  ],
  proof: {
    numbers: ["10.000+ ton teslimat", "30+ sehir", "1.500+ aktif muteahhit"],
    cases: ["Bir konut projesinde 2 günde 400 ton hazir beton tedariki"],
    references: ["500+ muteahhit tarafindan tercih edildi"],
  },
};

export const CONTENT_TYPE_FALLBACK: ContentType = "deger";
