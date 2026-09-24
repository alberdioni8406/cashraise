export interface Campaign {
  id: string;
  title: string;
  description: string;
  creatorAddress: string; // CashAddr format
  goalSats?: number; // optional goal in satoshis
  category?: string;
  createdAt: string; // ISO
  feeTxid: string; // the listing fee transaction
  raisedSats?: number; // optional, for display if tracked
}

export const LISTING_FEE_SATS = 10000; // 0.0001 BCH — adjustable
export const PLATFORM_ADDRESS =
  process.env.NEXT_PUBLIC_PLATFORM_ADDRESS ||
  "bitcoincash:qqptanljvhwjply7wt9kcn25qyzwys23yvey2tra66"; // placeholder — replace with real
