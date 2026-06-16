"use client";

import { useEffect, useState } from "react";
import { NeedBrand } from "@/components/NeedBrand";
import { CopyButton } from "@/components/CopyButton";
import { lintEmail } from "@/lib/email";
import { loadBrand } from "@/lib/brand-store";
import type { Brand, EmailKit, SequenceType } from "@/lib/types";

const SEQ: [SequenceType, string][] = [
  ["hosgeldin", "Hoş geldin"],
  ["nurture", "Nurture"],
  ["kampanya", "Kampanya"],
];

export default function EmailPage() {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [topic, setTopic] = useState("");
  const [seqType, setSeqType] = useState<SequenceType>("hosgeldin");
  const [personaIndex, setPersonaIndex] = useState(0);
  const [demo, setDemo] = useState(false);
  const [kit, setKit] = useState<EmailKit | null>(null);
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
    setKit(null);
    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, topic, sequenceType: seqType, personaIndex, demo }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Üretim başarısız.");
      else setKit(data as EmailKit);
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
        <h1 className="text-2xl font-bold">E-posta / Funnel</h1>
        <p className="text-sm text-neutral-600">{brand.name} — e-posta dizisi + landing kopyası.</p>
      </div>
      <section className="card space-y-4">
        <div>
          <label className="label">Konu / teklif</label>
          <input className="input" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="or. Yeni müteahhitlere hızlı tedarik" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Dizi türü</label>
            <select className="input" value={seqType} onChange={(e) => setSeqType(e.target.value as SequenceType)}>
              {SEQ.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Hedef persona</label>
            <select className="input" value={personaIndex} onChange={(e) => setPersonaIndex(Number(e.target.value))}>
              {brand.audience.map((p, i) => (
                <option key={i} value={i}>{p.name || `Persona ${i + 1}`}</option>
              ))}
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input type="checkbox" className="h-4 w-4 accent-brand" checked={demo} onChange={(e) => setDemo(e.target.checked)} />
          Demo modu (anahtarsız önizleme)
        </label>
        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <button type="button" className="btn-primary" onClick={run} disabled={loading}>
          {loading ? "Üretiliyor…" : "Dizi üret"}
        </button>
      </section>

      {kit && (() => {
        const issues = lintEmail(kit);
        return issues.length === 0 ? (
          <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            Deliverability temiz ✓ (spam-kelime / uzun konu yok)
          </div>
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <p className="font-semibold">Deliverability uyarıları ({issues.length}):</p>
            <ul className="mt-1 list-disc pl-5">
              {issues.map((it, i) => (
                <li key={i}>
                  {it.where}: {it.detail}
                </li>
              ))}
            </ul>
          </div>
        );
      })()}

      {kit && (
        <section className="card space-y-3">
          {kit.emails.map((e, i) => (
            <div key={i} className="rounded-xl border border-neutral-200 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">E-posta {i + 1}: {e.subject}</span>
                <CopyButton text={`${e.subject}\n\n${e.body}\n\n${e.cta}`} />
              </div>
              <p className="text-xs text-neutral-500">Preheader: {e.preview}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{e.body}</p>
              <p className="mt-1 text-sm font-medium text-brand-dark">CTA: {e.cta}</p>
            </div>
          ))}
          <div className="rounded-xl border border-brand/30 bg-brand-tint/40 p-3">
            <div className="text-sm font-semibold">Landing page</div>
            <p className="mt-1 text-base font-bold">{kit.landingHeadline}</p>
            <p className="text-sm text-neutral-700">{kit.landingSubhead}</p>
            <ul className="mt-1 list-disc pl-5 text-sm">
              {kit.landingBullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
            <p className="mt-1 text-sm font-medium text-brand-dark">CTA: {kit.landingCta}</p>
          </div>
        </section>
      )}
    </div>
  );
}
