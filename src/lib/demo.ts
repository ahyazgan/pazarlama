import { ANGLE_LABELS, type Angle, type ContentPackage, type GenerateRequest } from "./types";
import { getSector } from "./sectors";

// ============================================================================
// Demo (anahtarsiz) cikti ureteci.
// ANTHROPIC_API_KEY yokken tum akisi tiklanabilir kilar. Saf sablon — Claude
// CAGRILMAZ. Marka beyni + sektor + konu enjeksiyonunu sablonda gosterir; boylece
// "generic'ligi kiran katman" anahtarsiz da somut gorulur. Gercek kalite icin
// anahtarli uretim gerekir.
//
// Zenginlestirme: acıya özel çerçeve + CTA hedefi + persona motivasyon/sözlüğü +
// vaka kanıtı + farklılaşma + zorunlu disclaimer enjekte edilir (governance uyumu).
// ============================================================================

// Açıya özel açılış çerçevesi — aynı konu, farklı açıda görünür biçimde değişsin.
const ANGLE_FRAME: Record<Angle, string> = {
  korku: "Bunu kaçırmanın bedeli ağır",
  kazanc: "İşte somut kazanç",
  sosyal_kanit: "Çoğu kişinin tercihi belli",
  egitici: "Kısa ve net bir rehber",
  karsitlik: "Çoğu marka tam tersini yapıyor",
};

export function buildDemoPackage(req: GenerateRequest): ContentPackage {
  const { brand, topic, contentType, angle, personaIndex } = req;
  const sector = getSector(brand.sector);
  const persona = brand.audience[personaIndex] ?? brand.audience[0];
  const terms = sector.terminology;
  const t0 = terms[0] ?? "ürün";
  const t1 = terms[1] ?? "hizmet";
  const num = brand.proof.numbers.find(Boolean) ?? `${brand.name} deneyimi`;
  const caseProof = brand.proof.cases.find(Boolean) ?? num;
  const sig = brand.voice.signaturePhrases.find(Boolean) ?? brand.name;
  const personaName = persona?.name || "hedef kitle";
  const personaPain = persona?.pain || "öncelikli sorun";
  const personaMotive = persona?.motivation?.trim() || "istediği sonuca ulaşmak";
  const personaVocab = persona?.vocabulary?.trim();
  const angleLabel = ANGLE_LABELS[angle];
  const frame = ANGLE_FRAME[angle];
  const trendNote = req.trend?.trim() ? ` Güncel bağlam: ${req.trend.trim()}.` : "";
  const color = brand.identity.primaryColor?.trim() || "#E8650A";
  const vstyle = brand.identity.visualStyle?.trim();
  const cta = brand.identity.ctaGoal?.trim() || `Yorumlara "${slug(t0)}" yaz, detayları gönderelim`;
  const diff = brand.identity.differentiation?.trim() || brand.identity.valueProp?.trim();
  // Persona sözlüğünden bir terim — dili kitleye yaklaştırır.
  const vocabHint = personaVocab ? ` (${personaVocab.split(/[,;]/)[0].trim()})` : "";
  // Zorunlu ibareler (governance) — metnin sonuna eklenir; readiness lint'i de geçer.
  const disclaimers = (brand.governance?.requiredDisclaimers ?? []).filter(Boolean);
  const disclaimerTail = disclaimers.length ? `\n\n— ${disclaimers.join(" · ")}` : "";

  return {
    topic,
    contentType,
    angle,
    demo: true,
    platformEmphasis: sector.platformEmphasis,
    outputs: {
      instagram: {
        caption: `${frame}: ${topic}. ${personaName} için ${personaMotive}${vocabHint}. ${angleLabel} açısıyla ${personaPain} çözülür. ${sig}. (${num})${trendNote}${disclaimerTail}`,
        firstComment: `#${slug(brand.name)} #${slug(t0)} #${slug(t1)} #${slug(sector.sector)} #içerik`,
        imagePrompt: `Kare format, marka rengi ${color} vurgulu${vstyle ? `, stil: ${vstyle}` : ""}. Sahne: "${topic}" temasını ${t0} ve ${t1} öğeleriyle anlatan temiz, profesyonel kompozisyon. ${brand.name} kimliğiyle tutarlı; metin alanı sol üstte. (demo görsel prompt)`,
        altText: `${brand.name} için ${topic} konulu, ${t0} öğesini öne çıkaran görsel.`,
      },
      tiktok: {
        hook: `İlk 3 saniye: "${frame} — ${personaName} olarak ${topic} hakkında bilmen gereken tek şey..."`,
        scenes: [
          { timecode: "0-3sn", shot: "Yakın çekim, dikkat çeken açılış", voiceover: `${topic} — durdur ve izle.` },
          { timecode: "3-8sn", shot: `${t0} gösterimi`, voiceover: `${angleLabel} açısı: ${personaPain}.` },
          { timecode: "8-15sn", shot: "Kanıt / sonuç karesi", voiceover: `Sonuç: ${caseProof}. ${sig}.` },
        ],
        soundSuggestion: "Güncel, ritmik bir trend ses (sahne geçişleriyle senkron).",
        cta: `${cta}.`,
      },
      linkedin: {
        hookLine: `${topic}: ${personaName} için çoğu kişinin atladığı nokta.`,
        body: `${brand.name} olarak ${sector.label} alanında gördüğümüz şu:\n\n${personaPain}\n\n${personaName}, aslında ${personaMotive} istiyor. Bunu ${t0} ve ${t1} doğru kurgulandığında çözüyoruz${diff ? `; bizi ayıran: ${diff}` : ""}. ${angleLabel} açısından bakınca tablo netleşiyor.\n\nSomut: ${caseProof}. (${num})${disclaimerTail}`,
        insight: `Sektör notu: ${sector.seasonality}`,
        discussionQuestion: `Siz ${topic} konusunda ${t0} tarafını nasıl yönetiyorsunuz?`,
      },
      variants: {
        captions: [
          `${topic}: ${personaName} için neden önemli? ${sig}.`,
          `${personaPain} mı? ${topic} ile çözülür. (${num})`,
          `${frame} — ${topic}. ${brand.name}.`,
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
          `${brand.name} farkı: ${sig}. Somut: ${caseProof}.`,
          `Hedef: ${personaMotive}. ${cta}.`,
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
