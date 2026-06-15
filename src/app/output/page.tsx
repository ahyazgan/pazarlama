"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { captionLengthHint, downloadText, packageToMarkdown, slugify } from "@/lib/export";
import { lintPackage, lintWithBrand } from "@/lib/quality";
import { recordFeedback } from "@/lib/feedback";
import { addToPlan, todayISO } from "@/lib/calendar";
import { publishChecklist } from "@/lib/publish";
import { brainScore } from "@/lib/brain-score";
import { readiness } from "@/lib/readiness";
import {
  accessibilityForPackage,
  brandSafety,
  complianceForPackage,
  governanceGrade,
  readabilityForPackage,
  voiceFit,
} from "@/lib/governance";
import { recordApproval } from "@/lib/approvals";
import { loadBrand } from "@/lib/brand-store";
import {
  ANGLE_LABELS,
  CONTENT_TYPE_LABELS,
  PLATFORM_LABELS,
  type ContentPackage,
  type CritiqueResult,
  type PersonaPackage,
  type PlatformId,
} from "@/lib/types";

const DEFAULT_TABS: PlatformId[] = ["instagram", "tiktok", "linkedin", "x"];

const ISSUE_LABELS: Record<string, string> = {
  yasak: "yasak kelime",
  klise: "AI-klişe",
  kanit_yok: "kanıt rakamı yok",
  imza_yok: "imza ifade yok",
  hashtag: "hashtag sayısı",
  thread: "thread uzunluğu",
  emoji: "emoji fazla",
  zayif_hook: "zayıf hook",
  supheli_sayi: "şüpheli sayı (kaynaksız)",
};

// Sektor onceligine gore sirala; eksik kalani varsayilan sirayla tamamla.
function orderTabs(emphasis?: PlatformId[]): PlatformId[] {
  if (!emphasis?.length) return DEFAULT_TABS;
  const seen = new Set(emphasis);
  return [...emphasis, ...DEFAULT_TABS.filter((t) => !seen.has(t))];
}

