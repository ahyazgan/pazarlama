import { describe, expect, it } from "vitest";
import { EMAIL_SCHEMA, buildEmailUser, buildDemoEmail } from "./email";
import { REPLY_SCHEMA, buildReplyUser, buildDemoReplies } from "./community";
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
