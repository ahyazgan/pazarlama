import { describe, expect, it } from "vitest";
import { captionLengthHint, csvRow, libraryToCsv, packageToMarkdown, slugify } from "./export";
import type { ContentPackage } from "./types";
import type { LibraryItem } from "./library";

const pkg: ContentPackage = {
  topic: "Çimento stoğu tazelendi",
  contentType: "deger",
  angle: "korku",
  outputs: {
    instagram: {
      caption: "IG-CAPTION",
      firstComment: "#insaat #beton",
      imagePrompt: "IG-IMG",
      altText: "IG-ALT",
    },
    tiktok: {
      hook: "TT-HOOK",
      scenes: [
        { timecode: "0-3sn", shot: "SHOT-A", voiceover: "VO-A" },
        { timecode: "3-6sn", shot: "SHOT-B", voiceover: "VO-B" },
      ],
      soundSuggestion: "TT-SOUND",
      cta: "TT-CTA",
    },
    linkedin: {
      hookLine: "LI-HOOK",
      body: "LI-BODY",
      insight: "LI-INSIGHT",
      discussionQuestion: "LI-Q",
    },
    x: { thread: ["X1", "X2", "X3"] },
  },
};

describe("packageToMarkdown", () => {
  const md = packageToMarkdown(pkg);

  it("baslik ve meta satiri icerir", () => {
    expect(md).toMatch(/^# Çimento stoğu tazelendi/m);
    expect(md).toMatch(/Korku açısı/);
  });

  it("dort platformu da basliklar ile icerir", () => {
    for (const h of ["## Instagram", "## TikTok", "## LinkedIn", "## X / Twitter"]) {
      expect(md).toContain(h);
    }
  });

  it("tum cikti alanlarini yazar", () => {
    for (const v of [
      "IG-CAPTION",
      "IG-IMG",
      "TT-HOOK",
      "SHOT-A",
      "VO-B",
      "LI-INSIGHT",
      "X1",
      "X3",
    ]) {
      expect(md).toContain(v);
    }
  });

  it("tiktok sahnelerini numarali/timecode ile listeler", () => {
    expect(md).toMatch(/\[0-3sn\]/);
  });

  it("x thread'ini numaralandirir", () => {
    expect(md).toMatch(/1\/ X1/);
    expect(md).toMatch(/3\/ X3/);
  });
});

describe("captionLengthHint", () => {
  it("~125 hedefe yakını iyi sayar", () => {
    expect(captionLengthHint("x".repeat(120)).status).toBe("iyi");
  });
  it("çok uzunu uzun işaretler", () => {
    const h = captionLengthHint("x".repeat(300));
    expect(h.status).toBe("uzun");
    expect(h.label).toMatch(/Uzun/);
  });
  it("çok kısayı kısa işaretler", () => {
    expect(captionLengthHint("kısa").status).toBe("kisa");
  });
});

describe("slugify", () => {
  it("turkce konuyu dosya-guvenli slug'a cevirir", () => {
    expect(slugify("Çimento stoğu tazelendi!")).toBe("çimento-stoğu-tazelendi");
  });
  it("bos girdi icin varsayilan", () => {
    expect(slugify("  ")).toBe("icerik-paketi");
  });
});

describe("CSV dışa aktarma", () => {
  it("csvRow virgül/tırnak/satır sonu içeren hücreyi kaçışlar", () => {
    expect(csvRow(["a,b", 'di"şe', "satır\nsonu", "düz"])).toBe(
      '"a,b","di""şe","satır\nsonu",düz',
    );
  });

  it("libraryToCsv başlık + satır üretir, alanları doğru sıralar", () => {
    const item: LibraryItem = {
      id: "lib-1",
      topic: "Konu, virgüllü",
      brandName: "Hammaddem",
      sector: "insaat",
      pkg,
      at: Date.UTC(2026, 0, 15),
    };
    const csv = libraryToCsv([item]);
    const lines = csv.split("\n");
    expect(lines[0]).toContain("Tarih");
    expect(lines[0]).toContain("X Thread");
    expect(lines[1]).toContain("2026-01-15");
    expect(lines[1]).toContain("Hammaddem");
    expect(lines[1]).toContain('"Konu, virgüllü"'); // virgül kaçışlandı
    expect(lines[1]).toContain("X1 | X2 | X3"); // thread birleştirildi
  });

  it("boş kütüphane sadece başlık satırı verir", () => {
    expect(libraryToCsv([]).split("\n")).toHaveLength(1);
  });
});
