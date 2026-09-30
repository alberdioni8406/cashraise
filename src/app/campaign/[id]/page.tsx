import { notFound } from "next/navigation";
import { getCampaign } from "@/lib/store";
import { buildPaymentUri, qrImageUrl, getAddressReceivedSats } from "@/lib/bch";
import { renderMarkdown } from "@/lib/markdown";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatBch(sats: number): string {
  return (sats / 1e8).toFixed(4);
}

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = await getCampaign(id);
  if (!campaign || campaign.status !== "approved") notFound();

  const uri = buildPaymentUri(
    campaign.creatorAddress,
    undefined,
    `Support: ${campaign.title}`
  );

  const raisedSats = await getAddressReceivedSats(campaign.creatorAddress);
  const bodyHtml = renderMarkdown(campaign.description);

  const goal = campaign.goalSats;
  const raised = raisedSats ?? 0;
  const hasGoal = goal != null && goal > 0;
  const pct = hasGoal
    ? Math.min(100, Math.round((raised / goal!) * 1000) / 10)
    : null;
  const met = hasGoal && raised >= goal!;

  return (
    <article className="max-w-2xl mx-auto space-y-8">
      <Link
        href="/#open-ideas"
        className="cr-meta text-[var(--muted)] hover:text-white hover:no-underline inline-flex items-center gap-1"
      >
        ← Back to ideas
      </Link>

      {campaign.imageUrl && (
        <div className="rounded-[var(--radius)] overflow-hidden border border-[var(--border)] aspect-video bg-[var(--surface)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={campaign.imageUrl}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 cr-meta text-[var(--orange)]">
            <span className="status-dot" aria-hidden />
            Open
          </span>
          <span className="cr-meta">BCH fundraising</span>
          {campaign.category && (
            <span className="cr-meta border border-[var(--border)] px-2 py-0.5 rounded-[var(--radius)]">
              {campaign.category}
            </span>
          )}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
          {campaign.title}
        </h1>
        <p className="cr-meta">
          Listed {new Date(campaign.createdAt).toLocaleString()}
          {campaign.feeTxid && campaign.feeTxid !== "seed" && (
            <>
              {" · "}
              <a
                href={`https://bchexplorer.cash/tx/${campaign.feeTxid}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                fee tx
              </a>
            </>
          )}
        </p>
      </header>

      <div className="border border-[var(--border)] bg-[var(--surface)] rounded-[var(--radius)] p-5 sm:p-6 space-y-4">
        <p className="cr-meta text-[var(--orange)]">On-chain raised</p>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-display text-3xl sm:text-4xl font-bold text-[var(--orange)] tracking-tight">
              {raisedSats != null ? formatBch(raised) : "—"}{" "}
              <span className="text-lg text-[var(--muted)]">BCH</span>
            </p>
            <p className="cr-meta mt-1">Raised on campaign address</p>
          </div>
          <div className="text-right">
            {hasGoal ? (
              <>
                <p className="font-mono text-lg text-white">
                  {formatBch(goal!)} BCH
                </p>
                <p className="cr-meta">Target</p>
              </>
            ) : (
              <p className="cr-meta">Open-ended</p>
            )}
          </div>
        </div>

        {hasGoal && (
          <div className="space-y-1.5">
            <div
              className={`cr-progress ${met ? "met" : ""}`}
              role="progressbar"
              aria-valuenow={pct ?? 0}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span style={{ width: `${pct ?? 0}%` }} />
            </div>
            <div className="flex justify-between cr-meta">
              <span>{met ? "Goal reached" : `${pct}% funded`}</span>
              {raisedSats != null && goal! > raised && (
                <span>{formatBch(goal! - raised)} BCH to go</span>
              )}
            </div>
          </div>
        )}

        <p className="text-xs text-[var(--muted-dim)] leading-relaxed">
          Counts all funds received on this address. Creators should use a{" "}
          <strong className="text-[var(--muted)]">dedicated campaign address</strong>.
        </p>
      </div>

      <div
        className="cr-prose max-w-none"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />

      <div className="border border-[var(--orange)]/40 bg-[var(--orange-glow)] rounded-[var(--radius)] p-5 sm:p-6 space-y-5">
        <div>
          <h2 className="font-display text-xl font-bold text-[var(--orange)]">
            Support with BCH
          </h2>
          <p className="text-sm text-[var(--muted)] mt-1">
            Scan or copy. Funds go <strong className="text-white">straight</strong>{" "}
            to the creator. CashRaise never touches the money.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrImageUrl(uri, 200)}
            alt="Donation QR"
            width={200}
            height={200}
            className="rounded-[var(--radius)] bg-white p-2 shrink-0"
          />
          <div className="space-y-3 text-sm w-full min-w-0">
            <div>
              <span className="cr-meta block mb-1">Creator address</span>
              <code className="font-mono text-xs sm:text-sm text-[var(--orange)] break-all">
                {campaign.creatorAddress}
              </code>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href={uri} className="btn btn-primary">
                Support with BCH
              </a>
              <a
                href={`https://bchexplorer.cash/address/${encodeURIComponent(campaign.creatorAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
              >
                View on explorer
              </a>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-[var(--muted-dim)]">
          Always verify the address. Self-custody means you are responsible for
          the transaction.
        </p>
      </div>
    </article>
  );
}
