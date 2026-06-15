import { describe, expect, it } from "vitest";
import { brainInjectionSummary } from "./brain-preview";
import { HAMMADDEM_SAMPLE, emptyBrand } from "./brand-store";
import type { GenerateRequest } from "./types";

const base = (over: Partial<GenerateRequest> = {}): GenerateRequest => ({
  brand: HAMMADDEM_SAMPLE,
  topic: "Stok tazelendi",
  contentType: "deger",
  angle: "korku",
  personaIndex: 0,
  ...over,
});

describe("brainInjectionSummary", () => {
  it("dolu beyinde few-shot/konumlandırma/kanıt aktif", () => {
    const items = brainInjectionSummary(base());
    const byLabel = Object.fromEntries(items.map((i) => [i.label, i]));
    expect(byLabel["Ses örnekleri (few-shot)"].active).toBe(true);
    expect(byLabel["Konumlandırma"].active).toBe(true);
    expect(byLabel["Kanıt rakamları"].active).toBe(true);
  });

  it("boş beyinde çoğu sinyal pasif (sektör zekası hariç hep var)", () => {
    const items = brainInjectionSummary(base({ brand: emptyBrand() }));
    const active = items.filter((i) => i.active).map((i) => i.label);
    expect(active).toContain("Sektör zekası"); // her zaman var
    expect(active).not.toContain("Ses örnekleri (few-shot)");
  });

  it("trend verilince aktif olur", () => {
    const items = brainInjectionSummary(base({ trend: "Yeni yönetmelik" }));
    expect(items.find((i) => i.label === "Trend bağlamı")?.active).toBe(true);
  });
});
