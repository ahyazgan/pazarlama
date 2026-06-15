"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StringList } from "@/components/StringList";
import { BrainMeter } from "@/components/BrainMeter";
import { brainScore } from "@/lib/brain-score";
import { SECTOR_OPTIONS, getSector } from "@/lib/sectors";
import {
  deleteBrand,
  emptyBrand,
  HAMMADDEM_SAMPLE,
  loadBrand,
  loadBrands,
  saveBrandLocal,
  setActiveBrand,
} from "@/lib/brand-store";
import { saveBrandRemote } from "@/lib/persist";
import { serializeBrand, parseBrand } from "@/lib/brand-io";
import { downloadText, slugify } from "@/lib/export";
import type { Brand, SectorId } from "@/lib/types";

export default function BrandPage() {
  const router = useRouter();
  const [brand, setBrand] = useState<Brand>(emptyBrand());
  const [brands, setBrands] = useState<Brand[]>([]);
  const [saved, setSaved] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    const existing = loadBrand();
    if (existing) setBrand(existing);
    setBrands(loadBrands());
  }, []);

  const switchTo = (id: string) => {
    if (id === "__new__") {
      setBrand(emptyBrand());
      setSaved(false);
      return;
    }
    const found = loadBrands().find((b) => b.id === id);
    if (found) {
      setActiveBrand(id);
      setBrand(found);
      setSaved(false);
    }
  };

  const removeCurrent = () => {
    if (!brand.id) return;
    const next = deleteBrand(brand.id);
    setBrands(next.brands);
    setBrand(loadBrand() ?? emptyBrand());
    setSaved(false);
  };

  const set = (patch: Partial<Brand>) => {
    setBrand((b) => ({ ...b, ...patch }));
    setSaved(false);
  };

  const sector = getSector(brand.sector);
  const score = brainScore(brand);

  // Best-effort: Supabase yapilandirilmissa uzak kayit + brand id'yi sakla.
  const persistRemote = async () => {
    const id = await saveBrandRemote(brand);
    if (id) window.localStorage.setItem("content-os.brand_id", id);
  };

  const save = () => {
    const stored = saveBrandLocal(brand);
    setBrand(stored);
    setBrands(loadBrands());
    void persistRemote();
    setSaved(true);
  };

  const saveAndGo = () => {
    saveBrandLocal(brand);
    void persistRemote();
    router.push("/create");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Marka Profili</h1>
          <p className="text-sm text-neutral-600">
            Marka Beyni — bir kez doldur, sistem her uretimde kullanir.
          </p>
        </div>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setBrand(HAMMADDEM_SAMPLE)}
        >
          Hammaddem ornegiyle doldur
        </button>
      </div>

      {brands.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm">
          <span className="text-neutral-600">Marka:</span>
          <select
            className="input w-auto py-1"
            value={brand.id ?? "__new__"}
            onChange={(e) => switchTo(e.target.value)}
          >
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name || "(isimsiz)"}
              </option>
            ))}
            {!brand.id && <option value="__new__">(yeni marka)</option>}
          </select>
          <button type="button" className="btn-ghost px-3 py-1" onClick={() => switchTo("__new__")}>
            + Yeni marka
          </button>
          {brand.id && brands.length > 1 && (
            <button
              type="button"
              className="px-2 py-1 text-xs text-neutral-400 hover:text-red-500"
              onClick={removeCurrent}
            >
              Bu markayı sil
            </button>
          )}
        </div>
      )}

      <BrainMeter score={score} />

      {/* Katman 1: Kimlik */}
      <section className="card space-y-4">
        <h2 className="font-semibold">1. Kimlik</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Marka adi</label>
            <input
              className="input"
              value={brand.name}
              onChange={(e) => set({ name: e.target.value })}
              placeholder="or. Hammaddem"
            />
          </div>
          <div>
            <label className="label">Sektor</label>
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
            <p className="hint">
              Sektor zekasi (Katman 4) otomatik yuklenir: terminoloji, hook ve icerik
              karisimi.
            </p>
          </div>
        </div>
        <div>
          <label className="label">Misyon</label>
          <textarea
            className="input min-h-[64px]"
            value={brand.identity.mission}
            onChange={(e) =>
              set({ identity: { ...brand.identity, mission: e.target.value } })
            }
            placeholder="Ne icin varsin?"
          />
        </div>
        <div>
          <label className="label">Deger onerisi</label>
          <textarea
            className="input min-h-[64px]"
            value={brand.identity.valueProp}
            onChange={(e) =>
              set({ identity: { ...brand.identity, valueProp: e.target.value } })
            }
            placeholder="Neden sen?"
          />
        </div>
        <div>
          <label className="label">
            Marka hikayesi{" "}
            <span className="font-normal text-neutral-400">(origin / neden — özgünlük)</span>
          </label>
          <textarea
            className="input min-h-[64px]"
            value={brand.identity.story ?? ""}
            onChange={(e) => set({ identity: { ...brand.identity, story: e.target.value } })}
            placeholder="Bu marka neden, nasıl doğdu?"
          />
        </div>
        <div>
          <label className="label">Kisilik (5 sifat)</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {brand.identity.personality.map((p, i) => (
              <input
                key={i}
                className="input"
                value={p}
                onChange={(e) => {
                  const personality = [...brand.identity.personality];
                  personality[i] = e.target.value;
                  set({ identity: { ...brand.identity, personality } });
                }}
                placeholder={`sifat ${i + 1}`}
              />
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">
              Rakipler / alternatifler{" "}
              <span className="font-normal text-neutral-400">(konumlandırma)</span>
            </label>
            <StringList
              values={brand.identity.competitors ?? [""]}
              onChange={(competitors) => set({ identity: { ...brand.identity, competitors } })}
              placeholder="or. yerel hırdavatçı"
            />
          </div>
          <div>
            <label className="label">Neden onlardan farklıyız?</label>
            <textarea
              className="input min-h-[88px]"
              value={brand.identity.differentiation ?? ""}
              onChange={(e) =>
                set({ identity: { ...brand.identity, differentiation: e.target.value } })
              }
              placeholder="Karşıtlık açısını besleyen net fark"
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Marka ana rengi</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="h-10 w-14 rounded border border-neutral-300"
                value={brand.identity.primaryColor || "#E8650A"}
                onChange={(e) =>
                  set({ identity: { ...brand.identity, primaryColor: e.target.value } })
                }
              />
              <input
                className="input"
                value={brand.identity.primaryColor ?? ""}
                onChange={(e) =>
                  set({ identity: { ...brand.identity, primaryColor: e.target.value } })
                }
                placeholder="#E8650A"
              />
            </div>
            <p className="hint">Görsel prompt bu rengi kullanır.</p>
          </div>
          <div>
            <label className="label">Görsel stil</label>
            <input
              className="input"
              value={brand.identity.visualStyle ?? ""}
              onChange={(e) =>
                set({ identity: { ...brand.identity, visualStyle: e.target.value } })
              }
              placeholder="or. minimal, sıcak, teknik, saha-gerçekçi"
            />
          </div>
        </div>
        <div>
          <label className="label">
            Dönüşüm hedefi (CTA){" "}
            <span className="font-normal text-neutral-400">(istenen aksiyon)</span>
          </label>
          <input
            className="input"
            value={brand.identity.ctaGoal ?? ""}
            onChange={(e) => set({ identity: { ...brand.identity, ctaGoal: e.target.value } })}
            placeholder="or. Teklif al / WhatsApp'tan sor / siteyi ziyaret et"
          />
          <p className="hint">Tüm CTA'lar bu aksiyona yönlendirilir.</p>
        </div>
      </section>

      {/* İçerik sütunları */}
      <section className="card space-y-3">
        <h2 className="font-semibold">
          İçerik Sütunları{" "}
          <span className="text-sm font-normal text-neutral-500">
            (markanın sahip olduğu 3-5 tema)
          </span>
        </h2>
        <StringList
          values={brand.pillars ?? [""]}
          onChange={(pillars) => set({ pillars })}
          placeholder="or. Tedarik güvenliği"
        />
        <p className="hint">Her içerik bir sütuna hizmet eder; marka temalarını sahiplenir.</p>
      </section>

      {/* Katman 2: Ses */}
      <section className="card space-y-4">
        <h2 className="font-semibold">2. Ses</h2>
        <div>
          <label className="label">
            Ton: {brand.voice.tone}/10 (0 resmi — 10 samimi)
          </label>
          <input
            type="range"
            min={0}
            max={10}
            value={brand.voice.tone}
            onChange={(e) =>
              set({ voice: { ...brand.voice, tone: Number(e.target.value) } })
            }
            className="w-full accent-brand"
          />
        </div>
        <div>
          <label className="label">Cumle yapisi tercihi</label>
          <input
            className="input"
            value={brand.voice.sentenceStyle}
            onChange={(e) =>
              set({ voice: { ...brand.voice, sentenceStyle: e.target.value } })
            }
            placeholder='or. "kisa, fiil-oncelikli, nokta ile ayrik"'
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Yasak kelimeler</label>
            <StringList
              values={brand.voice.bannedWords}
              onChange={(bannedWords) => set({ voice: { ...brand.voice, bannedWords } })}
              placeholder='or. "ucuz"'
            />
          </div>
          <div>
            <label className="label">Imza ifadeler</label>
            <StringList
              values={brand.voice.signaturePhrases}
              onChange={(signaturePhrases) =>
                set({ voice: { ...brand.voice, signaturePhrases } })
              }
              placeholder='or. "Santiyeye deger katiyoruz"'
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">
              En iyi gönderiler{" "}
              <span className="font-normal text-neutral-400">(few-shot — sesi öğretir)</span>
            </label>
            <StringList
              values={brand.voice.goodExamples ?? [""]}
              onChange={(goodExamples) => set({ voice: { ...brand.voice, goodExamples } })}
              placeholder="gerçek bir iyi gönderini yapıştır"
            />
          </div>
          <div>
            <label className="label">
              Böyle yazma{" "}
              <span className="font-normal text-neutral-400">(negatif örnek)</span>
            </label>
            <StringList
              values={brand.voice.badExamples ?? [""]}
              onChange={(badExamples) => set({ voice: { ...brand.voice, badExamples } })}
              placeholder="kaçınılacak bir tarz örneği"
            />
          </div>
        </div>
      </section>

      {/* Katman 3: Kitle */}
      <section className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">3. Kitle (Personalar)</h2>
          <button
            type="button"
            className="btn-ghost"
            onClick={() =>
              set({
                audience: [...brand.audience, { name: "", pain: "", motivation: "" }],
              })
            }
          >
            + Persona
          </button>
        </div>
        {brand.audience.map((p, i) => (
          <div key={i} className="rounded-xl border border-neutral-200 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-500">
                Persona {i + 1}
              </span>
              {brand.audience.length > 1 && (
                <button
                  type="button"
                  className="text-sm text-neutral-400 hover:text-red-500"
                  onClick={() =>
                    set({ audience: brand.audience.filter((_, idx) => idx !== i) })
                  }
                >
                  Kaldir
                </button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  ["name", "Ad"],
                  ["pain", "Acı"],
                  ["motivation", "Motivasyon"],
                  ["objections", "İtirazlar"],
                  ["vocabulary", "Kullandığı kelimeler"],
                  ["triggers", "Tetikleyiciler"],
                ] as const
              ).map(([field, label]) => (
                <div key={field}>
                  <label className="label">{label}</label>
                  <input
                    className="input"
                    value={p[field] ?? ""}
                    onChange={(e) => {
                      const audience = [...brand.audience];
                      audience[i] = { ...audience[i], [field]: e.target.value };
                      set({ audience });
                    }}
                  />
                </div>
              ))}
            </div>
            <p className="hint mt-2">
              İtiraz/kelime/tetikleyici = persona derinliği (jobs-to-be-done). Beyin personanın
              diliyle yazar, itirazı önceden karşılar.
            </p>
          </div>
        ))}
      </section>

      {/* Katman 4: Sektor (otomatik, salt okunur onizleme) */}
      <section className="card space-y-3 bg-brand-tint/40">
        <h2 className="font-semibold">
          4. Sektor Zekasi <span className="text-sm font-normal text-neutral-500">(otomatik)</span>
        </h2>
        <p className="text-sm text-neutral-600">
          {sector.label} — bu katmani sen doldurmazsin; sistem sektore gore yukler.
        </p>
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <div className="font-medium">Terminoloji</div>
            <div className="text-neutral-600">{sector.terminology.slice(0, 6).join(", ")}…</div>
          </div>
          <div>
            <div className="font-medium">Icerik karisimi</div>
            <div className="text-neutral-600">
              {Object.entries(sector.contentMix)
                .filter(([, v]) => v > 0)
                .map(([k, v]) => `${k} %${v}`)
                .join(" · ")}
            </div>
          </div>
          <div>
            <div className="font-medium">Mevsimsellik</div>
            <div className="text-neutral-600">{sector.seasonality}</div>
          </div>
        </div>
      </section>

      {/* Katman 5: Kanit */}
      <section className="card space-y-4">
        <h2 className="font-semibold">5. Kanit</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Gercek rakamlar</label>
            <StringList
              values={brand.proof.numbers}
              onChange={(numbers) => set({ proof: { ...brand.proof, numbers } })}
              placeholder="or. 10.000+ ton teslimat"
            />
          </div>
          <div>
            <label className="label">Vaka ornekleri</label>
            <StringList
              values={brand.proof.cases}
              onChange={(cases) => set({ proof: { ...brand.proof, cases } })}
              placeholder="or. 2 gunde 400 ton beton"
            />
          </div>
          <div>
            <label className="label">Referanslar</label>
            <StringList
              values={brand.proof.references}
              onChange={(references) => set({ proof: { ...brand.proof, references } })}
              placeholder="or. 500+ muteahhit tercih etti"
            />
          </div>
        </div>
      </section>

      <div className="sticky bottom-0 flex items-center gap-3 border-t border-neutral-200 bg-neutral-50/90 py-4 backdrop-blur">
        <button type="button" className="btn-primary" onClick={saveAndGo} disabled={!brand.name}>
          Kaydet ve kampanyaya gec
        </button>
        <button type="button" className="btn-ghost" onClick={save} disabled={!brand.name}>
          Sadece kaydet
        </button>
        {saved && <span className="text-sm text-green-600">Kaydedildi ✓</span>}
        {!brand.name && (
          <span className="text-sm text-neutral-500">Once marka adi gir.</span>
        )}
        <span className="flex-1" />
        <button
          type="button"
          className="btn-ghost px-3 py-1 text-xs"
          onClick={() =>
            downloadText(`${slugify(brand.name || "marka")}-beyin.json`, serializeBrand(brand), "application/json")
          }
          disabled={!brand.name}
        >
          Beyni indir (JSON)
        </button>
        <label className="btn-ghost cursor-pointer px-3 py-1 text-xs">
          JSON yükle
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const parsed = parseBrand(await file.text());
              if (parsed) {
                setBrand(parsed);
                setSaved(false);
              } else {
                setImportError("Geçersiz marka JSON'u.");
              }
              e.target.value = "";
            }}
          />
        </label>
        {importError && <span className="text-xs text-red-600">{importError}</span>}
      </div>
    </div>
  );
}
