/**
 * Donor wall comments — stored in Upstash when configured.
 * Env: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
 */

export type DonorComment = {
  id: string;
  campaignId: string;
  text: string;
  displayName: string;
  txid: string;
  amountSats: number;
  createdAt: string;
};

const KEY = "cashraise:comments";

function url(): string {
  return (process.env.UPSTASH_REDIS_REST_URL || "").trim();
}
function token(): string {
  return (process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();
}

type G = { __cashraiseComments?: DonorComment[] };
function g(): G {
  return globalThis as unknown as G;
}

async function redis(command: (string | number)[]): Promise<unknown> {
  const u = url();
  const t = token();
  if (!u || !t) return null;
  const res = await fetch(u, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${t}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Upstash ${res.status}: ${body}`);
  }
  const data = await res.json();
  return data?.result;
}

async function loadAll(): Promise<DonorComment[]> {
  try {
    if (url() && token()) {
      const raw = await redis(["GET", KEY]);
      if (typeof raw === "string" && raw) {
        const parsed = JSON.parse(raw);
        const list = Array.isArray(parsed) ? parsed : [];
        g().__cashraiseComments = list;
        return list;
      }
      return [];
    }
  } catch (e) {
    console.error("comments loadAll", e);
  }
  return g().__cashraiseComments || [];
}

async function saveAll(list: DonorComment[]): Promise<void> {
  g().__cashraiseComments = list;
  if (url() && token()) {
    await redis(["SET", KEY, JSON.stringify(list)]);
  }
}

export async function getCommentsForCampaign(
  campaignId: string
): Promise<DonorComment[]> {
  const list = await loadAll();
  return list
    .filter((c) => c.campaignId === campaignId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function findCommentByTxid(
  txid: string
): Promise<DonorComment | undefined> {
  const list = await loadAll();
  const t = txid.trim().toLowerCase();
  return list.find((c) => c.txid.toLowerCase() === t);
}

export async function addComment(
  input: Omit<DonorComment, "id" | "createdAt">
): Promise<DonorComment> {
  const list = await loadAll();
  const id =
    "c-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 8);
  const comment: DonorComment = {
    ...input,
    id,
    createdAt: new Date().toISOString(),
  };
  list.push(comment);
  await saveAll(list);
  return comment;
}
