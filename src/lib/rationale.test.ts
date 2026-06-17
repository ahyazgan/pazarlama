import { describe, expect, it } from "vitest";
import { buildRationale } from "./rationale";
import { buildDemoPackage } from "./demo";
import { HAMMADDEM_SAMPLE } from "./brand-store";
import type { ContentPackage, GenerateRequest } from "./types";

const req: GenerateRequest = {
  brand: HAMMADDEM_SAMPLE,
  topic: "Geç teslimat riski",
  contentType: "deger",
  angle: "korku",
  personaIndex: 0,
};

const pkg = (): ContentPackage => buildDemoPackage(req);

const titles = (p: ContentPackage) => buildRationale(p, HAMMADDEM_SAMPLE).sections.map((s) => s.title);

describe("buildRationale", () => {
  it("strateji + mevzuat + benchmark bölümlerini üretir", () => {
    const t = titles(pkg());
    expect(t).toContain("Strateji kararı");
    expect(t).toContain("Mevzuat & uyum");
    expect(t).toContain("Kaçınılan yaygın hatalar");
    expect(t).toContain("Benchmark dayanağı");
  });

  it("strateji kararı açının sektördeki gücünü açıklar", () => {
    const r = buildRationale(pkg(), HAMMADDEM_SAMPLE);
    const strateji = r.sections.find((s) => s.title === "Strateji kararı")!;
    // insaat angleAffinity[0] === "korku" → en güçlü açı
    expect(strateji.items[0]).toMatch(/Korku/);
    expect(strateji.items[0]).toMatch(/en güçlü/);
  });

  it("metinde geçen sektör terimini kanıt olarak yakalar", () => {
    const p = pkg();
    p.outputs.instagram.caption = "Santiyede irsaliye ve tedarik suresi kritik.";
    const sek = buildRationale(p, HAMMADDEM_SAMPLE).sections.find(
      (s) => s.title === "Sektör zekası izi",
    )!;
    expect(sek.tone).toBe("ok");
    expect(sek.items[0]).toMatch(/irsaliye/);
  });

  it("imza ifade + kanıt rakamı kullanımını metinden tespit eder", () => {
    const p = pkg();
    p.outputs.linkedin.body = "Santiyeye deger katiyoruz: 10.000+ ton teslimat yaptik.";
    const marka = buildRationale(p, HAMMADDEM_SAMPLE).sections.find(
      (s) => s.title === "Marka beyni izi",
    )!;
    expect(marka.items.join(" ")).toMatch(/imza ifade/i);
    expect(marka.items.join(" ")).toMatch(/10\.000/);
  });

  it("yasak kelime geçerse uyarır (warn)", () => {
    const p = pkg();
    p.outputs.instagram.caption = "En ucuz fiyatlarla bedava teslimat!";
    const marka = buildRationale(p, HAMMADDEM_SAMPLE).sections.find(
      (s) => s.title === "Marka beyni izi",
    )!;
    expect(marka.tone).toBe("warn");
    expect(marka.items.join(" ")).toMatch(/Yasak kelime geçti/);
  });
});
