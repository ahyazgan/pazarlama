"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { captionLengthHint, downloadText, packageToMarkdown, slugify } from "@/lib/export";
import { lintPackage } from "@/lib/quality";
import { loadBrand } from "@/lib/brand-store";
import {
  ANGLE_LABELS,
  CONTENT_TYPE_LABELS,
  PLATFORM_LABELS,
  type ContentPackage,
  type PersonaPackage,
  type PlatformId,
} from "@/lib/types";

const DEFAULT_TABS: PlatformId[] = ["instagram", "tiktok", "linkedin", "x"];

// Sektor onceligine gore sirala; eksik kalani varsayilan sirayla tamamla.
function orderTabs(emphasis?: PlatformId[]): PlatformId[] {
  if (!emphasis?.length) return DEFAULT_TABS;
  const seen = new Set(emphasis);
  return [...emphasis, ...DEFAULT_TABS.filter((t) => !seen.has(t))];
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
  const bannedWords = loadBrand()?.voice.bannedWords ?? [];
  const issues = pkg ? lintPackage(pkg, bannedWords) : [];

  // Onerilen (ilk) platformu varsayilan aktif sekme yap.
  useEffect(() => {
    if (pkg) setTab(orderTabs(pkg.platformEmphasis)[0]);
    // pkg degisince (persona gecisi dahil) onerilen platforma don
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pkg?.platformEmphasis?.join(","), personaIdx]);

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

      {issues.length === 0 ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          Kalite kontrolü temiz ✓ (yasak kelime / AI-klişe bulunamadı)
        </div>
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <p className="font-semibold">Kalite uyarıları ({issues.length}):</p>
          <ul className="mt-1 list-disc pl-5">
            {issues.slice(0, 8).map((it, i) => (
              <li key={i}>
                {it.where}: {it.type === "yasak" ? "yasak kelime" : "AI-klişe"} "{it.term}"
              </li>
            ))}
          </ul>
        </div>
      )}

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
        )}
      </section>
    </div>
  );
}
