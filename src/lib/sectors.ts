import type { SectorId, SectorIntelligence } from "./types";

// ============================================================================
// Sektor Zekasi (sector_intelligence seed)
// Constitution Bolum 3 & 11: MVP'de SADECE insaat tam dolu (Hammaddem icin).
// Diger sektorler iskelet olarak var; Faz 2'de zenginlesir.
// Bu, AI'i generic olmaktan cikaran "sektor zekasi" katmanidir.
// ============================================================================

export const SECTORS: Record<SectorId, SectorIntelligence> = {
  insaat: {
    sector: "insaat",
    label: "Insaat / Yapi Malzemesi (B2B)",
    terminology: [
      "agrega",
      "donati",
      "hazir beton",
      "çimento mukavemeti",
      "santiye",
      "müteahhit",
      "tedarik suresi",
      "irsaliye",
      "tonaj",
      "döküm",
      "kalip",
      "izolasyon",
    ],
    contentMix: { deger: 50, urun: 30, kanit: 20, hikaye: 0, satis: 0 },
    hooks: [
      "Santiyede en pahali hata: ___",
      "Müteahhitlerin %80'i bunu yanlis yapiyor",
      "Beton dökümünden önce mutlaka kontrol et: ___",
      "Geç teslimat sana kaç lira kaybettiriyor, hesapladin mi?",
      "Bu malzemeyi yanlis stoklarsan ___",
      "500 müteahhit neden ayni tedarikçiyi seçti?",
    ],
    seasonality:
      "Aktif sezon Mart-Kasim (saha/döküm yogun). Kis aylarinda planlama, stok ve tedarik anlasmalari one cikar.",
  },

  kafe: {
    sector: "kafe",
    label: "Kafe / Restoran (B2C)",
    terminology: ["barista", "demleme", "single origin", "menü", "atmosfer", "brunch"],
    contentMix: { urun: 30, hikaye: 40, deger: 0, kanit: 0, satis: 30 },
    hooks: [
      "Kahveni yanlis içiyorsun çünkü ___",
      "Bu mekanda herkesin kaçirdigi köse: ___",
      "Menüdeki en az siparis edilen ama en iyi ürün: ___",
    ],
    seasonality:
      "Kampanya dönemleri ve hafta sonu yogunlugu belirleyici; mevsimsel menü gecisleri (yaz soguk içecek, kis sicak).",
  },

  eticaret: {
    sector: "eticaret",
    label: "E-ticaret (B2C)",
    terminology: ["sepet", "kampanya", "kargo", "stok", "iade", "indirim kodu"],
    contentMix: { urun: 40, satis: 30, deger: 20, hikaye: 10, kanit: 0 },
    hooks: [
      "Bu ürünü almadan önce sunu bil: ___",
      "Sepette unuttugun sey aslinda ___",
      "%X indirim bitmeden ___",
    ],
    seasonality: "Kampanya takvimi (sezon sonu, özel günler, indirim haftalari) belirleyici.",
  },

  hizmet: {
    sector: "hizmet",
    label: "Hizmet / Danismanlik (B2B/B2C)",
    terminology: ["süreç", "çözüm", "danismanlik", "sonuç", "uzmanlik"],
    contentMix: { deger: 40, kanit: 30, hikaye: 20, satis: 10, urun: 0 },
    hooks: [
      "Bu sorunu çözmek için harcadigin zaman aslinda ___",
      "Uzmanlarin yapip da kimsenin söylemedigi sey: ___",
      "Su 3 hatayi yapiyorsan ___",
    ],
    seasonality: "Yil basi planlama ve çeyrek dönem hedefleri talebi etkiler.",
  },

  guzellik: {
    sector: "guzellik",
    label: "Güzellik / Bakim (B2C)",
    terminology: ["cilt tipi", "rutin", "içerik", "uygulama", "bakim", "seans"],
    contentMix: { hikaye: 40, urun: 30, deger: 20, kanit: 10, satis: 0 },
    hooks: [
      "Cildine yillardir yanlis yaptigin sey: ___",
      "Bu adimi atlarsan tüm rutin bos: ___",
      "Öncesi/sonrasi: ___",
    ],
    seasonality: "Mevsim gecisleri (yaz/kis bakim degisimi) ve özel gün dönemleri talebi sekillendirir.",
  },
};

export const SECTOR_OPTIONS = (Object.keys(SECTORS) as SectorId[]).map((id) => ({
  id,
  label: SECTORS[id].label,
}));

export function getSector(id: SectorId): SectorIntelligence {
  return SECTORS[id] ?? SECTORS.insaat;
}
