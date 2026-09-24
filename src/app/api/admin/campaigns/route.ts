import { NextRequest, NextResponse } from "next/server";
import {
  getCampaigns,
  getPendingCampaigns,
  updateCampaign,
  deleteCampaign,
} from "@/lib/store";
import { ADMIN_SECRET } from "@/lib/types";

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

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
