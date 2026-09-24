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
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">
        ← All ideas
      </Link>

      {campaign.imageUrl && (
        <div className="rounded-xl overflow-hidden border border-zinc-800 aspect-video bg-zinc-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={campaign.imageUrl}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <header className="space-y-3">
        {campaign.category && (
          <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
            {campaign.category}
          </span>
        )}
        <h1 className="text-3xl sm:text-4xl font-bold">{campaign.title}</h1>
        <p className="text-zinc-500 text-sm">
          Listed {new Date(campaign.createdAt).toLocaleString()}
          {campaign.feeTxid && campaign.feeTxid !== "seed" && (
            <>
              {" · "}
              <a
                href={`https://bchexplorer.cash/tx/${campaign.feeTxid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                fee tx
              </a>
            </>
          )}
        </p>
      </header>

      <div className="border border-zinc-800 bg-zinc-900/60 rounded-xl p-5 space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wide">
              Raised on-chain
            </p>
            <p className="text-2xl font-bold text-emerald-400">
              {raisedSats != null ? `${formatBch(raised)} BCH` : "—"}
            </p>
          </div>
          <div className="text-right">
            {hasGoal ? (
              <>
                <p className="text-xs text-zinc-500 uppercase tracking-wide">
                  Goal
                </p>
                <p className="text-lg font-semibold text-zinc-200">
                  {formatBch(goal!)} BCH
                </p>
              </>
            ) : (
              <p className="text-sm text-zinc-500">Open-ended</p>
            )}
          </div>
        </div>

        {hasGoal && (
          <div className="space-y-1.5">
            <div className="h-2.5 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  met ? "bg-emerald-400" : "bg-emerald-500"
                }`}
                style={{ width: `${pct ?? 0}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-zinc-500">
              <span>{met ? "Goal reached" : `${pct}% of goal`}</span>
              {raisedSats != null && goal! > raised && (
                <span>{formatBch(goal! - raised)} BCH to go</span>
              )}
            </div>
          </div>
        )}

        <p className="text-xs text-zinc-500 leading-relaxed">
          Counts <strong className="text-zinc-400">all</strong> funds ever
          received on this address (explorer total). Creators should use a{" "}
          <strong className="text-zinc-300">dedicated campaign address</strong>{" "}
          and avoid sharing it for other payments while the campaign is live.
        </p>
      </div>

      <div
        className="text-zinc-300 max-w-none"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />

      <div className="border border-emerald-500/40 bg-emerald-950/10 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-semibold text-emerald-400">
          Donate directly
        </h2>
        <p className="text-sm text-zinc-400">
          Scan or copy. Funds go <strong>straight</strong> to the creator.
          This platform never touches the money.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrImageUrl(uri, 200)}
            alt="Donation QR"
            width={200}
            height={200}
            className="rounded-lg bg-white p-2 shrink-0"
          />
          <div className="space-y-3 text-sm break-all">
            <div>
              <span className="text-zinc-500 block mb-1">Address</span>
              <code className="text-emerald-300 text-xs sm:text-sm">
                {campaign.creatorAddress}
              </code>
            </div>
            <a
              href={uri}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-medium px-4 py-2 rounded-lg transition"
            >
              Open in wallet
            </a>
          </div>
        </div>

        <p className="text-xs text-zinc-600">
          Always verify the address. Self-custody means you are responsible for
          the transaction.
        </p>
      </div>
    </article>
  );
}
