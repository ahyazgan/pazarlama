import { describe, expect, it } from "vitest";
import { EMAIL_SCHEMA, buildEmailUser, buildDemoEmail, lintEmail } from "./email";
import { REPLY_SCHEMA, buildReplyUser, buildDemoReplies, triageComment } from "./community";
import { HAMMADDEM_SAMPLE } from "./brand-store";
import type { EmailRequest, ReplyRequest } from "./types";

const emailReq: EmailRequest = {
  brand: HAMMADDEM_SAMPLE,
  topic: "Hızlı tedarik",
  sequenceType: "hosgeldin",
  personaIndex: 0,
};

describe("e-posta motoru", () => {
  it("user dizi türü + landing ister; şema doğru", () => {
    expect(buildEmailUser(emailReq)).toMatch(/Hoş geldin dizisi/);
    expect(EMAIL_SCHEMA.required).toContain("emails");
    expect(EMAIL_SCHEMA.required).toContain("landingHeadline");
  });
  it("demo dizi + landing üretir, marka beynini kullanır", () => {
    const kit = buildDemoEmail(emailReq);
    expect(kit.emails.length).toBeGreaterThanOrEqual(3);
    expect(kit.landingBullets.length).toBeGreaterThanOrEqual(3);
    expect(JSON.stringify(kit)).toContain("Hammaddem");
  });
});

const replyReq: ReplyRequest = {
  brand: HAMMADDEM_SAMPLE,
  comment: "Fiyatlar neden net değil?",
  personaIndex: 0,
};

describe("topluluk yanıt motoru", () => {
  it("user yorumu + empati/çözüm yönergesini içerir", () => {
    const u = buildReplyUser(replyReq);
    expect(u).toContain("Fiyatlar neden net değil?");
    expect(u).toMatch(/empati/);
    expect(REPLY_SCHEMA.required).toEqual(["drafts"]);
  });
  it("demo 2-3 taslak üretir", () => {
    expect(buildDemoReplies(replyReq).drafts.length).toBeGreaterThanOrEqual(2);
  });
});

describe("lintEmail (deliverability)", () => {
  it("spam kelime + uzun konu işaretler", () => {
    const kit = buildDemoEmail(emailReq);
    kit.emails[0].subject = "Bedava müjde! ".repeat(6); // hem spam hem uzun
    const issues = lintEmail(kit);
    expect(issues.some((i) => i.type === "spam")).toBe(true);
    expect(issues.some((i) => i.type === "subject_uzun")).toBe(true);
  });
});

describe("triageComment", () => {
  it("kriz → escalate", () => {
    const t = triageComment("Avukatıma söyleyeceğim, dava açacağım");
    expect(t.category).toBe("kriz");
    expect(t.escalate).toBe(true);
  });
  it("şikâyet → empati önerisi", () => {
    expect(triageComment("Ürün bozuk geldi, çok kötü").category).toBe("sikayet");
  });
  it("soru → soru", () => {
    expect(triageComment("Fiyat ne kadar?").category).toBe("soru");
  });
  it("olumlu → düşük aciliyet", () => {
    expect(triageComment("Harika hizmet, teşekkürler").urgency).toBe("dusuk");
  });
});
