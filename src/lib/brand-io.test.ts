import { describe, expect, it } from "vitest";
import { parseBrand, serializeBrand } from "./brand-io";
import { HAMMADDEM_SAMPLE } from "./brand-store";

describe("brand export/import", () => {
  it("roundtrip: serialize → parse aynı içeriği verir (id hariç)", () => {
    const json = serializeBrand({ ...HAMMADDEM_SAMPLE, id: "b-123" });
    expect(json).not.toMatch(/"id"/); // id taşınmaz
    const back = parseBrand(json);
    expect(back?.name).toBe(HAMMADDEM_SAMPLE.name);
    expect(back?.id).toBeUndefined();
    expect(back?.audience.length).toBe(HAMMADDEM_SAMPLE.audience.length);
  });

  it("geçersiz JSON → null", () => {
    expect(parseBrand("{bozuk")).toBeNull();
  });

  it("eksik iskelet → null", () => {
    expect(parseBrand(JSON.stringify({ name: "x" }))).toBeNull();
  });

  it("import edilen marka id taşımaz", () => {
    const back = parseBrand(JSON.stringify({ ...HAMMADDEM_SAMPLE, id: "should-drop" }));
    expect(back?.id).toBeUndefined();
  });
});
