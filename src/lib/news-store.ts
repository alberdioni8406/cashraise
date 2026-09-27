/**
 * Curated news desk — durable via Upstash Redis when configured.
 * Env: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
 * Falls back to in-memory (dev only) if unset.
 */

export type NewsNote = {
  id: string;
  title: string;
  summary: string;
  excerpt?: string;
  sourceName: string;
  sourceUrl: string;
  tags?: string[];
  publishedAt: string;
  createdAt: string;
};

const KEY = "cashraise:news";

function url(): string {
  return (process.env.UPSTASH_REDIS_REST_URL || "").trim();
}
function token(): string {
  return (process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();
}

type G = { __cashraiseNews?: NewsNote[] };
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

async function loadAll(): Promise<NewsNote[]> {
  try {
    if (url() && token()) {
      const raw = await redis(["GET", KEY]);
      if (typeof raw === "string" && raw) {
        const parsed = JSON.parse(raw);
        const list = Array.isArray(parsed) ? parsed : [];
        g().__cashraiseNews = list;
        return list;
      }
      return [];
    }
  } catch (e) {
    console.error("news loadAll", e);
  }
  return g().__cashraiseNews || [];
}

async function saveAll(list: NewsNote[]): Promise<void> {
  g().__cashraiseNews = list;
  if (url() && token()) {
    await redis(["SET", KEY, JSON.stringify(list)]);
  }
}

export async function getNewsNotes(): Promise<NewsNote[]> {
  const list = await loadAll();
  return [...list].sort((a, b) =>
    (b.publishedAt || b.createdAt).localeCompare(a.publishedAt || a.createdAt)
  );
}

export async function addNewsNote(
  note: Omit<NewsNote, "id" | "createdAt"> & { id?: string }
): Promise<NewsNote> {
  const list = await loadAll();
  const id =
    note.id ||
    note.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 48) +
      "-" +
      Date.now().toString(36);
  const full: NewsNote = {
    id,
    title: note.title.trim(),
    summary: note.summary.trim(),
    excerpt: note.excerpt?.trim() || undefined,
    sourceName: note.sourceName.trim(),
    sourceUrl: note.sourceUrl.trim(),
    tags: note.tags?.filter(Boolean),
    publishedAt: note.publishedAt || new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
  };
  await saveAll([full, ...list.filter((n) => n.id !== id)]);
  return full;
}

export async function updateNewsNote(
  id: string,
  patch: Partial<NewsNote>
): Promise<NewsNote | null> {
  const list = await loadAll();
  const idx = list.findIndex((n) => n.id === id);
  if (idx === -1) return null;
  const updated = { ...list[idx], ...patch, id };
  const next = [...list];
  next[idx] = updated;
  await saveAll(next);
  return updated;
}

export async function deleteNewsNote(id: string): Promise<boolean> {
  const list = await loadAll();
  const next = list.filter((n) => n.id !== id);
  if (next.length === list.length) return false;
  await saveAll(next);
  return true;
}

export function newsStorageReady(): boolean {
  return Boolean(url() && token());
}
