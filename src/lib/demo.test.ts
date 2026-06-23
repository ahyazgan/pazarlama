import { describe, expect, it } from "vitest";
import { buildDemoPackage } from "./demo";
import { HAMMADDEM_SAMPLE } from "./brand-store";
import type { GenerateRequest } from "./types";

const req: GenerateRequest = {
  brand: HAMMADDEM_SAMPLE,
  topic: "Cimento stogu tazelendi",
  contentType: "deger",
  angle: "korku",
  personaIndex: 0,
  demo: true,
};

describe("demo (anahtarsiz) cikti ureteci", () => {
  const pkg = buildDemoPackage(req);

  it("demo bayragi ve meta alanlari dogru", () => {
    expect(pkg.demo).toBe(true);
    expect(pkg.topic).toBe("Cimento stogu tazelendi");
    expect(pkg.angle).toBe("korku");
  });

  it("marka beynini sablona enjekte eder (marka adi, persona, kanit)", () => {
    const all = JSON.stringify(pkg.outputs);
    expect(all).toContain("Hammaddem");
    expect(all).toContain("Saha Mudur"); // persona adi
    expect(all).toContain("10.000+ ton teslimat"); // kanit rakami
  });

  it("sektor terminolojisini kullanir", () => {
    const all = JSON.stringify(pkg.outputs).toLowerCase();
    expect(all).toContain("agrega"); // insaat terminolojisi[0]
  });

  it("dort platformu da uretir", () => {
    expect(pkg.outputs.instagram.caption).toBeTruthy();
    expect(pkg.outputs.tiktok.scenes.length).toBe(3);
    expect(pkg.outputs.linkedin.body).toBeTruthy();
    expect(pkg.outputs.x.thread.length).toBeGreaterThanOrEqual(3);
  });

  it("instagram gorsel prompt marka rengini icerir", () => {
    expect(pkg.outputs.instagram.imagePrompt).toContain("#E8650A");
  });

  it("A/B varyantlari uretir (caption + tiktok hook + x opener)", () => {
    const v = pkg.outputs.variants;
    expect(v).toBeTruthy();
    expect(v!.captions.length).toBeGreaterThanOrEqual(2);
    expect(v!.tiktokHooks.length).toBeGreaterThanOrEqual(2);
    expect(v!.xOpeners.length).toBeGreaterThanOrEqual(2);
  });

  it("marka CTA hedefini TikTok/X CTA olarak kullanir", () => {
    // Hammaddem ctaGoal: "Teklif al / WhatsApp'tan tedarik sorusu sor"
    expect(pkg.outputs.tiktok.cta).toContain("Teklif al");
    expect(pkg.outputs.x.thread.join(" ")).toContain("Teklif al");
  });

  it("zorunlu disclaimer'i caption ve linkedin govdesine ekler", () => {
    // Hammaddem requiredDisclaimers: ["Fiyatlara KDV dahil degildir"]
    expect(pkg.outputs.instagram.caption).toContain("KDV");
    expect(pkg.outputs.linkedin.body).toContain("KDV");
  });

  it("vaka kanitini ve farklilasmayi enjekte eder", () => {
    const li = pkg.outputs.linkedin.body;
    expect(li).toContain("400 ton"); // proof.cases[0]
    expect(li.toLowerCase()).toContain("ayıran"); // differentiation çerçevesi
  });

  it("aci farkli olunca cikti gorunur sekilde degisir", () => {
    const korku = buildDemoPackage({ ...req, angle: "korku" }).outputs.instagram.caption;
    const kazanc = buildDemoPackage({ ...req, angle: "kazanc" }).outputs.instagram.caption;
    expect(korku).not.toBe(kazanc); // açıya özel çerçeve farkı
  });
});
