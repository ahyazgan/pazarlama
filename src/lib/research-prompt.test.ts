import { describe, expect, it } from "vitest";
import {
  buildResearchSystem,
  buildResearchUser,
  parseResearchBrief,
} from "./research-prompt";
import { HAMMADDEM_SAMPLE } from "./brand-store";

describe("research prompt", () => {
  it("system araştırmacı + web_search + JSON ister", () => {
    const s = buildResearchSystem(HAMMADDEM_SAMPLE);
    expect(s).toMatch(/arastirmaci/i);
    expect(s).toMatch(/web_search/);
    expect(s).toMatch(/JSON/);
  });

  it("user konu + kaynaklı bulgu ister", () => {
    expect(buildResearchUser(HAMMADDEM_SAMPLE, "Çimento fiyatı")).toMatch(/Çimento fiyatı/);
  });
});

describe("parseResearchBrief", () => {
  it("serbest metin içindeki son JSON'u ayıklar", () => {
    const text = `Araştırdım, işte özet.\n\n{"findings":["Çimento %12 arttı"],"sources":[{"title":"TÜİK","url":"https://x"}],"competitorGap":"şeffaflık yok"}`;
    const brief = parseResearchBrief(text, "Çimento");
    expect(brief?.findings[0]).toMatch(/%12/);
    expect(brief?.sources[0].url).toBe("https://x");
    expect(brief?.competitorGap).toMatch(/şeffaflık/);
    expect(brief?.topic).toBe("Çimento");
  });

  it("JSON yoksa null", () => {
    expect(parseResearchBrief("hiç json yok", "x")).toBeNull();
  });

  it("boş bulgu+kaynak → null", () => {
    expect(parseResearchBrief('{"findings":[],"sources":[]}', "x")).toBeNull();
  });
});
