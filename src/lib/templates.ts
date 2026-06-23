import type { Angle, ContentType, SectorId } from "./types";

// ============================================================================
// İçerik şablonları kütüphanesi — sektöre özel hazır kampanya başlangıçları.
// "Boş sayfa sendromu"nun ikinci katmanı: kullanıcı konu+tip+açıyı sıfırdan
// kurmak yerine kanıtlanmış bir kalıptan başlar. Saf veri + seçici (test edilebilir).
// ============================================================================

export interface CampaignTemplate {
  label: string; // görünen kısa ad
  topic: string; // konu tohumu (/create'e seed)
  contentType: ContentType;
  angle: Angle;
}

// Her sektörde işe yarayan evrensel kalıplar.
const UNIVERSAL: CampaignTemplate[] = [
  { label: "Müşteri başarısı", topic: "Bir müşterinin somut sonucu", contentType: "kanit", angle: "sosyal_kanit" },
  { label: "Sık yapılan hata", topic: "Sektörde en pahalı yaygın hata", contentType: "deger", angle: "korku" },
  { label: "Perde arkası", topic: "İşin görünmeyen tarafı / süreç", contentType: "hikaye", angle: "egitici" },
];

const BY_SECTOR: Record<SectorId, CampaignTemplate[]> = {
  insaat: [
    { label: "Tedarik güvenliği", topic: "Zamanında teslimatın şantiyeye etkisi", contentType: "deger", angle: "korku" },
    { label: "Maliyet şeffaflığı", topic: "Gizli fiyatın gerçek maliyeti", contentType: "deger", angle: "karsitlik" },
    { label: "Saha kanıtı", topic: "Tamamlanan bir projeden teslimat verisi", contentType: "kanit", angle: "sosyal_kanit" },
  ],
  kafe: [
    { label: "Günün özeli", topic: "Bugünün öne çıkan lezzeti", contentType: "urun", angle: "kazanc" },
    { label: "Mekan atmosferi", topic: "Çalışmak/buluşmak için neden burası", contentType: "hikaye", angle: "egitici" },
    { label: "Sezon menüsü", topic: "Mevsime özel yeni ürün", contentType: "urun", angle: "kazanc" },
  ],
  eticaret: [
    { label: "Ürün faydası", topic: "Bir ürünün çözdüğü gerçek sorun", contentType: "urun", angle: "kazanc" },
    { label: "Kampanya", topic: "Sınırlı süreli fırsat", contentType: "satis", angle: "korku" },
    { label: "Kullanıcı yorumu", topic: "Gerçek müşteri deneyimi", contentType: "kanit", angle: "sosyal_kanit" },
  ],
  hizmet: [
    { label: "Süreç netliği", topic: "Hizmetin adım adım nasıl işlediği", contentType: "deger", angle: "egitici" },
    { label: "Uzmanlık kanıtı", topic: "Çözülen zor bir vaka", contentType: "kanit", angle: "sosyal_kanit" },
    { label: "Yanlış inanış", topic: "Sektörde yaygın bir yanlış bilgi", contentType: "deger", angle: "karsitlik" },
  ],
  guzellik: [
    { label: "Öncesi/sonrası", topic: "Bir uygulamanın görünür sonucu", contentType: "kanit", angle: "sosyal_kanit" },
    { label: "Bakım ipucu", topic: "Evde uygulanabilir pratik öneri", contentType: "deger", angle: "egitici" },
    { label: "Yeni hizmet", topic: "Tanıtılan yeni uygulama", contentType: "urun", angle: "kazanc" },
  ],
};

// Sektöre özel kalıplar önce, ardından evrensel kalıplar.
export function templatesFor(sector: SectorId): CampaignTemplate[] {
  return [...(BY_SECTOR[sector] ?? []), ...UNIVERSAL];
}
