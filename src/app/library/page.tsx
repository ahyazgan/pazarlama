"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { filterLibrary, loadLibrary, removeFromLibrary, type LibraryItem } from "@/lib/library";
import { ANGLE_LABELS, CONTENT_TYPE_LABELS, type Angle, type SectorId } from "@/lib/types";
import { downloadText, libraryToCsv } from "@/lib/export";
import { getSector } from "@/lib/sectors";

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
  const [text, setText] = useState("");
  const [sector, setSector] = useState<SectorId | "all">("all");
  const [angle, setAngle] = useState<Angle | "all">("all");

  useEffect(() => setItems(loadLibrary()), []);

  const open = (it: LibraryItem) => {
    sessionStorage.removeItem("content-os.results");
    sessionStorage.setItem("content-os.result", JSON.stringify(it.pkg));
    router.push("/output");
  };

  const visible = filterLibrary(items, { text, sector, angle });
  // Kütüphanede mevcut sektörler (filtre seçenekleri için).
  const sectorsPresent = Array.from(new Set(items.map((i) => i.sector)));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">İçerik Kütüphanesi</h1>
          <p className="text-sm text-neutral-600">
            {visible.length === items.length
              ? `Üretilen tüm paketler (${items.length}) — aç, kopyala, denetle.`
              : `${visible.length} / ${items.length} paket gösteriliyor (filtreli).`}
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            className="btn-ghost"
            onClick={() =>
              downloadText("icerik-kutuphanesi.csv", libraryToCsv(visible), "text/csv")
            }
          >
            CSV indir{visible.length !== items.length ? " (filtreli)" : ""}
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
        <section className="card space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              className="input w-auto flex-1 min-w-[180px]"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Konu veya marka ara…"
            />
            <select
              className="input w-auto"
              value={sector}
              onChange={(e) => setSector(e.target.value as SectorId | "all")}
            >
              <option value="all">Tüm sektörler</option>
              {sectorsPresent.map((s) => (
                <option key={s} value={s}>
                  {getSector(s).label}
                </option>
              ))}
            </select>
            <select
              className="input w-auto"
              value={angle}
              onChange={(e) => setAngle(e.target.value as Angle | "all")}
            >
              <option value="all">Tüm açılar</option>
              {(Object.keys(ANGLE_LABELS) as Angle[]).map((a) => (
                <option key={a} value={a}>
                  {ANGLE_LABELS[a]}
                </option>
              ))}
            </select>
            {(text || sector !== "all" || angle !== "all") && (
              <button
                type="button"
                className="text-sm text-neutral-500 hover:text-neutral-800"
                onClick={() => {
                  setText("");
                  setSector("all");
                  setAngle("all");
                }}
              >
                Temizle
              </button>
            )}
          </div>

          {visible.length === 0 ? (
            <p className="py-6 text-center text-sm text-neutral-500">
              Filtreyle eşleşen içerik yok.
            </p>
          ) : (
            <div className="space-y-2">
              {visible.map((it) => (
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
          )}
        </section>
      )}
    </div>
  );
}
