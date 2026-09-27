import Link from "next/link";
import { getNewsNotes } from "@/lib/news-store";
import { TIPS_ADDRESS } from "@/lib/types";
import { buildPaymentUri, qrImageUrl } from "@/lib/bch";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "BCH Desk — CashRaise",
  description:
    "Curated Bitcoin Cash notes by CashRaise. Tip the desk for site ops — campaign donations stay separate.",
};

const TIP_PRESETS_SATS = [10_000, 50_000, 100_000, 500_000];

export default async function NewsPage() {
  const notes = await getNewsNotes();

  return (
    <div className="space-y-10 max-w-2xl mx-auto">
      <div>
        <p className="text-xs uppercase tracking-wide text-emerald-500/80 mb-2">
          BCH desk
        </p>
        <h1 className="text-3xl font-bold">News &amp; notes</h1>
        <p className="text-zinc-400 mt-2 leading-relaxed">
          Hand-picked notes on Bitcoin Cash — published by the curator. Each
          piece is a short summary with a link to the original source. Tips
          support <strong className="text-zinc-300">site operations</strong>{" "}
          only. Campaign donations never pass through here.
        </p>
      </div>

      <section className="border border-emerald-500/30 bg-emerald-950/15 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-emerald-400">Tip the desk</h2>
        <p className="text-sm text-zinc-400">
          Optional. Hosting, curation time, keeping the board open. Non-custodial
          — straight to the tips address.
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
              {TIP_PRESETS_SATS.map((sats) => (
                <a
                  key={sats}
                  href={buildPaymentUri(
                    TIPS_ADDRESS,
                    sats,
                    "CashRaise desk tip"
                  )}
                  className="text-xs px-3 py-1.5 rounded-lg border border-zinc-600 text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-400"
                >
                  {(sats / 1e8).toFixed(4)} BCH
                </a>
              ))}
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

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide">
          Latest notes
        </h2>
        {notes.length === 0 ? (
          <div className="border border-zinc-800 rounded-xl p-8 text-center space-y-2">
            <p className="text-zinc-400">No notes published yet.</p>
            <p className="text-sm text-zinc-600">
              The curator publishes from Admin → News desk.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {notes.map((n) => (
              <li
                key={n.id}
                className="border border-zinc-800 bg-zinc-900/40 rounded-xl p-5 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold text-white leading-snug">
                    {n.title}
                  </h3>
                  <time className="text-xs text-zinc-600 shrink-0">
                    {n.publishedAt}
                  </time>
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
                  <div className="flex flex-wrap gap-1.5 items-center">
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
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
                  >
                    Read original →
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
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
