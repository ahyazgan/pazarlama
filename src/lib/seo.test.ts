import { describe, expect, it } from "vitest";
import { SEO_SCHEMA, auditSeo, buildSeoUser, buildDemoSeo } from "./seo";
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

describe("auditSeo", () => {
  it("iyi içeriğe yüksek skor", () => {
    const seo = {
      title: "Çimento Stok Yönetimi Rehberi",
      metaDescription: "x".repeat(140),
      primaryKeyword: "çimento stok yönetimi",
      keywords: ["a", "b", "c", "d", "e"],
      outline: [
        { h2: "1", points: [] },
        { h2: "2", points: [] },
        { h2: "3", points: [] },
        { h2: "4", points: [] },
      ],
      intro: "Çimento stok yönetimi önemlidir.",
    };
    const a = auditSeo(seo);
    expect(a.score).toBeGreaterThanOrEqual(80);
  });

  it("kötü içeriğe düşük skor + işaretler", () => {
    const seo = {
      title: "X".repeat(80),
      metaDescription: "kısa",
      primaryKeyword: "anahtar",
      keywords: ["a"],
      outline: [{ h2: "1", points: [] }],
      intro: "alakasız",
    };
    const a = auditSeo(seo);
    expect(a.score).toBeLessThan(40);
    expect(a.checks.some((c) => !c.ok)).toBe(true);
  });
});
