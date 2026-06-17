import type { Brand } from "./types";
import { HAMMADDEM_SAMPLE } from "./brand-store";

// ============================================================================
// SEKTÖR-ÖZEL ÖRNEK MARKA PRESETLERİ (çok-sektörlü SaaS kanıtı).
// Her sektör için tam 5-katman marka beyni — tek tıkla "kendi sektöründe dene".
// insaat: mevcut HAMMADDEM_SAMPLE. Diğer 4: aşağıda, sektör zekasıyla uyumlu.
// ============================================================================

const KAFE_SAMPLE: Brand = {
  name: "Demlik Kahve",
  sector: "kafe",
  identity: {
    mission: "Şehrin koşturmacasında durup nefes alınacak, özenle demlenmiş bir kahve molası sunmak.",
    valueProp: "Single origin çekirdek, uzman barista ve sakin atmosfer — zincirlerin aksine her fincan elde demlenir.",
    personality: ["samimi", "özenli", "sakin", "mekan-tutkunu", "sıcak"],
    competitors: ["zincir kahve markaları", "ofis kahvesi"],
    differentiation: "Zincir değiliz; çekirdek menüsü haftalık değişir, her fincan elde demlenir.",
    primaryColor: "#6F4E37",
    visualStyle: "Sıcak doğal ışık, ahşap dokular; yakın plan kahve ve atmosfer.",
    story: "Bir barista ve bir mimar, şehirde 'durulacak' bir köşe yaratmak için açtı.",
    ctaGoal: "Rezervasyon yap / hafta içi uğra",
  },
  voice: {
    tone: 8,
    sentenceStyle: "Sıcak, davetkâr, kısa cümleler.",
    bannedWords: ["ucuz", "sıradan"],
    signaturePhrases: ["İyi kahve acele etmez", "Bir mola hak ettin"],
    goodExamples: [
      "Bu hafta demde: Etiyopya Yirgacheffe. Çiçeksi, hafif, sabaha tam.",
      "Köşedeki prizli masa boş. Laptopun, kahven, sen. Acele yok.",
    ],
    badExamples: ["Şehrin EN UCUZ ve EN İYİ kahvesi sadece bizde! ☕🔥 Kaçırma!"],
  },
  audience: [
    {
      name: "Uzaktan çalışan freelancer",
      pain: "Evde odaklanamıyor; gürültülü, kalabalık kafe istemiyor.",
      motivation: "Sakin, prizli, iyi kahveli bir çalışma köşesi.",
      objections: "Masa bulamamak; gürültü.",
      vocabulary: "filtre, priz, sakin, masa, odak",
      triggers: "Yeni proje; ev sıkıcı gelince.",
    },
    {
      name: "Hafta sonu kaçışçısı",
      pain: "Standart zincir kafeler ruhsuz ve kalabalık.",
      motivation: "Özel, keyifli, fotojenik bir mekân deneyimi.",
      objections: "Yer yoğunluğu; fiyat.",
      vocabulary: "brunch, atmosfer, single origin, keyif",
      triggers: "Hafta sonu planı; arkadaş buluşması.",
    },
  ],
  proof: {
    numbers: ["Haftalık değişen 6 single origin", "Günde elde demlenen 200+ fincan"],
    cases: ["Cumartesi brunch saatlerinde sürekli dolu salon"],
    references: ["Mahallenin en yüksek puanlı kahvecisi"],
  },
  pillars: ["Kahve uzmanlığı", "Mekân ve atmosfer", "Topluluk"],
  governance: {
    extraBannedClaims: ["en iyi kahve", "rakipsiz lezzet"],
    requiredDisclaimers: ["Görseller temsilidir"],
  },
};

