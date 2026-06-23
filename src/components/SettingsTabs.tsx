"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Ayarlar tek yüzey: hesap, yayın entegrasyonları ve onay akışı.
const TABS: [string, string][] = [
  ["/login", "Hesap"],
  ["/integrations", "Entegrasyonlar"],
  ["/approvals", "Onaylar"],
];

export function SettingsTabs() {
  const pathname = usePathname();
  return (
    <div className="border-b border-neutral-200">
      <nav className="-mb-px flex gap-1 text-sm" aria-label="Ayarlar">
        {TABS.map(([href, label]) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`border-b-2 px-3 py-2 ${
                active
                  ? "border-brand font-semibold text-brand"
                  : "border-transparent text-neutral-500 hover:text-neutral-800"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
