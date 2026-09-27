export type CampaignStatus = "pending" | "approved" | "rejected";

export interface Campaign {
  id: string;
  title: string;
  description: string;
  creatorAddress: string;
  goalSats?: number;
  category?: string;
  imageUrl?: string;
  createdAt: string;
  feeTxid: string;
  status: CampaignStatus;
  feeVerified: boolean;
  approvedAt?: string;
  contactNote?: string;
}

/** Listing fee — 0.01 BCH to reduce spam */
export const LISTING_FEE_SATS = 1_000_000; // 0.01 BCH

/** Platform address for LISTING FEES only (campaign create) */
export const PLATFORM_ADDRESS =
  process.env.NEXT_PUBLIC_PLATFORM_ADDRESS ||
  "bitcoincash:qqptanljvhwjply7wt9kcn25qyzwys23yvey2tra66";

/**
 * Desk tips only — news page “Tip the desk”.
 * Do not use for listing fee verification.
 */
export const TIPS_ADDRESS =
  process.env.NEXT_PUBLIC_TIPS_ADDRESS ||
  "bitcoincash:qq58sy2efwezu44w64jjm9ttt2j9cxcg6yly6qvm79";

export const ADMIN_SECRET = process.env.ADMIN_SECRET || "cashraise-admin-change-me";

export const CONTACT = {
  x: "alberdioni8406_",
  email: "alberdioni8406@gmail.com",
  telegram: "alberdioni8406",
};
