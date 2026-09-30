import Link from "next/link";
import { getApprovedCampaigns } from "@/lib/store";
import { getAddressReceivedSats } from "@/lib/bch";
import { LISTING_FEE_SATS } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatBch(sats: number, digits = 4): string {
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
    <div className="space-y-12">
      <section className="pt-4 sm:pt-8 pb-2">
        <p className="cr-meta text-[var(--orange)] mb-3">CashRaise · BCH</p>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] max-w-2xl">
          Ideas.
          <br />
          Funded
          <br />
          <span className="text-[var(--orange)]">peer-to-peer.</span>
        </h1>
        <p className="mt-5 text-[var(--muted)] max-w-xl text-base sm:text-lg leading-relaxed">
          A non-custodial Bitcoin Cash fundraising board. List an idea. Let
          people discover it. Support it directly with BCH — funds never touch
          this platform.
        </p>
        <div className="flex flex-wrap gap-3 mt-7">
          <Link href="/create" className="btn btn-primary">
            + List an idea
          </Link>
          <a href="#open-ideas" className="btn btn-secondary">
            Explore ideas
          </a>
        </div>
      </section>

      <section id="open-ideas">
        <div className="flex items-end justify-between gap-4 mb-5 border-b border-[var(--border)] pb-3">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
              Open ideas
            </h2>
            <p className="cr-meta mt-1">Funding board</p>
          </div>
          <span className="cr-meta text-right">
            Listing fee · {LISTING_FEE_SATS.toLocaleString()} sats
          </span>
        </div>

        {campaigns.length === 0 ? (
          <div className="border border-[var(--border)] bg-[var(--surface)] rounded-[var(--radius)] p-10 text-center space-y-3">
            <p className="text-[var(--muted)]">No approved campaigns yet.</p>
            <Link href="/create" className="btn btn-primary">
              + Be the first
            </Link>
          </div>
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
              const met = hasGoal && raised != null && raised >= goal!;

              return (
                <li key={c.id}>
                  <Link
                    href={`/campaign/${c.id}`}
                    className="cr-card block h-full overflow-hidden hover:no-underline group"
                  >
                    {c.imageUrl && (
                      <div className="aspect-[16/9] bg-[var(--bg-elevated)] overflow-hidden border-b border-[var(--border)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={c.imageUrl}
                          alt=""
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
                        />
                      </div>
                    )}
                    <div className="p-4 sm:p-5 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 cr-meta text-[var(--orange)]">
                          <span className="status-dot" aria-hidden />
                          Open
                        </span>
                        <span className="cr-meta">BCH · Funding</span>
                      </div>

                      <h3 className="font-display text-lg sm:text-xl font-semibold text-white leading-snug group-hover:text-[var(--orange)] transition-colors">
                        {c.title}
                      </h3>

                      {c.category && (
                        <span className="inline-block cr-meta border border-[var(--border)] px-2 py-0.5 rounded-[var(--radius)]">
                          {c.category}
                        </span>
                      )}

                      <p className="text-sm text-[var(--muted)] line-clamp-3 leading-relaxed">
                        {c.description.replace(/[#*_`\[\]]/g, "").slice(0, 180)}
                        {c.description.length > 180 ? "…" : ""}
                      </p>

                      <div className="pt-1 space-y-1.5">
                        <div className="flex justify-between font-mono text-xs">
                          <span className="text-[var(--orange)]">
                            {raised != null
                              ? `${formatBch(raised)} BCH`
                              : "— BCH"}{" "}
                            <span className="text-[var(--muted-dim)]">raised</span>
                          </span>
                          <span className="text-[var(--muted)]">
                            {hasGoal
                              ? `${formatBch(goal!)} BCH goal`
                              : "Open-ended"}
                          </span>
                        </div>
                        {hasGoal && (
                          <div
                            className={`cr-progress ${met ? "met" : ""}`}
                            role="progressbar"
                            aria-valuenow={pct ?? 0}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          >
                            <span style={{ width: `${pct ?? 0}%` }} />
                          </div>
                        )}
                        {hasGoal && pct != null && (
                          <p className="cr-meta">
                            {met ? "Goal reached" : `${pct}% funded`}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="cr-meta">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs font-semibold text-[var(--orange)] group-hover:underline">
                          View idea →
                        </span>
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
