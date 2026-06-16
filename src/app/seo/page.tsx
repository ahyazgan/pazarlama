"use client";

import { useEffect, useState } from "react";
import { NeedBrand } from "@/components/NeedBrand";
import { CopyButton } from "@/components/CopyButton";
import { auditSeo } from "@/lib/seo";
import { loadBrand } from "@/lib/brand-store";
import type { Brand, SeoContent } from "@/lib/types";

export default function SeoPage() {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [topic, setTopic] = useState("");
  const [kw, setKw] = useState("");
  const [demo, setDemo] = useState(false);
  const [seo, setSeo] = useState<SeoContent | null>(null);
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
    setSeo(null);
    try {
      const res = await fetch("/api/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, topic, primaryKeyword: kw.trim() || undefined, demo }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Üretim başarısız.");
      else setSeo(data as SeoContent);
    } catch {
      setError("Ağa bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  };

  if (brand === null) {
    return <NeedBrand onLoaded={setBrand} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">SEO İçerik</h1>
        <p className="text-sm text-neutral-600">{brand.name} — blog iskeleti + meta + anahtar kelimeler.</p>
      </div>

      <section className="card space-y-4">
        <div>
          <label className="label">Konu</label>
          <input
            className="input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="or. Şantiyede çimento stok yönetimi"
          />
        </div>
        <div>
          <label className="label">Birincil anahtar kelime (opsiyonel)</label>
          <input
            className="input"
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            placeholder="or. çimento stok yönetimi"
          />
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
          {loading ? "Üretiliyor…" : "SEO iskeleti üret"}
        </button>
      </section>

      {seo && (() => {
        const audit = auditSeo(seo);
        return (
          <div
            className={`rounded-lg border px-3 py-2 text-sm ${
              audit.score >= 80
                ? "border-green-200 bg-green-50"
                : audit.score >= 50
                  ? "border-amber-200 bg-amber-50"
                  : "border-red-200 bg-red-50"
            }`}
          >
            <p className="font-semibold">SEO skoru: {audit.score}/100</p>
            <ul className="mt-1 space-y-0.5 text-xs">
              {audit.checks.map((c, i) => (
                <li key={i} className={c.ok ? "text-neutral-600" : "text-red-700"}>
                  {c.ok ? "✓" : "✗"} {c.label} — {c.detail}
                </li>
              ))}
            </ul>
          </div>
        );
      })()}

      {seo && (
        <section className="card space-y-3">
          <div className="rounded-xl border border-neutral-200 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Title ({seo.title.length})</span>
              <CopyButton text={seo.title} />
            </div>
            <p className="text-sm">{seo.title}</p>
          </div>
          <div className="rounded-xl border border-neutral-200 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Meta description ({seo.metaDescription.length})</span>
              <CopyButton text={seo.metaDescription} />
            </div>
            <p className="text-sm">{seo.metaDescription}</p>
          </div>
          <div className="text-sm">
            <span className="font-medium">Anahtar kelimeler:</span> {seo.keywords.join(", ")}
          </div>
          <div className="rounded-xl border border-neutral-200 p-3">
            <div className="mb-1 text-sm font-semibold">Giriş</div>
            <p className="text-sm">{seo.intro}</p>
          </div>
          <div>
            <div className="mb-1 text-sm font-semibold">Outline</div>
            <div className="space-y-2">
              {seo.outline.map((o, i) => (
                <div key={i} className="rounded-lg bg-neutral-50 p-3 text-sm">
                  <div className="font-medium">H2: {o.h2}</div>
                  <ul className="mt-1 list-disc pl-5 text-neutral-700">
                    {o.points.map((p, j) => (
                      <li key={j}>{p}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
