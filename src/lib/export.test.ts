import { describe, expect, it } from "vitest";
import { campaignToMarkdown, captionLengthHint, packageToMarkdown, slugify } from "./export";
import type { ContentPackage, PersonaPackage } from "./types";

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

describe("campaignToMarkdown", () => {
  const items: PersonaPackage[] = [
    { personaName: "2026-06-10 · Tedarik", pkg: { ...pkg, topic: "Gönderi A" } },
    { personaName: "2026-06-11 · Maliyet", pkg: { ...pkg, topic: "Gönderi B" } },
  ];
  const md = campaignToMarkdown(items, "Hammaddem");

  it("marka başlığı + içindekiler + her gönderiyi içerir", () => {
    expect(md).toMatch(/^# Hammaddem — Kampanya Teslim Paketi/m);
    expect(md).toContain("## İçindekiler");
    expect(md).toContain("2026-06-10 · Tedarik");
    expect(md).toContain("Gönderi A");
    expect(md).toContain("Gönderi B");
  });

  it("her gönderinin tam paketini gömer (4 platform x N)", () => {
    expect((md.match(/## Instagram/g) ?? []).length).toBe(2);
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
