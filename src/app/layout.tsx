import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "RacingControl",
  description: "Race operations control center built with Next.js 14",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className="bg-[#040507] text-slate-100">
      <body className="min-h-screen antialiased">
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-white/5 bg-black/40">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/" className="text-lg font-semibold text-white">
                RacingControl
              </Link>
              <nav className="flex items-center gap-6 text-sm font-medium text-slate-300">
                <Link className="transition hover:text-white" href="/">
                  Overview
                </Link>
                <Link className="transition hover:text-white" href="/races">
                  Races
                </Link>
              </nav>
            </div>
          </header>
          <main className="flex-1 bg-gradient-to-b from-[#05070c] via-[#060811] to-[#030406]">
            {children}
          </main>
          <footer className="border-t border-white/5 bg-black/30">
            <div className="mx-auto max-w-6xl px-6 py-4 text-sm text-slate-500">
              &copy; {new Date().getFullYear()} RacingControl. Built with Next.js, Tailwind CSS, and Supabase.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
