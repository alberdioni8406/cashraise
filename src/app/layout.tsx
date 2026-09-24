import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { CONTACT } from "@/lib/types";

export const metadata: Metadata = {
  title: "CashRaise — Non-custodial BCH Fundraising",
  description:
    "List ideas. Pay a fee on-chain. Donations go straight to creators. No custody. Pure Bitcoin Cash fundamentals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-white hover:no-underline"
            >
              Cash<span className="text-emerald-400">Raise</span>
            </Link>
            <nav className="flex gap-6 text-sm">
              <Link href="/" className="text-zinc-400 hover:text-white">
                Ideas
              </Link>
              <Link href="/create" className="text-zinc-400 hover:text-white">
                List an idea
              </Link>
              <Link href="/about" className="text-zinc-400 hover:text-white">
                Philosophy
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-500 space-y-2">
          <p>
            Non-custodial · Open source · Funded by BCH · Donations never touch
            this platform
          </p>
          <p>
            Contact:{" "}
            <a
              href={`https://x.com/${CONTACT.x}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-emerald-400"
            >
              @{CONTACT.x}
            </a>
            {" · "}
            <a
              href={`mailto:${CONTACT.email}`}
              className="text-zinc-400 hover:text-emerald-400"
            >
              {CONTACT.email}
            </a>
            {" · "}
            <a
              href={`https://t.me/${CONTACT.telegram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-emerald-400"
            >
              Telegram @{CONTACT.telegram}
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
