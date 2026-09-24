/**
 * Campaign store — durable via GitHub when GITHUB_TOKEN is set.
 *
 * Env (Vercel):
 *   GITHUB_TOKEN  = Personal Access Token with "repo" (or Contents read/write)
 *   GITHUB_REPO   = alberdioni8406/cashraise  (owner/name)
 *   GITHUB_BRANCH = main  (optional, default main)
 *
 * Without token: falls back to in-memory + /tmp (not shared across instances).
 */

import { Campaign } from "./types";
import fs from "fs";
import path from "path";

const TMP_PATH = path.join("/tmp", "cashraise-campaigns.json");
const DATA_FILE = "data/campaigns.json";

const REPO = process.env.GITHUB_REPO || "alberdioni8406/cashraise";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const TOKEN = process.env.GITHUB_TOKEN || "";

type GlobalStore = { __cashraiseCampaigns?: Campaign[] };

function g(): GlobalStore {
  return globalThis as unknown as GlobalStore;
}

function useGitHub(): boolean {
  return Boolean(TOKEN && REPO);
}

async function ghHeaders(): Promise<HeadersInit> {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${TOKEN}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function ghGetFile(): Promise<{
  list: Campaign[];
  sha: string | null;
}> {
  const url = `https://api.github.com/repos/\( {REPO}/contents/ \){DATA_FILE}?ref=${BRANCH}`;
  const res = await fetch(url, {
    headers: await ghHeaders(),
    cache: "no-store",
  });
  if (res.status === 404) {
    return { list: [], sha: null };
  }
  if (!res.ok) {
    throw new Error(`GitHub read failed: ${res.status}`);
  }
  const data = await res.json();
  const content = Buffer.from(data.content, "base64").toString("utf8");
  const list = JSON.parse(content || "[]") as Campaign[];
  return { list: Array.isArray(list) ? list : [], sha: data.sha as string };
}

async function ghPutFile(list: Campaign[], sha: string | null): Promise<void> {
  const url = `https://api.github.com/repos/\( {REPO}/contents/ \){DATA_FILE}`;
  const body: Record<string, string> = {
    message: `chore: update campaigns (${list.length})`,
    content: Buffer.from(JSON.stringify(list, null, 2)).toString("base64"),
    branch: BRANCH,
  };
  if (sha) body.sha = sha;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      ...(await ghHeaders()),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub write failed: ${res.status} ${err}`);
  }
}

function readTmp(): Campaign[] {
  try {
    if (fs.existsSync(TMP_PATH)) {
      const list = JSON.parse(fs.readFileSync(TMP_PATH, "utf8")) as Campaign[];
      return Array.isArray(list) ? list : [];
    }
  } catch {
    /* ignore */
  }
  return [];
}

function writeTmp(list: Campaign[]) {
  try {
    fs.writeFileSync(TMP_PATH, JSON.stringify(list, null, 2));
  } catch {
    /* ignore */
  }
}

async function loadAll(): Promise<Campaign[]> {
  if (useGitHub()) {
    const { list } = await ghGetFile();
    g().__cashraiseCampaigns = list;
    writeTmp(list);
    return list;
  }
  if (!g().__cashraiseCampaigns) {
    g().__cashraiseCampaigns = readTmp();
  }
  return g().__cashraiseCampaigns!;
}

async function saveAll(list: Campaign[]): Promise<void> {
  g().__cashraiseCampaigns = list;
  writeTmp(list);
  if (useGitHub()) {
    const { sha } = await ghGetFile();
    await ghPutFile(list, sha);
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
}> {
  try {
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
  } catch (e) {
    console.error("addCampaign error", e);
    return { ok: false, reason: "write_failed" };
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
