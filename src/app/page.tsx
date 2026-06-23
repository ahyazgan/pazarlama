import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <span className="inline-block rounded-full bg-brand-tint px-3 py-1 text-xs font-semibold text-brand-dark">
          MVP
        </span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Markani tanit, sektorune ozel{" "}
          <span className="text-brand">yayina hazir icerik paketi</span> al.
        </h1>
        <p className="max-w-2xl text-neutral-600">
          Marka beynini bir kez doldur. Sistem her uretimde marka kisiligini, sesini,
          personalarini ve sektor zekasini (terminoloji, hook formulleri, icerik karisimi)
          prompt'a enjekte eder. Cikti: Instagram, TikTok, LinkedIn ve X icin tam paket —
          metin + video script + gorsel prompt.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/onboarding" className="btn-primary">
            Hizli kurulum (5 adim)
          </Link>
          <Link href="/brand" className="btn-ghost">
            Marka Profili
          </Link>
          <Link href="/create" className="btn-ghost">
            Kampanya olustur
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            t: "Marka Beyni",
            d: "Kimlik + Ses + Kitle + Kanit. Generic'ligi kiran katman.",
          },
          {
            t: "Sektor Zekasi",
            d: "Sektore gore terminoloji, hook ve icerik karisimi otomatik gelir.",
          },
          {
            t: "Platform DNA",
            d: "Ayni mesaj IG / TikTok / LinkedIn / X dilinde uretilir.",
          },
        ].map((c) => (
          <div key={c.t} className="card">
            <h3 className="font-semibold">{c.t}</h3>
            <p className="mt-1 text-sm text-neutral-600">{c.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
