/**
 * Minimal safe markdown → HTML (no external deps).
 * Supports: **bold**, *italic*, `code`, [links](url), headings, lists,
 * paragraphs, GFM tables, blockquotes (callout boxes), horizontal rules.
 */

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(text: string): string {
  let t = escapeHtml(text);
  t = t.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[var(--accent)] underline">$1</a>'
  );
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
  t = t.replace(
    /`([^`]+)`/g,
    '<code class="bg-zinc-800 px-1 rounded text-sm">$1</code>'
  );
  return t;
}

function splitCells(line: string): string[] {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) s = s.slice(0, -1);
  return s.split("|").map((c) => c.trim());
}

function isTableSeparator(line: string): boolean {
  const cells = splitCells(line);
  if (cells.length < 2) return false;
  return cells.every((c) => /^:?-{3,}:?$/.test(c));
}

function isTableRow(line: string): boolean {
  const t = line.trim();
  if (!t.includes("|")) return false;
  if (isTableSeparator(t)) return true;
  return (
    t.split("|").filter((c) => c.trim().length > 0).length >= 1 &&
    (t.startsWith("|") || t.includes("|"))
  );
}

function alignmentFromSeparator(sep: string): ("left" | "center" | "right")[] {
  return splitCells(sep).map((c) => {
    const left = c.startsWith(":");
    const right = c.endsWith(":");
    if (left && right) return "center";
    if (right) return "right";
    return "left";
  });
}

function renderTable(rows: string[]): string {
  if (rows.length < 2) return "";
  const headerCells = splitCells(rows[0]);
  let bodyStart = 1;
  let aligns: ("left" | "center" | "right")[] = headerCells.map(() => "left");

  if (rows.length >= 2 && isTableSeparator(rows[1])) {
    aligns = alignmentFromSeparator(rows[1]);
    bodyStart = 2;
  }

  const alignStyle = (i: number) => {
    const a = aligns[i] || "left";
    return a === "left" ? "" : ` style="text-align:${a}"`;
  };

  const thead =
    "<thead><tr>" +
    headerCells
      .map((c, i) => `<th\( {alignStyle(i)}> \){inline(c)}</th>`)
      .join("") +
    "</tr></thead>";

  const bodyRows = rows.slice(bodyStart).filter((r) => !isTableSeparator(r));
  const tbody =
    bodyRows.length === 0
      ? ""
      : "<tbody>" +
        bodyRows
          .map((row) => {
            const cells = splitCells(row);
            while (cells.length < headerCells.length) cells.push("");
            return (
              "<tr>" +
              headerCells
                .map(
                  (_, i) =>
                    `<td\( {alignStyle(i)}> \){inline(cells[i] || "")}</td>`
                )
                .join("") +
              "</tr>"
            );
          })
          .join("") +
        "</tbody>";

  return `<div class="cr-table-wrap"><table class="cr-table">\( {thead} \){tbody}</table></div>`;
}

export function renderMarkdown(src: string): string {
  if (!src) return "";
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let inUl = false;
  let inOl = false;
  let inBq = false;
  let i = 0;

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

  const closeBq = () => {
    if (inBq) {
      out.push("</blockquote>");
      inBq = false;
    }
  };

  const closeAll = () => {
    closeLists();
    closeBq();
  };

  while (i < lines.length) {
    const line = lines[i].trimEnd();

    if (!line.trim()) {
      closeAll();
      i++;
      continue;
    }

    if (
      isTableRow(line) &&
      i + 1 < lines.length &&
      isTableRow(lines[i + 1].trimEnd())
    ) {
      closeAll();
      const tableLines: string[] = [];
      while (i < lines.length && isTableRow(lines[i].trimEnd())) {
        tableLines.push(lines[i].trimEnd());
        i++;
      }
      if (tableLines.length >= 2) {
        out.push(renderTable(tableLines));
      } else {
        out.push(
          `<p class="my-2 leading-relaxed">${inline(tableLines[0])}</p>`
        );
      }
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      closeAll();
      out.push('<hr class="cr-hr" />');
      i++;
      continue;
    }

    const h = line.match(/^(#{1,3})\s+(.+)$/);
    if (h) {
      closeAll();
      const level = h[1].length;
      out.push(
        `<h\( {level} class="font-semibold mt-4 mb-2 text-white"> \){inline(h[2])}</h${level}>`
      );
      i++;
      continue;
    }

    const bq = line.match(/^>\s?(.*)$/);
    if (bq) {
      closeLists();
      if (!inBq) {
        out.push('<blockquote class="cr-callout">');
        inBq = true;
      }
      if (bq[1].trim()) {
        out.push(`<p>${inline(bq[1])}</p>`);
      }
      i++;
      continue;
    }

    const ul = line.match(/^[-*]\s+(.+)$/);
    if (ul) {
      closeBq();
      if (inOl) {
        out.push("</ol>");
        inOl = false;
      }
      if (!inUl) {
        out.push('<ul class="list-disc list-inside space-y-1 my-2">');
        inUl = true;
      }
      out.push(`<li>${inline(ul[1])}</li>`);
      i++;
      continue;
    }

    const ol = line.match(/^\d+\.\s+(.+)$/);
    if (ol) {
      closeBq();
      if (inUl) {
        out.push("</ul>");
        inUl = false;
      }
      if (!inOl) {
        out.push('<ol class="list-decimal list-inside space-y-1 my-2">');
        inOl = true;
      }
      out.push(`<li>${inline(ol[1])}</li>`);
      i++;
      continue;
    }

    closeAll();
    out.push(`<p class="my-2 leading-relaxed">${inline(line)}</p>`);
    i++;
  }

  closeAll();
  return out.join("\n");
}