const ETICARET_SAMPLE: Brand = {
  name: "EvinRengi",
  sector: "eticaret",
  identity: {
    mission: "Uygun bütçeyle evini yenileyebilmeyi herkes için kolaylaştırmak.",
    valueProp: "Küratörlü ev dekorasyon koleksiyonu, 2 günde teslim, 30 gün koşulsuz iade.",
    personality: ["pratik", "ilham-veren", "güvenilir", "erişilebilir", "trend"],
    competitors: ["büyük pazaryerleri", "mobilya zincirleri"],
    differentiation: "Sonsuz liste değil küratörlü seçki + hızlı teslim + koşulsuz iade.",
    primaryColor: "#2E7D6F",
    visualStyle: "Aydınlık ev ortamları; ürün-yaşam alanı kombinleri.",
    story: "İlk evini döşerken uygun ve şık ürün bulmakta zorlanan kurucu, küratörlü bir mağaza kurdu.",
    ctaGoal: "Sepete ekle / koleksiyonu keşfet",
  },
  voice: {
    tone: 7,
    sentenceStyle: "Net, ilham verici, eyleme çağıran.",
    bannedWords: ["en ucuz", "bedava"],
    signaturePhrases: ["Evine küçük bir dokunuş", "Bütçene göre stil"],
    goodExamples: [
      "3 aksesuar, tek raf, yepyeni bir köşe. Kombini kaydet.",
      "Salonu tazelemek için tadilat şart değil: doğru tekstil yeter.",
    ],
    badExamples: ["EN UCUZ fiyat garantisi! Bedava kargo! Hemen tıkla, kaçırma!!!"],
  },
  audience: [
    {
      name: "Yeni eve taşınan genç",
      pain: "Sınırlı bütçe; neyi nereden alacağını bilmiyor.",
      motivation: "Şık ama uygun, tek yerden, hızlı.",
      objections: "Kalite belirsizliği; iade derdi.",
      vocabulary: "kombin, bütçe, teslim, iade",
      triggers: "Taşınma; maaş günü.",
    },
    {
      name: "Evini yenileyen ev sahibi",
      pain: "Evi tazelemek istiyor ama büyük tadilat istemiyor.",
      motivation: "Küçük dokunuşlarla görünür fark.",
      objections: "Renk uyumu; trend kaçırma.",
      vocabulary: "tekstil, aksesuar, renk paleti",
      triggers: "Mevsim değişimi; misafir dönemi.",
    },
  ],
  proof: {
    numbers: ["2 günde teslim", "30 gün koşulsuz iade", "4.7/5 ürün puanı"],
    cases: ["10.000+ teslim edilen sipariş"],
    references: ["50.000+ takipçi topluluğu"],
  },
  pillars: ["Bütçe dostu stil", "Trend ve ilham", "Güvenli alışveriş"],
  governance: {
    extraBannedClaims: ["en ucuz", "kalitede rakipsiz"],
    requiredDisclaimers: ["Stoklarla sınırlıdır", "Görseller temsilidir"],
  },
};

const HIZMET_SAMPLE: Brand = {
  name: "Netki Danışmanlık",
  sector: "hizmet",
  identity: {
    mission: "KOBİ'lerin dijital pazarlamada ölçülebilir sonuç almasını sağlamak.",
    valueProp: "Veriye dayalı, şeffaf raporlu, sonuç odaklı pazarlama danışmanlığı.",
    personality: ["analitik", "şeffaf", "sonuç-odaklı", "güvenilir", "uzman"],
    competitors: ["geleneksel reklam ajansları", "tek seferlik freelancer"],
    differentiation: "Vaat değil veri: her ay ölçülebilir KPI raporu, kapsamı net sözleşme.",
    primaryColor: "#1F6FEB",
    visualStyle: "Temiz, kurumsal, veri/grafik vurgulu.",
    story: "Ajans tarafında 'sonuç göstermeyen' işlere kızan kurucular, ölçülebilirliği merkeze alan bir danışmanlık kurdu.",
    ctaGoal: "Ücretsiz ön görüşme planla",
  },
  voice: {
    tone: 3,
    sentenceStyle: "Net, kanıtlı, profesyonel.",
    bannedWords: ["garanti viral", "kesin sonuç"],
    signaturePhrases: ["Vaat değil, veri", "Ölçemezsen yönetemezsin"],
    goodExamples: [
      "Reklam bütçeni artırmadan dönüşümü %35 büyüttük. İşte rapor.",
      "3 yaygın funnel hatası ve her birinin sana kaybettirdiği ciro.",
    ],
    badExamples: ["Markanı GARANTİ viral yapıyoruz, kesin sonuç! Hemen ara!"],
  },
  audience: [
    {
      name: "KOBİ sahibi",
      pain: "Reklama para harcıyor ama sonucu göremiyor.",
      motivation: "Net ROI ve şeffaflık.",
      objections: "Daha önce ajanstan yanmış; bütçe kaygısı.",
      vocabulary: "ROI, dönüşüm, rapor, bütçe",
      triggers: "Düşen satış; yeni ürün lansmanı.",
    },
    {
      name: "Pazarlama sorumlusu",
      pain: "İç ekip yetersiz; uzman desteği lazım.",
      motivation: "Güvenilir, ölçülebilir partner.",
      objections: "Kapsam belirsizliği; iletişim kopukluğu.",
      vocabulary: "KPI, kampanya, funnel, attribution",
      triggers: "Çeyrek hedefi; kampanya dönemi.",
    },
  ],
  proof: {
    numbers: ["Ortalama %35 dönüşüm artışı", "Aylık şeffaf KPI raporu", "20+ KOBİ"],
    cases: ["Bir e-ticarette 6 ayda 3x ROAS"],
    references: ["NPS 9/10"],
  },
  pillars: ["Ölçülebilir sonuç", "Şeffaflık", "Uzmanlık"],
  governance: {
    extraBannedClaims: ["garanti sonuç", "kesin viral"],
    requiredDisclaimers: ["Sonuçlar projeye göre değişir"],
  },
};

