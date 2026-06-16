"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS: [string, string][] = [
  ["/brand", "Marka Profili"],
  ["/create", "Kampanya"],
  ["/ads", "Reklam"],
  ["/seo", "SEO"],
  ["/email", "E-posta"],
  ["/community", "Topluluk"],
  ["/plan", "Plan"],
  ["/library", "Kütüphane"],
  ["/calendar", "Takvim"],
  ["/insights", "Performans"],
  ["/approvals", "Onaylar"],
  ["/integrations", "Entegrasyonlar"],
  ["/login", "Hesap"],
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Masaüstü */}
      <nav className="hidden items-center gap-1 text-sm md:flex">
        {LINKS.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(href) ? "page" : undefined}
            className={`rounded-md px-3 py-1.5 hover:bg-neutral-100 ${
              isActive(href) ? "bg-brand-tint font-semibold text-brand-dark" : ""
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Mobil hamburger */}
      <button
        type="button"
        className="rounded-md border border-neutral-300 p-2 md:hidden"
        aria-label="Menü"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <div className="space-y-1">
          <span className="block h-0.5 w-5 bg-neutral-700" />
          <span className="block h-0.5 w-5 bg-neutral-700" />
          <span className="block h-0.5 w-5 bg-neutral-700" />
        </div>
      </button>

      {/* Mobil açılır panel + dışına tıklayınca kapanan arka plan */}
      {open && (
        <>
          <button
            type="button"
            aria-label="Menüyü kapat"
            className="fixed inset-0 z-10 cursor-default bg-black/20 md:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full z-20 border-b border-neutral-200 bg-white shadow-sm md:hidden">
            <nav className="mx-auto flex max-w-5xl flex-col px-4 py-2 text-sm">
              {LINKS.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive(href) ? "page" : undefined}
                  className={`rounded-md px-3 py-2 hover:bg-neutral-100 ${
                    isActive(href) ? "bg-brand-tint font-semibold text-brand-dark" : ""
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
