"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NeedBrand } from "@/components/NeedBrand";
import { loadBrand } from "@/lib/brand-store";
import { addToPlan } from "@/lib/calendar";
import { saveToLibrary } from "@/lib/library";
import { evaluatePackage, runAgentTeam, type TeamRunResult } from "@/lib/agent-team";
import { weeklyPlan, type PlanItem } from "@/lib/weekly-plan";
import {
  ANGLE_LABELS,
  CONTENT_TYPE_LABELS,
  type Brand,
  type ContentPackage,
  type GenerateRequest,
  type PersonaPackage,
} from "@/lib/types";

export default function PlanPage() {
  const router = useRouter();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [count, setCount] = useState(5);
  const [items, setItems] = useState<PlanItem[]>([]);
  const [added, setAdded] = useState<Record<number, boolean>>({});
  const [building, setBuilding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [useTeam, setUseTeam] = useState(false);

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
      pillar: it.pillar || undefined,
    });
    setAdded((a) => ({ ...a, [i]: true }));
  };

  const addAll = () => items.forEach((it, i) => addOne(it, i));

  // Tüm kampanyayı üret: her plan maddesi için gerçek paket (demo modda, anahtarsız),
  // kütüphaneye + takvime kaydet, hepsini birlikte çıktıda göster.
  const postGenerate = async (req: GenerateRequest): Promise<ContentPackage> => {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...req, demo: true }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Üretim başarısız.");
    return data as ContentPackage;
  };

  const buildCampaign = async () => {
    if (!brand || !items.length) return;
    setBuilding(true);
    setError(null);
    setProgress(0);
    try {
      const results: PersonaPackage[] = [];
      const teamRuns: TeamRunResult[] = [];
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const req: GenerateRequest = {
          brand,
          topic: it.topicSeed,
          contentType: it.contentType,
          angle: it.angle,
          personaIndex: 0,
          demo: true,
        };
        let pkg: ContentPackage;
        if (useTeam) {
          // Her gönderi ajan ekibinden geçer: üret → editör puanı → düzelt.
          const run = await runAgentTeam(req, {
            generate: postGenerate,
            evaluate: evaluatePackage,
            threshold: 80,
            maxRounds: 2,
          });
          pkg = run.final;
          teamRuns.push(run);
        } else {
          pkg = await postGenerate(req);
        }
        saveToLibrary(pkg, brand.name, brand.sector);
        addToPlan({
          topic: it.topicSeed,
          contentType: it.contentType,
          angle: it.angle,
          sector: brand.sector,
          date: it.date,
          pillar: it.pillar || undefined,
        });
        results.push({ personaName: `${it.date} · ${it.pillar || it.topicSeed}`, pkg });
        setProgress(i + 1);
      }
      sessionStorage.removeItem("content-os.result");
      sessionStorage.removeItem("content-os.team-run");
      sessionStorage.setItem("content-os.results", JSON.stringify(results));
      if (useTeam) sessionStorage.setItem("content-os.team-runs", JSON.stringify(teamRuns));
      else sessionStorage.removeItem("content-os.team-runs");
      router.push("/output");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kampanya üretilemedi.");
      setBuilding(false);
    }
  };

  if (brand === null) {
    return <NeedBrand onLoaded={setBrand} />;
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
          <div className="flex flex-wrap items-center justify-end gap-2">
            {error && <span className="mr-auto text-sm text-red-600">{error}</span>}
            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                className="h-4 w-4 accent-brand"
                checked={useTeam}
                onChange={(e) => setUseTeam(e.target.checked)}
                disabled={building}
              />
              🤝 Ajan ekibi turu (her gönderi üret→eleştir→düzelt)
            </label>
            <button type="button" className="btn-ghost" onClick={addAll} disabled={building}>
              Tümünü takvime ekle
            </button>
            <button type="button" className="btn-primary" onClick={buildCampaign} disabled={building}>
              {building
                ? `Üretiliyor… ${progress}/${items.length}`
                : `Tüm kampanyayı üret (${items.length} gönderi)`}
            </button>
          </div>
          <p className="text-xs text-neutral-500">
            “Tüm kampanyayı üret” her maddeyi gerçek paket olarak üretir (demo modda, anahtarsız),
            kütüphaneye ve takvime kaydeder, hepsini birlikte çıktı ekranında gösterir.
          </p>
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
