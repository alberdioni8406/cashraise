/**
 * Minimal safe markdown → HTML (no external deps).
 * Supports: **bold**, *italic*, `code`, [links](url), headings, lists, paragraphs, line breaks.
 */

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderMarkdown(src: string): string {
  if (!src) return "";
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let inUl = false;
  let inOl = false;

  const closeLists = () => {
    if (inUl) {
      out.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      out.push("</ol>");
      inOl = false;
    }
  };

  const inline = (text: string): string => {
    let t = escapeHtml(text);
    // links [text](url) — only http(s)
    t = t.replace(
      /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-emerald-400 underline">$1</a>'
    );
    // bold **text**
    t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    // italic *text*
    t = t.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
    // inline code
    t = t.replace(
      /`([^`]+)`/g,
      '<code class="bg-zinc-800 px-1 rounded text-sm">$1</code>'
    );
    return t;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      closeLists();
      continue;
    }

    const h = line.match(/^(#{1,3})\s+(.+)$/);
    if (h) {
      closeLists();
      const level = h[1].length;
      out.push(`<h${level} class="font-semibold mt-4 mb-2 text-white">${inline(h[2])}</h${level}>`);
      continue;
    }

    const ul = line.match(/^[-*]\s+(.+)$/);
    if (ul) {
      if (inOl) {
        out.push("</ol>");
        inOl = false;
      }
      if (!inUl) {
        out.push('<ul class="list-disc list-inside space-y-1 my-2">');
        inUl = true;
      }
      out.push(`<li>${inline(ul[1])}</li>`);
      continue;
    }

    const ol = line.match(/^\d+\.\s+(.+)$/);
    if (ol) {
      if (inUl) {
        out.push("</ul>");
        inUl = false;
      }
      if (!inOl) {
        out.push('<ol class="list-decimal list-inside space-y-1 my-2">');
        inOl = true;
      }
      out.push(`<li>${inline(ol[1])}</li>`);
      continue;
    }

    closeLists();
    out.push(`<p class="my-2 leading-relaxed">${inline(line)}</p>`);
  }
  closeLists();
  return out.join("\n");
}
