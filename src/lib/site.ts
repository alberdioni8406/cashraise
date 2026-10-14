/** Canonical public site URL for Open Graph / social previews */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.cashraise.online";

export const SITE_NAME = "CashRaise";
export const SITE_TAGLINE = "Ideas. Funded peer-to-peer.";
export const SITE_DESCRIPTION =
  "Non-custodial Bitcoin Cash fundraising board. List an idea. Donations go straight to creators. No custody.";
