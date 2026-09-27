/**
 * Curated BCH desk + idea sparks.
 * Add news by editing NEWS below (title, your summary, link to original).
 * Tips on /news go to TIPS_ADDRESS (site ops) — not campaign wallets.
 */

export type NewsItem = {
  id: string;
  title: string;
  /** Your short write-up — do not paste full third-party articles */
  summary: string;
  /** Optional short attributed quote */
  excerpt?: string;
  sourceName: string;
  sourceUrl: string;
  tags?: string[];
  publishedAt?: string; // YYYY-MM-DD
};

export type IdeaSpark = {
  id: string;
  title: string;
  blurb: string;
  tags: string[];
  seedTitle?: string;
};

/** Quick X follows / searches (secondary to curated desk) */
export const X_SEARCHES = [
  {
    label: "BCH · $BCH",
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
    href: "https://x.com/search?q=Paytaca&src=typed_query&f=live",
  },
  {
    label: "@TheBCHPodcast",
    href: "https://x.com/TheBCHPodcast",
  },
  {
    label: "CashTokens",
    href: "https://x.com/search?q=CashTokens%20OR%20%22BCH%20DeFi%22&src=typed_query&f=live",
  },
];

/**
 * Curated desk — add items you find relevant.
 * summary = your words; sourceUrl = original; tips fund CashRaise ops.
 */
export const NEWS: NewsItem[] = [
  {
    id: "n1",
    title: "How to use this desk",
    summary:
      "CashRaise publishes short, hand-picked notes on Bitcoin Cash: wallets, merchants, CashTokens, meetups, and tools. Each card links to the original source. Tips on this page support site operations only — campaign donations always go straight to creators.",
    sourceName: "CashRaise",
    sourceUrl: "/about",
    tags: ["desk", "ops"],
    publishedAt: "2026-09-27",
  },
  {
    id: "n2",
    title: "Follow the live BCH conversation",
    summary:
      "For raw signal, track $BCH, #BitcoinCash, and voices like @BitcoinCashOG and @TheBCHPodcast. Use what you learn here to shape campaigns that solve real local problems — onboarding, pay links, meetups.",
    sourceName: "X · BCH",
    sourceUrl:
      "https://x.com/search?q=%24BCH%20OR%20%23BitcoinCash&src=typed_query&f=live",
    tags: ["BCH", "community"],
    publishedAt: "2026-09-27",
  },
  {
    id: "n3",
    title: "CashTokens in the wild",
    summary:
      "Watch builders ship token demos, DeFi experiments, and loyalty ideas on Bitcoin Cash. When a tool is useful enough to fund, turn it into a campaign with a dedicated address and a clear goal.",
    sourceName: "X · CashTokens",
    sourceUrl:
      "https://x.com/search?q=CashTokens%20OR%20Cauldron%20OR%20%22BCH%20DeFi%22&src=typed_query&f=live",
    tags: ["CashTokens", "DeFi", "builders"],
    publishedAt: "2026-09-27",
  },
];

/** Real-world BCH campaigns people actually fund */
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
