# CashRaise

**Non-custodial Bitcoin Cash fundraising for ideas.**

Donations go straight to campaign creators. Listing costs a small on-chain fee paid to a platform address. No accounts, no custody, no platform cut on donations.

## Philosophy

Traditional platforms look and act like banks. Crypto funding should not.

- You only sponsor what you see fit.
- The platform is a simple board, not a social network.
- Big orgs already run hackathons to surface ideas; this is the open version, settled in BCH.

See `/about` in the app.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Public BCH explorer for fee verification (`bchexplorer.cash`)
- Deployable on Vercel
- Code lives on GitHub

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Configuration

Edit `src/lib/types.ts`:

- `PLATFORM_ADDRESS` — CashAddr that receives listing fees (or set `NEXT_PUBLIC_PLATFORM_ADDRESS` env)
- `LISTING_FEE_SATS` — currently 10 000 sats (0.0001 BCH)

## How listing works

1. Creator fills title, description, their own BCH address.
2. Pays the listing fee on-chain to the platform address.
3. Pastes the txid.
4. Backend verifies the payment via a public explorer.
5. Campaign is published. All future donations go directly to the creator address.

## Storage note

The MVP writes campaigns to `data/campaigns.json`. On Vercel the filesystem is ephemeral, so for production swap `src/lib/store.ts` for:

- Vercel KV / Redis
- Supabase / Turso / any Postgres
- Or a GitHub-backed JSON + PR workflow for fully open governance

## Deploy

1. Push to GitHub
2. Import on Vercel
3. Set `NEXT_PUBLIC_PLATFORM_ADDRESS` if desired
4. Deploy

## License

MIT — fork it, change the fee, run your own instance.
