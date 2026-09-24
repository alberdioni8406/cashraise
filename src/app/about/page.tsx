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
        The platform only lists the idea after a small on-chain fee is paid to an
        address controlled by the operators (or a burn address, if you prefer).
        No KYC, no accounts, no intermediate balances.
      </p>

      <h2 className="text-xl font-semibold text-emerald-400">
        You only fund what you see fit
      </h2>
      <p className="text-zinc-400">
        There is no algorithmic feed, no featured slots for sale, no social
        graph. Ideas sit on a simple board. Serious builders and corporations
        already run hackathons and RFPs to surface ideas; this is the same
        principle, open to anyone, settled in cash that moves at the speed of
        the network.
      </p>

      <h2 className="text-xl font-semibold text-emerald-400">
        Why it should not look like GoFundMe
      </h2>
      <p className="text-zinc-400">
        Soft pastel cards, progress bars, and &ldquo;share to unlock&rdquo;
        mechanics train people to treat money as a social game. Bitcoin Cash is
        peer-to-peer electronic cash. The interface should reflect that:
        transparent addresses, verifiable fees, minimal chrome. If an idea is
        good, the description and the creator&apos;s reputation are enough.
      </p>

      <h2 className="text-xl font-semibold text-emerald-400">
        Open source, simple stack
      </h2>
      <p className="text-zinc-400">
        Next.js on Vercel, GitHub for the code, public blockchain explorers for
        verification. No proprietary payment processor. Change the platform
        address, the fee amount, or the storage backend. Fork it, run your own
        instance, or keep it as a pure public board.
      </p>

      <p className="text-zinc-500 text-sm pt-8">
        Built to stay true to the fundamentals. Replace the placeholder platform
        address before going live. Host the repo on GitHub, deploy to Vercel,
        and let the chain do the rest.
      </p>
    </div>
  );
}
