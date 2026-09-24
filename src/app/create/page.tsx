"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LISTING_FEE_SATS,
  PLATFORM_ADDRESS,
  CONTACT,
} from "@/lib/types";
import { qrImageUrl, buildPaymentUri } from "@/lib/bch";

export default function CreatePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creatorAddress, setCreatorAddress] = useState("");
  const [goalBch, setGoalBch] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [feeTxid, setFeeTxid] = useState("");
  const [status, setStatus] = useState<
    "idle" | "checking" | "error" | "success"
  >("idle");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const feeUri = buildPaymentUri(
    PLATFORM_ADDRESS,
    LISTING_FEE_SATS,
    "CashRaise listing fee"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("checking");
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          creatorAddress,
          goalSats: goalBch ? Math.round(parseFloat(goalBch) * 1e8) : undefined,
          category: category || undefined,
          imageUrl: imageUrl || undefined,
          feeTxid: feeTxid.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit");
        setStatus("error");
        return;
      }
      setStatus("success");
      setMessage(
        data.message ||
          "Submitted. Pending admin approval after on-chain fee verification."
      );
    } catch (err: any) {
      setError(err.message || "Network error");
      setStatus("error");
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">List an idea</h1>
        <p className="text-zinc-400 mt-2">
          Pay the on-chain listing fee, then submit. Campaigns go live only after
          admin approval. Donations always go straight to your address — this
          platform never holds funds.
        </p>
      </div>

      <div className="border border-emerald-500/30 bg-emerald-950/20 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-emerald-400">1. Pay the listing fee</h2>
        <p className="text-sm text-zinc-400">
          Send at least{" "}
          <strong>{LISTING_FEE_SATS.toLocaleString()} sats</strong> (
          {(LISTING_FEE_SATS / 1e8).toFixed(8)} BCH) to the platform address.
          Then paste the transaction ID below.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrImageUrl(feeUri)}
            alt="Fee QR"
            width={160}
            height={160}
            className="rounded bg-white p-2"
          />
          <div className="text-xs break-all space-y-2">
            <div>
              <span className="text-zinc-500">Address:</span>
              <br />
              <code className="text-emerald-300">{PLATFORM_ADDRESS}</code>
            </div>
            <div>
              <span className="text-zinc-500">Amount:</span>{" "}
              {(LISTING_FEE_SATS / 1e8).toFixed(8)} BCH
            </div>
            <a
              href={feeUri}
              className="inline-block mt-2 text-emerald-400 underline"
            >
              Open in wallet (BIP21)
            </a>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Title *</label>
          <input
            required
            minLength={5}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500"
            placeholder="Build a BCH payment plugin for X"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">
            Description *
          </label>
          <textarea
            required
            minLength={20}
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500"
            placeholder="What is the idea? Why does it matter? How will funds be used?"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">
            Your BCH donation address (CashAddr) *
          </label>
          <input
            required
            value={creatorAddress}
            onChange={(e) => setCreatorAddress(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 font-mono text-sm"
            placeholder="bitcoincash:q..."
          />
          <p className="text-xs text-zinc-500 mt-1">
            Use this address for the campaign so raised amount can be tracked
            on-chain. Donations go here. Never share private keys.
          </p>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">
            Image URL (optional, one photo)
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 text-sm"
            placeholder="https://…"
          />
          <p className="text-xs text-zinc-500 mt-1">
            Direct link to an image (e.g. from Imgur, GitHub raw, or your site).
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Goal (BCH, optional)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={goalBch}
              onChange={(e) => setGoalBch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500"
              placeholder="1.5"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Category (optional)
            </label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500"
              placeholder="Dev tools, Community…"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">
            Listing fee transaction ID *
          </label>
          <input
            required
            pattern="[a-fA-F0-9]{64}"
            value={feeTxid}
            onChange={(e) => setFeeTxid(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 font-mono text-sm"
            placeholder="64-character txid from your wallet"
          />
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-950/30 border border-red-900 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {status === "success" && (
          <div className="text-emerald-400 text-sm bg-emerald-950/30 border border-emerald-900 rounded-lg px-4 py-3 space-y-2">
            <p className="font-medium">Submitted — pending approval</p>
            <p>{message}</p>
            <p className="text-zinc-400 text-xs pt-2">
              If the fee did not verify automatically or you need help, contact
              with your txid:
              <br />
              X: @{CONTACT.x} · Email: {CONTACT.email} · Telegram: @
              {CONTACT.telegram}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={status === "checking" || status === "success"}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold py-3 rounded-lg transition"
        >
          {status === "checking" ? "Verifying on-chain…" : "Submit for approval"}
        </button>
      </form>

      <div className="border border-zinc-800 rounded-xl p-5 text-sm text-zinc-400 space-y-2">
        <p className="font-medium text-zinc-300">Need manual approval?</p>
        <p>
          If payment verification fails or the window closes, send your txid to:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            X:{" "}
            <a
              href={`https://x.com/${CONTACT.x}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400"
            >
              @{CONTACT.x}
            </a>
          </li>
          <li>
            Email:{" "}
            <a href={`mailto:${CONTACT.email}`} className="text-emerald-400">
              {CONTACT.email}
            </a>
          </li>
          <li>
            Telegram:{" "}
            <a
              href={`https://t.me/${CONTACT.telegram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400"
            >
              @{CONTACT.telegram}
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
