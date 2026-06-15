"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { loadBrand } from "@/lib/brand-store";
import type { AdCopy, AdObjective, Brand } from "@/lib/types";

const OBJECTIVES: [AdObjective, string][] = [
  ["donusum", "Dönüşüm (teklif/satış)"],
  ["trafik", "Trafik"],
  ["etkilesim", "Etkileşim"],
  ["bilinirlik", "Bilinirlik"],
];

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-neutral-200 p-3">
      <div className="mb-1 text-sm font-semibold text-neutral-700">{title}</div>
      <div className="space-y-1">
        {items.map((v, i) => (
          <div key={i} className="flex items-start justify-between gap-2 text-sm">
            <span>{v}</span>
            <CopyButton text={v} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdsPage() {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [topic, setTopic] = useState("");
  const [objective, setObjective] = useState<AdObjective>("donusum");
  const [personaIndex, setPersonaIndex] = useState(0);
  const [demo, setDemo] = useState(false);
  const [ads, setAds] = useState<AdCopy | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setBrand(loadBrand()), []);

  const run = async () => {
    if (!brand || !topic.trim()) {
      setError("Marka ve konu gerekli.");
      return;
    }
    setLoading(true);
    setError(null);
    setAds(null);
    try {
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, topic, objective, personaIndex, demo }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Üretim başarısız.");
      else setAds(data as AdCopy);
    } catch {
      setError("Ağa bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  };

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
      <div>
        <h1 className="text-2xl font-bold">Reklam Metni (Paid Media)</h1>
        <p className="text-sm text-neutral-600">
          {brand.name} — Meta + Google reklam seti. (Yalnızca kreatif; bütçe/yayın ayrı.)
        </p>
      </div>

      <section className="card space-y-4">
        <div>
          <label className="label">Konu / teklif</label>
          <input
            className="input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="or. 2 günde garantili çimento teslimi"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Kampanya hedefi</label>
            <select
              className="input"
              value={objective}
              onChange={(e) => setObjective(e.target.value as AdObjective)}
            >
              {OBJECTIVES.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Hedef persona</label>
            <select
              className="input"
              value={personaIndex}
              onChange={(e) => setPersonaIndex(Number(e.target.value))}
            >
              {brand.audience.map((p, i) => (
                <option key={i} value={i}>
                  {p.name || `Persona ${i + 1}`}
                </option>
              ))}
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            className="h-4 w-4 accent-brand"
            checked={demo}
            onChange={(e) => setDemo(e.target.checked)}
          />
          Demo modu (anahtarsız önizleme)
        </label>
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <button type="button" className="btn-primary" onClick={run} disabled={loading}>
          {loading ? "Üretiliyor…" : "Reklam metni üret"}
        </button>
      </section>

      {ads && (
        <section className="card space-y-4">
          <h2 className="font-semibold">Meta (Facebook/Instagram)</h2>
          <List title="Birincil metin" items={ads.meta.primaryTexts} />
          <List title="Başlıklar" items={ads.meta.headlines} />
          <List title="Açıklamalar" items={ads.meta.descriptions} />
          <div className="text-sm">
            <span className="font-medium">Buton:</span> {ads.meta.cta}
          </div>
          <h2 className="font-semibold">Google Ads</h2>
          <List title="Başlıklar (≤30)" items={ads.google.headlines} />
          <List title="Açıklamalar (≤90)" items={ads.google.descriptions} />
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm">
            <span className="font-medium">Hedef kitle önerisi:</span> {ads.audience}
          </div>
        </section>
      )}
    </div>
  );
}
