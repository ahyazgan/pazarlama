import {
  ANGLE_HINTS,
  ANGLE_LABELS,
  CONTENT_TYPE_LABELS,
  type GenerateRequest,
} from "./types";
import { getSector } from "./sectors";

// ============================================================================
// Prompt kurulumu — Constitution Bolum 8.
// Marka beyni + sektor zekasi HER istekte enjekte edilir.
// Generic'lik tam olarak burada kirilir: sadece "ton: profesyonel" demiyoruz;
// marka kisiligini, yasakli kelimeleri, persona acisini, gercek rakamlari,
// sektore ozel terminoloji + hook formullerini + icerik karisimini veriyoruz.
// ============================================================================

export function buildSystemPrompt(req: GenerateRequest): string {
  const sector = getSector(req.brand.sector);
  return `Sen ${sector.label} sektorunde uzman bir sosyal medya icerik stratejistisin.
Generic icerik uretmek YASAK. Cikti, asagidaki marka beyni ve sektor zekasi ile
o markaya OZGU olmali; baska bir marka bu icerigi kopyalayip kullanamamali.
Turkce uret. Klise, bos ve "AI kokan" ifadelerden kacin.`;
}

export function buildUserPrompt(req: GenerateRequest): string {
  const { brand, topic, contentType, angle, personaIndex } = req;
  const sector = getSector(brand.sector);
  const persona = brand.audience[personaIndex] ?? brand.audience[0];

  const toneLabel =
    brand.voice.tone <= 3
      ? "resmi/kurumsal"
      : brand.voice.tone >= 7
        ? "samimi/sicak"
        : "dengeli";

  const lines: string[] = [];

  lines.push("[MARKA BEYNI ENJEKSIYONU]");
  lines.push(`Marka: ${brand.name}`);
  lines.push(`Misyon: ${brand.identity.mission || "-"}`);
  lines.push(`Deger onerisi: ${brand.identity.valueProp || "-"}`);
  lines.push(
    `Kisilik (sifatlar): ${brand.identity.personality.filter(Boolean).join(", ") || "-"}`,
  );
  lines.push(
    `Ses: ton=${brand.voice.tone}/10 (${toneLabel}); cumle yapisi: ${
      brand.voice.sentenceStyle || "-"
    }`,
  );
  if (brand.voice.bannedWords.filter(Boolean).length) {
    lines.push(
      `YASAK kelimeler (asla kullanma): ${brand.voice.bannedWords.filter(Boolean).join(", ")}`,
    );
  }
  if (brand.voice.signaturePhrases.filter(Boolean).length) {
    lines.push(
      `Imza ifadeler (uygun yerde kullan): ${brand.voice.signaturePhrases
        .filter(Boolean)
        .join(" | ")}`,
    );
  }
  if (persona) {
    lines.push(
      `Hedef persona: ${persona.name} — acisi: ${persona.pain || "-"}; motivasyonu: ${
        persona.motivation || "-"
      }`,
    );
    lines.push("Bu personanin acisina/motivasyonuna dogrudan hitap et.");
  }
  if (brand.proof.numbers.filter(Boolean).length) {
    lines.push(
      `Kanit (gercek rakamlar — uydurma, sadece bunlari kullan): ${brand.proof.numbers
        .filter(Boolean)
        .join("; ")}`,
    );
  }
  if (brand.proof.cases.filter(Boolean).length) {
    lines.push(`Vaka ornekleri: ${brand.proof.cases.filter(Boolean).join("; ")}`);
  }
  if (brand.proof.references.filter(Boolean).length) {
    lines.push(`Referanslar: ${brand.proof.references.filter(Boolean).join("; ")}`);
  }

  lines.push("");
  lines.push("[SEKTOR ZEKASI ENJEKSIYONU]");
  lines.push(`Terminoloji (dogal kullan): ${sector.terminology.join(", ")}`);
  lines.push(`Mevsimsellik: ${sector.seasonality}`);
  lines.push(
    `Uygun hook formulleri (bunlardan ilham al, kopyalama): ${sector.hooks.join(" | ")}`,
  );

  lines.push("");
  lines.push("[GOREV]");
  lines.push(`Konu: ${topic}`);
  lines.push(`Icerik tipi: ${CONTENT_TYPE_LABELS[contentType]}`);
  lines.push(`Aci: ${ANGLE_LABELS[angle]} — ${ANGLE_HINTS[angle]}`);
  lines.push("");
  lines.push(
    "Su 4 platform icin TAM paket uret. Her platformun kendi fizigine uy:",
  );
  lines.push(
    "- Instagram: ~125 karakter hook+deger caption; ilk yorumda hashtag; kare gorsel prompt (marka rengi #E8650A, kompozisyon, character consistency notu); alt-text.",
  );
  lines.push(
    "- TikTok/Reels: 0-3sn pattern-interrupt hook; her ~3sn yeni bilgi veren shot-by-shot sahne dokumu (Seedance/Higgsfield uyumlu); trend ses onerisi; comment-bait CTA.",
  );
  lines.push(
    "- LinkedIn: feed'de gorunen guclu ilk satir; beyaz bosluklu okunabilir govde; sektor insight'i; tartisma sorusu (B2B otorite tonu).",
  );
  lines.push("- X/Twitter: çengel tweet + deger tweet'leri + CTA seklinde thread (3-5 tweet).");
  lines.push("");
  lines.push(
    "Ciktiyi SADECE verilen JSON semasina gore uret. Aciklama/markdown ekleme.",
  );

  return lines.join("\n");
}

// JSON cikti semasi (structured outputs icin). Constitution Bolum 8: parse edilebilir olmali.
export const OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    instagram: {
      type: "object",
      additionalProperties: false,
      properties: {
        caption: { type: "string" },
        firstComment: { type: "string" },
        imagePrompt: { type: "string" },
        altText: { type: "string" },
      },
      required: ["caption", "firstComment", "imagePrompt", "altText"],
    },
    tiktok: {
      type: "object",
      additionalProperties: false,
      properties: {
        hook: { type: "string" },
        scenes: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              timecode: { type: "string" },
              shot: { type: "string" },
              voiceover: { type: "string" },
            },
            required: ["timecode", "shot", "voiceover"],
          },
        },
        soundSuggestion: { type: "string" },
        cta: { type: "string" },
      },
      required: ["hook", "scenes", "soundSuggestion", "cta"],
    },
    linkedin: {
      type: "object",
      additionalProperties: false,
      properties: {
        hookLine: { type: "string" },
        body: { type: "string" },
        insight: { type: "string" },
        discussionQuestion: { type: "string" },
      },
      required: ["hookLine", "body", "insight", "discussionQuestion"],
    },
    x: {
      type: "object",
      additionalProperties: false,
      properties: {
        thread: { type: "array", items: { type: "string" } },
      },
      required: ["thread"],
    },
  },
  required: ["instagram", "tiktok", "linkedin", "x"],
} as const;
