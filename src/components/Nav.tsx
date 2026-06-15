"use client";

import { useState } from "react";
import Link from "next/link";

const LINKS: [string, string][] = [
  ["/brand", "Marka Profili"],
  ["/create", "Kampanya"],
  ["/ads", "Reklam"],
  ["/seo", "SEO"],
  ["/email", "E-posta"],
  ["/community", "Topluluk"],
  ["/plan", "Plan"],
  ["/calendar", "Takvim"],
  ["/integrations", "Entegrasyonlar"],
];

export function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Masaüstü */}
      <nav className="hidden items-center gap-1 text-sm md:flex">
        {LINKS.map(([href, label]) => (
          <Link key={href} href={href} className="rounded-md px-3 py-1.5 hover:bg-neutral-100">
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

      {/* Mobil açılır panel */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-20 border-b border-neutral-200 bg-white shadow-sm md:hidden">
          <nav className="mx-auto flex max-w-5xl flex-col px-4 py-2 text-sm">
            {LINKS.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="rounded-md px-3 py-2 hover:bg-neutral-100"
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
