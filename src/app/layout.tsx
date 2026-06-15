import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Content OS",
  description:
    "Marka beyni + sektor zekasi ile yayina hazir sosyal medya icerik paketi ureten SaaS (MVP).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        <header className="relative border-b border-neutral-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-brand text-white">
                C
              </span>
              Content OS
            </Link>
            <Nav />
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 py-10 text-center text-xs text-neutral-400">
          Content OS — MVP. Generic'ligi kiran marka beyni + sektor zekasi.
        </footer>
      </body>
    </html>
  );
}
