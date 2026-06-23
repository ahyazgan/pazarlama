import Link from "next/link";

const STEPS = [
  {
    n: "1",
    t: "Markanı tanıt",
    d: "Kimlik, ses, kitle ve sektörü bir kez doldur. Tüm üretimin temeli bu.",
    href: "/onboarding",
    cta: "Kuruluma başla",
  },
  {
    n: "2",
    t: "Kampanya üret",
    d: "Konuyu seç (veya hazır şablondan başla) — 4 platform için tam paket çıkar.",
    href: "/create",
    cta: "Kampanya oluştur",
  },
  {
    n: "3",
    t: "Planla & yayınla",
    d: "Paketleri kütüphanede sakla, takvime diz, kopyala-yapıştır yayınla.",
    href: "/calendar",
    cta: "Takvimi aç",
  },
];

const TOOLS: { t: string; d: string; href: string }[] = [
  { t: "Panel", d: "Tek bakışta hazırlık ve sıradaki aksiyon", href: "/dashboard" },
  { t: "Reklam · SEO · E-posta", d: "Kanala özel içerik üreteçleri", href: "/ads" },
  { t: "Topluluk", d: "Etkileşim ve topluluk içerikleri", href: "/community" },
  { t: "Onaylar", d: "Yayın öncesi onay akışı", href: "/approvals" },
];

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <span className="inline-block rounded-full bg-brand-tint px-3 py-1 text-xs font-semibold text-brand-dark">
          Yayına hazır içerik üreteci
        </span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Markanı tanıt,{" "}
          <span className="text-brand">sektörüne özel içerik paketi</span> al.
        </h1>
        <p className="max-w-2xl text-neutral-600">
          Marka beynini bir kez doldur; sistem her üretimde markanın sesini, personalarını ve
          sektör zekânı Instagram, TikTok, LinkedIn ve X için hazır pakete dönüştürür.
        </p>
        <div className="pt-1">
          <Link href="/onboarding" className="btn-primary">
            Hızlı kuruluma başla →
          </Link>
        </div>
      </section>

      {/* Net 3 adım */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">3 adımda nasıl çalışır</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="card flex flex-col">
              <div className="mb-2 grid h-8 w-8 place-items-center rounded-full bg-brand text-sm font-bold text-white">
                {s.n}
              </div>
              <h3 className="font-semibold">{s.t}</h3>
              <p className="mt-1 flex-1 text-sm text-neutral-600">{s.d}</p>
              <Link
                href={s.href}
                className="mt-3 text-sm font-medium text-brand hover:underline"
              >
                {s.cta} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* İkincil araçlar */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Diğer araçlar</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TOOLS.map((c) => (
            <Link
              key={c.t}
              href={c.href}
              className="card transition hover:border-brand hover:shadow-sm"
            >
              <h3 className="text-sm font-semibold">{c.t}</h3>
              <p className="mt-1 text-xs text-neutral-600">{c.d}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
