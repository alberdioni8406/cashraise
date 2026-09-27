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

/** Idea sparks — users can turn these into campaigns */
export const IDEA_SPARKS: IdeaSpark[] = [
  {
    id: "i1",
    title: "BCH merchant sticker pack",
    blurb:
      "Design printable “Pay with BCH” stickers for local shops. Raise for printing + a small outreach kit.",
    tags: ["merchant", "adoption"],
    seedTitle: "BCH merchant sticker pack",
  },
  {
    id: "i2",
    title: "Open-source CashTokens demo app",
    blurb:
      "Ship a minimal public demo that shows mint / transfer / burn so newcomers can learn by clicking.",
    tags: ["cashtokens", "dev"],
    seedTitle: "Open-source CashTokens demo",
  },
  {
    id: "i3",
    title: "Community translation drive",
    blurb:
      "Translate a BCH wallet or docs into a language your region needs. Budget for editors and review.",
    tags: ["community", "docs"],
    seedTitle: "BCH docs translation drive",
  },
  {
    id: "i4",
    title: "Local BCH meetup series",
    blurb:
      "Three small meetups: venue, snacks, a short talk on non-custodial fundraising. Publish notes after each.",
    tags: ["meetup", "education"],
    seedTitle: "Local BCH meetup series",
  },
  {
    id: "i5",
    title: "Paybutton + tip jar for creators",
    blurb:
      "Template site for writers/podcasters: embed BCH tips, track on-chain, no middleman.",
    tags: ["creators", "tools"],
    seedTitle: "BCH tip jar template for creators",
  },
  {
    id: "i6",
    title: "Explorer UX research",
    blurb:
      "Interview 10 non-technical users on bchexplorer-style sites; publish findings and mockups.",
    tags: ["ux", "research"],
    seedTitle: "BCH explorer UX research",
  },
];
