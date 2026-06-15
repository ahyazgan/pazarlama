import { describe, expect, it } from "vitest";
import { AD_SCHEMA, buildAdsUser, buildDemoAds } from "./ads";
import { HAMMADDEM_SAMPLE } from "./brand-store";
import type { AdsRequest } from "./types";

const req: AdsRequest = {
  brand: HAMMADDEM_SAMPLE,
  topic: "2 günde garantili teslim",
  objective: "donusum",
  personaIndex: 0,
};

describe("reklam metni", () => {
  it("user prompt hedef + konu + limitleri içerir", () => {
    const u = buildAdsUser(req);
    expect(u).toMatch(/REKLAM GOREVI/);
    expect(u).toMatch(/Donusum/);
    expect(u).toContain("2 günde garantili teslim");
    expect(u).toMatch(/Meta:/);
    expect(u).toMatch(/Google:/);
  });

  it("şema meta + google + audience zorunlu", () => {
    expect(AD_SCHEMA.required).toEqual(["meta", "google", "audience"]);
  });

  it("demo reklam seti marka beynini kullanır", () => {
    const ads = buildDemoAds(req);
    expect(ads.meta.primaryTexts.length).toBeGreaterThanOrEqual(2);
    expect(ads.meta.headlines.length).toBeGreaterThanOrEqual(2);
    expect(ads.google.headlines.length).toBeGreaterThanOrEqual(2);
    expect(ads.meta.cta).toBeTruthy();
    const blob = JSON.stringify(ads);
    expect(blob).toContain("Hammaddem");
    expect(blob).toMatch(/10\.000\+ ton/);
  });

  it("google açıklamaları 90 karakter sınırında", () => {
    const ads = buildDemoAds(req);
    for (const d of ads.google.descriptions) expect(d.length).toBeLessThanOrEqual(90);
  });
});
