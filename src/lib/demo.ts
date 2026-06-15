import { ANGLE_LABELS, type ContentPackage, type GenerateRequest } from "./types";
import { getSector } from "./sectors";

// ============================================================================
// Demo (anahtarsiz) cikti ureteci.
// ANTHROPIC_API_KEY yokken tum akisi tiklanabilir kilar. Saf sablon — Claude
// CAGRILMAZ. Marka beyni + sektor + konu enjeksiyonunu sablonda gosterir; boylece
// "generic'ligi kiran katman" anahtarsiz da somut gorulur. Gercek kalite icin
// anahtarli uretim gerekir.
// ============================================================================

export function buildDemoPackage(req: GenerateRequest): ContentPackage {
  const { brand, topic, contentType, angle, personaIndex } = req;
  const sector = getSector(brand.sector);
  const persona = brand.audience[personaIndex] ?? brand.audience[0];
  const terms = sector.terminology;
  const t0 = terms[0] ?? "ürün";
  const t1 = terms[1] ?? "hizmet";
  const num = brand.proof.numbers.find(Boolean) ?? `${brand.name} deneyimi`;
  const sig = brand.voice.signaturePhrases.find(Boolean) ?? brand.name;
  const personaName = persona?.name || "hedef kitle";
  const personaPain = persona?.pain || "öncelikli sorun";
  const angleLabel = ANGLE_LABELS[angle];
  const trendNote = req.trend?.trim() ? ` Güncel bağlam: ${req.trend.trim()}.` : "";

  return {
    topic,
    contentType,
    angle,
    demo: true,
    platformEmphasis: sector.platformEmphasis,
    outputs: {
      instagram: {
        caption: `${topic} — ${personaName} için fark yaratan nokta. ${sig}. ${angleLabel} açısıyla: ${personaPain} çözülür. (${num})${trendNote}`,
        firstComment: `#${slug(brand.name)} #${slug(t0)} #${slug(t1)} #${slug(sector.sector)} #içerik`,
        imagePrompt: `Kare format, marka rengi #E8650A vurgulu. Sahne: "${topic}" temasını ${t0} ve ${t1} öğeleriyle anlatan temiz, profesyonel kompozisyon. ${brand.name} kimliğiyle tutarlı; metin alanı sol üstte. (demo görsel prompt)`,
        altText: `${brand.name} için ${topic} konulu, ${t0} öğesini öne çıkaran görsel.`,
      },
      tiktok: {
        hook: `İlk 3 saniye: "${topic} hakkında ${personaName} olarak bilmen gereken tek şey..."`,
        scenes: [
          { timecode: "0-3sn", shot: "Yakın çekim, dikkat çeken açılış", voiceover: `${topic} — durdur ve izle.` },
          { timecode: "3-8sn", shot: `${t0} gösterimi`, voiceover: `${angleLabel} açısı: ${personaPain}.` },
          { timecode: "8-15sn", shot: "Kanıt / sonuç karesi", voiceover: `${num} ile fark: ${sig}.` },
        ],
        soundSuggestion: "Güncel, ritmik bir trend ses (sahne geçişleriyle senkron).",
        cta: `Yorumlara "${slug(t0)}" yaz, detayları gönderelim.`,
      },
      linkedin: {
        hookLine: `${topic}: ${personaName} için çoğu kişinin atladığı nokta.`,
        body: `${brand.name} olarak ${sector.label} alanında gördüğümüz şu:\n\n${personaPain}\n\nBunu ${t0} ve ${t1} doğru kurgulandığında çözüyoruz. ${angleLabel} açısından bakınca tablo netleşiyor.\n\n${num}.`,
        insight: `Sektör notu: ${sector.seasonality}`,
        discussionQuestion: `Siz ${topic} konusunda ${t0} tarafını nasıl yönetiyorsunuz?`,
      },
      variants: {
        captions: [
          `${topic}: ${personaName} için neden önemli? ${sig}.`,
          `${personaPain} mı? ${topic} ile çözülür. (${num})`,
          `${angleLabel} açısı — ${topic}. ${brand.name}.`,
        ],
        tiktokHooks: [
          `"${topic}" — 3 saniyede neden umursamalısın?`,
          `${personaName}: bunu kaçırma — ${topic}.`,
        ],
        xOpeners: [
          `${topic} hakkında kısa bir gerçek 🧵`,
          `Çoğu ${personaName} ${topic} konusunda şunu atlıyor:`,
        ],
      },
      x: {
        thread: [
          `${topic} 🧵 ${personaName} için kısa bir değerlendirme.`,
          `${angleLabel} açısı: ${personaPain}. Çoğu marka burada ${t0} adımını atlıyor.`,
          `${brand.name} farkı: ${sig}. Somut: ${num}.`,
          `Özet: ${t0} + ${t1} doğru kurulursa sonuç değişir. Sorun varsa yanıtla.`,
        ],
      },
    },
  };
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9çğıöşü]/g, "")
    .slice(0, 24) || "icerik";
}
