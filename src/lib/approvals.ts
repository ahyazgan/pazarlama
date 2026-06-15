"use client";

// Onay / sign-off kaydı (governance denetim izi). Yerel saklama (MVP).
export interface Approval {
  topic: string;
  brand: string;
  grade: string;
  score: number;
  at: number;
}

const KEY = "content-os.approvals";

export function loadApprovals(): Approval[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Approval[]) : [];
  } catch {
    return [];
  }
}

export function recordApproval(a: Omit<Approval, "at">): Approval[] {
  const next = [{ ...a, at: Date.now() }, ...loadApprovals()].slice(0, 100);
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
