import { NextResponse } from "next/server";
import { getCampaign } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * Serves a campaign cover for Open Graph crawlers.
 * Supports external https URLs (redirect) and stored data:image/* URLs.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const campaign = await getCampaign(id);

  if (!campaign || campaign.status !== "approved" || !campaign.imageUrl) {
    return new NextResponse("Not found", { status: 404 });
  }

  const src = campaign.imageUrl.trim();

  // External image — redirect so Facebook/X fetch the original
  if (/^https?:\/\//i.test(src)) {
    return NextResponse.redirect(src, 302);
  }

  // data:image/png;base64,... or data:image/jpeg;base64,...
  const m = src.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!m) {
    return new NextResponse("Unsupported image", { status: 415 });
  }

  const contentType = m[1];
  const buf = Buffer.from(m[2], "base64");

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
