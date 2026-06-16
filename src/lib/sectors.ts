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
    platformEmphasis: ["linkedin", "instagram", "x", "tiktok"],
    angleAffinity: ["korku", "egitici", "karsitlik", "kazanc", "sosyal_kanit"],
    defaultDisclaimers: ["Fiyatlara KDV dahil degildir", "Teknik ozellikler projeye gore degisebilir"],
    knowledge: {
      regulations: [
        "TS EN 206 hazir beton standardi",
        "Deprem yonetmeligi (TBDY 2018) donati/beton siniflari",
        "CE / G uygunluk isareti zorunlulugu",
        "Sevk irsaliyesi ve e-irsaliye yukumlulugu",
      ],
      commonMistakes: [
        "Beton sinifini (C25/C30) projeye gore dogrulamadan siparis",
        "Tedarikçiyi son ana birakip teslim suresini garanti etmemek",
        "Agrega/çimento stok kosullarini (nem/ayrismа) ihmal etmek",
        "Tek tedarikçiye bagimlilik → gecikmede plan B yok",
      ],
      benchmarks: [
        "Saha duruslarinin önemli kismi malzeme gecikmesinden kaynaklanir",
        "Planli tedarik, acil siparise kiyasla maliyeti belirgin düsurur",
      ],
    },
  },

  kafe: {
    sector: "kafe",
    label: "Kafe / Restoran (B2C)",
    terminology: [
      "barista",
      "demleme",
      "single origin",
      "espresso",
      "filtre kahve",
      "latte art",
      "menü",
      "atmosfer",
      "brunch",
      "kavrum",
      "günün özeli",
      "rezervasyon",
    ],
    contentMix: { urun: 30, hikaye: 40, deger: 0, kanit: 0, satis: 30 },
    hooks: [
      "Kahveni yanlis içiyorsun çünkü ___",
      "Bu mekanda herkesin kaçirdigi köse: ___",
      "Menüdeki en az siparis edilen ama en iyi ürün: ___",
      "Bir fincan kahvenin arkasindaki 3 saatlik hikaye: ___",
      "Barista olarak en çok sorulan soru: ___",
      "Hafta sonu kalabaligindan kaçmak isteyen herkese: ___",
    ],
    seasonality:
      "Kampanya dönemleri ve hafta sonu yogunlugu belirleyici; mevsimsel menü gecisleri (yaz soguk içecek/cold brew, kis sicak çikolata/sahlep).",
    platformEmphasis: ["instagram", "tiktok", "x", "linkedin"],
    angleAffinity: ["egitici", "sosyal_kanit", "kazanc", "karsitlik", "korku"],
    defaultDisclaimers: ["Gorseller temsilidir", "Fiyatlar subeye gore degisebilir"],
    knowledge: {
      regulations: [
        "Gida isletmesi kayit/onay belgesi (Tarim ve Orman Bakanligi)",
        "HACCP / ISO 22000 gida guvenligi ve hijyen egitimi zorunlulugu",
        "Menude alerjen bilgisi (14 temel alerjen) ve icerik seffafligi",
        "Fiyat etiketleme ve yaniltici sunum yasagi (tuketici mevzuati)",
      ],
      commonMistakes: [
        "Menude alerjen/icerik bilgisini eksik birakmak",
        "Gorselle gercek sunumun uyusmamasi (yaniltici reklam)",
        "Yogun saat operasyonunu 'hizli servis' sozuyle tutturamamak",
        "Saglik/zayiflama gibi temelsiz iddialarla urun pazarlamak",
      ],
      benchmarks: [
        "Yemek/atmosfer gorseli agirlikli icerik etkilesimi belirgin artirir",
        "Kullanici icerigi (UGC) ve yorumlar rezervasyon donusumunu yukseltir",
      ],
    },
  },

  eticaret: {
    sector: "eticaret",
    label: "E-ticaret (B2C)",
    terminology: [
      "sepet",
      "kampanya",
      "kargo",
      "stok",
      "iade",
      "indirim kodu",
      "ücretsiz kargo",
      "stok tükeniyor",
      "ürün incelemesi",
      "favori",
      "sepete ekle",
      "hizli teslimat",
    ],
    contentMix: { urun: 40, satis: 30, deger: 20, hikaye: 10, kanit: 0 },
    hooks: [
      "Bu ürünü almadan önce sunu bil: ___",
      "Sepette unuttugun sey aslinda ___",
      "%X indirim bitmeden ___",
      "Herkesin aldigi ama yanlis kullandigi ürün: ___",
      "Stoklar tükenmeden son ___ adet",
      "Bunu rakiplerden almanin sana kaybettirdigi: ___",
    ],
    seasonality:
      "Kampanya takvimi belirleyici: sezon sonu, özel günler (Sevgililer, Anneler Günü), 11.11, Black Friday, okula dönüs.",
    platformEmphasis: ["instagram", "tiktok", "x", "linkedin"],
    angleAffinity: ["kazanc", "korku", "sosyal_kanit", "karsitlik", "egitici"],
    defaultDisclaimers: ["Stoklarla sinirlidir", "Kampanya kosullari gecerlidir"],
    knowledge: {
      regulations: [
        "Mesafeli Satis Sozlesmesi ve 14 gun cayma hakki",
        "On bilgilendirme + fiyat/kargo/iade seffafligi (e-ticaret mevzuati)",
        "Indirimde son 30 gunun en dusuk fiyatini gosterme kurali",
        "KVKK + IYS: musteri verisi ve ticari ileti izni; ETBIS kaydi",
      ],
      commonMistakes: [
        "Indirimde sahte 'eski fiyat' gostermek (yaniltici)",
        "Stok/teslim suresini tutturamayip iade ve sikayet dogurmak",
        "Izinsiz SMS/e-posta ile spam (IYS ihlali)",
        "Urun gorseliyle gelen urunun uyusmamasi",
      ],
      benchmarks: [
        "Aciliyet (stok/sure) + sosyal kanit (yorum/puan) donusumu artirir",
        "Ucretsiz kargo esigi sepet ortalamasini yukseltir",
      ],
    },
  },

  hizmet: {
    sector: "hizmet",
    label: "Hizmet / Danismanlik (B2B/B2C)",
    terminology: [
      "süreç",
      "çözüm",
      "danismanlik",
      "sonuç",
      "uzmanlik",
      "teklif",
      "kapsam",
      "teslim süresi",
      "vaka çalismasi",
      "ROI",
      "süreç haritasi",
      "ön görüsme",
    ],
    contentMix: { deger: 40, kanit: 30, hikaye: 20, satis: 10, urun: 0 },
    hooks: [
      "Bu sorunu çözmek için harcadigin zaman aslinda ___",
      "Uzmanlarin yapip da kimsenin söylemedigi sey: ___",
      "Su 3 hatayi yapiyorsan ___",
      "Müsterilerimizin en çok sasirdigi gerçek: ___",
      "Bu isi kendin yapmaya çalismak sana neye mal oluyor: ___",
      "Rakamlarla: ___ yaparak ___ kazandirdik",
    ],
    seasonality:
      "Yil basi planlama, çeyrek dönem hedefleri ve bütçe dönemleri (Q4/Q1) talebi etkiler.",
    platformEmphasis: ["linkedin", "instagram", "x", "tiktok"],
    angleAffinity: ["egitici", "korku", "kazanc", "sosyal_kanit", "karsitlik"],
    defaultDisclaimers: ["Sonuclar kisiye/projeye gore degisir"],
    knowledge: {
      regulations: [
        "Hizmet sozlesmesi: kapsam, teslim suresi, sorumluluk sinirlari",
        "Garanti edilemez sonuclari kesin vaat etmeme (haksiz rekabet)",
        "KVKK: musteri verisi isleme ve gizlilik yukumlulugu",
        "Fatura/serbest meslek makbuzu ve vergi yukumlulugu",
      ],
      commonMistakes: [
        "Garanti edilemez sonuclari kesin vaat etmek",
        "Kapsami netlestirmeden is almak (scope creep)",
        "Vaka calismalarini olculebilir sonuc olmadan anlatmak",
        "Referans/veri paylasiminda musteri izni almamak",
      ],
      benchmarks: [
        "Somut rakam/vaka iceren icerik guven ve donusum saglar",
        "LinkedIn'de otorite icerigi nitelikli lead getirir",
      ],
    },
  },

  guzellik: {
    sector: "guzellik",
    label: "Güzellik / Bakim (B2C)",
    terminology: [
      "cilt tipi",
      "rutin",
      "içerik (formül)",
      "uygulama",
      "bakim",
      "seans",
      "nemlendirme",
      "SPF",
      "serum",
      "peeling",
      "cilt bariyeri",
      "öncesi/sonrasi",
    ],
    contentMix: { hikaye: 40, urun: 30, deger: 20, kanit: 10, satis: 0 },
    hooks: [
      "Cildine yillardir yanlis yaptigin sey: ___",
      "Bu adimi atlarsan tüm rutin bos: ___",
      "Öncesi/sonrasi: ___",
      "Cildin için en pahali hata: ___",
      "Bu içerigi su saatte kullanmazsan ___",
      "Uzman dermokozmetik önerisi: ___",
    ],
    seasonality:
      "Mevsim gecisleri (yaz: SPF/yaglanma, kis: nem/bariyer) ve özel gün/düğün dönemleri talebi sekillendirir.",
    platformEmphasis: ["instagram", "tiktok", "x", "linkedin"],
    angleAffinity: ["egitici", "korku", "sosyal_kanit", "kazanc", "karsitlik"],
    defaultDisclaimers: ["Kozmetik urundur; tibbi tedavi amacli degildir", "Sonuclar kisiden kisiye degisir"],
    knowledge: {
      regulations: [
        "Kozmetik Yonetmeligi (Saglik Bakanligi / EU 1223/2009 uyumu)",
        "Tibbi tedavi/iyilestirme iddiasi yasagi (kozmetik ilac degildir)",
        "Icerik (INCI) listesi ve zorunlu uyari ibareleri",
        "Reklam Kurulu: temelsiz '%X etki/kanitlandi' iddialarina ceza",
      ],
      commonMistakes: [
        "'Tedavi eder/iyilestirir' gibi tibbi iddialar kullanmak",
        "Oncesi/sonrasi ile garanti sonuc vaat etmek",
        "Alerjen/uyari bilgisini atlamak",
        "Dermatolojik kanit olmadan '%X kanitlandi' demek",
      ],
      benchmarks: [
        "Egitici rutin icerigi (adim adim) kaydetme oranini artirir",
        "Izinli gercek kullanici donusum gorselleri guven saglar",
      ],
    },
  },
};

export const SECTOR_OPTIONS = (Object.keys(SECTORS) as SectorId[]).map((id) => ({
  id,
  label: SECTORS[id].label,
}));

export function getSector(id: SectorId): SectorIntelligence {
  return SECTORS[id] ?? SECTORS.insaat;
}
