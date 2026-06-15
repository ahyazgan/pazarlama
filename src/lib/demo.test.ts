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
});
