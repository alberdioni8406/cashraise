import Link from "next/link";
import { getApprovedCampaigns } from "@/lib/store";
import { getAddressReceivedSats } from "@/lib/bch";
import { LISTING_FEE_SATS, type Campaign } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatBch(sats: number, digits = 4): string {
  return (sats / 1e8).toFixed(digits);
}

/** Relative time from a real ISO timestamp — no invented dates */
function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const sec = Math.floor((Date.now() - t) / 1000);
  if (sec < 0) return "just now";
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
  if (sec < 86400) {
    const h = Math.floor(sec / 3600);
    return h === 1 ? "1 hour ago" : `${h} hours ago`;
  }
  if (sec < 86400 * 2) return "yesterday";
  if (sec < 86400 * 14) return `${Math.floor(sec / 86400)} days ago`;
  return new Date(iso).toLocaleDateString();
}

type ActivityItem = {
  id: string;
  kind: "listed" | "raised" | "goal";
  title: string;
  campaignId: string;
  detail: string;
  at: string; // ISO for sort + relative
};

function buildActivity(
  campaigns: Campaign[],
  raisedMap: Record<string, number | null>
): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const c of campaigns) {
    const listedAt = c.approvedAt || c.createdAt;
    if (listedAt) {
      items.push({
        id: `listed-${c.id}`,
        kind: "listed",
        title: c.title,
        campaignId: c.id,
        detail: "Idea listed",
        at: listedAt,
      });
    }

    const raised = raisedMap[c.id];
    if (raised != null && raised > 0) {
      items.push({
        id: `raised-${c.id}`,
        kind: "raised",
        title: c.title,
        campaignId: c.id,
        detail: `${formatBch(raised)} BCH raised on campaign address`,
        // No per-donation timestamp available — use listing time only as anchor
        // Label is a live total, not a timed payment event
        at: listedAt,
      });
    }

    const goal = c.goalSats;
    if (goal != null && goal > 0 && raised != null && raised >= goal) {
      items.push({
        id: `goal-${c.id}`,
        kind: "goal",
        title: c.title,
        campaignId: c.id,
        detail: "Goal reached (on-chain total)",
        at: listedAt,
      });
    }
  }

  // Prefer newest listing time; de-dupe keeps goal/raised/listed as separate facts
  items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  return items.slice(0, 8);
}

export default async function Home() {
  const campaigns = await getApprovedCampaigns();

  const raisedMap: Record<string, number | null> = {};
  await Promise.all(
    campaigns.map(async (c) => {
      raisedMap[c.id] = await getAddressReceivedSats(c.creatorAddress);
    })
  );

  const activity = buildActivity(campaigns, raisedMap);
  const totalRaised = Object.values(raisedMap).reduce<number>(
    (sum, v) => sum + (v != null && v > 0 ? v : 0),
    0
  );

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="pt-4 sm:pt-8 pb-2">
        <p className="cr-meta text-[var(--accent)] mb-3">
          CashRaise · <span className="bch-mark">BCH</span>
        </p>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] max-w-2xl">
          Ideas.
          <br />
          Funded
          <br />
          <span className="text-[var(--accent)]">peer-to-peer.</span>
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

      {/* Recent activity — real campaign + on-chain totals only */}
      <section className="border border-[var(--border)] bg-[var(--surface)] rounded-[var(--radius)] p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
          <h2 className="cr-meta text-[var(--accent)]">Recent activity</h2>
          <p className="cr-meta">
            {campaigns.length} live idea{campaigns.length === 1 ? "" : "s"}
            {totalRaised > 0
              ? ` · ${formatBch(totalRaised)} BCH on-chain total`
              : ""}
          </p>
        </div>

        {activity.length === 0 ? (
          <p className="text-sm text-[var(--muted)] py-2">
            No recent activity yet. The first BCH-funded ideas are just getting
            started.
          </p>
        ) : (
          <ul className="space-y-0 divide-y divide-[var(--border)]">
            {activity.map((item) => (
              <li key={item.id} className="py-2.5 first:pt-0 last:pb-0">
                <Link
                  href={`/campaign/${item.campaignId}`}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 hover:no-underline group"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-white group-hover:text-[var(--accent)] transition-colors truncate">
                      <span className="text-[var(--accent)] font-mono text-xs mr-2">
                        {item.kind === "listed"
                          ? "LISTED"
                          : item.kind === "goal"
                            ? "GOAL"
                            : "RAISED"}
                      </span>
                      {item.title}
                    </p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      {item.detail}
                    </p>
                  </div>
                  <span className="cr-meta shrink-0">
                    {item.kind === "raised" ? (
                      "live total"
                    ) : item.at ? (
                      <time
                        dateTime={item.at}
                        title={new Date(item.at).toLocaleString()}
                      >
                        {relativeTime(item.at)}
                      </time>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="text-[11px] text-[var(--muted-dim)] mt-3 leading-relaxed">
          Raised totals are live on-chain sums for each campaign address — not
          individual donation events. CashRaise does not custody funds.
        </p>
      </section>

      {/* Open ideas */}
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
                        <span className="inline-flex items-center gap-1.5 cr-meta text-[var(--accent)]">
                          <span className="status-dot" aria-hidden />
                          Open
                        </span>
                        <span className="cr-meta">
                          <span className="bch-mark">BCH</span> · Funding
                        </span>
                      </div>

                      <h3 className="font-display text-lg sm:text-xl font-semibold text-white leading-snug group-hover:text-[var(--accent)] transition-colors">
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
                          <span className="text-[var(--accent)]">
                            {raised != null
                              ? `${formatBch(raised)} BCH`
                              : "— BCH"}{" "}
                            <span className="text-[var(--muted-dim)]">
                              raised
                            </span>
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
                        <span className="text-xs font-semibold text-[var(--accent)] group-hover:underline">
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
