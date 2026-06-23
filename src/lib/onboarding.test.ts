import { describe, expect, it } from "vitest";
import {
  WIZARD_STEPS,
  isStepComplete,
  completedStepCount,
  canFinish,
} from "./onboarding";
import { HAMMADDEM_SAMPLE, emptyBrand } from "./brand-store";

describe("onboarding wizard", () => {
  it("5 adım tanımlı ve katmanlara karşılık gelir", () => {
    expect(WIZARD_STEPS.map((s) => s.id)).toEqual([
      "identity",
      "voice",
      "audience",
      "proof",
      "sector",
    ]);
  });

  it("boş beyinde hiçbir adım tamam değil", () => {
    const b = emptyBrand();
    expect(completedStepCount(b)).toBe(0);
    expect(canFinish(b)).toBe(false);
  });

  it("Hammaddem örneğinde tüm adımlar tamam", () => {
    expect(completedStepCount(HAMMADDEM_SAMPLE)).toBe(5);
    WIZARD_STEPS.forEach((s) => expect(isStepComplete(HAMMADDEM_SAMPLE, s.id)).toBe(true));
    expect(canFinish(HAMMADDEM_SAMPLE)).toBe(true);
  });

  it("kimlik adımı: ad + (değer önerisi veya misyon) ister", () => {
    const b = emptyBrand();
    b.name = "X";
    expect(isStepComplete(b, "identity")).toBe(false);
    b.identity.valueProp = "Hızlı tedarik";
    expect(isStepComplete(b, "identity")).toBe(true);
  });

  it("canFinish: ad + sektör + ilk persona acısı yeterli minimum", () => {
    const b = emptyBrand();
    b.name = "X";
    b.audience[0].pain = "Geç teslimat";
    expect(canFinish(b)).toBe(true);
  });

  it("sektör adımı CTA hedefi ister", () => {
    const b = emptyBrand();
    expect(isStepComplete(b, "sector")).toBe(false);
    b.identity.ctaGoal = "Teklif al";
    expect(isStepComplete(b, "sector")).toBe(true);
  });
});
