import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { CONTACT } from "@/lib/types";

export const metadata: Metadata = {
  title: "CashRaise — Ideas. Funded peer-to-peer.",
  description:
    "Non-custodial Bitcoin Cash fundraising board. List an idea. Donations go straight to creators. No custody.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <header className="border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
            <Link
              href="/"
              className="font-display text-lg sm:text-xl font-bold tracking-tight text-white hover:no-underline shrink-0"
            >
              CASH<span className="text-[var(--orange)]">RAISE</span>
            </Link>
            <nav className="flex items-center gap-1 sm:gap-3 text-xs sm:text-sm">
              <Link href="/" className="hidden sm:inline text-[var(--muted)] hover:text-white px-2 py-1 hover:no-underline">
                Ideas
              </Link>
              <Link href="/news" className="hidden sm:inline text-[var(--muted)] hover:text-white px-2 py-1 hover:no-underline">
                News
              </Link>
              <Link href="/ideas" className="hidden md:inline text-[var(--muted)] hover:text-white px-2 py-1 hover:no-underline">
                Sparks
              </Link>
              <Link href="/about" className="hidden sm:inline text-[var(--muted)] hover:text-white px-2 py-1 hover:no-underline">
                Philosophy
              </Link>
              <Link href="/create" className="btn btn-primary text-xs sm:text-sm py-2 px-3 sm:px-4">
                + List an idea
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-10">
          {children}
        </main>

        <footer className="border-t border-[var(--border)] mt-auto">
          <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
            <div className="trust-grid">
              <div className="trust-block">
                <h3>Non-custodial</h3>
                <p>Donations never touch CashRaise.</p>
              </div>
              <div className="trust-block">
                <h3>Open source</h3>
                <p>Inspect the code. No black boxes.</p>
              </div>
              <div className="trust-block">
                <h3>BCH funded</h3>
                <p>Built around Bitcoin Cash.</p>
              </div>
              <div className="trust-block">
                <h3>Direct</h3>
                <p>Funds go to the creator&apos;s address.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-[var(--muted-dim)]">
              <p className="font-display font-semibold text-sm text-[var(--muted)]">
                CASH<span className="text-[var(--orange)]">RAISE</span>
              </p>
              <nav className="flex flex-wrap gap-x-4 gap-y-1">
                <Link href="/" className="hover:text-white hover:no-underline">Ideas</Link>
                <Link href="/create" className="hover:text-white hover:no-underline">List an idea</Link>
                <Link href="/about" className="hover:text-white hover:no-underline">Philosophy</Link>
                <Link href="/news" className="hover:text-white hover:no-underline">News</Link>
                <a
                  href="https://github.com/alberdioni8406/cashraise"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white hover:no-underline"
                >
                  GitHub
                </a>
              </nav>
            </div>

            <p className="text-center text-[11px] text-[var(--muted-dim)]">
              Contact:{" "}
              <a href={`https://x.com/${CONTACT.x}`} target="_blank" rel="noopener noreferrer">
                @{CONTACT.x}
              </a>
              {" · "}
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              {" · "}
              <a href={`https://t.me/${CONTACT.telegram}`} target="_blank" rel="noopener noreferrer">
                Telegram
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