function Variants({ title, items }: { title: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="rounded-xl border border-dashed border-brand/40 bg-brand-tint/30 p-4">
      <div className="mb-2 text-sm font-semibold text-brand-dark">{title} (A/B varyant)</div>
      <div className="space-y-2">
        {items.map((v, i) => (
          <div key={i} className="flex items-start justify-between gap-2 text-sm">
            <span className="text-neutral-800">
              <span className="mr-1 text-xs font-semibold text-neutral-400">
                {String.fromCharCode(65 + i)}
              </span>
              {v}
            </span>
            <CopyButton text={v} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Block({
  title,
  body,
  copy,
}: {
  title: string;
  body: React.ReactNode;
  copy?: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-neutral-700">{title}</span>
        {copy !== undefined && <CopyButton text={copy} />}
      </div>
      <div className="whitespace-pre-wrap text-sm text-neutral-800">{body}</div>
    </div>
  );
}

export default function OutputPage() {
  const [single, setSingle] = useState<ContentPackage | null>(null);
  const [personas, setPersonas] = useState<PersonaPackage[] | null>(null);
  const [personaIdx, setPersonaIdx] = useState(0);
  const [tab, setTab] = useState<PlatformId>("instagram");
  const [voted, setVoted] = useState<null | 1 | -1>(null);

  useEffect(() => {
    const multi = sessionStorage.getItem("content-os.results");
    if (multi) {
      setPersonas(JSON.parse(multi) as PersonaPackage[]);
      return;
    }
    const one = sessionStorage.getItem("content-os.result");
    if (one) setSingle(JSON.parse(one) as ContentPackage);
  }, []);

  const pkg: ContentPackage | null = personas
    ? (personas[personaIdx]?.pkg ?? null)
    : single;

  const tabs = orderTabs(pkg?.platformEmphasis);
  const brand = loadBrand();
  const issues = pkg
    ? brand
      ? lintWithBrand(pkg, brand)
      : lintPackage(pkg)
    : [];
  const brain = brand ? brainScore(brand).score : 0;
  const compliance = pkg && brand ? complianceForPackage(pkg, brand.sector) : [];
  const readability = pkg ? readabilityForPackage(pkg) : [];
  const safety = pkg ? brandSafety(pkg) : [];
  const access = pkg ? accessibilityForPackage(pkg) : [];
  const voice = pkg && brand ? voiceFit(pkg, brand) : null;
  const grade = governanceGrade({
    issues: issues.length,
    compliance: compliance.length,
    safety: safety.length,
    readability: readability.length,
    access: access.length,
    voiceScore: voice?.score ?? 0,
    brain,
  });
  const ready = readiness(
    brain,
    issues.length + compliance.length + readability.length + safety.length + access.length,
  );
  const [approved, setApproved] = useState(false);
  const approve = () => {
    if (pkg && brand) {
      recordApproval({ topic: pkg.topic, brand: brand.name, grade: grade.grade, score: grade.score });
      setApproved(true);
    }
  };

  // Onerilen (ilk) platformu varsayilan aktif sekme yap.
  useEffect(() => {
    if (pkg) setTab(orderTabs(pkg.platformEmphasis)[0]);
    setVoted(null);
    // pkg degisince (persona gecisi dahil) onerilen platforma don
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pkg?.platformEmphasis?.join(","), personaIdx]);

  const vote = (v: 1 | -1) => {
    if (pkg && brand) recordFeedback(brand.sector, pkg.angle, v);
    setVoted(v);
  };

  const [crit, setCrit] = useState<CritiqueResult | null>(null);
  const [critLoading, setCritLoading] = useState(false);
  const [critError, setCritError] = useState<string | null>(null);
  const runCritique = async () => {
    if (!pkg || !brand) return;
    setCritLoading(true);
    setCritError(null);
    setCrit(null);
    try {
      const res = await fetch("/api/critique", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, pkg }),
      });
      const data = await res.json();
      if (!res.ok) setCritError(data.error || "Denetim başarısız.");
      else setCrit(data as CritiqueResult);
    } catch {
      setCritError("Ağa bağlanılamadı.");
    } finally {
      setCritLoading(false);
    }
  };

  const [planDate, setPlanDate] = useState(todayISO);
  const [planned, setPlanned] = useState(false);
  const addPlan = () => {
    if (!pkg || !brand) return;
    addToPlan({
      topic: pkg.topic,
      contentType: pkg.contentType,
      angle: pkg.angle,
      sector: brand.sector,
      date: planDate,
    });
    setPlanned(true);
  };

  if (!pkg) {
    return (
      <div className="card space-y-3 text-center">
        <h1 className="text-xl font-bold">Goruntulenecek cikti yok</h1>
        <p className="text-sm text-neutral-600">Once bir kampanya uret.</p>
        <Link href="/create" className="btn-primary mx-auto w-fit">
          Kampanya Olustur'a git
        </Link>
      </div>
    );
  }

  const o = pkg.outputs;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{pkg.topic}</h1>
          <p className="text-sm text-neutral-600">
            {CONTENT_TYPE_LABELS[pkg.contentType]} · {ANGLE_LABELS[pkg.angle]} acisi
            {pkg.demo && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                DEMO — API anahtarı olmadan şablon çıktı
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-ghost"
            onClick={() =>
              downloadText(
                `${slugify(pkg.topic)}.md`,
                packageToMarkdown(pkg),
                "text/markdown",
              )
            }
          >
            Markdown indir
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() =>
              downloadText(
                `${slugify(pkg.topic)}.json`,
                JSON.stringify(pkg, null, 2),
                "application/json",
              )
            }
          >
            JSON indir
          </button>
          <Link href="/create" className="btn-ghost">
            Yeni kampanya
          </Link>
        </div>
      </div>

      {personas && personas.length > 1 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-3">
          <p className="hint mb-2">Persona (her biri için ayrı açı):</p>
          <div className="flex flex-wrap gap-2">
            {personas.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPersonaIdx(i)}
                className={`chip ${
                  personaIdx === i
                    ? "border-brand bg-brand-tint text-brand-dark"
                    : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {p.personaName}
              </button>
            ))}
          </div>
        </div>
      )}

      {pkg.sources && pkg.sources.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm">
          <p className="font-medium text-blue-800">
            Araştırma kaynakları ({pkg.sources.length}) — içerik bu bulgulara dayandırıldı
          </p>
          <ul className="mt-1 list-disc pl-5 text-xs">
            {pkg.sources.map((s, i) => (
              <li key={i}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline"
                >
                  {s.title || s.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Birleşik Kalite Raporu */}
      <div
        className={`rounded-lg border px-3 py-2 text-sm ${
          ready.level === "hazir"
            ? "border-green-200 bg-green-50"
            : ready.level === "neredeyse"
              ? "border-amber-200 bg-amber-50"
              : "border-red-200 bg-red-50"
        }`}
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-medium">
          <span
            className={
              ready.level === "hazir"
                ? "text-green-700"
                : ready.level === "neredeyse"
                  ? "text-amber-800"
                  : "text-red-700"
            }
          >
            {ready.ready ? "✓" : "•"} Kalite Raporu: {ready.label}
          </span>
          <span className="text-neutral-500">Beyin %{brain}</span>
          <span className="text-neutral-500">
            {issues.length === 0 ? "Lint temiz" : `${issues.length} lint uyarısı`}
          </span>
          {readability.length > 0 && (
            <span className="text-neutral-500">{readability.length} okunabilirlik</span>
          )}
          {voice && (
            <span
              className={voice.score >= 80 ? "text-neutral-500" : "text-amber-700"}
              title={voice.notes.join(" · ")}
            >
              Ses uyumu %{voice.score}
            </span>
          )}
          {brain < 60 && (
            <Link href="/brand" className="text-xs text-brand-dark underline">
              Beyni güçlendir
            </Link>
          )}
          <span className="ml-auto flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                grade.grade === "A"
                  ? "bg-green-600 text-white"
                  : grade.grade === "B"
                    ? "bg-lime-500 text-white"
                    : grade.grade === "C"
                      ? "bg-amber-500 text-white"
                      : "bg-red-600 text-white"
              }`}
              title={grade.label}
            >
              Governance: {grade.grade} ({grade.score})
            </span>
            <button
              type="button"
              className="chip border-neutral-300 text-xs"
              onClick={approve}
              disabled={approved || grade.blocking}
              title={grade.blocking ? "Bloklayıcı uyarı var — önce düzelt" : grade.label}
            >
              {approved ? "Onaylandı ✓" : "Onayla (sign-off)"}
            </button>
          </span>
        </div>
        {issues.length > 0 && (
          <ul className="mt-1 list-disc pl-5 text-xs text-neutral-700">
            {issues.slice(0, 10).map((it, i) => (
              <li key={i}>
                {it.where}: {ISSUE_LABELS[it.type] ?? it.type} — {it.term}
              </li>
            ))}
          </ul>
        )}
        {compliance.length > 0 && (
          <div className="mt-2 border-t border-neutral-200 pt-2">
            <p className="text-xs font-semibold text-red-700">
              ⚖ Uyumluluk uyarıları ({compliance.length}) — insan/hukuk onayı önerilir:
            </p>
            <ul className="mt-1 list-disc pl-5 text-xs text-red-700">
              {compliance.map((c, i) => (
                <li key={i}>
                  &quot;{c.term}&quot; — {c.reason}
                </li>
              ))}
            </ul>
          </div>
        )}
        {safety.length > 0 && (
          <div className="mt-2 border-t border-neutral-200 pt-2">
            <p className="text-xs font-semibold text-red-700">
              🛡 Marka güvenliği ({safety.length}):
            </p>
            <ul className="mt-1 list-disc pl-5 text-xs text-red-700">
              {safety.map((s, i) => (
                <li key={i}>
                  &quot;{s.term}&quot; — {s.reason}
                </li>
              ))}
            </ul>
          </div>
        )}
        {access.length > 0 && (
          <div className="mt-2 border-t border-neutral-200 pt-2">
            <p className="text-xs font-semibold text-amber-800">
              ♿ Erişilebilirlik ({access.length}):
            </p>
            <ul className="mt-1 list-disc pl-5 text-xs text-amber-800">
              {access.map((a, i) => (
                <li key={i}>
                  {a.where}: {a.detail}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-neutral-700">AI öz-eleştiri turu:</span>
          <button
            type="button"
            className="chip border-neutral-300"
            onClick={runCritique}
            disabled={critLoading}
          >
            {critLoading ? "Denetleniyor…" : "AI ile denetle"}
          </button>
          {crit && (
            <span
              className={`font-semibold ${
                crit.score >= 80 ? "text-green-600" : crit.score >= 60 ? "text-amber-600" : "text-red-600"
              }`}
            >
              Marka uyum skoru: {crit.score}/100
            </span>
          )}
          {critError && <span className="text-xs text-amber-700">{critError}</span>}
        </div>
        {crit && (
          <div className="mt-2">
            <p className="text-xs italic text-neutral-600">{crit.verdict}</p>
            {crit.issues.length > 0 && (
              <ul className="mt-1 space-y-1 text-xs text-neutral-700">
                {crit.issues.map((it, i) => (
                  <li key={i}>
                    <span className="font-medium">[{it.severity}] {it.where}:</span> {it.problem}{" "}
                    → <span className="text-brand-dark">{it.fix}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm">
        <span className="text-neutral-600">
          Bu paket ({ANGLE_LABELS[pkg.angle]} açısı) işe yaradı mı?
        </span>
        <button
          type="button"
          onClick={() => vote(1)}
          disabled={voted !== null}
          className={`chip ${voted === 1 ? "border-green-500 bg-green-50 text-green-700" : "border-neutral-300"}`}
        >
          👍 Evet
        </button>
        <button
          type="button"
          onClick={() => vote(-1)}
          disabled={voted !== null}
          className={`chip ${voted === -1 ? "border-red-400 bg-red-50 text-red-600" : "border-neutral-300"}`}
        >
          👎 Hayır
        </button>
        {voted !== null && (
          <span className="text-xs text-neutral-500">
            Teşekkürler — strateji önerisi bunu öğrenecek.
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm">
        <span className="text-neutral-600">Takvime planla:</span>
        <input
          type="date"
          className="input w-auto py-1"
          value={planDate}
          onChange={(e) => {
            setPlanDate(e.target.value);
            setPlanned(false);
          }}
        />
        <button type="button" className="chip border-neutral-300" onClick={addPlan} disabled={planned}>
          {planned ? "Eklendi ✓" : "Takvime ekle"}
        </button>
        {planned && (
          <Link href="/calendar" className="text-xs text-brand-dark underline">
            Takvimi gör
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t, i) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`chip ${
              tab === t
                ? "border-brand bg-brand text-white"
                : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
            }`}
            title={i === 0 ? "Bu sektörde en öncelikli platform" : undefined}
          >
            {PLATFORM_LABELS[t]}
            {i === 0 && pkg.platformEmphasis ? " ★" : ""}
          </button>
        ))}
      </div>

      <section className="card space-y-3">
        {tab === "instagram" && (
          <>
            <Block
              title="Caption"
              body={
                <>
                  {o.instagram.caption}
                  {(() => {
                    const h = captionLengthHint(o.instagram.caption);
                    const cls =
                      h.status === "iyi"
                        ? "text-green-600"
                        : h.status === "uzun"
                          ? "text-amber-600"
                          : "text-neutral-500";
                    return (
                      <div className={`mt-2 text-xs font-medium ${cls}`}>{h.label}</div>
                    );
                  })()}
                </>
              }
              copy={o.instagram.caption}
            />
            <Block
              title="Ilk yorum (hashtag)"
              body={o.instagram.firstComment}
              copy={o.instagram.firstComment}
            />
            <Block
              title="Gorsel prompt"
              body={o.instagram.imagePrompt}
              copy={o.instagram.imagePrompt}
            />
            <Block title="Alt-text" body={o.instagram.altText} copy={o.instagram.altText} />
            <Variants title="Caption" items={o.variants?.captions} />
          </>
        )}

        {tab === "tiktok" && (
          <>
            <Block title="Hook (0-3sn)" body={o.tiktok.hook} copy={o.tiktok.hook} />
            <Block
              title="Sahne dokumu"
              copy={o.tiktok.scenes
                .map((s) => `[${s.timecode}] ${s.shot}\n${s.voiceover}`)
                .join("\n\n")}
              body={
                <div className="space-y-3">
                  {o.tiktok.scenes.map((s, i) => (
                    <div key={i} className="border-l-2 border-brand pl-3">
                      <div className="text-xs font-semibold text-brand-dark">
                        {s.timecode}
                      </div>
                      <div className="font-medium">{s.shot}</div>
                      <div className="text-neutral-700">{s.voiceover}</div>
                    </div>
                  ))}
                </div>
              }
            />
            <Block
              title="Trend ses onerisi"
              body={o.tiktok.soundSuggestion}
              copy={o.tiktok.soundSuggestion}
            />
            <Block title="CTA" body={o.tiktok.cta} copy={o.tiktok.cta} />
            <Variants title="Hook" items={o.variants?.tiktokHooks} />
          </>
        )}

        {tab === "linkedin" && (
          <>
            <Block title="Hook satiri" body={o.linkedin.hookLine} copy={o.linkedin.hookLine} />
            <Block title="Govde" body={o.linkedin.body} copy={o.linkedin.body} />
            <Block title="Sektor insight'i" body={o.linkedin.insight} copy={o.linkedin.insight} />
            <Block
              title="Tartisma sorusu"
              body={o.linkedin.discussionQuestion}
              copy={o.linkedin.discussionQuestion}
            />
            <Block
              title="Tamamini kopyala"
              body={<span className="text-neutral-400">Hook + govde + soru</span>}
              copy={`${o.linkedin.hookLine}\n\n${o.linkedin.body}\n\n${o.linkedin.insight}\n\n${o.linkedin.discussionQuestion}`}
            />
          </>
        )}

        {tab === "x" && (
          <>
            <Block
              title="Thread"
              copy={o.x.thread.map((t, i) => `${i + 1}/ ${t}`).join("\n\n")}
              body={
                <div className="space-y-3">
                  {o.x.thread.map((t, i) => (
                    <div key={i} className="rounded-lg bg-neutral-50 p-3">
                      <span className="mr-2 text-xs font-semibold text-neutral-400">
                        {i + 1}/{o.x.thread.length}
                      </span>
                      {t}
                    </div>
                  ))}
                </div>
              }
            />
            <Variants title="Açılış tweet" items={o.variants?.xOpeners} />
          </>
        )}
      </section>

      <details className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <summary className="cursor-pointer text-sm font-medium text-neutral-700">
          Yayın hazırlığı — {PLATFORM_LABELS[tab]} manuel adımlar
        </summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-neutral-600">
          {publishChecklist(tab).map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}
