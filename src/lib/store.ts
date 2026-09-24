/**
 * Campaign store for Vercel serverless.
 * - Primary: in-memory (globalThis) so submit + admin work on the same instance
 * - Secondary: /tmp (writable on Vercel) for short-lived persistence
 * - data/campaigns.json is NOT writable on Vercel (read-only deploy)
 *
 * For durable storage across cold starts, use Vercel KV / Supabase later.
 */

import { Campaign } from "./types";
import fs from "fs";
import path from "path";

const TMP_PATH = path.join("/tmp", "cashraise-campaigns.json");

type GlobalStore = {
  __cashraiseCampaigns?: Campaign[];
};

function g(): GlobalStore {
  return globalThis as unknown as GlobalStore;
}

function readFromDisk(): Campaign[] | null {
  try {
    if (fs.existsSync(TMP_PATH)) {
      const raw = fs.readFileSync(TMP_PATH, "utf8");
      const list = JSON.parse(raw) as Campaign[];
      return Array.isArray(list) ? list : null;
    }
  } catch {
    // ignore
  }
  return null;
}

function writeToDisk(list: Campaign[]): boolean {
  try {
    fs.writeFileSync(TMP_PATH, JSON.stringify(list, null, 2));
    return true;
  } catch {
    return false;
  }
}

function getList(): Campaign[] {
  if (!g().__cashraiseCampaigns) {
    const fromDisk = readFromDisk();
    g().__cashraiseCampaigns = fromDisk ?? [];
  }
  return g().__cashraiseCampaigns!;
}

function setList(list: Campaign[]): void {
  g().__cashraiseCampaigns = list;
  writeToDisk(list); // best-effort; memory is source of truth
}

export function getCampaigns(): Campaign[] {
  return [...getList()];
}

export function getApprovedCampaigns(): Campaign[] {
  return getList().filter((c) => c.status === "approved");
}

export function getPendingCampaigns(): Campaign[] {
  return getList().filter((c) => c.status === "pending");
}

export function getCampaign(id: string): Campaign | undefined {
  return getList().find((c) => c.id === id);
}

export function findByFeeTxid(feeTxid: string): Campaign | undefined {
  if (!feeTxid) return undefined;
  return getList().find((c) => c.feeTxid === feeTxid);
}

/**
 * Add a campaign.
 * Same feeTxid + pending → success (already submitted).
 * Same feeTxid + approved → block.
 * Same feeTxid + rejected → allow re-submit.
 */
export function addCampaign(c: Campaign): {
  ok: boolean;
  campaign?: Campaign;
  reason?: "created" | "already_pending" | "already_approved" | "write_failed";
} {
  try {
    const list = getList();

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
      // rejected → allow re-submit
      const without = list.filter((x) => x.feeTxid !== c.feeTxid);
      without.unshift(c);
      setList(without);
      return { ok: true, campaign: c, reason: "created" };
    }

    if (list.some((x) => x.id === c.id)) {
      return {
        ok: true,
        campaign: list.find((x) => x.id === c.id),
        reason: "already_pending",
      };
    }

    const next = [c, ...list];
    setList(next);
    return { ok: true, campaign: c, reason: "created" };
  } catch {
    return { ok: false, reason: "write_failed" };
  }
}

export function updateCampaign(
  id: string,
  patch: Partial<Campaign>
): Campaign | null {
  try {
    const list = getList();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const updated = { ...list[idx], ...patch };
    const next = [...list];
    next[idx] = updated;
    setList(next);
    return updated;
  } catch {
    return null;
  }
}

export function deleteCampaign(id: string): boolean {
  try {
    const list = getList().filter((c) => c.id !== id);
    setList(list);
    return true;
  } catch {
    return false;
  }
}
