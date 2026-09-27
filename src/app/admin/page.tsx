"use client";

import { useState, useCallback } from "react";
import { CONTACT } from "@/lib/types";

interface Campaign {
  id: string;
  title: string;
  description: string;
  creatorAddress: string;
  goalSats?: number;
  category?: string;
  imageUrl?: string;
  createdAt: string;
  feeTxid: string;
  status: "pending" | "approved" | "rejected";
  feeVerified: boolean;
  approvedAt?: string;
}

interface NewsNote {
  id: string;
  title: string;
  summary: string;
  excerpt?: string;
  sourceName: string;
  sourceUrl: string;
  tags?: string[];
  publishedAt: string;
  createdAt: string;
}

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editGoalBch, setEditGoalBch] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState<NewsNote[]>([]);
  const [newsReady, setNewsReady] = useState(false);
  const [nTitle, setNTitle] = useState("");
  const [nSummary, setNSummary] = useState("");
  const [nExcerpt, setNExcerpt] = useState("");
  const [nSourceName, setNSourceName] = useState("");
  const [nSourceUrl, setNSourceUrl] = useState("");
  const [nTags, setNTags] = useState("");
  const [nDate, setNDate] = useState("");
  const [publishing, setPublishing] = useState(false);

  const load = useCallback(async (s: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/campaigns", {
        headers: { "x-admin-secret": s },
      });
      if (!res.ok) {
        setError("Unauthorized or server error");
        setAuthed(false);
        return;
      }
      const data = await res.json();
      setCampaigns(data.campaigns || []);
      setAuthed(true);
      try {
        const nr = await fetch("/api/admin/news", {
          headers: { "x-admin-secret": s },
        });
        if (nr.ok) {
          const nd = await nr.json();
          setNotes(nd.notes || []);
          setNewsReady(Boolean(nd.storageReady));
        }
      } catch {
        /* news optional if route missing */
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    load(secret);
  }

  async function action(id: string, act: "approve" | "reject" | "delete") {
    setMsg("");
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify({ id, action: act }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Failed");
        return;
      }
      setMsg(`${act} OK`);
      if (editingId === id) setEditingId(null);
      load(secret);
    } catch {
      setMsg("Network error");
    }
  }

  function startEdit(c: Campaign) {
    setEditingId(c.id);
    setEditTitle(c.title);
    setEditDescription(c.description);
    setEditAddress(c.creatorAddress);
    setEditGoalBch(
      c.goalSats != null && c.goalSats > 0
        ? (c.goalSats / 1e8).toString()
        : ""
    );
    setEditCategory(c.category || "");
    setEditImageUrl(c.imageUrl || "");
    setMsg("");
  }

  async function saveEdit(id: string) {
    setSaving(true);
    setMsg("");
    try {
      const body: Record<string, unknown> = {
        id,
        action: "edit",
        title: editTitle,
        description: editDescription,
        creatorAddress: editAddress,
        category: editCategory,
        imageUrl: editImageUrl,
      };
      if (editGoalBch.trim() === "") {
        body.clearGoal = true;
      } else {
        body.goalBch = editGoalBch.trim();
      }

      const res = await fetch("/api/admin/campaigns", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Save failed");
        return;
      }
      setMsg("Saved");
      setEditingId(null);
      load(secret);
    } catch {
      setMsg("Network error");
    } finally {
      setSaving(false);
    }
  }


  async function publishNote(e: React.FormEvent) {
    e.preventDefault();
    setPublishing(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify({
          title: nTitle,
          summary: nSummary,
          excerpt: nExcerpt || undefined,
          sourceName: nSourceName,
          sourceUrl: nSourceUrl,
          tags: nTags,
          publishedAt: nDate || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Publish failed");
        return;
      }
      setMsg("Note published");
      setNTitle("");
      setNSummary("");
      setNExcerpt("");
      setNSourceName("");
      setNSourceUrl("");
      setNTags("");
      setNDate("");
      load(secret);
    } catch {
      setMsg("Network error");
    } finally {
      setPublishing(false);
    }
  }

  async function deleteNote(id: string) {
    if (!confirm("Delete this note?")) return;
    setMsg("");
    try {
      const res = await fetch("/api/admin/news", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify({ id, action: "delete" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Delete failed");
        return;
      }
      setMsg("Note deleted");
      load(secret);
    } catch {
      setMsg("Network error");
    }
  }

  const pending = campaigns.filter((c) => c.status === "pending");
  const approved = campaigns.filter((c) => c.status === "approved");
  const rejected = campaigns.filter((c) => c.status === "rejected");

  function CampaignRow({ c }: { c: Campaign }) {
    const isEditing = editingId === c.id;
    return (
      <li className="border border-zinc-800 rounded-xl p-4 space-y-3 bg-zinc-900/40">
        {!isEditing ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">{c.title}</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {c.status} · fee{" "}
                  {c.feeVerified ? "✓ verified" : "not verified"} ·{" "}
                  {c.goalSats
                    ? `goal ${(c.goalSats / 1e8).toFixed(4)} BCH`
                    : "no goal"}
                </p>
                <p className="text-xs text-zinc-600 font-mono mt-1 break-all">
                  {c.creatorAddress}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {c.status === "pending" && (
                  <>
                    <button
                      onClick={() => action(c.id, "approve")}
                      className="text-xs bg-emerald-500 text-black px-2 py-1 rounded font-medium"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => action(c.id, "reject")}
                      className="text-xs border border-zinc-600 px-2 py-1 rounded"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => startEdit(c)}
                  className="text-xs border border-emerald-600 text-emerald-400 px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this campaign?")) action(c.id, "delete");
                  }}
                  className="text-xs text-red-400 px-2 py-1"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="text-sm text-zinc-400 line-clamp-2">{c.description}</p>
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-emerald-400">Editing</p>
            <div>
              <label className="text-xs text-zinc-500">Title</label>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm mt-0.5"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500">Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm mt-0.5 font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500">
                Goal (BCH) — leave empty for open-ended
              </label>
              <input
                type="number"
                step="0.0001"
                min="0"
                value={editGoalBch}
                onChange={(e) => setEditGoalBch(e.target.value)}
                placeholder="e.g. 1.5"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm mt-0.5"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500">Donation address</label>
              <input
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm mt-0.5 font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-zinc-500">Category</label>
                <input
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm mt-0.5"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500">Image URL</label>
                <input
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm mt-0.5"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => saveEdit(c.id)}
                disabled={saving}
                className="text-sm bg-emerald-500 text-black font-medium px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="text-sm border border-zinc-600 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </li>
    );
  }

  if (!authed) {
    return (
      <div className="max-w-md mx-auto space-y-6 py-12">
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="text-sm text-zinc-400">
          Enter the admin secret (set{" "}
          <code className="text-emerald-400">ADMIN_SECRET</code> in Vercel env).
        </p>
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5"
            placeholder="Admin secret"
          />
          <button
            type="submit"
            className="w-full bg-emerald-500 text-black font-semibold py-2.5 rounded-lg"
          >
            Log in
          </button>
        </form>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin</h1>
        <button
          onClick={() => load(secret)}
          className="text-sm text-zinc-400 hover:text-white"
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>
      {msg && (
        <p className="text-sm text-emerald-400 bg-emerald-950/20 border border-emerald-900 rounded-lg px-3 py-2">
          {msg}
        </p>
      )}

      <section className="space-y-4 border border-zinc-800 rounded-xl p-5 bg-zinc-900/30">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">News desk</h2>
          <span className="text-xs text-zinc-500">
            {newsReady ? "Upstash ready" : "Set UPSTASH_REDIS_* for durable notes"}
          </span>
        </div>
        <p className="text-xs text-zinc-500">
          Publish a short note + link to the original. Appears on /news. Tips go to TIPS_ADDRESS, not listing fee.
        </p>
        <form onSubmit={publishNote} className="space-y-3">
          <input
            required
            value={nTitle}
            onChange={(e) => setNTitle(e.target.value)}
            placeholder="Title"
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
          />
          <textarea
            required
            rows={3}
            value={nSummary}
            onChange={(e) => setNSummary(e.target.value)}
            placeholder="Your summary (your words — not a full copy of the article)"
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
          />
          <input
            value={nExcerpt}
            onChange={(e) => setNExcerpt(e.target.value)}
            placeholder="Optional short quote"
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              required
              value={nSourceName}
              onChange={(e) => setNSourceName(e.target.value)}
              placeholder="Source name (e.g. site or author)"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
            />
            <input
              required
              value={nSourceUrl}
              onChange={(e) => setNSourceUrl(e.target.value)}
              placeholder="https://original-article-url"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              value={nTags}
              onChange={(e) => setNTags(e.target.value)}
              placeholder="Tags (comma-separated)"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={nDate}
              onChange={(e) => setNDate(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={publishing}
            className="bg-emerald-500 text-black font-medium text-sm px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {publishing ? "Publishing…" : "Publish note"}
          </button>
        </form>
        <ul className="space-y-2 pt-2">
          {notes.length === 0 ? (
            <li className="text-sm text-zinc-500">No notes yet</li>
          ) : (
            notes.map((n) => (
              <li
                key={n.id}
                className="flex flex-wrap items-start justify-between gap-2 text-sm border border-zinc-800 rounded-lg px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{n.title}</p>
                  <p className="text-xs text-zinc-500">
                    {n.publishedAt} · {n.sourceName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteNote(n.id)}
                  className="text-xs text-red-400 shrink-0"
                >
                  Delete
                </button>
              </li>
            ))
          )}
        </ul>
      </section>


      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          Pending ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-zinc-500">None</p>
        ) : (
          <ul className="space-y-3">
            {pending.map((c) => (
              <CampaignRow key={c.id} c={c} />
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          Approved ({approved.length})
        </h2>
        {approved.length === 0 ? (
          <p className="text-sm text-zinc-500">None</p>
        ) : (
          <ul className="space-y-3">
            {approved.map((c) => (
              <CampaignRow key={c.id} c={c} />
            ))}
          </ul>
        )}
      </section>

      {rejected.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            Rejected ({rejected.length})
          </h2>
          <ul className="space-y-3">
            {rejected.map((c) => (
              <CampaignRow key={c.id} c={c} />
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs text-zinc-600">
        Contact for manual cases: X @{CONTACT.x} · {CONTACT.email} · Telegram @
        {CONTACT.telegram}
      </p>
    </div>
  );
}