const GUZELLIK_SAMPLE: Brand = {
  name: "Cilt Notu",
  sector: "guzellik",
  identity: {
    mission: "Bilime dayalı, abartısız cilt bakımını herkes için anlaşılır kılmak.",
    valueProp: "Dermatolog danışmanlı, içerik-şeffaf, cilt tipine özel rutin.",
    personality: ["bilimsel", "şeffaf", "şefkatli", "sade", "güvenilir"],
    competitors: ["mucize vaat eden markalar", "denetimsiz online ürünler"],
    differentiation: "Mucize değil rutin: her ürün INCI-şeffaf, dermatolog onaylı, cilt tipine göre.",
    primaryColor: "#E59BB0",
    visualStyle: "Yumuşak, temiz, doğal ten; ürün-doku yakın plan.",
    story: "Yanlış ürünlerle cilt bariyerini bozan kurucu, kanıta dayalı sade bakımı savunmak için kurdu.",
    ctaGoal: "Cilt tipi testini yap / danışmanlık al",
  },
  voice: {
    tone: 6,
    sentenceStyle: "Açıklayıcı, sakin, kanıtlı.",
    bannedWords: ["mucize", "tedavi eder"],
    signaturePhrases: ["Mucize değil, rutin", "Cildin bariyeri önce gelir"],
    goodExamples: [
      "Serumdan önce nem, nemden sonra SPF. Sıralama her şeyi değiştirir.",
      "Hassas cilt için fragrance-free seçmenin gerçek sebebi: bariyer.",
    ],
    badExamples: ["Bu krem cildini 7 günde TEDAVİ EDER, mucize sonuç garantili!"],
  },
  audience: [
    {
      name: "Bakıma yeni başlayan",
      pain: "Onlarca ürün var; ne işe yaradığını bilmiyor.",
      motivation: "Basit, doğru, güvenli bir rutin.",
      objections: "Karmaşa; yanlış ürün korkusu.",
      vocabulary: "rutin, nemlendirme, SPF, bariyer",
      triggers: "Cilt problemi; mevsim geçişi.",
    },
    {
      name: "Hassas ciltli kullanıcı",
      pain: "Çoğu ürün cildini tahriş ediyor.",
      motivation: "İçerik-şeffaf, tahriş etmeyen ürün.",
      objections: "Alerjen kaygısı; abartılı iddialar.",
      vocabulary: "INCI, hassas, fragrance-free, tahriş",
      triggers: "Tahriş; dermatolog önerisi.",
    },
  ],
  proof: {
    numbers: ["Dermatolog danışmanlı", "INCI-şeffaf 30+ ürün", "4.8/5 kullanıcı puanı"],
    cases: ["8 haftada bariyer iyileşmesinde yüksek memnuniyet"],
    references: ["10.000+ cilt tipi testi yapıldı"],
  },
  pillars: ["Bilime dayalı bakım", "İçerik şeffaflığı", "Cilt tipine özel"],
  governance: {
    extraBannedClaims: ["mucize", "tedavi eder", "%100 etkili"],
    requiredDisclaimers: [
      "Kozmetik üründür; tıbbi tedavi amaçlı değildir",
      "Sonuçlar kişiden kişiye değişir",
    ],
  },
};

export interface BrandPreset {
  id: string;
  label: string;
  brand: Brand;
}

export const BRAND_PRESETS: BrandPreset[] = [
  { id: "insaat", label: "Hammaddem — İnşaat malzemesi (B2B)", brand: HAMMADDEM_SAMPLE },
  { id: "kafe", label: "Demlik Kahve — Kafe (B2C)", brand: KAFE_SAMPLE },
  { id: "eticaret", label: "EvinRengi — E-ticaret (B2C)", brand: ETICARET_SAMPLE },
  { id: "hizmet", label: "Netki — Hizmet/Danışmanlık (B2B)", brand: HIZMET_SAMPLE },
  { id: "guzellik", label: "Cilt Notu — Güzellik/Bakım (B2C)", brand: GUZELLIK_SAMPLE },
];
