import type { CalendarEntry } from "./calendar";
import { ANGLE_LABELS, CONTENT_TYPE_LABELS, type PlatformId } from "./types";
import { PLATFORM_DNA } from "./platform-dna";

// ============================================================================
// Yayın hazırlığı (otomatik yayının kredensiyelsiz öncülü).
// 1) Takvimi .ics olarak dışa aktar → kullanıcı kendi takvimine yayın hatırlatıcısı koyar.
// 2) Platform başına manuel yayın checklist'i (Platform DNA kurallarından).
// buildICS saf (test edilebilir).
// ============================================================================

function icsDate(isoDate: string): string {
  return isoDate.replace(/-/g, ""); // YYYY-MM-DD -> YYYYMMDD (all-day)
}

function esc(s: string): string {
  return s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
}

export function buildICS(entries: CalendarEntry[]): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Content OS//Takvim//TR",
    "CALSCALE:GREGORIAN",
  ];
  for (const e of entries) {
    const d = icsDate(e.date);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.id}@content-os`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${d}`,
      `SUMMARY:${esc(`İçerik yayını: ${e.topic}`)}`,
      `DESCRIPTION:${esc(
        `${CONTENT_TYPE_LABELS[e.contentType]} · ${ANGLE_LABELS[e.angle]} açısı · ${e.sector} · durum: ${e.status}`,
      )}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

// Platform başına manuel yayın adımları (Platform DNA kurallarından türetilir).
export function publishChecklist(platform: PlatformId): string[] {
  return PLATFORM_DNA[platform].rules;
}
