import { NextRequest, NextResponse } from "next/server";
import { getApprovedCampaigns, addCampaign } from "@/lib/store";
import { verifyListingFee, isValidCashAddr } from "@/lib/bch";
import { Campaign, LISTING_FEE_SATS } from "@/lib/types";

export async function GET() {
  const campaigns = getApprovedCampaigns();
  return NextResponse.json({ campaigns });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      creatorAddress,
      goalSats,
      category,
      feeTxid,
      imageUrl,
      contactNote,
    } = body;

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
    if (imageUrl && typeof imageUrl === "string" && imageUrl.length > 500) {
      return NextResponse.json(
        { error: "Image URL too long" },
        { status: 400 }
      );
    }

    const check = await verifyListingFee(feeTxid);
    const feeVerified = check.valid;

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
      imageUrl: imageUrl?.trim() || undefined,
      createdAt: new Date().toISOString(),
      feeTxid,
      status: "pending",
      feeVerified,
      contactNote: contactNote?.trim() || undefined,
    };

    const ok = addCampaign(campaign);
    if (!ok) {
      return NextResponse.json(
        { error: "Campaign already submitted (same id or fee tx)" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        campaign,
        feeVerified,
        message: feeVerified
          ? "Fee verified on-chain. Campaign is pending admin approval."
          : `Fee not fully verified yet (${check.error || "unknown"}). Campaign is pending — contact admin with your txid for manual approval.`,
      },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
