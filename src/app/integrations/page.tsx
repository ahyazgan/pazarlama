import Link from "next/link";
import { SettingsTabs } from "@/components/SettingsTabs";

// Dürüst entegrasyon iskeleti. Constitution §5: MVP'de manuel yayın yeterli.
// Otomatik yayın gerçek OAuth + platform API + prod yan etki ister (CLAUDE.md §4) —
// bu yüzden burada SAHTE bağlantı yoktur; yalnızca yol haritası + mevcut manuel akış.

const PLATFORMS = [
  { name: "Instagram", api: "Instagram Graph API", need: "Facebook App + OAuth + İşletme hesabı" },
  { name: "TikTok", api: "TikTok Content Posting API", need: "TikTok for Developers + OAuth onayı" },
  { name: "LinkedIn", api: "LinkedIn Marketing API", need: "LinkedIn App + OAuth + sayfa yetkisi" },
  { name: "X / Twitter", api: "X API v2", need: "X Developer + OAuth 2.0 + ücretli tier" },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <SettingsTabs />
      <div>
        <h1 className="text-2xl font-bold">Yayın Entegrasyonları</h1>
        <p className="text-sm text-neutral-600">
          Otomatik yayın Faz 2. Şu an yayın <strong>manuel</strong> — çıktıyı kopyala/indir,
          takvime planla, .ics ile hatırlatıcı koy.
        </p>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
        Otomatik yayın gerçek platform API'leri + OAuth + üretim yetkisi gerektirir. Sahte
        bağlantı sunmuyoruz; aşağıdaki adımlar kurulum içindir.
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {PLATFORMS.map((p) => (
          <div key={p.name} className="card space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{p.name}</h3>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                Faz 2
              </span>
            </div>
            <p className="text-sm text-neutral-600">{p.api}</p>
            <p className="text-xs text-neutral-400">Gerekenler: {p.need}</p>
            <button
              type="button"
              disabled
              className="btn-ghost mt-2 w-fit cursor-not-allowed opacity-50"
            >
              Bağlan (kurulum gerekli)
            </button>
          </div>
        ))}
      </div>

      <div className="card space-y-2">
        <h3 className="font-semibold">Şimdilik manuel akış</h3>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-neutral-700">
          <li>Çıktı ekranından platform metnini kopyala (varyantlardan birini seç).</li>
          <li>Görsel prompt'u kendi görsel aracında üret (marka rengi otomatik gelir).</li>
          <li>Takvime planla; durumunu “yayınlandı” yap ve gerçek metriği gir.</li>
          <li>
            <Link href="/calendar" className="text-brand-dark underline">
              Takvim
            </Link>{" "}
            sayfasından .ics indirip kendi takvimine hatırlatıcı koy.
          </li>
        </ol>
      </div>
    </div>
  );
}
