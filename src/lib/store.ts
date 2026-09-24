/**
 * Campaign store.
 * On Vercel the filesystem is ephemeral — for durable storage swap this
 * for Vercel KV, Supabase, Turso, or a GitHub-backed JSON workflow.
 */

import { Campaign } from "./types";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "campaigns.json");

function ensureFile() {
  try {
    if (!fs.existsSync(path.dirname(DATA_PATH))) {
      fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    }
    if (!fs.existsSync(DATA_PATH)) {
      fs.writeFileSync(DATA_PATH, "[]");
    }
  } catch {
    // serverless / read-only
  }
}

export function getCampaigns(): Campaign[] {
  try {
    ensureFile();
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    const list = JSON.parse(raw) as Campaign[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function getApprovedCampaigns(): Campaign[] {
  return getCampaigns().filter((c) => c.status === "approved");
}

export function getPendingCampaigns(): Campaign[] {
  return getCampaigns().filter((c) => c.status === "pending");
}

export function getCampaign(id: string): Campaign | undefined {
  return getCampaigns().find((c) => c.id === id);
}

export function findByFeeTxid(feeTxid: string): Campaign | undefined {
  if (!feeTxid) return undefined;
  return getCampaigns().find((c) => c.feeTxid === feeTxid);
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
    ensureFile();
    const list = getCampaigns();

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
      fs.writeFileSync(DATA_PATH, JSON.stringify(without, null, 2));
      return { ok: true, campaign: c, reason: "created" };
    }

    if (list.some((x) => x.id === c.id)) {
      return {
        ok: false,
        campaign: list.find((x) => x.id === c.id),
        reason: "already_pending",
      };
    }

    list.unshift(c);
    fs.writeFileSync(DATA_PATH, JSON.stringify(list, null, 2));
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
    ensureFile();
    const list = getCampaigns();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...patch };
    fs.writeFileSync(DATA_PATH, JSON.stringify(list, null, 2));
    return list[idx];
  } catch {
    return null;
  }
}

export function deleteCampaign(id: string): boolean {
  try {
    ensureFile();
    const list = getCampaigns().filter((c) => c.id !== id);
    fs.writeFileSync(DATA_PATH, JSON.stringify(list, null, 2));
    return true;
  } catch {
    return false;
  }
}
