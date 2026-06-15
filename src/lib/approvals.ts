"use client";

// Onay / sign-off kaydı (governance denetim izi). Yerel saklama (MVP).
export type ApproverRole = "icerik" | "marka" | "hukuk";

export interface Approval {
  topic: string;
  brand: string;
  grade: string;
  score: number;
  approver?: string; // onaylayan kişi
  role?: ApproverRole; // onaylayan rolü
  at: number;
}

export const ROLE_LABEL: Record<ApproverRole, string> = {
  icerik: "İçerik",
  marka: "Marka",
  hukuk: "Hukuk",
};

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

export function clearApprovals(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
}

// Pure: onay özeti (oran + ortalama not skoru).
export function approvalSummary(list: Approval[]): { count: number; avgScore: number } {
  if (!list.length) return { count: 0, avgScore: 0 };
  const avg = Math.round(list.reduce((s, a) => s + a.score, 0) / list.length);
  return { count: list.length, avgScore: avg };
}
