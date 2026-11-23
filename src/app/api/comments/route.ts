import { NextResponse } from "next/server";
import { getCampaign } from "@/lib/store";
import { verifyDonationToAddress } from "@/lib/bch";
import {
  addComment,
  findCommentByTxid,
  getCommentsForCampaign,
} from "@/lib/comment-store";

export const dynamic = "force-dynamic";

const MAX_TEXT = 500;
const MAX_NAME = 40;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const campaignId = (searchParams.get("campaignId") || "").trim();
  if (!campaignId) {
    return NextResponse.json({ error: "campaignId required" }, { status: 400 });
  }
  const comments = await getCommentsForCampaign(campaignId);
  return NextResponse.json({ comments });
}

export async function POST(req: Request) {
  let body: {
    campaignId?: string;
    txid?: string;
    text?: string;
    displayName?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const campaignId = (body.campaignId || "").trim();
  const txid = (body.txid || "").trim().toLowerCase();
  const text = (body.text || "").trim();
  const displayName = (body.displayName || "").trim().slice(0, MAX_NAME);

  if (!campaignId) {
    return NextResponse.json({ error: "campaignId required" }, { status: 400 });
  }
  if (!txid || !/^[a-f0-9]{64}$/.test(txid)) {
    return NextResponse.json(
      { error: "Valid donation txid required (64 hex characters)" },
      { status: 400 }
    );
  }
  if (!text || text.length < 2) {
    return NextResponse.json(
      { error: "Write a short comment (at least 2 characters)" },
      { status: 400 }
    );
  }
  if (text.length > MAX_TEXT) {
    return NextResponse.json(
      { error: `Comment max ${MAX_TEXT} characters` },
      { status: 400 }
    );
  }

  const campaign = await getCampaign(campaignId);
  if (!campaign || campaign.status !== "approved") {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  const existing = await findCommentByTxid(txid);
  if (existing) {
    return NextResponse.json(
      {
        error:
          existing.campaignId === campaignId
            ? "This transaction already has a comment on this campaign."
            : "This transaction was already used for a comment.",
      },
      { status: 409 }
    );
  }

  const proof = await verifyDonationToAddress(txid, campaign.creatorAddress);
  if (!proof.valid) {
    return NextResponse.json(
      {
        error:
          proof.error ||
          "Could not verify a donation to this campaign address from that txid.",
      },
      { status: 400 }
    );
  }

  const comment = await addComment({
    campaignId,
    text,
    displayName: displayName || "Anonymous supporter",
    txid,
    amountSats: proof.amountSats || 0,
  });

  return NextResponse.json({ ok: true, comment });
}
