import { notFound } from "next/navigation";
import { getCampaign } from "@/lib/store";
import { buildPaymentUri, qrImageUrl, getAddressReceivedSats } from "@/lib/bch";
import Link from "next/link";

export const dynamic = "force-dynamic";

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

      <div className="prose prose-invert max-w-none">
        <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
          {campaign.description}
        </p>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        {campaign.goalSats != null && (
          <p className="text-zinc-400">
            Goal:{" "}
            <span className="text-white font-medium">
              {(campaign.goalSats / 1e8).toFixed(4)} BCH
            </span>
          </p>
        )}
        {raisedSats != null && (
          <p className="text-zinc-400">
            Raised (on this address):{" "}
            <span className="text-emerald-400 font-medium">
              {(raisedSats / 1e8).toFixed(4)} BCH
            </span>
          </p>
        )}
      </div>

      <div className="border border-emerald-500/40 bg-emerald-950/10 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-semibold text-emerald-400">
          Donate directly
        </h2>
        <p className="text-sm text-zinc-400">
          Scan or copy. Funds go <strong>straight</strong> to the creator.
          This platform never touches the money. Use the address below so the
          raised total can be tracked on-chain.
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
      </div>

      <p className="text-xs text-zinc-600 text-center">
        Always verify the address matches what the creator published. Self-custody
        means you are responsible for the transaction.
      </p>
    </article>
  );
}
