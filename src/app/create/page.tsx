"use client";

import { useRef, useState } from "react";
import {
  LISTING_FEE_SATS,
  PLATFORM_ADDRESS,
  CONTACT,
} from "@/lib/types";
import { qrImageUrl, buildPaymentUri } from "@/lib/bch";

const MAX_IMAGE_CHARS = 180_000; // \~135KB base64 budget

async function fileToResizedDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const maxW = 900;
      let w = img.width;
      let h = img.height;
      if (w > maxW) {
        h = Math.round((h * maxW) / w);
        w = maxW;
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      // Try jpeg qualities until under budget
      for (const q of [0.72, 0.55, 0.4, 0.28]) {
        const data = canvas.toDataURL("image/jpeg", q);
        if (data.length <= MAX_IMAGE_CHARS) {
          resolve(data);
          return;
        }
      }
      reject(new Error("Image still too large after compression. Use a smaller photo or a URL."));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

export default function CreatePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creatorAddress, setCreatorAddress] = useState("");
  const [goalBch, setGoalBch] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");
  const [feeTxid, setFeeTxid] = useState("");
  const [status, setStatus] = useState<
    "idle" | "checking" | "error" | "success"
  >("idle");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const feeUri = buildPaymentUri(
    PLATFORM_ADDRESS,
    LISTING_FEE_SATS,
    "CashRaise listing fee"
  );

  function insertMarkdown(before: string, after = "") {
    const el = descRef.current;
    if (!el) {
      setDescription((d) => d + before + after);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = description.slice(start, end);
    const next =
      description.slice(0, start) +
      before +
      (selected || "text") +
      after +
      description.slice(end);
    setDescription(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos =
        start + before.length + (selected || "text").length + after.length;
      el.setSelectionRange(pos, pos);
    });
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (jpg, png, webp…)");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      setImageUrl(dataUrl);
      setImageMode("upload");
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

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
        <h2 className="font-semibold text-emerald-400">1. Pay listing fee</h2>
        <p className="text-sm text-zinc-400">
          Send exactly{" "}
          <strong className="text-white">
            {(LISTING_FEE_SATS / 1e8).toFixed(4)} BCH
          </strong>{" "}
          ({LISTING_FEE_SATS.toLocaleString()} sats) to the platform address.
          Copy the txid after confirmation.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrImageUrl(feeUri, 160)}
            alt="Fee QR"
            width={160}
            height={160}
            className="rounded-lg bg-white p-2"
          />
          <div className="text-xs break-all space-y-2">
            <code className="text-emerald-300">{PLATFORM_ADDRESS}</code>
            <a
              href={feeUri}
              className="inline-block bg-emerald-500 text-black font-medium px-3 py-1.5 rounded"
            >
              Open in wallet
            </a>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <h2 className="font-semibold text-zinc-200">2. Campaign details</h2>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Title *</label>
          <input
            required
            minLength={5}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500"
            placeholder="What are you building?"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">
            Description *{" "}
            <span className="text-zinc-600">(basic markdown)</span>
          </label>
          <div className="flex flex-wrap gap-1 mb-1.5">
            {[
              { label: "B", title: "Bold", fn: () => insertMarkdown("**", "**") },
              { label: "I", title: "Italic", fn: () => insertMarkdown("*", "*") },
              {
                label: "H2",
                title: "Heading",
                fn: () => insertMarkdown("\n## ", ""),
              },
              { label: "•", title: "List", fn: () => insertMarkdown("\n- ", "") },
              {
                label: "1.",
                title: "Numbered",
                fn: () => insertMarkdown("\n1. ", ""),
              },
              {
                label: "Link",
                title: "Link",
                fn: () => insertMarkdown("[", "](https://)"),
              },
              {
                label: "`code`",
                title: "Code",
                fn: () => insertMarkdown("`", "`"),
              },
            ].map((b) => (
              <button
                key={b.label}
                type="button"
                title={b.title}
                onClick={b.fn}
                className="text-xs px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
              >
                {b.label}
              </button>
            ))}
          </div>
          <textarea
            ref={descRef}
            required
            minLength={20}
            rows={8}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 text-sm font-mono"
            placeholder={
              "## Why this matters\n\nShort pitch with **bold** and a [link](https://example.com).\n\n- Point one\n- Point two"
            }
          />
          <p className="text-xs text-zinc-500 mt-1">
            Supports **bold**, *italic*, headings, lists, links, and `code`.
          </p>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">
            Donation address (CashAddr) *
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
          <label className="block text-sm text-zinc-400 mb-2">
            Photo (optional, one image)
          </label>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => setImageMode("url")}
              className={`text-xs px-3 py-1.5 rounded border ${
                imageMode === "url"
                  ? "border-emerald-500 text-emerald-400 bg-emerald-950/30"
                  : "border-zinc-700 text-zinc-400"
              }`}
            >
              Image URL
            </button>
            <button
              type="button"
              onClick={() => setImageMode("upload")}
              className={`text-xs px-3 py-1.5 rounded border ${
                imageMode === "upload"
                  ? "border-emerald-500 text-emerald-400 bg-emerald-950/30"
                  : "border-zinc-700 text-zinc-400"
              }`}
            >
              Upload file
            </button>
          </div>

          {imageMode === "url" ? (
            <input
              type="url"
              value={imageUrl.startsWith("data:") ? "" : imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 text-sm"
              placeholder="https://imgur.com/… or any direct image link"
            />
          ) : (
            <div className="space-y-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onFile}
                className="block w-full text-sm text-zinc-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700"
              />
              <p className="text-xs text-zinc-500">
                {uploading
                  ? "Compressing…"
                  : "JPG/PNG/WebP. Auto-resized & compressed (no external host)."}
              </p>
            </div>
          )}

          {imageUrl && (
            <div className="mt-3 relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Preview"
                className="max-h-40 rounded-lg border border-zinc-700"
              />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute top-1 right-1 text-xs bg-black/70 text-white px-2 py-0.5 rounded"
              >
                Remove
              </button>
            </div>
          )}
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
          <div className="text-emerald-400 text-sm bg-emerald-950/30 border border-emerald-900 rounded-lg px-4 py-3 space-y-1">
            <p className="font-medium">Submitted — pending approval</p>
            <p>{message}</p>
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
