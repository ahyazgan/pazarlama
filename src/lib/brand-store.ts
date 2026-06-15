"use client";

import type { Brand, ContentType, SectorId } from "./types";

// ============================================================================
// Marka Beyni saklama (MVP).
// Birincil: localStorage (her zaman calisir).
// Supabase yapilandirilmissa ek olarak oraya da yazilir (best-effort).
// Bu sayede uretim endpoint'i DB'ye bagimli olmaz; marka body ile gecer.
// ============================================================================

const KEY = "content-os.brand"; // eski tek-marka anahtari (migrasyon kaynagi)
const MULTI_KEY = "content-os.brands"; // {brands, activeId}

export interface BrandStore {
  brands: Brand[];
  activeId: string | null;
}

export function genBrandId(): string {
  return `b-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// --- Pure yardımcılar (test edilebilir) --------------------------------------

export function pickActiveBrand(store: BrandStore): Brand | null {
  if (!store.brands.length) return null;
  return store.brands.find((b) => b.id === store.activeId) ?? store.brands[0];
}

export function upsertBrandList(brands: Brand[], brand: Brand): Brand[] {
  const idx = brands.findIndex((b) => b.id === brand.id);
  if (idx === -1) return [...brands, brand];
  const next = [...brands];
  next[idx] = brand;
  return next;
}

export function removeBrandFromList(brands: Brand[], id: string): Brand[] {
  return brands.filter((b) => b.id !== id);
}

export function emptyBrand(): Brand {
  return {
    name: "",
    sector: "insaat" as SectorId,
    identity: {
      mission: "",
      valueProp: "",
      personality: ["", "", "", "", ""],
      competitors: [""],
      differentiation: "",
      primaryColor: "#E8650A",
      visualStyle: "",
      story: "",
      ctaGoal: "",
    },
    voice: {
      tone: 5,
      sentenceStyle: "",
      bannedWords: [""],
      signaturePhrases: [""],
      goodExamples: [""],
      badExamples: [""],
    },
    audience: [
      { name: "", pain: "", motivation: "", objections: "", vocabulary: "", triggers: "" },
    ],
    proof: { numbers: [""], cases: [""], references: [""] },
    pillars: [""],
  };
}

// Çok-marka store'u yükle; eski tek-marka kaydını otomatik migrate et.
export function loadBrandStore(): BrandStore {
  if (typeof window === "undefined") return { brands: [], activeId: null };
  try {
    const raw = window.localStorage.getItem(MULTI_KEY);
    if (raw) return JSON.parse(raw) as BrandStore;
  } catch {
    /* ignore */
  }
  // Migrasyon: eski tek marka varsa store'a taşı.
  try {
    const old = window.localStorage.getItem(KEY);
    if (old) {
      const b = JSON.parse(old) as Brand;
      if (!b.id) b.id = genBrandId();
      const store: BrandStore = { brands: [b], activeId: b.id };
      window.localStorage.setItem(MULTI_KEY, JSON.stringify(store));
      return store;
    }
  } catch {
    /* ignore */
  }
  return { brands: [], activeId: null };
}

function persistStore(store: BrandStore): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MULTI_KEY, JSON.stringify(store));
}

export function loadBrands(): Brand[] {
  return loadBrandStore().brands;
}

// Aktif marka (geriye dönük uyum: loadBrand eski adı korunur).
export function loadBrand(): Brand | null {
  return pickActiveBrand(loadBrandStore());
}

export function setActiveBrand(id: string): void {
  const store = loadBrandStore();
  if (store.brands.some((b) => b.id === id)) persistStore({ ...store, activeId: id });
}

// Markayı kaydet (id yoksa üret), upsert et ve aktif yap.
export function saveBrandLocal(brand: Brand): Brand {
  const withId = brand.id ? brand : { ...brand, id: genBrandId() };
  const store = loadBrandStore();
  persistStore({ brands: upsertBrandList(store.brands, withId), activeId: withId.id! });
  return withId;
}

export function deleteBrand(id: string): BrandStore {
  const store = loadBrandStore();
  const brands = removeBrandFromList(store.brands, id);
  const activeId = store.activeId === id ? (brands[0]?.id ?? null) : store.activeId;
  const next = { brands, activeId };
  persistStore(next);
  return next;
}

export const HAMMADDEM_SAMPLE: Brand = {
  name: "Hammaddem",
  sector: "insaat",
  identity: {
    mission: "Insaat malzemesi tedarikini hizli, seffaf ve guvenilir hale getirmek.",
    valueProp:
      "Tek pazaryerinden, dogrulanmis tedarikçilerden, zamaninda teslimatla malzeme tedariki.",
    personality: ["guvenilir", "hizli", "seffaf", "teknik", "cozum-odakli"],
    competitors: ["yerel hirdavatçi", "tek tedarikçiyle çalismak"],
    differentiation:
      "Tek pazaryerinde dogrulanmis çok tedarikçi + garantili teslim suresi; tek bir bayiye baglilik yok.",
    primaryColor: "#E8650A",
    visualStyle: "Net, teknik, saha-gerçekçi; turuncu vurgu, beyaz alan.",
    story:
      "Kurucular, santiyede malzeme gecikmesinin projeleri nasil durdurdugunu bizzat yasadi; tedariki seffaf ve garantili hale getirmek icin Hammaddem'i kurdu.",
    ctaGoal: "Teklif al / WhatsApp'tan tedarik sorusu sor",
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
      objections: "Yeni tedarikçiye güvenmek; teslim sözünün tutulmamasi korkusu.",
      vocabulary: "döküm, irsaliye, santiye, hakedis, ceza",
      triggers: "Acil stok ihtiyaci; mevcut tedarikçinin gecikmesi.",
    },
    {
      name: "Satinalma Sorumlusu",
      pain: "Tedarikçi kalitesi ve fiyat seffafligini dogrulamak zor.",
      motivation: "Dogrulanmis tedarikçiyle riski ve evrak yukunu azaltmak.",
      objections: "Fiyatin gizli olmasi; karsilastirma yapamamak.",
      vocabulary: "teklif, KDV, vade, mutabakat, tedarikçi onayi",
      triggers: "Çeyrek bütçe planlama; tek tedarikçi riski.",
    },
  ],
  proof: {
    numbers: ["10.000+ ton teslimat", "30+ sehir", "1.500+ aktif muteahhit"],
    cases: ["Bir konut projesinde 2 günde 400 ton hazir beton tedariki"],
    references: ["500+ muteahhit tarafindan tercih edildi"],
  },
  pillars: ["Tedarik guvenligi", "Saha verimliligi", "Maliyet ve seffaflik"],
};

export const CONTENT_TYPE_FALLBACK: ContentType = "deger";
