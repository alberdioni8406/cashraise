export type CampaignStatus = "pending" | "approved" | "rejected";

export interface Campaign {
  id: string;
  title: string;
  description: string;
  creatorAddress: string; // CashAddr — donations go here; use this address to track raised amount
  goalSats?: number;
  category?: string;
  imageUrl?: string; // optional single photo URL
  createdAt: string;
  feeTxid: string;
  status: CampaignStatus;
  feeVerified: boolean; // true when on-chain fee check succeeded
  approvedAt?: string;
  contactNote?: string;
}

/** Listing fee — raised to reduce spam. Override with env if needed. */
export const LISTING_FEE_SATS = 1_000_000; // 0.01 BCH

export const PLATFORM_ADDRESS =
  process.env.NEXT_PUBLIC_PLATFORM_ADDRESS ||
  "bitcoincash:qqptanljvhwjply7wt9kcn25qyzwys23yvey2tra66";

/** Set ADMIN_SECRET in Vercel environment variables for production */
export const ADMIN_SECRET = process.env.ADMIN_SECRET || "cashraise-admin-change-me";

export const CONTACT = {
  x: "alberdioni8406_",
  email: "alberdioni8406@proton.me",
  telegram: "alberdioni8406",
};
