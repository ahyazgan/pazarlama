import type { ContentPackage } from "./types";
import type { LibraryItem } from "./library";
import { ANGLE_LABELS, CONTENT_TYPE_LABELS, PLATFORM_LABELS } from "./types";

// ============================================================================
// Cikti disa aktarma — paketi tek dosya (JSON + markdown) olarak.
// packageToMarkdown saf fonksiyon (test edilebilir); downloadText client helper.
// ============================================================================

export function packageToMarkdown(pkg: ContentPackage): string {
  const o = pkg.outputs;
  const L: string[] = [];

  L.push(`# ${pkg.topic}`);
  L.push(`*${CONTENT_TYPE_LABELS[pkg.contentType]} · ${ANGLE_LABELS[pkg.angle]} açısı*`);
  L.push("");

  L.push(`## ${PLATFORM_LABELS.instagram}`);
  L.push(`**Caption**\n\n${o.instagram.caption}`);
  L.push(`**İlk yorum (hashtag)**\n\n${o.instagram.firstComment}`);
  L.push(`**Görsel prompt**\n\n${o.instagram.imagePrompt}`);
  L.push(`**Alt-text**\n\n${o.instagram.altText}`);
  L.push("");

  L.push(`## ${PLATFORM_LABELS.tiktok}`);
  L.push(`**Hook (0-3sn)**\n\n${o.tiktok.hook}`);
  L.push("**Sahne dökümü**");
  for (const s of o.tiktok.scenes) {
    L.push(`- \`[${s.timecode}]\` ${s.shot} — ${s.voiceover}`);
  }
  L.push(`**Trend ses önerisi**\n\n${o.tiktok.soundSuggestion}`);
  L.push(`**CTA**\n\n${o.tiktok.cta}`);
  L.push("");

  L.push(`## ${PLATFORM_LABELS.linkedin}`);
  L.push(`**Hook satırı**\n\n${o.linkedin.hookLine}`);
  L.push(`**Gövde**\n\n${o.linkedin.body}`);
  L.push(`**Sektör insight'ı**\n\n${o.linkedin.insight}`);
  L.push(`**Tartışma sorusu**\n\n${o.linkedin.discussionQuestion}`);
  L.push("");

  L.push(`## ${PLATFORM_LABELS.x}`);
  o.x.thread.forEach((t, i) => L.push(`${i + 1}/ ${t}`));
  L.push("");

  return L.join("\n");
}

// Çıktı kalite göstergesi: IG caption hedefi ~125 karakter (hook görünürlüğü).
export interface LengthHint {
  count: number;
  target: number;
  status: "iyi" | "uzun" | "kisa";
  label: string;
}

export function captionLengthHint(caption: string, target = 125): LengthHint {
  const count = caption.length;
  let status: LengthHint["status"] = "iyi";
  if (count > target * 1.4) status = "uzun";
  else if (count < target * 0.3) status = "kisa";
  const label =
    status === "uzun"
      ? `Uzun (${count}/${target}) — hook ilk satırda kalsın`
      : status === "kisa"
        ? `Kısa (${count}/${target})`
        : `İyi (${count}/${target})`;
  return { count, target, status, label };
}

export function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9çğıöşü\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 50) || "icerik-paketi"
  );
}

// --- CSV dışa aktarma (tablo / e-tablo) --------------------------------------

// Tek alanı CSV-güvenli kaçışla sarmala (tırnak, virgül, satır sonu).
function csvCell(value: string): string {
  const v = value ?? "";
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export function csvRow(cells: string[]): string {
  return cells.map(csvCell).join(",");
}

const LIBRARY_CSV_HEADER = [
  "Tarih",
  "Marka",
  "Sektör",
  "Konu",
  "İçerik Tipi",
  "Açı",
  "IG Caption",
  "TikTok Hook",
  "LinkedIn Hook",
  "X Thread",
];

// Kütüphaneyi e-tablo dostu CSV'ye çevir (saf; Excel/Sheets'te açılır).
export function libraryToCsv(items: LibraryItem[]): string {
  const rows = [csvRow(LIBRARY_CSV_HEADER)];
  for (const it of items) {
    const o = it.pkg.outputs;
    rows.push(
      csvRow([
        new Date(it.at).toISOString().slice(0, 10),
        it.brandName,
        it.sector,
        it.topic,
        CONTENT_TYPE_LABELS[it.pkg.contentType],
        ANGLE_LABELS[it.pkg.angle],
        o.instagram.caption,
        o.tiktok.hook,
        o.linkedin.hookLine,
        o.x.thread.join(" | "),
      ]),
    );
  }
  return rows.join("\n");
}

// Client-only: metni dosya olarak indir.
export function downloadText(filename: string, content: string, mime: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
