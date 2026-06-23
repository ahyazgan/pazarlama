import type { GenerateRequest } from "./types";
import { getSector } from "./sectors";

// ============================================================================
// Şeffaflık önizlemesi: üretimde beyne NE enjekte edildiğini okunabilir özetler.
// Ham prompt değil, insan-okur özet. Güven verir + kullanıcıyı beyni doldurmaya iter.
// Saf fonksiyon (test edilebilir).
// ============================================================================

export interface InjectionItem {
  label: string;
  value: string;
  active: boolean; // bu sinyal gerçekten enjekte ediliyor mu (doluysa)
}

const list = (a?: string[]) => (a ?? []).filter((s) => s && s.trim());

export function brainInjectionSummary(req: GenerateRequest): InjectionItem[] {
  const { brand } = req;
  const sector = getSector(brand.sector);
  const persona = brand.audience[req.personaIndex] ?? brand.audience[0];
  const good = list(brand.voice.goodExamples);
  const banned = list(brand.voice.bannedWords);
  const nums = list(brand.proof.numbers);
  const personaDepth = persona
    ? [persona.objections, persona.vocabulary, persona.triggers].filter((s) => s && s.trim())
        .length
    : 0;

  return [
    { label: "Marka kimliği", value: brand.name || "—", active: !!brand.name },
    {
      label: "Kişilik",
      value: list(brand.identity.personality).join(", ") || "—",
      active: list(brand.identity.personality).length > 0,
    },
    {
      label: "Ses tonu",
      value: `${brand.voice.tone}/10`,
      active: true,
    },
    {
      label: "Ses örnekleri (few-shot)",
      value: good.length ? `${good.length} gerçek gönderi taklit ediliyor` : "yok",
      active: good.length > 0,
    },
    {
      label: "Yasak kelimeler",
      value: banned.length ? banned.join(", ") : "yok",
      active: banned.length > 0,
    },
    {
      label: "Konumlandırma",
      value: brand.identity.differentiation?.trim()
        ? "fark + rakip enjekte ediliyor"
        : "yok",
      active: !!brand.identity.differentiation?.trim() || list(brand.identity.competitors).length > 0,
    },
    {
      label: "Hedef persona",
      value: persona
        ? `${persona.name || "persona"}${personaDepth ? ` (+${personaDepth} derinlik sinyali)` : ""}`
        : "—",
      active: !!persona,
    },
    {
      label: "Kanıt rakamları",
      value: nums.length ? nums.join("; ") : "yok",
      active: nums.length > 0,
    },
    {
      label: "Sektör zekası",
      value: `${sector.terminology.length} terim · ${sector.hooks.length} hook · platform önceliği: ${sector.platformEmphasis[0]}`,
      active: true,
    },
    {
      label: "Trend bağlamı",
      value: req.trend?.trim() ? req.trend.trim() : "yok",
      active: !!req.trend?.trim(),
    },
  ];
}
