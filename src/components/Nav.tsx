"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS: [string, string][] = [
  ["/onboarding", "Kurulum"],
  ["/dashboard", "Panel"],
  ["/brand", "Marka Profili"],
  ["/create", "Kampanya"],
  ["/ads", "Reklam"],
  ["/seo", "SEO"],
  ["/email", "E-posta"],
  ["/community", "Topluluk"],
  ["/plan", "Plan"],
  ["/library", "Kütüphane"],
  ["/calendar", "Takvim"],
  ["/approvals", "Onaylar"],
  ["/integrations", "Entegrasyonlar"],
  ["/login", "Hesap"],
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <>
      {/* Masaüstü (14 link sığsın diye lg eşiği) */}
      <nav className="hidden items-center gap-0.5 text-sm lg:flex">
        {LINKS.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(href) ? "page" : undefined}
            className={`rounded-md px-2.5 py-1.5 hover:bg-neutral-100 ${
              isActive(href) ? "font-semibold text-brand" : ""
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Hamburger (lg altı) */}
      <button
        type="button"
        className="rounded-md border border-neutral-300 p-2 lg:hidden"
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

      {/* Mobil açılır panel */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-20 border-b border-neutral-200 bg-white shadow-sm lg:hidden">
          <nav className="mx-auto flex max-w-5xl flex-col px-4 py-2 text-sm">
            {LINKS.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={`rounded-md px-3 py-2 hover:bg-neutral-100 ${
                  isActive(href) ? "font-semibold text-brand" : ""
                }`}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
