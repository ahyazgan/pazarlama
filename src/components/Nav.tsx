"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Link2 = [string, string];

// Çekirdek yolculuk — her zaman görünür (Marka → Kampanya → İçerik).
const PRIMARY: Link2[] = [
  ["/dashboard", "Panel"],
  ["/brand", "Marka"],
  ["/create", "Kampanya"],
  ["/library", "Kütüphane"],
  ["/calendar", "Takvim"],
];

// İkincil araçlar — "Daha fazla" altında gruplu (kalabalık etmesin).
const MORE: { title: string; links: Link2[] }[] = [
  {
    title: "Kanal içerikleri",
    links: [["/ads", "Reklam · SEO · E-posta · Topluluk"]],
  },
  {
    title: "İş akışı",
    links: [
      ["/plan", "Plan"],
      ["/approvals", "Onaylar"],
    ],
  },
  {
    title: "Sistem",
    links: [
      ["/onboarding", "Kurulum"],
      ["/integrations", "Entegrasyonlar"],
      ["/login", "Hesap"],
    ],
  },
];

// "Kanal içerikleri" tek link ama dört rotayı kapsar (sekme şeridiyle gezilir).
const CHANNEL_PATHS = ["/ads", "/seo", "/email", "/community"];
const MORE_PATHS = [...MORE.flatMap((g) => g.links.map(([href]) => href)), ...CHANNEL_PATHS];

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const pathname = usePathname();
  const moreRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => {
    // /ads linki dört kanal rotasının hepsinde aktif say.
    if (href === "/ads") return CHANNEL_PATHS.some((p) => pathname.startsWith(p));
    return pathname === href || (href !== "/" && pathname.startsWith(href));
  };
  const moreActive = MORE_PATHS.some(isActive);

  // Dışarı tıklayınca "Daha fazla" menüsünü kapat.
  useEffect(() => {
    if (!moreOpen) return;
    const onClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [moreOpen]);

  const linkClass = (active: boolean) =>
    `rounded-md px-2.5 py-1.5 hover:bg-neutral-100 ${active ? "font-semibold text-brand" : ""}`;

  return (
    <>
      {/* Masaüstü: çekirdek linkler + Daha fazla menüsü */}
      <nav className="hidden items-center gap-0.5 text-sm md:flex">
        {PRIMARY.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(href) ? "page" : undefined}
            className={linkClass(isActive(href))}
          >
            {label}
          </Link>
        ))}

        <div className="relative" ref={moreRef}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((o) => !o)}
            className={linkClass(moreActive)}
          >
            Daha fazla ▾
          </button>
          {moreOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-30 mt-1 w-56 rounded-lg border border-neutral-200 bg-white p-2 shadow-lg"
            >
              {MORE.map((group) => (
                <div key={group.title} className="py-1">
                  <div className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    {group.title}
                  </div>
                  {group.links.map(([href, label]) => (
                    <Link
                      key={href}
                      href={href}
                      role="menuitem"
                      aria-current={isActive(href) ? "page" : undefined}
                      onClick={() => setMoreOpen(false)}
                      className={`block rounded-md px-2 py-1.5 hover:bg-neutral-100 ${
                        isActive(href) ? "font-semibold text-brand" : ""
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Hamburger (md altı) */}
      <button
        type="button"
        className="rounded-md border border-neutral-300 p-2 md:hidden"
        aria-label="Menü"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((o) => !o)}
      >
        <div className="space-y-1">
          <span className="block h-0.5 w-5 bg-neutral-700" />
          <span className="block h-0.5 w-5 bg-neutral-700" />
          <span className="block h-0.5 w-5 bg-neutral-700" />
        </div>
      </button>

      {/* Mobil açılır panel — gruplu */}
      {mobileOpen && (
        <div className="absolute left-0 right-0 top-full z-20 border-b border-neutral-200 bg-white shadow-sm md:hidden">
          <nav className="mx-auto flex max-w-5xl flex-col px-4 py-2 text-sm">
            {PRIMARY.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={`rounded-md px-3 py-2 hover:bg-neutral-100 ${
                  isActive(href) ? "font-semibold text-brand" : ""
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
            {MORE.map((group) => (
              <div key={group.title} className="mt-1 border-t border-neutral-100 pt-1">
                <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  {group.title}
                </div>
                {group.links.map(([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    aria-current={isActive(href) ? "page" : undefined}
                    className={`rounded-md px-3 py-2 hover:bg-neutral-100 ${
                      isActive(href) ? "font-semibold text-brand" : ""
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
