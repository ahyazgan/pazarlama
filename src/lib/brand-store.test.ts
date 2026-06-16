import { describe, expect, it } from "vitest";
import {
  pickActiveBrand,
  removeBrandFromList,
  upsertBrandList,
  type BrandStore,
} from "./brand-store";
import type { Brand } from "./types";

const b = (id: string, name = id): Brand =>
  ({
    id,
    name,
    sector: "insaat",
    identity: { mission: "", valueProp: "", personality: [] },
    voice: { tone: 5, sentenceStyle: "", bannedWords: [], signaturePhrases: [] },
    audience: [],
    proof: { numbers: [], cases: [], references: [] },
  }) as Brand;

describe("çok-marka pure yardımcılar", () => {
  it("pickActiveBrand aktif id'yi seçer, yoksa ilkine düşer", () => {
    const store: BrandStore = { brands: [b("1"), b("2")], activeId: "2" };
    expect(pickActiveBrand(store)?.id).toBe("2");
    expect(pickActiveBrand({ brands: [b("1")], activeId: "yok" })?.id).toBe("1");
    expect(pickActiveBrand({ brands: [], activeId: null })).toBeNull();
  });

  it("upsertBrandList id varsa günceller, yoksa ekler", () => {
    const list = [b("1", "A"), b("2", "B")];
    expect(upsertBrandList(list, b("2", "B2")).find((x) => x.id === "2")?.name).toBe("B2");
    expect(upsertBrandList(list, b("3", "C"))).toHaveLength(3);
  });

  it("removeBrandFromList id'yi siler", () => {
    expect(removeBrandFromList([b("1"), b("2")], "1").map((x) => x.id)).toEqual(["2"]);
  });
});
