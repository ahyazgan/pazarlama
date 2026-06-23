"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Planlama tek yüzey: önce plan üret (/plan), sonra takvimde yönet (/calendar).
const TABS: [string, string][] = [
  ["/plan", "Plan öner"],
  ["/calendar", "Takvim"],
];

export function PlanningTabs() {
  const pathname = usePathname();
  return (
    <div className="border-b border-neutral-200">
      <nav className="-mb-px flex gap-1 text-sm" aria-label="Planlama">
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
