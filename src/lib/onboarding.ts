import type { Brand } from "./types";

// ============================================================================
// Onboarding sihirbazı — ilk kullanıcı için rehberli marka beyni kurulumu.
// "Boş sayfa sendromu"nu kırar: 631 satırlık tek formu, marka katmanlarına
// karşılık gelen sindirilebilir adımlara böler. Saf mantık (test edilebilir):
// adım listesi + adım-tamamlanma doğrulaması + minimum kaydedilebilirlik.
// UI (/onboarding) bu fonksiyonları kullanır; tam düzenleme /brand'de kalır.
// ============================================================================

export interface WizardStep {
  id: "identity" | "voice" | "audience" | "proof" | "sector";
  title: string;
  hint: string;
}

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: "identity",
    title: "Kimlik",
    hint: "Marka adı, misyon, değer önerisi ve seni rakipten ayıran şey.",
  },
  {
    id: "voice",
    title: "Ses",
    hint: "Ton, cümle stili ve markanın asla kullanmayacağı yasak kelimeler.",
  },
  {
    id: "audience",
    title: "Kitle",
    hint: "En az bir persona: kimin acısını çözüyorsun ve onu ne motive ediyor.",
  },
  {
    id: "proof",
    title: "Kanıt",
    hint: "Gerçek rakamlar, vaka örnekleri veya referanslar — generic'liği kıran şey.",
  },
  {
    id: "sector",
    title: "Sektör & Hedef",
    hint: "Sektörünü seç ve içeriğin dönüşüm hedefini (CTA) belirle.",
  },
];

const has = (s?: string) => !!s && s.trim().length > 0;
const hasInList = (a?: string[]) => !!a && a.some((x) => has(x));

// Bir adım, üretime anlamlı katkı yapacak kadar dolu mu? (Saf.)
export function isStepComplete(brand: Brand, stepId: WizardStep["id"]): boolean {
  const id = brand.identity;
  const v = brand.voice;
  switch (stepId) {
    case "identity":
      return has(brand.name) && (has(id?.valueProp) || has(id?.mission));
    case "voice":
      return hasInList(v?.bannedWords) || has(v?.sentenceStyle);
    case "audience": {
      const first = brand.audience?.[0];
      return !!first && (has(first.pain) || has(first.motivation));
    }
    case "proof":
      return (
        hasInList(brand.proof?.numbers) ||
        hasInList(brand.proof?.cases) ||
        hasInList(brand.proof?.references)
      );
    case "sector":
      return has(brand.sector) && has(id?.ctaGoal);
    default:
      return false;
  }
}

export function completedStepCount(brand: Brand): number {
  return WIZARD_STEPS.filter((s) => isStepComplete(brand, s.id)).length;
}

// Kaydetmeye yetecek minimum beyin: ad + sektör + en az bir persona acısı.
// Wizard, kullanıcıyı zorlamadan erken çıkışa izin verir; geri kalanı /brand'de
// derinleştirilebilir. Tamamen boş beynin kaydedilmesini engeller.
export function canFinish(brand: Brand): boolean {
  const firstPain = brand.audience?.[0]?.pain;
  return has(brand.name) && has(brand.sector) && has(firstPain);
}
