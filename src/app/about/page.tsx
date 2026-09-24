import { CONTACT, LISTING_FEE_SATS } from "@/lib/types";

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 prose prose-invert">
      <h1 className="text-3xl font-bold">Philosophy</h1>

      <p className="text-zinc-300 leading-relaxed">
        Traditional fundraising platforms take custody, charge high fees, and
        design themselves like banks or social networks. That is the opposite of
        what crypto is for.
      </p>

      <h2 className="text-xl font-semibold text-emerald-400">
        Non-custodial by design
      </h2>
      <p className="text-zinc-400">
        Donations never enter a platform wallet. The moment you decide an idea is
        worth sponsoring, you send BCH straight to the creator&apos;s address.
        The platform only lists the idea after a small on-chain fee is paid and
        an admin has approved the campaign. No KYC, no intermediate balances.
      </p>

      <h2 className="text-xl font-semibold text-emerald-400">
        Approval after on-chain proof
      </h2>
      <p className="text-zinc-400">
        Paying the listing fee ({LISTING_FEE_SATS.toLocaleString()} sats) is the
        proof of seriousness. Campaigns stay pending until approved so no one
        loses money to a closed window or failed auto-check. If verification
        fails, contact the operator with your txid.
      </p>

      <h2 className="text-xl font-semibold text-emerald-400">
        You only fund what you see fit
      </h2>
      <p className="text-zinc-400">
        There is no algorithmic feed or paid featured slots. Ideas sit on a
        simple board. Serious builders and corporations already run hackathons
        to surface ideas; this is the open version, settled in cash that moves
        at the speed of the network.
      </p>

      <h2 className="text-xl font-semibold text-emerald-400">
        Track raised on the campaign address
      </h2>
      <p className="text-zinc-400">
        Creators should use the address they publish for the campaign. The
        platform reads total received on that address from a public explorer so
        supporters can see progress without the platform ever holding funds.
      </p>

      <h2 className="text-xl font-semibold text-emerald-400">Contact</h2>
      <p className="text-zinc-400">
        For manual approval or questions after paying the listing fee:
      </p>
      <ul className="text-zinc-400 list-disc list-inside space-y-1">
        <li>
          X:{" "}
          <a
            href={`https://x.com/${CONTACT.x}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            @{CONTACT.x}
          </a>
        </li>
        <li>
          Email:{" "}
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
        </li>
        <li>
          Telegram:{" "}
          <a
            href={`https://t.me/${CONTACT.telegram}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            @{CONTACT.telegram}
          </a>
        </li>
      </ul>
    </div>
  );
}
