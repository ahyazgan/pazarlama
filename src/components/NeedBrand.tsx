"use client";

import Link from "next/link";
import { HAMMADDEM_SAMPLE, saveBrandLocal } from "@/lib/brand-store";
import type { Brand } from "@/lib/types";

// Marka yokken gösterilen ortak boş-durum. Çıkmaz sokak yerine anında değer:
// tek tıkla örnek markayı (Hammaddem) yükler, ya da kendi markana yönlendirir.
export function NeedBrand({
  message,
  onLoaded,
}: {
  message?: string;
  onLoaded?: (b: Brand) => void;
}) {
  const loadSample = () => {
    const b = saveBrandLocal({ ...HAMMADDEM_SAMPLE });
    if (onLoaded) onLoaded(b);
    else window.location.reload();
  };

  return (
    <div className="card space-y-3 text-center">
      <h1 className="text-xl font-bold">Önce bir marka beyni gerekli</h1>
      <p className="text-sm text-neutral-600">
        {message ?? "Bu sayfa marka beynini her üretimde prompt'a enjekte eder."}
      </p>
      <div className="flex flex-wrap justify-center gap-2 pt-1">
        <button type="button" className="btn-primary" onClick={loadSample}>
          Örnek markayı yükle (Hammaddem)
        </button>
        <Link href="/brand" className="btn-ghost">
          Kendi markanı oluştur
        </Link>
      </div>
    </div>
  );
}
