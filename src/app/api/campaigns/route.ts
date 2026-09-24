import { NextRequest, NextResponse } from "next/server";
import { getCampaigns, addCampaign } from "@/lib/store";
import { verifyListingFee, isValidCashAddr } from "@/lib/bch";
import { Campaign, LISTING_FEE_SATS } from "@/lib/types";

export async function GET() {
  const campaigns = getCampaigns();
  return NextResponse.json({ campaigns });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, creatorAddress, goalSats, category, feeTxid } =
      body;

    if (!title || typeof title !== "string" || title.trim().length < 5) {
      return NextResponse.json(
        { error: "Title required (min 5 chars)" },
        { status: 400 }
      );
    }
    if (!description || description.trim().length < 20) {
      return NextResponse.json(
        { error: "Description required (min 20 chars)" },
        { status: 400 }
      );
    }
    if (!isValidCashAddr(creatorAddress)) {
      return NextResponse.json(
        { error: "Invalid BCH CashAddr for donations" },
        { status: 400 }
      );
    }
    if (!feeTxid || !/^[a-fA-F0-9]{64}$/.test(feeTxid)) {
      return NextResponse.json(
        { error: "Valid listing fee txid required" },
        { status: 400 }
      );
    }

    // The core: non-custodial fee verification on-chain
    const check = await verifyListingFee(feeTxid);
    if (!check.valid) {
      return NextResponse.json(
        {
          error: check.error || "Listing fee not verified on-chain",
          paid: check.amountSats,
          required: LISTING_FEE_SATS,
        },
        { status: 402 }
      );
    }

    const id =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 48) +
      "-" +
      feeTxid.slice(0, 8);

    const campaign: Campaign = {
      id,
      title: title.trim(),
      description: description.trim(),
      creatorAddress: creatorAddress.trim(),
      goalSats: goalSats ? Number(goalSats) : undefined,
      category: category?.trim() || undefined,
      createdAt: new Date().toISOString(),
      feeTxid,
    };

    const ok = addCampaign(campaign);
    if (!ok) {
      return NextResponse.json(
        { error: "Campaign already listed (same id or fee tx)" },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, campaign }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
