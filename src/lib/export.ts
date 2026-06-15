import type { ContentPackage } from "./types";
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
