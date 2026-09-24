/**
 * Simple campaign store.
 * In production replace with Vercel KV, Supabase, Turso, or a GitHub JSON + PR workflow.
 * This keeps the platform fully non-custodial and dependency-light for the MVP.
 */

import { Campaign } from "./types";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "campaigns.json");

const seed: Campaign[] = [
  {
    id: "seed-open-source-bch-tooling",
    title: "Open-source BCH developer tooling",
    description:
      "Build better libraries, explorers, and wallet SDKs for Bitcoin Cash. Funds go straight to the maintainer address. No middleman, no platform cut on donations.",
    creatorAddress: "bitcoincash:qpm2qsznhks23z7629mms6s4cwef74vcwvy22gdx6a",
    goalSats: 5_000_000_00, // 5 BCH
    category: "Infrastructure",
    createdAt: new Date().toISOString(),
    feeTxid: "seed",
  },
  {
    id: "seed-local-community-meetup",
    title: "BCH meetup series in emerging markets",
    description:
      "Organize physical meetups, workshops and local merchant onboarding. Pure peer-to-peer funding — you decide if the idea is worth sponsoring.",
    creatorAddress: "bitcoincash:qp3sn6vlwz28ntmf3wmyra7jqttfx7z6zgtkygjhc7m",
    category: "Community",
    createdAt: new Date().toISOString(),
    feeTxid: "seed",
  },
];

function ensureFile() {
  try {
    if (!fs.existsSync(path.dirname(DATA_PATH))) {
      fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    }
    if (!fs.existsSync(DATA_PATH)) {
      fs.writeFileSync(DATA_PATH, JSON.stringify(seed, null, 2));
    }
  } catch {
    // serverless / read-only — fall back to memory
  }
}

export function getCampaigns(): Campaign[] {
  try {
    ensureFile();
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    return JSON.parse(raw) as Campaign[];
  } catch {
    return [...seed];
  }
}

export function getCampaign(id: string): Campaign | undefined {
  return getCampaigns().find((c) => c.id === id);
}

export function addCampaign(c: Campaign): boolean {
  try {
    ensureFile();
    const list = getCampaigns();
    if (list.some((x) => x.id === c.id || x.feeTxid === c.feeTxid)) {
      return false; // already exists
    }
    list.unshift(c);
    fs.writeFileSync(DATA_PATH, JSON.stringify(list, null, 2));
    return true;
  } catch {
    // In pure serverless (Vercel) the filesystem is ephemeral.
    // Campaigns still work for the current instance; for durable storage
    // swap this module for a real DB or GitHub-backed store.
    seed.unshift(c);
    return true;
  }
}
