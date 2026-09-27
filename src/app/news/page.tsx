import Link from "next/link";
import { NEWS, X_SEARCHES } from "@/lib/content";

export const metadata = {
  title: "BCH News — CashRaise",
  description: "Bitcoin Cash news and live trends from X, curated for builders and funders.",
};

export default function NewsPage() {
  return (
    <div className="space-y-10 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">BCH News</h1>
        <p className="text-zinc-400 mt-2">
          What&apos;s moving in Bitcoin Cash — live searches on X plus curated
          entry points. Read first, then fund or list an idea.
        </p>
      </div>

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
              className="text-sm px-3 py-1.5 rounded-full border border-zinc-700 text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-400 transition"
            >
              {s.label} ↗
            </a>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide">
          Spotlight
        </h2>
        <ul className="space-y-3">
          {NEWS.map((n) => (
            <li key={n.id}>
              <a
                href={n.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-zinc-800 bg-zinc-900/40 hover:border-emerald-500/30 rounded-xl p-5 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-white">{n.title}</h3>
                  <span className="text-xs text-zinc-500 shrink-0 uppercase">
                    {n.source}
                  </span>
                </div>
                <p className="text-sm text-zinc-400 mt-2">{n.summary}</p>
                {n.tags && n.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {n.tags.map((t) => (
                      <span
                        key={t}
                        className="text-xs bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-sm text-zinc-500 text-center">
        Inspired?{" "}
        <Link href="/ideas" className="text-emerald-400 hover:underline">
          Browse idea sparks
        </Link>{" "}
        or{" "}
        <Link href="/create" className="text-emerald-400 hover:underline">
          list a campaign
        </Link>
        .
      </p>
    </div>
  );
}
