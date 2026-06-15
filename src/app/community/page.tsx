"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { loadBrand } from "@/lib/brand-store";
import type { Brand, ReplyDrafts } from "@/lib/types";

export default function CommunityPage() {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [comment, setComment] = useState("");
  const [demo, setDemo] = useState(false);
  const [res, setRes] = useState<ReplyDrafts | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setBrand(loadBrand()), []);

  const run = async () => {
    if (!brand || !comment.trim()) {
      setError("Marka ve yorum gerekli.");
      return;
    }
    setLoading(true);
    setError(null);
    setRes(null);
    try {
      const r = await fetch("/api/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, comment, personaIndex: 0, demo }),
      });
      const data = await r.json();
      if (!r.ok) setError(data.error || "Üretim başarısız.");
      else setRes(data as ReplyDrafts);
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
        <h1 className="text-2xl font-bold">Topluluk Yönetimi</h1>
        <p className="text-sm text-neutral-600">{brand.name} — yorum/DM yanıt taslakları (marka sesiyle).</p>
      </div>
      <section className="card space-y-4">
        <div>
          <label className="label">Gelen yorum / DM</label>
          <textarea
            className="input min-h-[88px]"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="or. Fiyatlarınız neden net değil? Güvenmek zor."
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input type="checkbox" className="h-4 w-4 accent-brand" checked={demo} onChange={(e) => setDemo(e.target.checked)} />
          Demo modu (anahtarsız önizleme)
        </label>
        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <button type="button" className="btn-primary" onClick={run} disabled={loading}>
          {loading ? "Üretiliyor…" : "Yanıt taslağı üret"}
        </button>
      </section>

      {res && (
        <section className="card space-y-2">
          {res.drafts.map((d, i) => (
            <div key={i} className="flex items-start justify-between gap-2 rounded-xl border border-neutral-200 p-3 text-sm">
              <span>{d}</span>
              <CopyButton text={d} />
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
