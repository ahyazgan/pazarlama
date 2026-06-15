"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadBrand } from "@/lib/brand-store";
import {
  findDuplicate,
  formatWhen,
  loadHistory,
  recordHistory,
  type HistoryEntry,
} from "@/lib/history";
import { savePackageRemote } from "@/lib/persist";
import { loadFeedback, netScores } from "@/lib/feedback";
import { brainScore } from "@/lib/brain-score";
import { brainInjectionSummary } from "@/lib/brain-preview";
import { getSector } from "@/lib/sectors";
import {
  assignAnglesToPersonas,
  buildStrategyBrief,
  suggestTopics,
} from "@/lib/strategy";
import {
  ANGLE_HINTS,
  ANGLE_LABELS,
  CONTENT_TYPE_LABELS,
  PLATFORM_LABELS,
  type Angle,
  type Brand,
  type ContentPackage,
  type ContentType,
  type PersonaPackage,
} from "@/lib/types";

const ANGLES = Object.keys(ANGLE_LABELS) as Angle[];

export default function CreatePage() {
  const router = useRouter();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState<ContentType>("deger");
  const [angle, setAngle] = useState<Angle>("egitici");
  const [personaIndex, setPersonaIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [feedbackStore, setFeedbackStore] = useState<ReturnType<typeof loadFeedback>>({});
  const [demo, setDemo] = useState(false);
  const [trend, setTrend] = useState("");

  useEffect(() => {
    const b = loadBrand();
    setBrand(b);
    setHistory(loadHistory());
    setFeedbackStore(loadFeedback());
    if (b) {
      // Sektorun icerik karisimindan en yuksek payli tipi varsayilan sec.
      const mix = getSector(b.sector).contentMix;
      const top = (Object.entries(mix) as [ContentType, number][])
        .filter(([, v]) => v > 0)
        .sort((a, c) => c[1] - a[1])[0];
      if (top) setContentType(top[0]);
    }
  }, []);

  if (brand === null) {
    return (
      <div className="card space-y-3 text-center">
        <h1 className="text-xl font-bold">Once marka profili gerekli</h1>
        <p className="text-sm text-neutral-600">
          Icerik uretmek icin once Marka Beyni'ni doldurmalisin.
        </p>
        <Link href="/brand" className="btn-primary mx-auto w-fit">
          Marka Profili'ne git
        </Link>
      </div>
    );
  }

  const sector = getSector(brand.sector);
  const mix = sector.contentMix;
  const duplicate = findDuplicate(history, topic, angle);

  // Strateji Engine — zengin brief (boş sayfa sendromunu öldürür) + öğrenilmiş feedback.
  const feedback = netScores(feedbackStore, brand.sector);
  const brief = buildStrategyBrief(brand, topic, history, feedback);
  const score = brainScore(brand);
  const injection = brainInjectionSummary({
    brand,
    topic,
    contentType,
    angle,
    personaIndex,
    trend: trend.trim() || undefined,
  });
  const angleRec = brief.primaryAngle;
  const typeRec = brief.contentType;
  const topicIdeas = suggestTopics(sector, history);
  const recApplied = angle === angleRec.value && contentType === typeRec.value;

  const applyRecommendation = () => {
    setAngle(angleRec.value);
    setContentType(typeRec.value);
    setPersonaIndex(brief.personaFocusIndex);
  };

  const generateFor = async (idx: number, angleArg: Angle = angle) => {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brand,
        topic,
        contentType,
        angle: angleArg,
        personaIndex: idx,
        demo,
        trend: trend.trim() || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Uretim basarisiz.");
    const pkg = data as ContentPackage;
    // Best-effort uzak kayit (env + brand_id varsa); yoksa sessizce atlar.
    const brandId =
      typeof window !== "undefined"
        ? window.localStorage.getItem("content-os.brand_id")
        : null;
    void savePackageRemote(brandId, pkg);
    return pkg;
  };

  const submit = async () => {
    setError(null);
    if (!topic.trim()) {
      setError("Konu bos olamaz.");
      return;
    }
    setLoading(true);
    try {
      const pkg = await generateFor(personaIndex);
      recordHistory({ topic, contentType, angle, personaIndex });
      sessionStorage.removeItem("content-os.results");
      sessionStorage.setItem("content-os.result", JSON.stringify(pkg));
      router.push("/output");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Aga baglanilamadi. Tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  // Constitution Katman 3: her persona icin AYRI icerik acisi uretilir.
  const submitAll = async () => {
    setError(null);
    if (!topic.trim()) {
      setError("Konu bos olamaz.");
      return;
    }
    setLoading(true);
    try {
      // Her persona için FARKLI açı (Constitution Katman 3).
      const angles = assignAnglesToPersonas(
        sector,
        topic,
        brand.audience.length,
        history,
        feedback,
      );
      const results: PersonaPackage[] = [];
      for (let i = 0; i < brand.audience.length; i++) {
        const pkg = await generateFor(i, angles[i]);
        results.push({
          personaName: brand.audience[i].name || `Persona ${i + 1}`,
          pkg,
        });
      }
      recordHistory({ topic, contentType, angle, personaIndex });
      sessionStorage.removeItem("content-os.result");
      sessionStorage.setItem("content-os.results", JSON.stringify(results));
      router.push("/output");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Aga baglanilamadi. Tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kampanya Olustur</h1>
        <p className="text-sm text-neutral-600">
          <span className="font-medium">{brand.name}</span> · {sector.label}
        </p>
      </div>

      {score.score < 60 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Beyin %{score.score} dolu — çıktı daha generic olabilir.{" "}
          <Link href="/brand" className="font-medium underline">
            Marka Profili'ni güçlendir
          </Link>{" "}
          (öncelik: {score.missing[0]?.label}).
        </div>
      )}

      <section className="card space-y-5">
        <div>
          <label className="label">Bu hafta ne anlatmak istersin? (Konu)</label>
          <input
            className="input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="or. Cimento stogu tazelendi"
          />
          {!topic.trim() && topicIdeas.length > 0 && (
            <div className="mt-2">
              <p className="hint mb-1">Konu fikri (boş sayfa mı? başla):</p>
              <div className="flex flex-wrap gap-2">
                {topicIdeas.map((idea, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setTopic(idea)}
                    className="chip border-neutral-300 bg-white text-left text-neutral-700 hover:border-brand hover:bg-brand-tint"
                  >
                    {idea}
                  </button>
                ))}
              </div>
            </div>
          )}
          {sector.hooks.length > 0 && (
            <div className="mt-2">
              <p className="hint mb-1">
                Hook kütüphanesi ({sector.label}) — tıkla, boşluğu doldur:
              </p>
              <div className="flex flex-wrap gap-2">
                {sector.hooks.map((h, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setTopic(h)}
                    className="chip border-neutral-300 bg-white text-left text-neutral-700 hover:border-brand hover:bg-brand-tint"
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Strateji Engine önerisi */}
        <div className="rounded-xl border border-brand/30 bg-brand-tint/50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-neutral-700">
              <span className="font-semibold text-brand-dark">Strateji önerisi:</span>{" "}
              {CONTENT_TYPE_LABELS[typeRec.value]} içerik ·{" "}
              {ANGLE_LABELS[angleRec.value]} açısı
            </p>
            <button
              type="button"
              className="btn-ghost px-3 py-1 text-xs"
              onClick={applyRecommendation}
              disabled={recApplied}
            >
              {recApplied ? "Uygulandı ✓" : "Öneriyi uygula"}
            </button>
          </div>
          <p className="hint mt-1">
            {angleRec.reason} {typeRec.reason}
          </p>
          <div className="mt-2 grid gap-1 text-xs text-neutral-600 sm:grid-cols-2">
            <div>
              <span className="font-medium">İkincil açı:</span>{" "}
              {ANGLE_LABELS[brief.secondaryAngle]}
            </div>
            <div>
              <span className="font-medium">Persona odağı:</span> {brief.personaFocusName}
            </div>
            <div>
              <span className="font-medium">Platform önceliği:</span>{" "}
              {brief.platformPriority.map((p) => PLATFORM_LABELS[p]).join(" › ")}
            </div>
            {brief.hookSeed && (
              <div>
                <span className="font-medium">Hook tohumu:</span> {brief.hookSeed}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="label">Icerik tipi</label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CONTENT_TYPE_LABELS) as ContentType[]).map((ct) => {
              const pct = mix[ct] ?? 0;
              const active = contentType === ct;
              return (
                <button
                  key={ct}
                  type="button"
                  onClick={() => setContentType(ct)}
                  className={`chip ${
                    active
                      ? "border-brand bg-brand text-white"
                      : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  {CONTENT_TYPE_LABELS[ct]}
                  {pct > 0 && (
                    <span className={active ? "opacity-80" : "text-neutral-400"}>
                      {" "}
                      · %{pct}
                    </span>
                  )}
                  {ct === typeRec.value && <span title="Önerilen"> ★</span>}
                </button>
              );
            })}
          </div>
          <p className="hint">Yuzdeler sektorun onerilen icerik karisimini gosterir.</p>
        </div>

        <div>
          <label className="label">Aci (Angle Generator — 5 evrensel aci)</label>
          <div className="grid gap-2 sm:grid-cols-2">
            {ANGLES.map((a) => {
              const active = angle === a;
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAngle(a)}
                  className={`rounded-xl border p-3 text-left transition ${
                    active
                      ? "border-brand bg-brand-tint"
                      : "border-neutral-200 bg-white hover:bg-neutral-50"
                  }`}
                >
                  <div className="font-medium">
                    {ANGLE_LABELS[a]}
                    {a === angleRec.value && (
                      <span className="ml-1 text-brand" title="Önerilen">
                        ★
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-neutral-500">{ANGLE_HINTS[a]}</div>
                </button>
              );
            })}
          </div>
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

        <div>
          <label className="label">
            Güncel trend / haber{" "}
            <span className="font-normal text-neutral-400">(opsiyonel — trend enjeksiyonu)</span>
          </label>
          <input
            className="input"
            value={trend}
            onChange={(e) => setTrend(e.target.value)}
            placeholder="or. Yeni deprem yönetmeliği yürürlüğe girdi"
          />
          <p className="hint">Doldurulursa içerik bu güncel olaya bağlanır.</p>
        </div>

        <details className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
          <summary className="cursor-pointer text-sm font-medium text-neutral-700">
            Beyne ne enjekte ediliyor? ({injection.filter((i) => i.active).length}/
            {injection.length} sinyal aktif)
          </summary>
          <ul className="mt-2 space-y-1 text-xs">
            {injection.map((it) => (
              <li
                key={it.label}
                className={it.active ? "text-neutral-700" : "text-neutral-400"}
              >
                <span className="font-medium">{it.active ? "✓" : "○"} {it.label}:</span>{" "}
                {it.value}
              </li>
            ))}
          </ul>
        </details>

        {duplicate && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            İçerik hafızası: bu konuyu <strong>{ANGLE_LABELS[angle]}</strong> açısıyla{" "}
            {formatWhen(duplicate.at)} tarihinde zaten ürettin. Tekrarı önlemek için farklı
            bir açı seçmeyi düşün.
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            className="h-4 w-4 accent-brand"
            checked={demo}
            onChange={(e) => setDemo(e.target.checked)}
          />
          Demo modu (API anahtarı olmadan şablon önizleme)
        </label>

        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-primary" onClick={submit} disabled={loading}>
            {loading ? "Uretiliyor…" : demo ? "Demo paketi uret" : "Icerik paketi uret"}
          </button>
          {brand.audience.length > 1 && (
            <button
              type="button"
              className="btn-ghost"
              onClick={submitAll}
              disabled={loading}
            >
              {loading
                ? "Uretiliyor…"
                : `Tum personalar icin ayri aci ile uret (${brand.audience.length})`}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
