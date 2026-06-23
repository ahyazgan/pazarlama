"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  approvalSummary,
  clearApprovals,
  loadApprovals,
  ROLE_LABEL,
  type Approval,
} from "@/lib/approvals";
import { SettingsTabs } from "@/components/SettingsTabs";

function fmt(at: number): string {
  try {
    return new Date(at).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return "";
  }
}

export default function ApprovalsPage() {
  const [list, setList] = useState<Approval[]>([]);

  useEffect(() => setList(loadApprovals()), []);
  const sum = approvalSummary(list);

  return (
    <div className="space-y-6">
      <SettingsTabs />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Onay / Denetim İzi</h1>
          <p className="text-sm text-neutral-600">
            Sign-off geçmişi — {sum.count} onay · ortalama not {sum.avgScore}/100
          </p>
        </div>
        {list.length > 0 && (
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              clearApprovals();
              setList([]);
            }}
          >
            Geçmişi temizle
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="card space-y-3 text-center">
          <p className="text-sm text-neutral-600">
            Henüz onay yok. Çıktı ekranında bir paketi “Onayla (sign-off)” ile onayla.
          </p>
          <Link href="/create" className="btn-primary mx-auto w-fit">
            Kampanya Oluştur
          </Link>
        </div>
      ) : (
        <section className="card">
          <div className="space-y-2">
            {list.map((a, i) => (
              <div
                key={i}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-200 p-3"
              >
                <div>
                  <div className="font-medium">{a.topic}</div>
                  <div className="text-xs text-neutral-500">
                    {a.brand} · {fmt(a.at)}
                    {a.approver && ` · ${a.approver}`}
                    {a.role && ` (${ROLE_LABEL[a.role]})`}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    a.grade === "A"
                      ? "bg-green-600 text-white"
                      : a.grade === "B"
                        ? "bg-lime-500 text-white"
                        : a.grade === "C"
                          ? "bg-amber-500 text-white"
                          : "bg-red-600 text-white"
                  }`}
                >
                  {a.grade} ({a.score})
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
