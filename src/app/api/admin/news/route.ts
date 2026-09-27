import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SECRET } from "@/lib/types";
import {
  getNewsNotes,
  addNewsNote,
  updateNewsNote,
  deleteNewsNote,
  newsStorageReady,
} from "@/lib/news-store";

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
  const notes = await getNewsNotes();
  return NextResponse.json({
    notes,
    storageReady: newsStorageReady(),
  });
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const title = String(body.title || "").trim();
    const summary = String(body.summary || "").trim();
    const sourceName = String(body.sourceName || "").trim();
    const sourceUrl = String(body.sourceUrl || "").trim();
    if (title.length < 3 || summary.length < 10) {
      return NextResponse.json(
        { error: "Title and summary required" },
        { status: 400 }
      );
    }
    if (!sourceName || !sourceUrl) {
      return NextResponse.json(
        { error: "Source name and URL required (link to the original)" },
        { status: 400 }
      );
    }
    const tags =
      typeof body.tags === "string"
        ? body.tags
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean)
        : Array.isArray(body.tags)
          ? body.tags
          : undefined;
    const note = await addNewsNote({
      title,
      summary,
      excerpt: body.excerpt ? String(body.excerpt) : undefined,
      sourceName,
      sourceUrl,
      tags,
      publishedAt: body.publishedAt
        ? String(body.publishedAt).slice(0, 10)
        : new Date().toISOString().slice(0, 10),
    });
    return NextResponse.json({ success: true, note });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { id, action } = body;
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    if (action === "delete") {
      const ok = await deleteNewsNote(id);
      return NextResponse.json({ success: ok });
    }
    const patch: Record<string, unknown> = {};
    if (body.title != null) patch.title = String(body.title).trim();
    if (body.summary != null) patch.summary = String(body.summary).trim();
    if (body.excerpt != null)
      patch.excerpt = String(body.excerpt).trim() || undefined;
    if (body.sourceName != null)
      patch.sourceName = String(body.sourceName).trim();
    if (body.sourceUrl != null) patch.sourceUrl = String(body.sourceUrl).trim();
    if (body.publishedAt != null)
      patch.publishedAt = String(body.publishedAt).slice(0, 10);
    if (body.tags != null) {
      patch.tags =
        typeof body.tags === "string"
          ? body.tags
              .split(",")
              .map((t: string) => t.trim())
              .filter(Boolean)
          : body.tags;
    }
    const updated = await updateNewsNote(id, patch as any);
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, note: updated });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
