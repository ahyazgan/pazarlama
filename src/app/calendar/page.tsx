"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  groupByDate,
  loadPlan,
  removeFromPlan,
  reschedule,
  setMetrics,
  setStatus,
  type CalendarEntry,
} from "@/lib/calendar";
import { ANGLE_LABELS, CONTENT_TYPE_LABELS } from "@/lib/types";
import { buildICS } from "@/lib/publish";
import { downloadText } from "@/lib/export";

function MetricsRow({
  entry,
  onSave,
}: {
  entry: CalendarEntry;
  onSave: (id: string, reach: number, engagement: number) => void;
}) {
  const [reach, setReach] = useState(entry.reach?.toString() ?? "");
  const [eng, setEng] = useState(entry.engagement?.toString() ?? "");
  const rate =
    entry.reach && entry.reach > 0 && entry.engagement != null
      ? ((entry.engagement / entry.reach) * 100).toFixed(1)
      : null;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-2 text-xs">
      <span className="text-neutral-500">Gerçek sonuç:</span>
      <input
        className="input w-24 py-1"
        type="number"
        min={0}
        placeholder="erişim"
        value={reach}
        onChange={(e) => setReach(e.target.value)}
      />
      <input
        className="input w-24 py-1"
        type="number"
        min={0}
        placeholder="etkileşim"
        value={eng}
        onChange={(e) => setEng(e.target.value)}
      />
      <button
        type="button"
        className="chip border-neutral-300"
        onClick={() => onSave(entry.id, Number(reach) || 0, Number(eng) || 0)}
      >
        Kaydet
      </button>
      {rate && <span className="text-neutral-500">oran: %{rate} → strateji öğrenir</span>}
    </div>
  );
}

export default function CalendarPage() {
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overDate, setOverDate] = useState<string | null>(null);

  useEffect(() => {
    setEntries(loadPlan());
  }, []);

  const groups = groupByDate(entries);

  const toggle = (e: CalendarEntry) =>
    setEntries(setStatus(e.id, e.status === "planlandi" ? "yayinlandi" : "planlandi"));
  const remove = (id: string) => setEntries(removeFromPlan(id));
  const saveMetrics = (id: string, reach: number, engagement: number) =>
    setEntries(setMetrics(id, reach, engagement));

  const dropOnDate = (date: string) => {
    if (dragId) {
      const cur = entries.find((e) => e.id === dragId);
      if (cur && cur.date !== date) setEntries(reschedule(dragId, date));
    }
    setDragId(null);
    setOverDate(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">İçerik Takvimi</h1>
          <p className="text-sm text-neutral-600">
            Planlanan içerik paketleri. Yayın manuel (MVP) — yayınladıkça işaretle.
            Kartı başka bir gün başlığına sürükleyerek yeniden planla.
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
          <section
            key={g.date}
            onDragOver={(ev) => {
              if (dragId) {
                ev.preventDefault();
                setOverDate(g.date);
              }
            }}
            onDragLeave={() => setOverDate((d) => (d === g.date ? null : d))}
            onDrop={() => dropOnDate(g.date)}
            className={`card space-y-3 transition-colors ${
              overDate === g.date ? "ring-2 ring-orange-400" : ""
            }`}
          >
            <h2 className="font-semibold">{g.date}</h2>
            <div className="space-y-2">
              {g.items.map((e) => (
                <div
                  key={e.id}
                  draggable
                  onDragStart={() => setDragId(e.id)}
                  onDragEnd={() => {
                    setDragId(null);
                    setOverDate(null);
                  }}
                  className={`cursor-grab rounded-xl border border-neutral-200 p-3 active:cursor-grabbing ${
                    dragId === e.id ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
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
                  <MetricsRow entry={e} onSave={saveMetrics} />
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
