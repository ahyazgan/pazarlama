"use client";

import type { ContentPackage, SectorId } from "./types";

// ============================================================================
// İçerik Kütüphanesi — üretilen paketleri kalıcı sakla (localStorage), tekrar aç.
// Pure: addItem (dedup + cap) test edilebilir. Storage wrapper'ları ince.
// ============================================================================

export interface LibraryItem {
  id: string;
  topic: string;
  brandName: string;
  sector: SectorId;
  pkg: ContentPackage;
  at: number;
}

const KEY = "content-os.library";
const MAX = 100;

export function newLibId(): string {
  return `lib-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// Pure: aynı (konu+açı+marka) varsa güncelle, yoksa başa ekle; MAX ile sınırla.
export function addItem(list: LibraryItem[], item: LibraryItem, max = MAX): LibraryItem[] {
  const key = (i: LibraryItem) =>
    `${i.brandName}|${i.topic}|${i.pkg.angle}`.toLowerCase();
  const filtered = list.filter((i) => key(i) !== key(item));
  return [item, ...filtered].slice(0, max);
}

export function loadLibrary(): LibraryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LibraryItem[]) : [];
  } catch {
    return [];
  }
}

export function saveToLibrary(pkg: ContentPackage, brandName: string, sector: SectorId): void {
  if (typeof window === "undefined") return;
  const item: LibraryItem = {
    id: newLibId(),
    topic: pkg.topic,
    brandName,
    sector,
    pkg,
    at: Date.now(),
  };
  window.localStorage.setItem(KEY, JSON.stringify(addItem(loadLibrary(), item)));
}

export function removeFromLibrary(id: string): LibraryItem[] {
  const next = loadLibrary().filter((i) => i.id !== id);
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
