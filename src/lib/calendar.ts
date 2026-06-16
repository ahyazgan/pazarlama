"use client";

import type { Angle, ContentType, SectorId } from "./types";

// ============================================================================
// İçerik Takvimi (ajanda/planlayıcı — MVP, drag-drop yerine).
// Üretilen paketi bir tarihe planla; durumu takip et (planlandı/yayınlandı).
// Pure: groupByDate (test edilebilir). Storage: localStorage.
// ============================================================================

export type PlanStatus = "planlandi" | "yayinlandi";

export interface CalendarEntry {
  id: string;
  topic: string;
  contentType: ContentType;
  angle: Angle;
  sector: SectorId;
  date: string; // YYYY-MM-DD
  status: PlanStatus;
  pillar?: string; // içerik sütunu (markanın temel teması) — performans kırılımı için
  reach?: number; // gerçek erişim (yayınlandıktan sonra elle girilir)
  engagement?: number; // gerçek etkileşim
}

const KEY = "content-os.calendar";

export function loadPlan(): CalendarEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CalendarEntry[]) : [];
  } catch {
    return [];
  }
}

function persist(entries: CalendarEntry[]): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(entries));
  }
}

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function addToPlan(entry: Omit<CalendarEntry, "id" | "status">): CalendarEntry[] {
  const next = [...loadPlan(), { ...entry, id: newId(), status: "planlandi" as PlanStatus }];
  persist(next);
  return next;
}

export function setStatus(id: string, status: PlanStatus): CalendarEntry[] {
  const next = loadPlan().map((e) => (e.id === id ? { ...e, status } : e));
  persist(next);
  return next;
}

export function setMetrics(id: string, reach: number, engagement: number): CalendarEntry[] {
  const next = loadPlan().map((e) =>
    e.id === id ? { ...e, reach, engagement, status: "yayinlandi" as PlanStatus } : e,
  );
  persist(next);
  return next;
}

export function removeFromPlan(id: string): CalendarEntry[] {
  const next = loadPlan().filter((e) => e.id !== id);
  persist(next);
  return next;
}

// Drag-drop: bir girdiyi başka bir tarihe taşı (yeniden planla).
export function reschedule(id: string, date: string): CalendarEntry[] {
  const next = loadPlan().map((e) => (e.id === id ? { ...e, date } : e));
  persist(next);
  return next;
}

export interface DateGroup {
  date: string;
  items: CalendarEntry[];
}

// Pure: tarihe göre grupla ve kronolojik sırala.
export function groupByDate(entries: CalendarEntry[]): DateGroup[] {
  const map = new Map<string, CalendarEntry[]>();
  for (const e of entries) {
    (map.get(e.date) ?? map.set(e.date, []).get(e.date)!).push(e);
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, items]) => ({ date, items }));
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
