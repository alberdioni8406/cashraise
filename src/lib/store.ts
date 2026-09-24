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

export function addCampaign(c: Campaign): boolean {
  try {
    ensureFile();
    const list = getCampaigns();
    if (list.some((x) => x.id === c.id || (c.feeTxid && x.feeTxid === c.feeTxid))) {
      return false;
    }
    list.unshift(c);
    fs.writeFileSync(DATA_PATH, JSON.stringify(list, null, 2));
    return true;
  } catch {
    return false;
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
