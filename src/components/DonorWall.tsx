"use client";

import { useCallback, useEffect, useState } from "react";

type Comment = {
  id: string;
  campaignId: string;
  text: string;
  displayName: string;
  txid: string;
  amountSats: number;
  createdAt: string;
};

function formatBch(sats: number): string {
  return (sats / 1e8).toFixed(4);
}

function relativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const sec = Math.floor((Date.now() - t) / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
  if (sec < 86400) {
    const h = Math.floor(sec / 3600);
    return h === 1 ? "1 hour ago" : `${h} hours ago`;
  }
  if (sec < 86400 * 2) return "yesterday";
  if (sec < 86400 * 14) return `${Math.floor(sec / 86400)} days ago`;
  return new Date(iso).toLocaleDateString();
}

export function DonorWall({ campaignId }: { campaignId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [txid, setTxid] = useState("");
  const [text, setText] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/comments?campaignId=${encodeURIComponent(campaignId)}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      setComments(Array.isArray(data.comments) ? data.comments : []);
    } catch {
      /* keep list */
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    load();
  }, [load]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOkMsg(null);
    setBusy(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          txid: txid.trim(),
          text: text.trim(),
          displayName: displayName.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not post comment");
        return;
      }
      setOkMsg("Comment posted. Thank you for supporting on-chain.");
      setTxid("");
      setText("");
      setDisplayName("");
      await load();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="border border-[var(--border)] bg-[var(--surface)] rounded-[var(--radius)] p-5 sm:p-6 space-y-5">
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight">
          Donor wall
        </h2>
        <p className="text-sm text-[var(--muted)] mt-1 leading-relaxed">
          Supported this campaign on-chain? Leave a short note. Paste your{" "}
          <strong className="text-[var(--muted)]">donation txid</strong> so we
          can verify it went to this campaign address — no account required.
        </p>
      </div>

      {loading ? (
        <p className="cr-meta">Loading notes…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          No donor notes yet. Be the first after you support with BCH.
        </p>
      ) : (
        <ul className="space-y-0 divide-y divide-[var(--border)]">
          {comments.map((c) => (
            <li key={c.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-white">
                  {c.displayName}
                </span>
                <span className="cr-meta">
                  {c.amountSats > 0 ? `${formatBch(c.amountSats)} BCH · ` : ""}
                  {relativeTime(c.createdAt)}
                </span>
              </div>
              <p className="text-sm text-[var(--muted)] leading-relaxed whitespace-pre-wrap">
                {c.text}
              </p>
              <a
                href={`https://bchexplorer.cash/tx/${c.txid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cr-meta text-[var(--accent)] hover:underline"
              >
                tx {c.txid.slice(0, 8)}…{c.txid.slice(-6)}
              </a>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={onSubmit}
        className="space-y-3 border-t border-[var(--border)] pt-4"
      >
        <p className="cr-meta text-[var(--accent)]">Leave a note</p>
        <div>
          <label className="cr-label" htmlFor="donor-name">
            Name (optional)
          </label>
          <input
            id="donor-name"
            className="cr-input"
            maxLength={40}
            placeholder="Anonymous supporter"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div>
          <label className="cr-label" htmlFor="donor-txid">
            Donation txid
          </label>
          <input
            id="donor-txid"
            className="cr-input font-mono text-sm"
            required
            placeholder="64-character transaction id"
            value={txid}
            onChange={(e) => setTxid(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div>
          <label className="cr-label" htmlFor="donor-text">
            Your note
          </label>
          <textarea
            id="donor-text"
            className="cr-textarea min-h-[88px]"
            required
            maxLength={500}
            placeholder="A short message for the creator or other supporters…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <p className="cr-meta mt-1 text-right">{text.length}/500</p>
        </div>
        {error && (
          <p className="text-sm text-[var(--danger,#ef4444)]">{error}</p>
        )}
        {okMsg && (
          <p className="text-sm text-[var(--success,#00c853)]">{okMsg}</p>
        )}
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Verifying…" : "Post note"}
        </button>
      </form>
    </section>
  );
}
