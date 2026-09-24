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

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

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
      load(secret);
    } catch {
      setMsg("Network error");
    }
  }

  const pending = campaigns.filter((c) => c.status === "pending");
  const approved = campaigns.filter((c) => c.status === "approved");
  const rejected = campaigns.filter((c) => c.status === "rejected");

  if (!authed) {
    return (
      <div className="max-w-md mx-auto space-y-6 py-12">
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="text-sm text-zinc-400">
          Enter the admin secret (set <code className="text-emerald-400">ADMIN_SECRET</code> in
          Vercel env).
        </p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500"
            placeholder="Admin secret"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-2.5 rounded-lg"
          >
            {loading ? "…" : "Enter"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin dashboard</h1>
        <button
          onClick={() => load(secret)}
          className="text-sm text-zinc-400 hover:text-white"
        >
          Refresh
        </button>
      </div>
      {msg && <p className="text-emerald-400 text-sm">{msg}</p>}

      <section>
        <h2 className="text-lg font-semibold text-amber-400 mb-4">
          Pending ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-zinc-500 text-sm">No pending campaigns.</p>
        ) : (
          <ul className="space-y-4">
            {pending.map((c) => (
              <li
                key={c.id}
                className="border border-zinc-800 rounded-xl p-4 space-y-2"
              >
                <div className="flex flex-wrap gap-2 items-start justify-between">
                  <div>
                    <h3 className="font-medium">{c.title}</h3>
                    <p className="text-xs text-zinc-500">
                      {c.feeVerified ? (
                        <span className="text-emerald-400">Fee verified</span>
                      ) : (
                        <span className="text-amber-400">Fee not verified</span>
                      )}{" "}
                      · {new Date(c.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => action(c.id, "approve")}
                      className="text-xs bg-emerald-600 hover:bg-emerald-500 text-black px-3 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => action(c.id, "reject")}
                      className="text-xs bg-zinc-700 hover:bg-zinc-600 px-3 py-1 rounded"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => action(c.id, "delete")}
                      className="text-xs bg-red-900/50 hover:bg-red-900 px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 line-clamp-2">
                  {c.description}
                </p>
                <p className="text-xs font-mono text-zinc-500 break-all">
                  Address: {c.creatorAddress}
                </p>
                <p className="text-xs font-mono text-zinc-500 break-all">
                  Fee tx:{" "}
                  <a
                    href={`https://bchexplorer.cash/tx/${c.feeTxid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {c.feeTxid}
                  </a>
                </p>
                {c.imageUrl && (
                  <p className="text-xs text-zinc-500 break-all">
                    Image: {c.imageUrl}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">
          Approved ({approved.length})
        </h2>
        {approved.length === 0 ? (
          <p className="text-zinc-500 text-sm">None yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {approved.map((c) => (
              <li
                key={c.id}
                className="flex justify-between items-center border-b border-zinc-800 py-2"
              >
                <span>{c.title}</span>
                <button
                  onClick={() => action(c.id, "delete")}
                  className="text-xs text-red-400 hover:underline"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {rejected.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-zinc-500 mb-4">
            Rejected ({rejected.length})
          </h2>
          <ul className="space-y-2 text-sm text-zinc-500">
            {rejected.map((c) => (
              <li key={c.id} className="flex justify-between">
                <span>{c.title}</span>
                <button
                  onClick={() => action(c.id, "delete")}
                  className="text-xs text-red-400"
                >
                  Delete
                </button>
              </li>
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
