import type { PlatformId } from "./types";

// ============================================================================
// Platform DNA (Üretim Pipeline derinliği — Constitution Bölüm 4).
// Her platformun kendi fiziği var. Bu yapısal kurallar prompt'a somut spec
// olarak enjekte edilir; "tek mesajı kopyala" değil, platform diline çevir.
// ============================================================================

export interface PlatformDNA {
  id: PlatformId;
  label: string;
  format: string; // genel biçim/uzunluk
  hook: string; // ilk saniye/satır kuralı
  structure: string; // gövde yapısı
  cta: string; // çağrı stili
  rules: string[]; // sıkı kurallar (limitler)
}

export const PLATFORM_DNA: Record<PlatformId, PlatformDNA> = {
  instagram: {
    id: "instagram",
    label: "Instagram",
    format: "Görsel-öncelikli, duygusal. Caption ~125 karakter görünür kısımda hook + değer.",
    hook: "İlk satır (kesilmeden görünen) merak/fayda taşımalı; emoji'yi abartma.",
    structure: "Hook → tek net değer → yumuşak CTA. Hashtag caption'da DEĞİL, ilk yorumda.",
    cta: "Kaydet/paylaş veya yoruma yönlendiren tek cümle.",
    rules: [
      "Caption hedefi ~125 karakter (max ~300).",
      "firstComment alanina SADECE hashtag yaz (8-15 adet, bosluklarla ayrik); cumle/CTA/aciklama YAZMA.",
      "Hashtag ilk yorumda, 8-15 adet, sektör+niş karışık.",
      "Görsel prompt: kare format, marka beynindeki ana rengi kullan, kompozisyon + character-consistency notu.",
      "Alt-text erişilebilirlik için doldurulmalı.",
    ],
  },
  tiktok: {
    id: "tiktok",
    label: "TikTok / Reels",
    format: "Hareket, hız, ses. Dikey video; 15-30 sn.",
    hook: "0-3 sn pattern-interrupt; ilk karede söz + görsel çengel.",
    structure: "Retention curve: her ~3 sn yeni bilgi/sahne. Shot-by-shot döküm (Seedance/Higgsfield uyumlu).",
    cta: "Comment-bait: yoruma bir kelime yazdıran soru.",
    rules: [
      "Hook 0-3 sn içinde; izleyiciyi durdur.",
      "Sahneler timecode + shot + voiceover/ekran metni olarak ayrık.",
      "Trend ses önerisi ekle.",
      "Metin ekranda kısa; konuşma diline yakın.",
    ],
  },
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    format: "Otorite, B2B, uzun-form. Profesyonel ama insani ton.",
    hook: "Feed'de görünen ilk 2 satır kritik; tartışma/insight vaadi.",
    structure: "Beyaz boşluklu kısa paragraflar; sektör insight'ı + somut veri.",
    cta: "Sonunda tartışma sorusu (engagement).",
    rules: [
      "İlk 2 satır 'devamını gör'den önce çengel olmalı.",
      "Kısa paragraflar, bol satır arası (okunabilirlik).",
      "En az bir somut sektör verisi/rakam.",
      "Klişe motivasyon dilinden kaçın.",
    ],
  },
  x: {
    id: "x",
    label: "X / Twitter",
    format: "Tartışma, thread. Kısa, yoğun, iddialı.",
    hook: "Tweet 1 çengel: iddia/merak; tek nefeste okunur.",
    structure: "Tweet 2-4 değer (her tweet tek fikir); Tweet 5 CTA.",
    cta: "Yanıt/repost'a davet eden net kapanış.",
    rules: [
      "Thread 3-5 tweet.",
      "Her tweet ~280 karakter altında, tek fikir.",
      "Numaralandırma (1/, 2/...) opsiyonel ama tutarlı.",
      "Hashtag minimal (0-2).",
    ],
  },
};

// Prompt'a girecek derin spec metni (sıralama sektör önceliğine göre verilebilir).
export function platformDnaBlock(order: PlatformId[]): string {
  const lines: string[] = [];
  for (const id of order) {
    const d = PLATFORM_DNA[id];
    lines.push(`### ${d.label}`);
    lines.push(`- Biçim: ${d.format}`);
    lines.push(`- Hook: ${d.hook}`);
    lines.push(`- Yapı: ${d.structure}`);
    lines.push(`- CTA: ${d.cta}`);
    lines.push(`- Kurallar: ${d.rules.join(" ")}`);
  }
  return lines.join("\n");
}
