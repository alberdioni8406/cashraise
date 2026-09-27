/**
 * Curated news + project idea sparks.
 * Edit this file (or later move to Upstash/admin) to refresh content.
 */

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  href: string;
  source: "x" | "web" | "official";
  tags?: string[];
  publishedAt?: string;
};

export type IdeaSpark = {
  id: string;
  title: string;
  blurb: string;
  tags: string[];
  /** Prefill for /create?title=... */
  seedTitle?: string;
};

/** Live X search shortcuts — focused on BCH culture, builders, and CashTokens */
export const X_SEARCHES = [
  {
    label: "BCH",
    href: "https://x.com/search?q=BCH%20OR%20%24BCH&src=typed_query&f=live",
  },
  {
    label: "#BitcoinCash",
    href: "https://x.com/search?q=%23BitcoinCash%20OR%20%23BCH&src=typed_query&f=live",
  },
  {
    label: "@BitcoinCashOG",
    href: "https://x.com/BitcoinCashOG",
  },
  {
    label: "Paytaca",
    href: "https://x.com/search?q=Paytaca%20OR%20%40Paytaca&src=typed_query&f=live",
  },
  {
    label: "@TheBCHPodcast",
    href: "https://x.com/TheBCHPodcast",
  },
  {
    label: "CashTokens / DeFi",
    href: "https://x.com/search?q=CashTokens%20OR%20%22BCH%20DeFi%22%20OR%20Cauldron&src=typed_query&f=live",
  },
  {
    label: "@CauldronSwap",
    href: "https://x.com/search?q=Cauldron%20OR%20CauldronSwap%20OR%20%40Cauldron&src=typed_query&f=live",
  },
  {
    label: "BCH Guru",
    href: "https://x.com/search?q=%22BCH%20Guru%22%20OR%20BCHGuru&src=typed_query&f=live",
  },
];

/** Hand-picked entry points — BCH on its own terms */
export const NEWS: NewsItem[] = [
  {
    id: "n1",
    title: "Live BCH signal on X",
    summary:
      "Track $BCH, #BitcoinCash, and #BCH in real time. Follow builders, merchants, and podcasters shaping peer-to-peer cash — not side debates.",
    href: "https://x.com/search?q=%24BCH%20OR%20%23BitcoinCash%20OR%20%23BCH&src=typed_query&f=live",
    source: "x",
    tags: ["BCH", "$BCH", "#BitcoinCash"],
  },
  {
    id: "n2",
    title: "Voices worth following",
    summary:
      "Start with @BitcoinCashOG and @TheBCHPodcast for culture, interviews, and network pulse. Add Paytaca when you care about wallets people actually use day to day.",
    href: "https://x.com/BitcoinCashOG",
    source: "x",
    tags: ["@BitcoinCashOG", "@TheBCHPodcast", "Paytaca"],
  },
  {
    id: "n3",
    title: "CashTokens & BCH DeFi",
    summary:
      "Tokens, pools, and apps on Bitcoin Cash. Watch Cauldron-style swaps, BCH Guru takes, and #CashTokens demos — native capability, not a sidechain story.",
    href: "https://x.com/search?q=CashTokens%20OR%20%22BCH%20DeFi%22%20OR%20Cauldron&src=typed_query&f=live",
    source: "x",
    tags: ["CashTokens", "BCH DeFi", "Cauldron"],
  },
  {
    id: "n4",
    title: "Build and fund on BCH",
    summary:
      "Ideas that need capital belong here: merchant tools, open demos, meetups, tip jars. List a campaign when the work is ready — fee on-chain, donations straight to you.",
    href: "/ideas",
    source: "official",
    tags: ["campaigns", "builders"],
  },
];
/** Idea sparks — real-world BCH campaigns people actually fund */
export const IDEA_SPARKS: IdeaSpark[] = [
  {
    id: "i1",
    title: "Neighborhood BCH onboarding week",
    blurb:
      "Run a 7-day local push: QR flyers, one short workshop, and help 20 neighbors install a wallet and receive their first sats. Budget for prints, venue hour, and a small starter sat pool.",
    tags: ["onboarding", "local", "adoption"],
    seedTitle: "Neighborhood BCH onboarding week",
  },
  {
    id: "i2",
    title: "One-tap BCH pay link for small shops",
    blurb:
      "Build a dead-simple page: shop name, amount, BIP21 button + QR. No account. Shopkeepers share one link on WhatsApp. Raise for hosting, design, and 5 pilot stores.",
    tags: ["payments", "merchants", "tools"],
    seedTitle: "One-tap BCH pay link for small shops",
  },
  {
    id: "i3",
    title: "Monthly BCH cash meetup (3 months)",
    blurb:
      "Three meetups: learn a wallet, practice a live payment, share a success story. Venue + snacks + printed one-pagers. Publish photos and a short recap after each night.",
    tags: ["meetup", "community", "education"],
    seedTitle: "Monthly BCH cash meetup series",
  },
  {
    id: "i4",
    title: "Street-market “Pay with BCH” kit",
    blurb:
      "Laminated signs, table tents, and a 2-minute video for market vendors. Kit + train 10 stalls. Measure how many sales close in BCH the first weekend.",
    tags: ["merchants", "markets", "adoption"],
    seedTitle: "Street-market Pay with BCH kit",
  },
  {
    id: "i5",
    title: "Family remittance demo day",
    blurb:
      "Show families how to send value home in BCH in under 5 minutes. Projector, two phones, printed steps in local language. Goal: 15 successful first sends the same day.",
    tags: ["remittance", "education", "real-world"],
    seedTitle: "Family BCH remittance demo day",
  },
  {
    id: "i6",
    title: "School / club tip-jar for events",
    blurb:
      "Set up a non-custodial tip address + poster for a sports club, open mic, or campus event. Track raised on-chain. Transparent, no middleman, kids see money move live.",
    tags: ["events", "youth", "tips"],
    seedTitle: "School event BCH tip jar",
  },
  {
    id: "i7",
    title: "CashTokens loyalty stamp for a café",
    blurb:
      "Pilot: buy 5 coffees → get a token stamp → 6th free. Simple mint/burn flow the barista can explain. Raise for the tiny app + stickers on the counter.",
    tags: ["cashtokens", "merchants", "loyalty"],
    seedTitle: "Café CashTokens loyalty stamp pilot",
  },
  {
    id: "i8",
    title: "BCH payment cheat-sheet (print + PDF)",
    blurb:
      "One page: install wallet → backup → receive → send. Local language. 500 prints for shops, churches, co-ops. PDF free online so anyone can reprint.",
    tags: ["education", "print", "onboarding"],
    seedTitle: "BCH payment cheat-sheet print run",
  },
];
