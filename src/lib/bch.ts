/**
 * BCH helpers — non-custodial verification via public explorers.
 * No private keys, no custody. Pure on-chain checks.
 */

import { LISTING_FEE_SATS, PLATFORM_ADDRESS } from "./types";

const EXPLORER = "https://bchexplorer.cash/api";

/** Basic CashAddr validation (prefix + length heuristic) */
export function isValidCashAddr(addr: string): boolean {
  if (!addr || typeof addr !== "string") return false;
  const a = addr.trim().toLowerCase();
  return (
    (a.startsWith("bitcoincash:") || a.startsWith("bchtest:") || a.startsWith("bchreg:")) &&
    a.length > 20 &&
    a.length < 120 &&
    /^[a-z0-9:]+$/.test(a)
  );
}

/** Fetch raw transaction from public explorer */
export async function getTransaction(txid: string): Promise<any | null> {
  try {
    const res = await fetch(`${EXPLORER}/tx/${txid}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Verify that a transaction paid at least LISTING_FEE_SATS to PLATFORM_ADDRESS.
 * This is the only gate for listing — pure non-custodial fee.
 */
export async function verifyListingFee(txid: string): Promise<{
  valid: boolean;
  amountSats?: number;
  error?: string;
}> {
  if (!txid || !/^[a-fA-F0-9]{64}$/.test(txid)) {
    return { valid: false, error: "Invalid txid format" };
  }

  const tx = await getTransaction(txid);
  if (!tx) {
    return { valid: false, error: "Transaction not found (or explorer unavailable)" };
  }

  // Look at outputs for payment to platform
  let paid = 0;
  const platform = PLATFORM_ADDRESS.toLowerCase().replace("bitcoincash:", "");

  for (const vout of tx.vout || []) {
    const addr =
      vout.scriptpubkey_address?.toLowerCase?.() ||
      vout.scriptPubKey?.addresses?.[0]?.toLowerCase?.() ||
      "";
    const clean = addr.replace("bitcoincash:", "");
    if (clean === platform || addr === PLATFORM_ADDRESS.toLowerCase()) {
      // value is usually in sats for this explorer
      const val = Number(vout.value ?? vout.valueSat ?? 0);
      // some explorers return BCH float; normalize
      paid += val > 1 ? val : Math.round(val * 1e8);
    }
  }

  if (paid >= LISTING_FEE_SATS) {
    return { valid: true, amountSats: paid };
  }

  return {
    valid: false,
    amountSats: paid,
    error: `Paid only ${paid} sats, need ≥ ${LISTING_FEE_SATS}`,
  };
}

/** Build BIP21 payment URI for donations */
export function buildPaymentUri(
  address: string,
  amountSats?: number,
  message?: string
): string {
  let uri = address;
  const params: string[] = [];
  if (amountSats && amountSats > 0) {
    params.push(`amount=${(amountSats / 1e8).toFixed(8)}`);
  }
  if (message) {
    params.push(`message=${encodeURIComponent(message)}`);
  }
  if (params.length) uri += "?" + params.join("&");
  return uri;
}

/** QR image URL via public service (no local dep needed) */
export function qrImageUrl(data: string, size = 220): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
}
