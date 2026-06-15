"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import {
  ANGLE_LABELS,
  CONTENT_TYPE_LABELS,
  PLATFORM_LABELS,
  type ContentPackage,
  type PlatformId,
} from "@/lib/types";

const TABS: PlatformId[] = ["instagram", "tiktok", "linkedin", "x"];

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
  const [pkg, setPkg] = useState<ContentPackage | null>(null);
  const [tab, setTab] = useState<PlatformId>("instagram");

  useEffect(() => {
    const raw = sessionStorage.getItem("content-os.result");
    if (raw) setPkg(JSON.parse(raw) as ContentPackage);
  }, []);

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
          </p>
        </div>
        <Link href="/create" className="btn-ghost">
          Yeni kampanya
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`chip ${
              tab === t
                ? "border-brand bg-brand text-white"
                : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            {PLATFORM_LABELS[t]}
          </button>
        ))}
      </div>

      <section className="card space-y-3">
        {tab === "instagram" && (
          <>
            <Block title="Caption" body={o.instagram.caption} copy={o.instagram.caption} />
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
