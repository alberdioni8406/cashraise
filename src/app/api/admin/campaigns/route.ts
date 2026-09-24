import { NextRequest, NextResponse } from "next/server";
import {
  getCampaigns,
  getPendingCampaigns,
  updateCampaign,
  deleteCampaign,
} from "@/lib/store";
import { ADMIN_SECRET } from "@/lib/types";
import { isValidCashAddr } from "@/lib/bch";

function isAdmin(req: NextRequest): boolean {
  const secret =
    req.headers.get("x-admin-secret") ||
    req.nextUrl.searchParams.get("secret") ||
    "";
  return secret === ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const all = await getCampaigns();
  const pending = await getPendingCampaigns();
  return NextResponse.json({ campaigns: all, pending });
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { id, action } = body;
    if (!id || !action) {
      return NextResponse.json(
        { error: "id and action required" },
        { status: 400 }
      );
    }

    if (action === "delete") {
      const ok = await deleteCampaign(id);
      return NextResponse.json({ success: ok });
    }

    if (action === "approve") {
      const updated = await updateCampaign(id, {
        status: "approved",
        approvedAt: new Date().toISOString(),
      });
      if (!updated) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, campaign: updated });
    }

    if (action === "reject") {
      const updated = await updateCampaign(id, { status: "rejected" });
      if (!updated) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, campaign: updated });
    }

    if (action === "edit") {
      const patch: Record<string, unknown> = {};

      if (typeof body.title === "string" && body.title.trim().length >= 5) {
        patch.title = body.title.trim();
      }
      if (
        typeof body.description === "string" &&
        body.description.trim().length >= 20
      ) {
        patch.description = body.description.trim();
      }
      if (typeof body.creatorAddress === "string") {
        if (!isValidCashAddr(body.creatorAddress)) {
          return NextResponse.json(
            { error: "Invalid CashAddr" },
            { status: 400 }
          );
        }
        patch.creatorAddress = body.creatorAddress.trim();
      }
      if (body.category !== undefined) {
        patch.category =
          typeof body.category === "string" && body.category.trim()
            ? body.category.trim()
            : undefined;
      }
      if (body.imageUrl !== undefined) {
        patch.imageUrl =
          typeof body.imageUrl === "string" && body.imageUrl.trim()
            ? body.imageUrl.trim()
            : undefined;
      }
      if (body.goalBch !== undefined && body.goalBch !== null && body.goalBch !== "") {
        const n = Number(body.goalBch);
        if (Number.isNaN(n) || n < 0) {
          return NextResponse.json({ error: "Invalid goal" }, { status: 400 });
        }
        patch.goalSats = n === 0 ? undefined : Math.round(n * 1e8);
      }
      if (body.clearGoal === true) {
        patch.goalSats = undefined;
      }

      if (Object.keys(patch).length === 0) {
        return NextResponse.json(
          { error: "No valid fields to update" },
          { status: 400 }
        );
      }

      const updated = await updateCampaign(id, patch as any);
      if (!updated) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, campaign: updated });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
