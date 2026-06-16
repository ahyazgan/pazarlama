"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadBrand } from "@/lib/brand-store";
import { addToPlan } from "@/lib/calendar";
import { weeklyPlan, type PlanItem } from "@/lib/weekly-plan";
import { ANGLE_LABELS, CONTENT_TYPE_LABELS, type Brand } from "@/lib/types";

export default function PlanPage() {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [count, setCount] = useState(5);
  const [items, setItems] = useState<PlanItem[]>([]);
  const [added, setAdded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setBrand(loadBrand());
  }, []);

  const generate = () => {
    if (brand) {
      setItems(weeklyPlan(brand, count));
      setAdded({});
    }
  };

  const addOne = (it: PlanItem, i: number) => {
    if (!brand) return;
    addToPlan({
      topic: it.topicSeed,
      contentType: it.contentType,
      angle: it.angle,
      sector: brand.sector,
      date: it.date,
    });
    setAdded((a) => ({ ...a, [i]: true }));
  };

  const addAll = () => items.forEach((it, i) => addOne(it, i));

  if (brand === null) {
    return (
      <div className="card space-y-3 text-center">
        <h1 className="text-xl font-bold">Önce marka profili gerekli</h1>
        <Link href="/brand" className="btn-primary mx-auto w-fit">
          Marka Profili'ne git
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Haftalık İçerik Planı</h1>
          <p className="text-sm text-neutral-600">
            {brand.name} — sütun + açı + içerik tipi rotasyonuyla hazır plan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="input w-auto py-1"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          >
            {[3, 5, 7].map((n) => (
              <option key={n} value={n}>
                {n} gün
              </option>
            ))}
          </select>
          <button type="button" className="btn-primary" onClick={generate}>
            Plan üret
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <>
          <div className="flex justify-end">
            <button type="button" className="btn-ghost" onClick={addAll}>
              Tümünü takvime ekle
            </button>
          </div>
          <div className="space-y-2">
            {items.map((it, i) => (
              <div
                key={i}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-white p-3"
              >
                <div>
                  <div className="font-medium">
                    {it.date} · {it.topicSeed}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {CONTENT_TYPE_LABELS[it.contentType]} · {ANGLE_LABELS[it.angle]} açısı ·{" "}
                    {it.personaName}
                  </div>
                </div>
                <button
                  type="button"
                  className="chip border-neutral-300"
                  onClick={() => addOne(it, i)}
                  disabled={added[i]}
                >
                  {added[i] ? "Eklendi ✓" : "Takvime ekle"}
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-neutral-400">
            Plan tohumları başlangıç noktasıdır; Kampanya ekranında konuyu netleştirip üret.
          </p>
        </>
      )}
    </div>
  );
}
