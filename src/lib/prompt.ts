import {
  ANGLE_HINTS,
  ANGLE_LABELS,
  CONTENT_TYPE_LABELS,
  PLATFORM_LABELS,
  type GenerateRequest,
} from "./types";
import { getSector } from "./sectors";
import { platformDnaBlock } from "./platform-dna";

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
o markaya OZGU olmali; baska bir marka bu icerigi kelimesi kelimesine kopyalayip
kullanamamali — markanin adi, kanit rakamlari, personasinin acisi ve sektor
terminolojisi metne islenmis olmali.
Turkce uret. Su "AI kokan" klise kaliplari KULLANMA: "gunumuz dunyasinda",
"bu yazida/gonderide", "sizler icin", "hayatinizi kolaylastirmak icin",
asiri emoji, ic bos sifat yiginlari. Somut ol; her cumle bir bilgi tasisin.`;
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
    "Su 4 platform icin TAM paket uret. Her platformun PLATFORM DNA'sina KESIN uy:",
  );
  lines.push("");
  lines.push("[PLATFORM DNA — her platformun kendi fizigi]");
  lines.push(platformDnaBlock(sector.platformEmphasis));
  lines.push("");
  lines.push(
    `[PLATFORM ONCELIGI] Bu sektorde en cok donus veren platform sirasi: ${sector.platformEmphasis
      .map((p) => PLATFORM_LABELS[p])
      .join(" > ")}. Ilk iki platforma ekstra ozen goster.`,
  );
  lines.push("");
  lines.push("[KALITE KURALLARI — generic'ligi kir]");
  lines.push(
    "- Hook'un ilk satiri DOGRUDAN secilen personanin acisina degsin; merak/gerilim yaratsin.",
  );
  lines.push(
    "- SADECE yukarida verilen gercek rakamlari/kanitlari kullan; rakam UYDURMA.",
  );
  lines.push(
    "- Yasakli kelimeleri asla kullanma. Imza ifadeleri zorlamadan, dogal yerlestir.",
  );
  lines.push(
    "- Sektor terminolojisini dogal kullan; jargonu yerinde, abartmadan kullan.",
  );
  lines.push(
    "- Secilen aciya sadik kal; her platformun kendi DNA'sina (uzunluk, ritim, format) uy.",
  );
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
