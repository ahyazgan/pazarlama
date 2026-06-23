"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadBrands } from "@/lib/brand-store";
import { loadLibrary } from "@/lib/library";
import { LEVEL_LABEL } from "@/lib/brain-score";
import { buildDashboard, type DashboardData } from "@/lib/dashboard";
import { getSector } from "@/lib/sectors";

const READY_STYLE: Record<string, string> = {
  hazir: "bg-green-100 text-green-700",
  neredeyse: "bg-amber-100 text-amber-700",
  gelismeli: "bg-red-100 text-red-600",
};

const LEVEL_STYLE: Record<string, string> = {
  zayif: "text-red-600",
  orta: "text-amber-600",
  iyi: "text-lime-600",
  guclu: "text-green-700",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    setData(buildDashboard(loadBrands(), loadLibrary()));
  }, []);

  if (!data) return null;

  const empty = data.brandCount === 0 && data.packageCount === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Yayın Paneli</h1>
        <p className="text-sm text-neutral-600">
          Markaların ve kayıtlı paketlerin tek bakışta hazırlık durumu.
        </p>
      </div>

      {empty ? (
        <div className="card text-sm text-neutral-600">
          Henüz marka veya kayıtlı paket yok.{" "}
          <Link href="/onboarding" className="text-brand underline">
            Hızlı kurulumla başla
          </Link>
          .
        </div>
      ) : (
        <>
          {/* Özet kartları */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Marka" value={data.brandCount} />
            <Stat label="Kayıtlı paket" value={data.packageCount} />
            <Stat
              label="Yayına hazır paket"
              value={data.readyCount}
              accent={data.readyCount > 0}
            />
          </div>

          {/* Markalar */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Markalar</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {data.brands.map((b) => (
                <div key={b.brand.id ?? b.brand.name} className="card space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{b.brand.name || "(isimsiz)"}</span>
                    <span className="text-xs text-neutral-500">
                      {getSector(b.brand.sector).label}
                    </span>
                  </div>
                  <div className="text-sm">
                    Beyin doluluğu:{" "}
                    <span className={`font-semibold ${LEVEL_STYLE[b.level]}`}>
                      {b.score}/100 ({LEVEL_LABEL[b.level]})
                    </span>
                  </div>
                  {b.topMissing && (
                    <p className="text-xs text-neutral-500">
                      Sıradaki kazanım: <span className="font-medium">{b.topMissing}</span>
                    </p>
                  )}
                  <Link href="/brand" className="inline-block text-xs text-brand underline">
                    Beyni geliştir →
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Paketler */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Kayıtlı paketler</h2>
            {data.packages.length === 0 ? (
              <p className="text-sm text-neutral-500">
                Henüz kayıtlı paket yok. Bir kampanya üretip kütüphaneye kaydet.
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 text-left text-xs text-neutral-500">
                    <tr>
                      <th className="px-3 py-2">Konu</th>
                      <th className="px-3 py-2">Marka</th>
                      <th className="px-3 py-2">Uyarı</th>
                      <th className="px-3 py-2">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.packages.map((p) => (
                      <tr key={p.item.id} className="border-t border-neutral-100">
                        <td className="px-3 py-2">{p.item.topic || "(konu yok)"}</td>
                        <td className="px-3 py-2 text-neutral-600">{p.item.brandName}</td>
                        <td className="px-3 py-2 text-neutral-600">{p.issues}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${READY_STYLE[p.readiness.level]}`}
                          >
                            {p.readiness.label}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Link href="/library" className="inline-block text-xs text-brand underline">
              Kütüphaneyi aç →
            </Link>
          </section>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="card">
      <div className={`text-3xl font-bold ${accent ? "text-brand" : "text-neutral-900"}`}>
        {value}
      </div>
      <div className="text-sm text-neutral-600">{label}</div>
    </div>
  );
}
