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

// ============================================================================
// Prompt kurulumu — Constitution Bolum 8.
// CACHING ICIN AYRIM: buildSystemPrompt = markaya/sektore gore SABIT prefix
// (her uretimde ayni → prompt-caching ile ucuzlar). buildUserPrompt = yalnizca
// degisen gorev (konu/tip/aci/persona/trend). Generic'lik yine marka beyni +
// sektor zekasi enjeksiyonuyla kirilir.
// ============================================================================

export function buildSystemPrompt(brand: GenerateRequest["brand"]): string {
  const sector = getSector(brand.sector);
  const toneLabel =
    brand.voice.tone <= 3 ? "resmi/kurumsal" : brand.voice.tone >= 7 ? "samimi/sicak" : "dengeli";
  const lines: string[] = [];

  lines.push(
    `Sen ${sector.label} sektorunde uzman bir sosyal medya icerik stratejistisin.`,
  );
  lines.push(
    `Generic icerik uretmek YASAK. Cikti, asagidaki marka beyni ve sektor zekasi ile o markaya OZGU olmali; baska bir marka bunu kopyalayip kullanamamali.`,
  );
  lines.push(
    `Turkce uret. Su "AI kokan" klise kaliplari KULLANMA: "gunumuz dunyasinda", "bu yazida/gonderide", "sizler icin", "hayatinizi kolaylastirmak icin", asiri emoji, ic bos sifat yiginlari. Somut ol; her cumle bir bilgi tasisin.`,
  );

  lines.push("");
  lines.push("[MARKA BEYNI]");
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
    `Ses: ton=${brand.voice.tone}/10 (${toneLabel}); cumle yapisi: ${brand.voice.sentenceStyle || "-"}`,
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
      `Imza ifadeler (uygun yerde kullan): ${brand.voice.signaturePhrases.filter(Boolean).join(" | ")}`,
    );
  }
  const goodEx = (brand.voice.goodExamples ?? []).filter(Boolean);
  if (goodEx.length) {
    lines.push(
      "[SES ORNEKLERI — markanin gercek iyi gonderileri] Bunlarin ses/ritim/uzunlugunu TAKLIT et, kelimesi kelimesine KOPYALAMA:",
    );
    goodEx.forEach((e, i) => lines.push(`Ornek ${i + 1}: ${e}`));
  }
  const badEx = (brand.voice.badExamples ?? []).filter(Boolean);
  if (badEx.length) {
    lines.push("[KACINILACAK ORNEKLER] Bu tarza ASLA benzeme:");
    badEx.forEach((e, i) => lines.push(`Kotu ${i + 1}: ${e}`));
  }
  if (brand.proof.numbers.filter(Boolean).length) {
    lines.push(
      `Kanit (gercek rakamlar — uydurma, sadece bunlari kullan): ${brand.proof.numbers.filter(Boolean).join("; ")}`,
    );
  }
  if (brand.proof.cases.filter(Boolean).length) {
    lines.push(`Vaka ornekleri: ${brand.proof.cases.filter(Boolean).join("; ")}`);
  }
  if (brand.proof.references.filter(Boolean).length) {
    lines.push(`Referanslar: ${brand.proof.references.filter(Boolean).join("; ")}`);
  }
  const pillars = (brand.pillars ?? []).filter((p) => p && p.trim());
  if (pillars.length) {
    lines.push(
      `Icerik sutunlari: ${pillars.join(", ")}. Her icerik en uygun sutuna acikca hizmet etsin.`,
    );
  }
  if (brand.identity.ctaGoal?.trim()) {
    lines.push(
      `Donusum hedefi: ${brand.identity.ctaGoal.trim()}. Tum CTA'lar bu eyleme yonlendirsin (generic "bizi takip et" deme).`,
    );
  }

  lines.push("");
  lines.push("[SEKTOR ZEKASI]");
  lines.push(`Terminoloji (dogal kullan): ${sector.terminology.join(", ")}`);
  lines.push(`Mevsimsellik: ${sector.seasonality}`);
  lines.push(`Uygun hook formulleri (ilham al, kopyalama): ${sector.hooks.join(" | ")}`);

  lines.push("");
  lines.push("[PLATFORM DNA — her platformun kendi fizigi]");
  lines.push(platformDnaBlock(sector.platformEmphasis));
  lines.push(
    `[PLATFORM ONCELIGI] Bu sektorde en cok donus veren sira: ${sector.platformEmphasis
      .map((p) => PLATFORM_LABELS[p])
      .join(" > ")}. Ilk iki platforma ekstra ozen goster.`,
  );

  lines.push("");
  lines.push("[KALITE KURALLARI — generic'ligi kir]");
  lines.push("- Hook'un ilk satiri DOGRUDAN secilen personanin acisina degsin.");
  lines.push("- SADECE verilen gercek rakamlari kullan; rakam UYDURMA.");
  lines.push("- Yasakli kelimeleri asla kullanma; imza ifadeleri dogal yerlestir.");
  lines.push("- Sektor terminolojisini dogal kullan; secilen aciya sadik kal.");
  lines.push(
    "[A/B VARYANT] 'variants' alanini doldur: belirgin farkli 2-3 alternatif — captions, tiktokHooks, xOpeners.",
  );
  lines.push(
    "Su 4 platform icin TAM paket uret (Instagram, TikTok, LinkedIn, X). Ciktiyi SADECE verilen JSON semasina gore ver; aciklama/markdown ekleme.",
  );

  return lines.join("\n");
}

export function buildUserPrompt(req: GenerateRequest): string {
  const { brand, topic, contentType, angle, personaIndex } = req;
  const persona = brand.audience[personaIndex] ?? brand.audience[0];
  const lines: string[] = [];

  lines.push("[GOREV]");
  if (persona) {
    lines.push(
      `Hedef persona: ${persona.name} — acisi: ${persona.pain || "-"}; motivasyonu: ${persona.motivation || "-"}`,
    );
    const depth: string[] = [];
    if (persona.objections?.trim()) depth.push(`itirazlar: ${persona.objections.trim()}`);
    if (persona.vocabulary?.trim()) depth.push(`kullandigi kelimeler: ${persona.vocabulary.trim()}`);
    if (persona.triggers?.trim()) depth.push(`tetikleyiciler: ${persona.triggers.trim()}`);
    if (depth.length) {
      lines.push(`Persona derinligi — ${depth.join("; ")}.`);
      lines.push("Personanin kelimeleriyle yaz; bir itirazi onceden karsila; bir tetikleyiciye dokun.");
    }
    lines.push("Bu personanin acisina/motivasyonuna dogrudan hitap et.");
  }
  lines.push(`Konu: ${topic}`);
  lines.push(`Icerik tipi: ${CONTENT_TYPE_LABELS[contentType]}`);
  lines.push(`Aci: ${ANGLE_LABELS[angle]} — ${ANGLE_HINTS[angle]}`);
  if (req.trend && req.trend.trim()) {
    lines.push(
      `[TREND] Guncel olay/trend: "${req.trend.trim()}". Icerigi bu guncel baglama dogal sekilde bagla.`,
    );
  }
  lines.push("");
  lines.push(
    "Yukaridaki marka beyni + sektor zekasina gore bu gorev icin TAM paketi (4 platform + variants) JSON semasina uygun uret.",
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
