import { CONTACT, LISTING_FEE_SATS } from "@/lib/types";
import Link from "next/link";

export const metadata = {
  title: "Philosophy — CashRaise",
  description: "Why CashRaise exists. Non-custodial, peer-to-peer BCH funding.",
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-12">
      <header className="space-y-4 pt-2">
        <p className="cr-meta text-[var(--accent)]">Manifesto</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
          Why CashRaise exists
        </h1>
        <p className="text-[var(--muted)] text-lg leading-relaxed">
          Traditional fundraising platforms take custody, charge high fees, and
          design themselves like banks. That is the opposite of what cash is
          for.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">
          Peer-to-peer by design
        </h2>
        <p className="text-[var(--muted)] leading-relaxed">
          Donations never enter a platform wallet. When an idea is worth
          sponsoring, you send BCH straight to the creator&apos;s address. The
          board only lists the idea after a small on-chain fee and admin
          approval. No KYC. No intermediate balances.
        </p>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          {
            t: "Non-custodial",
            d: "Funds never touch CashRaise. The network moves the value.",
          },
          {
            t: "On-chain fee",
            d: `${LISTING_FEE_SATS.toLocaleString()} sats to list — proof of seriousness, not a subscription.`,
          },
          {
            t: "You choose",
            d: "No algorithmic feed. No paid featured slots. Sponsor what you see fit.",
          },
          {
            t: "Bitcoin Cash",
            d: "Fast, low-fee electronic cash. Built for payments people can actually use.",
          },
          {
            t: "Open source",
            d: "Inspect the code. No black-box custody claims.",
          },
          {
            t: "No accounts",
            d: "List with a fee tx. Donate with a wallet. That is the whole model.",
          },
        ].map((p) => (
          <div
            key={p.t}
            className="border border-[var(--border)] bg-[var(--surface)] rounded-[var(--radius)] p-4"
          >
            <h3 className="cr-meta text-[var(--accent)] mb-2">{p.t}</h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed">{p.d}</p>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">
          Track raised on the campaign address
        </h2>
        <p className="text-[var(--muted)] leading-relaxed">
          Creators should publish a dedicated address for the campaign. The board
          reads total received from a public explorer so supporters see progress
          without the platform ever holding funds.
        </p>
      </section>

      <section className="border border-[var(--border)] rounded-[var(--radius)] p-5 space-y-3">
        <h2 className="cr-meta text-[var(--accent)]">Contact</h2>
        <p className="text-sm text-[var(--muted)]">
          Manual approval or questions after the listing fee:
        </p>
        <ul className="text-sm text-[var(--muted)] space-y-1 font-mono">
          <li>
            <a
              href={`https://x.com/${CONTACT.x}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              @{CONTACT.x}
            </a>
          </li>
          <li>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          </li>
          <li>
            <a
              href={`https://t.me/${CONTACT.telegram}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              t.me/{CONTACT.telegram}
            </a>
          </li>
        </ul>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/create" className="btn btn-primary">
          + List an idea
        </Link>
        <Link href="/" className="btn btn-secondary">
          Explore ideas
        </Link>
      </div>
    </div>
  );
}
