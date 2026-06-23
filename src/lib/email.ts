import type { EmailKit, EmailRequest, SequenceType } from "./types";

// ============================================================================
// E-posta / funnel metni. Marka beyni system prefix'ten; burada gorev + sema.
// ============================================================================

const SEQ_LABEL: Record<SequenceType, string> = {
  hosgeldin: "Hoş geldin dizisi (yeni abone)",
  nurture: "Nurture dizisi (güven inşa et)",
  kampanya: "Kampanya dizisi (dönüşüm)",
};

const SEQ_COUNT: Record<SequenceType, number> = { hosgeldin: 3, nurture: 3, kampanya: 3 };

export function buildEmailUser(req: EmailRequest): string {
  const persona = req.brand.audience[req.personaIndex] ?? req.brand.audience[0];
  const lines: string[] = [];
  lines.push("[E-POSTA GOREVI]");
  lines.push(`Dizi turu: ${SEQ_LABEL[req.sequenceType]}`);
  lines.push(`Konu/teklif: ${req.topic}`);
  if (persona) lines.push(`Hedef persona: ${persona.name} — acisi: ${persona.pain || "-"}`);
  lines.push("");
  lines.push(
    `Marka beynine gore ${SEQ_COUNT[req.sequenceType]} e-postalik bir dizi + 1 landing page kopyasi uret:`,
  );
  lines.push("- Her e-posta: subject (~50 karakter), preview (preheader), body (kisa, deger odakli), cta.");
  lines.push("- Landing: landingHeadline, landingSubhead, landingBullets (3-4 fayda), landingCta.");
  lines.push("Marka tonunu koru; yasakli kelime kullanma; donusum hedefine yonlendir.");
  lines.push("Ciktiyi SADECE verilen JSON semasina gore ver.");
  return lines.join("\n");
}

export const EMAIL_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    emails: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          subject: { type: "string" },
          preview: { type: "string" },
          body: { type: "string" },
          cta: { type: "string" },
        },
        required: ["subject", "preview", "body", "cta"],
      },
    },
    landingHeadline: { type: "string" },
    landingSubhead: { type: "string" },
    landingBullets: { type: "array", items: { type: "string" } },
    landingCta: { type: "string" },
  },
  required: ["emails", "landingHeadline", "landingSubhead", "landingBullets", "landingCta"],
} as const;

// Deliverability lint: spam tetikleyici kelimeler + subject uzunluğu.
const SPAM_WORDS = [
  "bedava",
  "ücretsiz kazan",
  "%100 garanti",
  "acele et",
  "şimdi tıkla",
  "kaçırma",
  "müjde",
  "tıkla kazan",
  "son şans",
  "indirim indirim",
];

export interface EmailIssue {
  where: string;
  type: "spam" | "subject_uzun" | "subject_bos";
  detail: string;
}

export function lintEmail(kit: EmailKit): EmailIssue[] {
  const out: EmailIssue[] = [];
  kit.emails.forEach((e, i) => {
    const subj = e.subject.trim();
    if (!subj) out.push({ where: `E-posta ${i + 1}`, type: "subject_bos", detail: "konu boş" });
    else if (subj.length > 60)
      out.push({ where: `E-posta ${i + 1}`, type: "subject_uzun", detail: `${subj.length} karakter (≤60 önerilir)` });
    const blob = `${e.subject} ${e.body}`.toLowerCase();
    for (const w of SPAM_WORDS) {
      if (blob.includes(w))
        out.push({ where: `E-posta ${i + 1}`, type: "spam", detail: `spam kelimesi: "${w}"` });
    }
  });
  return out;
}

export function buildDemoEmail(req: EmailRequest): EmailKit {
  const b = req.brand;
  const sig = b.voice.signaturePhrases?.find(Boolean) ?? b.name;
  const num = b.proof.numbers.find(Boolean) ?? b.name;
  const cta = b.identity.ctaGoal?.trim() || "Teklif al";
  return {
    emails: [
      {
        subject: `${b.name}'e hoş geldin`,
        preview: `${req.topic} ile başlayalım`,
        body: `Merhaba, ${b.name} ailesine katıldın. ${sig}. İlk adım: ${req.topic}.`,
        cta,
      },
      {
        subject: `${req.topic}: bilmen gereken 3 şey`,
        preview: "Pratik ipuçları",
        body: `Çoğu kişi burada hata yapar. ${num} deneyimiyle doğrusunu paylaşıyoruz.`,
        cta,
      },
      {
        subject: "Hazır mısın?",
        preview: "Bir sonraki adım",
        body: `${sig}. ${req.topic} için seni bekliyoruz.`,
        cta,
      },
    ],
    landingHeadline: `${req.topic} — ${b.name} ile`,
    landingSubhead: `${sig}. (${num})`,
    landingBullets: ["Hızlı ve garantili", "Doğrulanmış kalite", "Şeffaf süreç"],
    landingCta: cta,
  };
}
