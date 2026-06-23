"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StringList } from "@/components/StringList";
import { BrainMeter } from "@/components/BrainMeter";
import { brainScore } from "@/lib/brain-score";
import { SECTOR_OPTIONS } from "@/lib/sectors";
import {
  emptyBrand,
  HAMMADDEM_SAMPLE,
  loadBrands,
  saveBrandLocal,
} from "@/lib/brand-store";
import {
  WIZARD_STEPS,
  isStepComplete,
  canFinish,
  type WizardStep,
} from "@/lib/onboarding";
import type { Brand, SectorId } from "@/lib/types";

export default function OnboardingPage() {
  const router = useRouter();
  const [brand, setBrand] = useState<Brand>(emptyBrand());
  const [step, setStep] = useState(0);
  const [hasBrands, setHasBrands] = useState(false);

  useEffect(() => {
    setHasBrands(loadBrands().length > 0);
  }, []);

  const set = (patch: Partial<Brand>) => setBrand((b) => ({ ...b, ...patch }));
  const setId = (patch: Partial<Brand["identity"]>) =>
    setBrand((b) => ({ ...b, identity: { ...b.identity, ...patch } }));
  const setVoice = (patch: Partial<Brand["voice"]>) =>
    setBrand((b) => ({ ...b, voice: { ...b.voice, ...patch } }));
  const setPersona = (patch: Partial<Brand["audience"][number]>) =>
    setBrand((b) => ({
      ...b,
      audience: [{ ...b.audience[0], ...patch }, ...b.audience.slice(1)],
    }));
  const setProof = (patch: Partial<Brand["proof"]>) =>
    setBrand((b) => ({ ...b, proof: { ...b.proof, ...patch } }));

  const current: WizardStep = WIZARD_STEPS[step];
  const score = brainScore(brand);
  const isLast = step === WIZARD_STEPS.length - 1;

  const finish = () => {
    saveBrandLocal(brand);
    router.push("/create");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Hızlı Kurulum</h1>
          <p className="text-sm text-neutral-600">
            5 adımda marka beynini kur. Sonra her üretim markana özel olur.
          </p>
        </div>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setBrand(HAMMADDEM_SAMPLE)}
        >
          Hammaddem örneğiyle başla
        </button>
      </div>

      {/* Adım göstergesi */}
      <div className="flex flex-wrap gap-2">
        {WIZARD_STEPS.map((s, i) => {
          const done = isStepComplete(brand, s.id);
          const active = i === step;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(i)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                active
                  ? "bg-brand text-white"
                  : done
                    ? "bg-brand-tint text-brand-dark"
                    : "bg-neutral-100 text-neutral-500"
              }`}
            >
              <span>{done ? "✓" : i + 1}</span>
              {s.title}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="card space-y-4">
          <div>
            <h2 className="text-lg font-semibold">
              {step + 1}. {current.title}
            </h2>
            <p className="text-sm text-neutral-600">{current.hint}</p>
          </div>

          {current.id === "identity" && (
            <div className="space-y-3">
              <Field label="Marka adı">
                <input
                  className="input"
                  value={brand.name}
                  placeholder="Örn. Hammaddem"
                  onChange={(e) => set({ name: e.target.value })}
                />
              </Field>
              <Field label="Değer önerisi (tek cümlede ne sunuyorsun?)">
                <textarea
                  className="input min-h-[64px]"
                  value={brand.identity.valueProp}
                  placeholder="Örn. Doğrulanmış tedarikçilerden zamanında malzeme tedariki."
                  onChange={(e) => setId({ valueProp: e.target.value })}
                />
              </Field>
              <Field label="Farklılaşma (seni rakipten ne ayırıyor?)">
                <textarea
                  className="input min-h-[64px]"
                  value={brand.identity.differentiation}
                  placeholder="Örn. Tek pazaryerinde çok tedarikçi + garantili teslim süresi."
                  onChange={(e) => setId({ differentiation: e.target.value })}
                />
              </Field>
            </div>
          )}

          {current.id === "voice" && (
            <div className="space-y-3">
              <Field label="Cümle stili">
                <input
                  className="input"
                  value={brand.voice.sentenceStyle}
                  placeholder="Örn. Kısa, fiil-öncelikli, nokta ile ayrık cümleler."
                  onChange={(e) => setVoice({ sentenceStyle: e.target.value })}
                />
              </Field>
              <Field label="Yasak kelimeler (markanın asla kullanmayacağı)">
                <StringList
                  values={brand.voice.bannedWords}
                  onChange={(bannedWords) => setVoice({ bannedWords })}
                  placeholder="Örn. ucuz"
                />
              </Field>
            </div>
          )}

          {current.id === "audience" && (
            <div className="space-y-3">
              <Field label="Persona adı">
                <input
                  className="input"
                  value={brand.audience[0]?.name ?? ""}
                  placeholder="Örn. Saha Müdürü (Müteahhit)"
                  onChange={(e) => setPersona({ name: e.target.value })}
                />
              </Field>
              <Field label="Acısı (hangi sorunu yaşıyor?)">
                <textarea
                  className="input min-h-[64px]"
                  value={brand.audience[0]?.pain ?? ""}
                  placeholder="Örn. Geç gelen malzeme şantiyeyi durduruyor."
                  onChange={(e) => setPersona({ pain: e.target.value })}
                />
              </Field>
              <Field label="Motivasyonu (ne istiyor?)">
                <textarea
                  className="input min-h-[64px]"
                  value={brand.audience[0]?.motivation ?? ""}
                  placeholder="Örn. Teslimatı garanti alarak işi zamanında bitirmek."
                  onChange={(e) => setPersona({ motivation: e.target.value })}
                />
              </Field>
            </div>
          )}

          {current.id === "proof" && (
            <div className="space-y-3">
              <Field label="Gerçek rakamlar (generic'liği kıran kanıt)">
                <StringList
                  values={brand.proof.numbers}
                  onChange={(numbers) => setProof({ numbers })}
                  placeholder="Örn. 10.000+ ton teslimat"
                />
              </Field>
              <Field label="Vaka / referans">
                <StringList
                  values={brand.proof.cases}
                  onChange={(cases) => setProof({ cases })}
                  placeholder="Örn. Konut projesinde 2 günde 400 ton tedarik"
                />
              </Field>
            </div>
          )}

          {current.id === "sector" && (
            <div className="space-y-3">
              <Field label="Sektör">
                <select
                  className="input"
                  value={brand.sector}
                  onChange={(e) => set({ sector: e.target.value as SectorId })}
                >
                  {SECTOR_OPTIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Dönüşüm hedefi (CTA — içerik ne yaptırsın?)">
                <input
                  className="input"
                  value={brand.identity.ctaGoal}
                  placeholder="Örn. Teklif al / WhatsApp'tan sor"
                  onChange={(e) => setId({ ctaGoal: e.target.value })}
                />
              </Field>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              className="btn-ghost"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              ← Geri
            </button>
            {isLast ? (
              <button
                type="button"
                className="btn-primary"
                disabled={!canFinish(brand)}
                onClick={finish}
                title={canFinish(brand) ? "" : "Ad, sektör ve bir persona acısı gerekli"}
              >
                Bitir ve kampanya oluştur →
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={() => setStep((s) => Math.min(WIZARD_STEPS.length - 1, s + 1))}
              >
                İleri →
              </button>
            )}
          </div>
        </div>

        <aside className="space-y-3">
          <BrainMeter score={score} />
          <div className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
            <p>
              Buradaki alanlar minimum başlangıç. Bitirdikten sonra{" "}
              <Link href="/brand" className="text-brand underline">
                Marka Profili
              </Link>{" "}
              ekranında beyni dilediğin kadar derinleştirebilirsin.
            </p>
          </div>
          {hasBrands && (
            <Link href="/brand" className="block text-center text-xs text-neutral-400 hover:text-neutral-600">
              Kurulumu atla, doğrudan Marka Profili'ne git
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      {children}
    </label>
  );
}
