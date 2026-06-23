"use client";

import type { Angle, ContentType } from "./types";

// ============================================================================
// Icerik Hafizasi (Faz 2) — tekrari onleme.
// Uretilen paketlerin ozeti localStorage'da tutulur; ayni konu+aci daha once
// uretildiyse kullaniciya "gecen sefer bunu kullandin" uyarisi gosterilir.
// ============================================================================

const KEY = "content-os.history";
const MAX = 50;

export interface HistoryEntry {
  topic: string;
  contentType: ContentType;
  angle: Angle;
  personaIndex: number;
  at: number; // epoch ms
}

// Locale-bagimsiz: Turkce I/ı ikilemini (toLocaleLowerCase("tr")) onler.
const norm = (s: string) => s.trim().toLowerCase();

// Pure: ayni konu + aci kombinasyonu gecmiste var mi? (en yeni eslesme doner)
export function findDuplicate(
  history: HistoryEntry[],
  topic: string,
  angle: Angle,
): HistoryEntry | null {
  const t = norm(topic);
  if (!t) return null;
  const matches = history.filter((h) => norm(h.topic) === t && h.angle === angle);
  if (!matches.length) return null;
  return matches.reduce((a, b) => (b.at > a.at ? b : a));
}

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function recordHistory(entry: Omit<HistoryEntry, "at">): void {
  if (typeof window === "undefined") return;
  const next: HistoryEntry[] = [{ ...entry, at: Date.now() }, ...loadHistory()].slice(0, MAX);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function formatWhen(at: number): string {
  try {
    return new Date(at).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
    });
  } catch {
    return "";
  }
}
