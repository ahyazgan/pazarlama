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
  if (brand.identity.story?.trim()) {
    lines.push(
      `Marka hikayesi: ${brand.identity.story.trim()} (Ozgunluk icin uygun yerde, ozellikle "hikaye" tipinde, bu hikayeye dokun.)`,
    );
  }
  lines.push(
    `Kisilik (sifatlar): ${brand.identity.personality.filter(Boolean).join(", ") || "-"}`,
  );
  const competitors = (brand.identity.competitors ?? []).filter(Boolean);
  const diff = brand.identity.differentiation?.trim();
  if (competitors.length || diff) {
    lines.push(
      `[KONUMLANDIRMA] Rakipler/alternatifler: ${competitors.join(", ") || "-"}. Farkimiz: ${
        diff || "-"
      }. Karsitlik acisinda bu farki one cikar; rakip ismi vermeden ustunlugu goster.`,
    );
  }
  lines.push(
    `Ses: ton=${brand.voice.tone}/10 (${toneLabel}); cumle yapisi: ${
      brand.voice.sentenceStyle || "-"
    }`,
  );
  lines.push(`Ton kurallari: ${toneDirectives(brand.voice.tone)}`);
  const color = brand.identity.primaryColor?.trim() || "#E8650A";
  const vstyle = brand.identity.visualStyle?.trim();
  lines.push(
    `Gorsel kimlik: marka ana rengi ${color}${vstyle ? `; gorsel stil: ${vstyle}` : ""}. Gorsel prompt'ta bu rengi ve stili kullan.`,
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
  const goodEx = (brand.voice.goodExamples ?? []).filter(Boolean);
  if (goodEx.length) {
    lines.push("");
    lines.push(
      "[SES ORNEKLERI — markanin gercek iyi gonderileri] Bunlarin ses/ritim/uzunlugunu TAKLIT et, kelimesi kelimesine KOPYALAMA:",
    );
    goodEx.forEach((e, i) => lines.push(`Ornek ${i + 1}: ${e}`));
  }
  const badEx = (brand.voice.badExamples ?? []).filter(Boolean);
  if (badEx.length) {
    lines.push("");
    lines.push("[KACINILACAK ORNEKLER] Bu tarza ASLA benzeme:");
    badEx.forEach((e, i) => lines.push(`Kotu ${i + 1}: ${e}`));
  }
  if (persona) {
    lines.push(
      `Hedef persona: ${persona.name} — acisi: ${persona.pain || "-"}; motivasyonu: ${
        persona.motivation || "-"
      }`,
    );
    const depth: string[] = [];
    if (persona.objections?.trim()) depth.push(`itirazlar: ${persona.objections.trim()}`);
    if (persona.vocabulary?.trim())
      depth.push(`kullandigi kelimeler: ${persona.vocabulary.trim()}`);
    if (persona.triggers?.trim()) depth.push(`tetikleyiciler: ${persona.triggers.trim()}`);
    if (depth.length) {
      lines.push(`Persona derinligi — ${depth.join("; ")}.`);
      lines.push(
        "Personanin kendi kelimeleriyle yaz; bir itirazi onceden karsila; bir tetikleyiciye dokun.",
      );
    }
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
  const pillars = (brand.pillars ?? []).filter((p) => p && p.trim());
  if (pillars.length) {
    lines.push(
      `Icerik sutunlari: ${pillars.join(", ")}. Bu icerik, en uygun sutuna acikca hizmet etsin (markanin sahip oldugu temayi guclendir).`,
    );
  }
  lines.push(`Konu: ${topic}`);
  lines.push(`Icerik tipi: ${CONTENT_TYPE_LABELS[contentType]}`);
  lines.push(`Aci: ${ANGLE_LABELS[angle]} — ${ANGLE_HINTS[angle]}`);
  if (req.trend && req.trend.trim()) {
    lines.push(
      `[TREND ENJEKSIYONU] Guncel olay/trend: "${req.trend.trim()}". Icerigi bu guncel baglama dogal sekilde bagla; zorlamadan, marka mesajiyla ortustur.`,
    );
  }
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
    "[A/B VARYANT] Ayrica 'variants' alanini doldur: birbirinden belirgin farkli 2-3 alternatif uret — captions (IG caption), tiktokHooks (TikTok hook), xOpeners (X acilis tweet'i). Her alternatif ayni stratejiyi farkli aci/ifadeyle denesin.",
  );
  lines.push("");
  lines.push(
    "Ciktiyi SADECE verilen JSON semasina gore uret. Aciklama/markdown ekleme.",
  );

  return lines.join("\n");
}

// Ses-ton (0-10) → somut yazım kuralları. Marka Beyni derinliği.
export function toneDirectives(tone: number): string {
  if (tone <= 3) {
    return "Resmi/kurumsal: net, profesyonel, abartısız. Argo ve emoji yok; 'siz' dili. Veriyle konuş.";
  }
  if (tone >= 7) {
    return "Samimi/sıcak: 'sen' dili, kısa ve enerjik cümleler, ölçülü emoji, günlük konuşma tonu.";
  }
  return "Dengeli: profesyonel ama insani; teknik doğruluk + erişilebilir dil. Emoji minimal.";
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
    variants: {
      type: "object",
      additionalProperties: false,
      properties: {
        captions: { type: "array", items: { type: "string" } },
        tiktokHooks: { type: "array", items: { type: "string" } },
        xOpeners: { type: "array", items: { type: "string" } },
      },
      required: ["captions", "tiktokHooks", "xOpeners"],
    },
  },
  required: ["instagram", "tiktok", "linkedin", "x", "variants"],
} as const;
