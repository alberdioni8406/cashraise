import Link from "next/link";
import { NEWS, X_SEARCHES } from "@/lib/content";
import { TIPS_ADDRESS } from "@/lib/types";
import { buildPaymentUri, qrImageUrl } from "@/lib/bch";

export const metadata = {
  title: "BCH Desk — CashRaise",
  description:
    "Curated Bitcoin Cash notes for builders and funders. Tip the desk to support site ops — campaign donations stay separate.",
};

const TIP_PRESETS_SATS = [10_000, 50_000, 100_000, 500_000]; // 0.0001 → 0.005 BCH

export default function NewsPage() {
  return (
    <div className="space-y-10 max-w-2xl mx-auto">
      <div>
        <p className="text-xs uppercase tracking-wide text-emerald-500/80 mb-2">
          BCH desk
        </p>
        <h1 className="text-3xl font-bold">News &amp; signal</h1>
        <p className="text-zinc-400 mt-2 leading-relaxed">
          Hand-picked notes on Bitcoin Cash — wallets, merchants, CashTokens,
          meetups, tools. Summaries are ours; full stories live at the source.
          Tips on this page support <strong className="text-zinc-300">CashRaise
          operations</strong> only. Campaign funds never pass through here.
        </p>
      </div>

      {/* Tip the desk */}
      <section className="border border-emerald-500/30 bg-emerald-950/15 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-emerald-400">Tip the desk</h2>
        <p className="text-sm text-zinc-400">
          Optional. Helps cover hosting, curation time, and keeping the board
          open. Non-custodial — straight to the platform address.
        </p>
        <div className="flex flex-col sm:flex-row gap-5 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrImageUrl(
              buildPaymentUri(TIPS_ADDRESS, undefined, "CashRaise desk tip"),
              140
            )}
            alt="Tip QR"
            width={140}
            height={140}
            className="rounded-lg bg-white p-2 shrink-0"
          />
          <div className="space-y-3 text-sm w-full min-w-0">
            <code className="block text-xs text-emerald-300 break-all">
              {TIPS_ADDRESS}
            </code>
            <div className="flex flex-wrap gap-2">
              {TIP_PRESETS_SATS.map((sats) => {
                const uri = buildPaymentUri(
                  TIPS_ADDRESS,
                  sats,
                  "CashRaise desk tip"
                );
                return (
                  <a
                    key={sats}
                    href={uri}
                    className="text-xs px-3 py-1.5 rounded-lg border border-zinc-600 text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-400"
                  >
                    {(sats / 1e8).toFixed(4)} BCH
                  </a>
                );
              })}
              <a
                href={buildPaymentUri(
                  TIPS_ADDRESS,
                  undefined,
                  "CashRaise desk tip"
                )}
                className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-medium"
              >
                Open wallet
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Curated articles */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide">
          Latest notes
        </h2>
        {NEWS.length === 0 ? (
          <p className="text-zinc-500 text-sm">No notes yet — check back soon.</p>
        ) : (
          <ul className="space-y-4">
            {NEWS.map((n) => (
              <li
                key={n.id}
                className="border border-zinc-800 bg-zinc-900/40 rounded-xl p-5 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold text-white leading-snug">
                    {n.title}
                  </h3>
                  {n.publishedAt && (
                    <time className="text-xs text-zinc-600 shrink-0">
                      {n.publishedAt}
                    </time>
                  )}
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {n.summary}
                </p>
                {n.excerpt && (
                  <blockquote className="text-sm text-zinc-500 border-l-2 border-zinc-700 pl-3 italic">
                    {n.excerpt}
                  </blockquote>
                )}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-xs text-zinc-500">{n.sourceName}</span>
                    {n.tags?.map((t) => (
                      <span
                        key={t}
                        className="text-xs bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <a
                    href={n.sourceUrl}
                    target={n.sourceUrl.startsWith("http") ? "_blank" : undefined}
                    rel={
                      n.sourceUrl.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
                  >
                    Read source →
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Secondary live chips */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide">
          Live on X
        </h2>
        <div className="flex flex-wrap gap-2">
          {X_SEARCHES.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-3 py-1.5 rounded-full border border-zinc-700 text-zinc-400 hover:border-emerald-500/40 hover:text-emerald-400 transition"
            >
              {s.label} ↗
            </a>
          ))}
        </div>
      </section>

      <p className="text-sm text-zinc-500 text-center pb-4">
        Ready to build?{" "}
        <Link href="/ideas" className="text-emerald-400 hover:underline">
          Idea sparks
        </Link>
        {" · "}
        <Link href="/create" className="text-emerald-400 hover:underline">
          List a campaign
        </Link>
      </p>
    </div>
  );
}
