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
  seedTitle?: string;
};

export const X_SEARCHES = [
  {
    label: "Bitcoin Cash",
    href: "https://x.com/search?q=Bitcoin%20Cash%20OR%20%23BCH&src=typed_query&f=live",
  },
  {
    label: "#BCH",
    href: "https://x.com/search?q=%23BCH&src=typed_query&f=live",
  },
  {
    label: "CashTokens",
    href: "https://x.com/search?q=CashTokens%20OR%20%23CashTokens&src=typed_query&f=live",
  },
  {
    label: "eCash vs BCH",
    href: "https://x.com/search?q=%22Bitcoin%20Cash%22%20(upgrade%20OR%20dev%20OR%20wallet)&src=typed_query&f=live",
  },
];

export const NEWS: NewsItem[] = [
  {
    id: "n1",
    title: "Follow live BCH conversation on X",
    summary:
      "Open the live search for Bitcoin Cash and #BCH. Pin what matters to your community and share campaign ideas that fit the moment.",
    href: "https://x.com/search?q=Bitcoin%20Cash%20OR%20%23BCH&src=typed_query&f=live",
    source: "x",
    tags: ["trending", "x"],
  },
  {
    id: "n2",
    title: "CashTokens ecosystem",
    summary:
      "Tokens on Bitcoin Cash power NFTs, stable assets, and app logic. Watch builders share demos and standards discussions.",
    href: "https://x.com/search?q=CashTokens&src=typed_query&f=live",
    source: "x",
    tags: ["cashtokens", "dev"],
  },
  {
    id: "n3",
    title: "Bitcoin Cash node & network",
    summary:
      "Stay current on upgrades, infrastructure, and merchant adoption threads from the BCH community.",
    href: "https://x.com/search?q=%22Bitcoin%20Cash%22%20(node%20OR%20merchant%20OR%20adoption)&src=typed_query&f=live",
    source: "x",
    tags: ["network"],
  },
];

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
