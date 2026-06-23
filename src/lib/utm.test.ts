import { describe, expect, it } from "vitest";
import { buildUtmUrl, campaignSlug, platformLinks } from "./utm";

describe("utm etiketleme", () => {
  it("temiz URL'e ? ile parametre ekler", () => {
    const u = buildUtmUrl("https://site.com/urun", {
      source: "instagram",
      medium: "social",
      campaign: "marka-konu",
    });
    expect(u).toBe(
      "https://site.com/urun?utm_source=instagram&utm_medium=social&utm_campaign=marka-konu",
    );
  });

  it("mevcut query varsa & ile ekler", () => {
    const u = buildUtmUrl("https://site.com?ref=x", {
      source: "x",
      medium: "social",
      campaign: "c",
    });
    expect(u).toContain("?ref=x&utm_source=x");
  });

  it("fragment'i (#) sona korur", () => {
    const u = buildUtmUrl("https://site.com/s#bolum", {
      source: "tiktok",
      medium: "social",
      campaign: "c",
    });
    expect(u.endsWith("#bolum")).toBe(true);
    expect(u).toContain("utm_source=tiktok");
  });

  it("boş base boş döner", () => {
    expect(buildUtmUrl("  ", { source: "a", medium: "b", campaign: "c" })).toBe("");
  });

  it("campaignSlug marka+konuyu birleştirir", () => {
    expect(campaignSlug("Hammaddem", "Çimento stoğu")).toBe("hammaddem-çimento-stoğu");
  });

  it("platformLinks 4 platform için ayrı source üretir", () => {
    const links = platformLinks("https://site.com", "kamp");
    expect(links).toHaveLength(4);
    expect(links.map((l) => l.platform)).toEqual(["instagram", "tiktok", "linkedin", "x"]);
    expect(links[0].url).toContain("utm_source=instagram");
    expect(links[3].url).toContain("utm_source=x");
  });
});
