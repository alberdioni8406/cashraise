/**
 * Campaign store — Upstash Redis (recommended) or in-memory fallback.
 *
 * Vercel env:
 *   UPSTASH_REDIS_REST_URL   = https://xxxxx.upstash.io
 *   UPSTASH_REDIS_REST_TOKEN = Axxxxxxx
 *
 * Free: https://console.upstash.com → Create Redis → REST API
 */

import { Campaign } from "./types";

const KEY = "cashraise:campaigns";

const URL = (process.env.UPSTASH_REDIS_REST_URL || "").trim();
const TOKEN = (process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();

type GlobalStore = { __cashraiseCampaigns?: Campaign[] };

function g(): GlobalStore {
  return globalThis as unknown as GlobalStore;
}

function useUpstash(): boolean {
  return Boolean(URL && TOKEN);
}

async function redis(command: (string | number)[]): Promise<any> {
  const res = await fetch(URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upstash error: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data.result;
}

async function loadAll(): Promise<Campaign[]> {
  if (useUpstash()) {
    const raw = await redis(["GET", KEY]);
    if (!raw) {
      g().__cashraiseCampaigns = [];
      return [];
    }
    const list = typeof raw === "string" ? JSON.parse(raw) : raw;
    const arr = Array.isArray(list) ? (list as Campaign[]) : [];
    g().__cashraiseCampaigns = arr;
    return arr;
  }
  if (!g().__cashraiseCampaigns) {
    g().__cashraiseCampaigns = [];
  }
  return g().__cashraiseCampaigns!;
}

async function saveAll(list: Campaign[]): Promise<void> {
  g().__cashraiseCampaigns = list;
  if (useUpstash()) {
    await redis(["SET", KEY, JSON.stringify(list)]);
  }
}

export async function getCampaigns(): Promise<Campaign[]> {
  return [...(await loadAll())];
}

export async function getApprovedCampaigns(): Promise<Campaign[]> {
  return (await loadAll()).filter((c) => c.status === "approved");
}

export async function getPendingCampaigns(): Promise<Campaign[]> {
  return (await loadAll()).filter((c) => c.status === "pending");
}

export async function getCampaign(id: string): Promise<Campaign | undefined> {
  return (await loadAll()).find((c) => c.id === id);
}

export async function findByFeeTxid(
  feeTxid: string
): Promise<Campaign | undefined> {
  if (!feeTxid) return undefined;
  return (await loadAll()).find((c) => c.feeTxid === feeTxid);
}

export async function addCampaign(c: Campaign): Promise<{
  ok: boolean;
  campaign?: Campaign;
  reason?: "created" | "already_pending" | "already_approved" | "write_failed";
  detail?: string;
}> {
  try {
    if (!useUpstash()) {
      return {
        ok: false,
        reason: "write_failed",
        detail:
          "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in Vercel, then redeploy.",
      };
    }

    const list = await loadAll();

    const byFee = c.feeTxid
      ? list.find((x) => x.feeTxid === c.feeTxid)
      : undefined;

    if (byFee) {
      if (byFee.status === "approved") {
        return { ok: false, campaign: byFee, reason: "already_approved" };
      }
      if (byFee.status === "pending") {
        return { ok: true, campaign: byFee, reason: "already_pending" };
      }
      const without = list.filter((x) => x.feeTxid !== c.feeTxid);
      without.unshift(c);
      await saveAll(without);
      return { ok: true, campaign: c, reason: "created" };
    }

    if (list.some((x) => x.id === c.id)) {
      return {
        ok: true,
        campaign: list.find((x) => x.id === c.id),
        reason: "already_pending",
      };
    }

    await saveAll([c, ...list]);
    return { ok: true, campaign: c, reason: "created" };
  } catch (e: any) {
    console.error("addCampaign error", e);
    return {
      ok: false,
      reason: "write_failed",
      detail: e?.message || String(e),
    };
  }
}

export async function updateCampaign(
  id: string,
  patch: Partial<Campaign>
): Promise<Campaign | null> {
  try {
    const list = await loadAll();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const updated = { ...list[idx], ...patch };
    const next = [...list];
    next[idx] = updated;
    await saveAll(next);
    return updated;
  } catch (e) {
    console.error("updateCampaign error", e);
    return null;
  }
}

export async function deleteCampaign(id: string): Promise<boolean> {
  try {
    const list = (await loadAll()).filter((c) => c.id !== id);
    await saveAll(list);
    return true;
  } catch (e) {
    console.error("deleteCampaign error", e);
    return false;
  }
}
