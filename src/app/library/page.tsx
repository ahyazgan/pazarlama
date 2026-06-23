"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadLibrary, removeFromLibrary, type LibraryItem } from "@/lib/library";
import { ANGLE_LABELS, CONTENT_TYPE_LABELS } from "@/lib/types";
import { downloadText, libraryToCsv } from "@/lib/export";

function fmt(at: number): string {
  try {
    return new Date(at).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return "";
  }
}

export default function LibraryPage() {
  const router = useRouter();
  const [items, setItems] = useState<LibraryItem[]>([]);

  useEffect(() => setItems(loadLibrary()), []);

  const open = (it: LibraryItem) => {
    sessionStorage.removeItem("content-os.results");
    sessionStorage.setItem("content-os.result", JSON.stringify(it.pkg));
    router.push("/output");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">İçerik Kütüphanesi</h1>
          <p className="text-sm text-neutral-600">
            Üretilen tüm paketler ({items.length}) — aç, kopyala, denetle.
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            className="btn-ghost"
            onClick={() =>
              downloadText("icerik-kutuphanesi.csv", libraryToCsv(items), "text/csv")
            }
          >
            CSV indir
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="card space-y-3 text-center">
          <p className="text-sm text-neutral-600">Henüz kayıtlı içerik yok.</p>
          <Link href="/create" className="btn-primary mx-auto w-fit">
            Kampanya Oluştur
          </Link>
        </div>
      ) : (
        <section className="card">
          <div className="space-y-2">
            {items.map((it) => (
              <div
                key={it.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-200 p-3"
              >
                <div>
                  <div className="font-medium">{it.topic}</div>
                  <div className="text-xs text-neutral-500">
                    {it.brandName} · {CONTENT_TYPE_LABELS[it.pkg.contentType]} ·{" "}
                    {ANGLE_LABELS[it.pkg.angle]} açısı · {fmt(it.at)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" className="chip border-neutral-300" onClick={() => open(it)}>
                    Aç
                  </button>
                  <button
                    type="button"
                    className="text-sm text-neutral-400 hover:text-red-500"
                    onClick={() => setItems(removeFromLibrary(it.id))}
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
