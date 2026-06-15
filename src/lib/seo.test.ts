import { describe, expect, it } from "vitest";
import { SEO_SCHEMA, buildSeoUser, buildDemoSeo } from "./seo";
import { HAMMADDEM_SAMPLE } from "./brand-store";
import type { SeoRequest } from "./types";

const req: SeoRequest = {
  brand: HAMMADDEM_SAMPLE,
  topic: "Şantiyede çimento stok yönetimi",
  primaryKeyword: "çimento stok yönetimi",
};

describe("SEO içerik", () => {
  it("user prompt konu + anahtar kelime + iskelet kuralları", () => {
    const u = buildSeoUser(req);
    expect(u).toMatch(/SEO GOREVI/);
    expect(u).toContain("çimento stok yönetimi");
    expect(u).toMatch(/title:/);
    expect(u).toMatch(/outline:/);
  });

  it("şema title/meta/keywords/outline/intro zorunlu", () => {
    expect(SEO_SCHEMA.required).toEqual([
      "title",
      "metaDescription",
      "primaryKeyword",
      "keywords",
      "outline",
      "intro",
    ]);
  });

  it("demo iskeleti meta sınırlarına uyar + sektör terimlerini kullanır", () => {
    const seo = buildDemoSeo(req);
    expect(seo.title.length).toBeLessThanOrEqual(60);
    expect(seo.metaDescription.length).toBeLessThanOrEqual(155);
    expect(seo.outline.length).toBeGreaterThanOrEqual(3);
    expect(seo.keywords).toContain("çimento stok yönetimi");
    expect(seo.keywords.some((k) => k === "agrega")).toBe(true);
  });
});
