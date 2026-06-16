"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadPlan } from "@/lib/calendar";
import { computeInsights, type Insights, type RatePerf } from "@/lib/insights";

const pct = (r: number) => `%${(r * 100).toFixed(1)}`;

function PerfBars<K extends string>({ rows }: { rows: RatePerf<K>[] }) {
  const max = Math.max(...rows.map((r) => r.avgRate), 0.0001);
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.key} className="flex items-center gap-3 text-sm">
          <span className="w-32 shrink-0 text-neutral-700">{r.label}</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: `${(r.avgRate / max) * 100}%` }}
            />
          </div>
          <span className="w-24 shrink-0 text-right text-neutral-600">
            {pct(r.avgRate)} · {r.count} gönderi
          </span>
        </div>
      ))}
    </div>
  );
}

export default function InsightsPage() {
  const [data, setData] = useState<Insights | null>(null);

  useEffect(() => {
    setData(computeInsights(loadPlan()));
  }, []);

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Performans / Öğrenme Panosu</h1>
          <p className="text-sm text-neutral-600">
            Takvimde işaretlediğin gerçek metriklerden hangi açı ve içerik tipinin işe
            yaradığını öğrenir. Strateji önerileri buradan beslenir.
          </p>
        </div>
        <Link href="/calendar" className="btn-ghost">
          Takvim &amp; metrik gir
        </Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["Metrikli yayın", String(data.publishedCount)],
          ["Toplam erişim", data.totalReach.toLocaleString("tr-TR")],
          ["Ort. etkileşim oranı", pct(data.avgRate)],
        ].map(([t, v]) => (
          <div key={t} className="card">
            <div className="text-xs text-neutral-500">{t}</div>
            <div className="mt-1 text-2xl font-bold">{v}</div>
          </div>
        ))}
      </section>

      {data.recommendations.length > 0 && (
        <section className="card space-y-2 border-brand/30 bg-brand-tint/30">
          <h2 className="font-semibold text-brand-dark">Öneriler</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-700">
            {data.recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </section>
      )}

      {data.byAngle.length > 0 && (
        <section className="card space-y-3">
          <h2 className="font-semibold">Açıya göre performans</h2>
          <PerfBars rows={data.byAngle} />
        </section>
      )}

      {data.byContentType.length > 0 && (
        <section className="card space-y-3">
          <h2 className="font-semibold">İçerik tipine göre performans</h2>
          <PerfBars rows={data.byContentType} />
        </section>
      )}

      {data.publishedCount === 0 && (
        <div className="card text-center text-sm text-neutral-600">
          Henüz veri yok.{" "}
          <Link href="/calendar" className="text-brand underline">
            Takvimde
          </Link>{" "}
          yayınlananları gerçek erişim/etkileşimle işaretle — pano öğrenmeye başlasın.
        </div>
      )}
    </div>
  );
}
