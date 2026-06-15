"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  groupByDate,
  loadPlan,
  removeFromPlan,
  setStatus,
  type CalendarEntry,
} from "@/lib/calendar";
import { ANGLE_LABELS, CONTENT_TYPE_LABELS } from "@/lib/types";
import { buildICS } from "@/lib/publish";
import { downloadText } from "@/lib/export";

export default function CalendarPage() {
  const [entries, setEntries] = useState<CalendarEntry[]>([]);

  useEffect(() => {
    setEntries(loadPlan());
  }, []);

  const groups = groupByDate(entries);

  const toggle = (e: CalendarEntry) =>
    setEntries(setStatus(e.id, e.status === "planlandi" ? "yayinlandi" : "planlandi"));
  const remove = (id: string) => setEntries(removeFromPlan(id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">İçerik Takvimi</h1>
          <p className="text-sm text-neutral-600">
            Planlanan içerik paketleri. Yayın manuel (MVP) — yayınladıkça işaretle.
          </p>
        </div>
        <div className="flex gap-2">
          {entries.length > 0 && (
            <button
              type="button"
              className="btn-ghost"
              onClick={() =>
                downloadText("content-os-takvim.ics", buildICS(entries), "text/calendar")
              }
            >
              .ics indir
            </button>
          )}
          <Link href="/create" className="btn-ghost">
            Yeni kampanya
          </Link>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="card space-y-3 text-center">
          <p className="text-sm text-neutral-600">
            Henüz planlanan içerik yok. Bir paket üret, çıktı ekranından “Takvime ekle”.
          </p>
          <Link href="/create" className="btn-primary mx-auto w-fit">
            Kampanya Oluştur
          </Link>
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.date} className="card space-y-3">
            <h2 className="font-semibold">{g.date}</h2>
            <div className="space-y-2">
              {g.items.map((e) => (
                <div
                  key={e.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-200 p-3"
                >
                  <div>
                    <div className="font-medium">{e.topic}</div>
                    <div className="text-xs text-neutral-500">
                      {CONTENT_TYPE_LABELS[e.contentType]} · {ANGLE_LABELS[e.angle]} açısı ·{" "}
                      {e.sector}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggle(e)}
                      className={`chip ${
                        e.status === "yayinlandi"
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-neutral-300 bg-white text-neutral-700"
                      }`}
                    >
                      {e.status === "yayinlandi" ? "Yayınlandı ✓" : "Planlandı"}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(e.id)}
                      className="text-sm text-neutral-400 hover:text-red-500"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
