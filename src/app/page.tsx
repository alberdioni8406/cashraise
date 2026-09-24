import Link from "next/link";
import { getApprovedCampaigns } from "@/lib/store";
import { getAddressReceivedSats } from "@/lib/bch";
import { LISTING_FEE_SATS } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatBch(sats: number, digits = 2): string {
  return (sats / 1e8).toFixed(digits);
}

export default async function Home() {
  const campaigns = await getApprovedCampaigns();

  const raisedMap: Record<string, number | null> = {};
  await Promise.all(
    campaigns.map(async (c) => {
      raisedMap[c.id] = await getAddressReceivedSats(c.creatorAddress);
    })
  );

  return (
    <div className="space-y-10">
      <section className="text-center space-y-4 py-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Ideas. Funded peer-to-peer.
        </h1>
        <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
          A non-custodial BCH fundraising board. Pay an on-chain fee to list.
          Donations go <strong className="text-emerald-400">straight</strong> to
          the creator&apos;s address. No accounts. No custody. You only sponsor
          what you see fit.
        </p>
        <div className="flex justify-center gap-4 pt-4 flex-wrap">
          <Link
            href="/create"
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-6 py-3 rounded-lg transition"
          >
            List an idea
          </Link>
          <Link
            href="/about"
            className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 px-6 py-3 rounded-lg transition"
          >
            Why this exists
          </Link>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Open ideas</h2>
          <span className="text-xs text-zinc-500">
            Listing fee: {LISTING_FEE_SATS.toLocaleString()} sats
          </span>
        </div>

        {campaigns.length === 0 ? (
          <p className="text-zinc-500 text-center py-16">
            No approved campaigns yet. Be the first to list an idea.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {campaigns.map((c) => {
              const raised = raisedMap[c.id];
              const goal = c.goalSats;
              const hasGoal = goal != null && goal > 0;
              const pct =
                hasGoal && raised != null
                  ? Math.min(100, Math.round((raised / goal!) * 1000) / 10)
                  : null;

              return (
                <li key={c.id}>
                  <Link
                    href={`/campaign/${c.id}`}
                    className="block h-full border border-zinc-800 bg-zinc-900/50 hover:border-emerald-500/40 hover:bg-zinc-900 rounded-xl overflow-hidden transition group"
                  >
                    {c.imageUrl && (
                      <div className="aspect-video bg-zinc-800 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={c.imageUrl}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-lg group-hover:text-emerald-400 transition">
                          {c.title}
                        </h3>
                        {c.category && (
                          <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded shrink-0">
                            {c.category}
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-400 text-sm mt-2 line-clamp-3">
                        {c.description}
                      </p>

                      <div className="mt-4 space-y-1.5">
                        <div className="flex justify-between text-xs text-zinc-500">
                          <span>
                            {raised != null
                              ? `${formatBch(raised)} BCH raised`
                              : "Raised —"}
                          </span>
                          <span>
                            {hasGoal
                              ? `Goal ${formatBch(goal!)} BCH`
                              : "Open-ended"}
                          </span>
                        </div>
                        {hasGoal && (
                          <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{ width: `${pct ?? 0}%` }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="mt-3 text-xs text-zinc-600">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
