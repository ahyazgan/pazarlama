import { describe, expect, it } from "vitest";
import { addItem, filterLibrary, type LibraryItem } from "./library";
import type { ContentPackage } from "./types";

const pkg = (topic: string, angle: ContentPackage["angle"]): ContentPackage => ({
  topic,
  contentType: "deger",
  angle,
  outputs: {
    instagram: { caption: "", firstComment: "", imagePrompt: "", altText: "" },
    tiktok: { hook: "", scenes: [], soundSuggestion: "", cta: "" },
    linkedin: { hookLine: "", body: "", insight: "", discussionQuestion: "" },
    x: { thread: [] },
  },
});

const item = (id: string, topic: string, angle: ContentPackage["angle"]): LibraryItem => ({
  id,
  topic,
  brandName: "Hammaddem",
  sector: "insaat",
  pkg: pkg(topic, angle),
  at: Number(id),
});

describe("library addItem", () => {
  it("yeni öğeyi başa ekler", () => {
    const list = addItem([], item("1", "A", "korku"));
    expect(list[0].topic).toBe("A");
  });

  it("aynı konu+açı+marka → günceller (dedup)", () => {
    let list = addItem([], item("1", "A", "korku"));
    list = addItem(list, item("2", "A", "korku"));
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe("2");
  });

  it("farklı açı → ayrı kayıt", () => {
    let list = addItem([], item("1", "A", "korku"));
    list = addItem(list, item("2", "A", "kazanc"));
    expect(list).toHaveLength(2);
  });

  it("MAX ile sınırlar", () => {
    let list: LibraryItem[] = [];
    for (let i = 0; i < 5; i++) list = addItem(list, item(String(i), `T${i}`, "korku"), 3);
    expect(list).toHaveLength(3);
  });
});

describe("library filterLibrary", () => {
  const list: LibraryItem[] = [
    item("1", "Çimento stoğu", "korku"),
    item("2", "Beton fiyatı", "kazanc"),
    { ...item("3", "Kahve menüsü", "kazanc"), brandName: "Köşe Kafe", sector: "kafe" },
  ];

  it("boş filtre hepsini döner", () => {
    expect(filterLibrary(list, {})).toHaveLength(3);
  });

  it("metin konu ve markada arar (case-insensitive)", () => {
    expect(filterLibrary(list, { text: "beton" }).map((i) => i.id)).toEqual(["2"]);
    expect(filterLibrary(list, { text: "köşe" }).map((i) => i.id)).toEqual(["3"]);
  });

  it("sektör süzer", () => {
    expect(filterLibrary(list, { sector: "kafe" }).map((i) => i.id)).toEqual(["3"]);
    expect(filterLibrary(list, { sector: "all" })).toHaveLength(3);
  });

  it("açı süzer", () => {
    expect(filterLibrary(list, { angle: "kazanc" }).map((i) => i.id)).toEqual(["2", "3"]);
  });

  it("filtreleri kesiştirir (AND)", () => {
    expect(filterLibrary(list, { angle: "kazanc", sector: "insaat" }).map((i) => i.id)).toEqual([
      "2",
    ]);
  });
});
