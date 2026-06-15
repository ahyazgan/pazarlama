import type { ReplyDrafts, ReplyRequest } from "./types";

// ============================================================================
// Topluluk yönetimi: yorum/DM yanıt taslağı. Marka sesiyle, çatışmasız.
// ============================================================================

export function buildReplyUser(req: ReplyRequest): string {
  const lines: string[] = [];
  lines.push("[YANIT GOREVI]");
  lines.push(`Gelen yorum/DM: "${req.comment}"`);
  lines.push("");
  lines.push("Marka sesiyle 2-3 farkli yanit taslagi uret (drafts):");
  lines.push("- Kisa, sicak ama profesyonel; markanin tonuna uy.");
  lines.push("- Olumsuz/sikayet ise once empati, sonra cozum/yonlendirme; savunmaci olma.");
  lines.push("- Soru ise net cevap + bir sonraki adim (CTA hedefine yonlendir).");
  lines.push("- Yasakli kelime kullanma; spam/asiri emoji yok.");
  lines.push("Ciktiyi SADECE verilen JSON semasina gore ver.");
  return lines.join("\n");
}

export const REPLY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    drafts: { type: "array", items: { type: "string" } },
  },
  required: ["drafts"],
} as const;

// Triyaj: gelen yorum/DM'i sınıfla + aciliyet + insana yükselt sinyali.
export type TriageCategory = "olumlu" | "soru" | "sikayet" | "kriz";

export interface Triage {
  category: TriageCategory;
  urgency: "dusuk" | "orta" | "yuksek";
  escalate: boolean; // insan müdahalesi önerilir mi
  advice: string;
}

const CRISIS = ["dava", "avukat", "dolandırıcı", "şikayet edeceğim", "iade etmiyor", "rezalet", "skandal", "zehir"];
const COMPLAINT = ["kötü", "berbat", "gecikti", "bozuk", "memnun değil", "sorun", "çözmüyor", "kandır", "pahalı"];
const QUESTION = ["?", "nasıl", "ne kadar", "mı", "mu", "fiyat", "bilgi"];

export function triageComment(text: string): Triage {
  const t = text.toLowerCase();
  if (CRISIS.some((w) => t.includes(w))) {
    return {
      category: "kriz",
      urgency: "yuksek",
      escalate: true,
      advice: "Kriz sinyali: hemen bir insana yükselt; kamuya savunmacı yanıt verme, özelden çöz.",
    };
  }
  if (COMPLAINT.some((w) => t.includes(w))) {
    return {
      category: "sikayet",
      urgency: "orta",
      escalate: false,
      advice: "Şikâyet: önce empati, sonra somut çözüm/yönlendirme. Hızlı yanıt ver.",
    };
  }
  if (QUESTION.some((w) => t.includes(w))) {
    return {
      category: "soru",
      urgency: "orta",
      escalate: false,
      advice: "Soru: net cevap + bir sonraki adım (CTA hedefine yönlendir).",
    };
  }
  return {
    category: "olumlu",
    urgency: "dusuk",
    escalate: false,
    advice: "Olumlu/nötr: sıcak teşekkür + ilişkiyi derinleştiren kısa dokunuş.",
  };
}

export function buildDemoReplies(req: ReplyRequest): ReplyDrafts {
  const b = req.brand;
  const cta = b.identity.ctaGoal?.trim() || "bize ulaşın";
  const sig = b.voice.signaturePhrases?.find(Boolean) ?? b.name;
  return {
    drafts: [
      `Merhaba! İlginiz için teşekkürler. ${sig}. Detaylar için ${cta}.`,
      `Geri bildiriminiz değerli. Bu konuda yardımcı olalım — ${cta}.`,
      `Harika soru! Kısaca yanıtlayalım, daha fazlası için ${cta}.`,
    ],
  };
}
