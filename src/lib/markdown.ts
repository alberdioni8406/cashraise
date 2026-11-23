/**
 * Minimal safe markdown → HTML (no external deps).
 * Supports: **bold**, *italic*, `code`, [links](url), headings, lists,
 * paragraphs, GFM tables, blockquotes (callout boxes), horizontal rules.
 *
 * NOTE: Uses string concatenation only (no ${} template literals) so
 * pasting into GitHub cannot strip interpolations.
 */

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(text: string): string {
  var t = escapeHtml(text);
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
  var s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) s = s.slice(0, -1);
  return s.split("|").map(function (c) {
    return c.trim();
  });
}

function isTableSeparator(line: string): boolean {
  var cells = splitCells(line);
  if (cells.length < 2) return false;
  return cells.every(function (c) {
    return /^:?-{3,}:?$/.test(c);
  });
}

function isTableRow(line: string): boolean {
  var t = line.trim();
  if (!t.includes("|")) return false;
  if (isTableSeparator(t)) return true;
  return (
    t.split("|").filter(function (c) {
      return c.trim().length > 0;
    }).length >= 1 &&
    (t.startsWith("|") || t.includes("|"))
  );
}

function alignmentFromSeparator(sep: string): Array<"left" | "center" | "right"> {
  return splitCells(sep).map(function (c) {
    var left = c.startsWith(":");
    var right = c.endsWith(":");
    if (left && right) return "center";
    if (right) return "right";
    return "left";
  });
}

function renderTable(rows: string[]): string {
  if (rows.length < 2) return "";
  var headerCells = splitCells(rows[0]);
  var bodyStart = 1;
  var aligns: Array<"left" | "center" | "right"> = headerCells.map(function () {
    return "left";
  });

  if (rows.length >= 2 && isTableSeparator(rows[1])) {
    aligns = alignmentFromSeparator(rows[1]);
    bodyStart = 2;
  }

  function alignStyle(i: number): string {
    var a = aligns[i] || "left";
    if (a === "left") return "";
    return ' style="text-align:' + a + '"';
  }

  var thead = "<thead><tr>";
  for (var hi = 0; hi < headerCells.length; hi++) {
    thead += "<th" + alignStyle(hi) + ">" + inline(headerCells[hi]) + "</th>";
  }
  thead += "</tr></thead>";

  var bodyRows = rows.slice(bodyStart).filter(function (r) {
    return !isTableSeparator(r);
  });

  var tbody = "";
  if (bodyRows.length > 0) {
    tbody = "<tbody>";
    for (var ri = 0; ri < bodyRows.length; ri++) {
      var cells = splitCells(bodyRows[ri]);
      while (cells.length < headerCells.length) cells.push("");
      tbody += "<tr>";
      for (var ci = 0; ci < headerCells.length; ci++) {
        tbody +=
          "<td" + alignStyle(ci) + ">" + inline(cells[ci] || "") + "</td>";
      }
      tbody += "</tr>";
    }
    tbody += "</tbody>";
  }

  return (
    '<div class="cr-table-wrap"><table class="cr-table">' +
    thead +
    tbody +
    "</table></div>"
  );
}

export function renderMarkdown(src: string): string {
  if (!src) return "";
  var lines = src.replace(/\r\n/g, "\n").split("\n");
  var out: string[] = [];
  var inUl = false;
  var inOl = false;
  var inBq = false;
  var i = 0;

  function closeLists() {
    if (inUl) {
      out.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      out.push("</ol>");
      inOl = false;
    }
  }

  function closeBq() {
    if (inBq) {
      out.push("</blockquote>");
      inBq = false;
    }
  }

  function closeAll() {
    closeLists();
    closeBq();
  }

  while (i < lines.length) {
    var line = lines[i].trimEnd();

    if (!line.trim()) {
      closeAll();
      i++;
      continue;
    }

    // GFM tables
    if (
      isTableRow(line) &&
      i + 1 < lines.length &&
      isTableRow(lines[i + 1].trimEnd())
    ) {
      closeAll();
      var tableLines: string[] = [];
      while (i < lines.length && isTableRow(lines[i].trimEnd())) {
        tableLines.push(lines[i].trimEnd());
        i++;
      }
      if (tableLines.length >= 2) {
        out.push(renderTable(tableLines));
      } else {
        out.push(
          '<p class="my-2 leading-relaxed">' + inline(tableLines[0]) + "</p>"
        );
      }
      continue;
    }

    // horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      closeAll();
      out.push('<hr class="cr-hr" />');
      i++;
      continue;
    }

    // headings ## ###
    var h = line.match(/^(#{1,3})\s+(.+)$/);
    if (h) {
      closeAll();
      var level = h[1].length;
      out.push(
        "<h" +
          level +
          ' class="font-semibold mt-4 mb-2 text-white">' +
          inline(h[2]) +
          "</h" +
          level +
          ">"
      );
      i++;
      continue;
    }

    // blockquote callout
    var bq = line.match(/^>\s?(.*)$/);
    if (bq) {
      closeLists();
      if (!inBq) {
        out.push('<blockquote class="cr-callout">');
        inBq = true;
      }
      if (bq[1].trim()) {
        out.push("<p>" + inline(bq[1]) + "</p>");
      }
      i++;
      continue;
    }

    // unordered list
    var ul = line.match(/^[-*]\s+(.+)$/);
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
      out.push("<li>" + inline(ul[1]) + "</li>");
      i++;
      continue;
    }

    // ordered list
    var ol = line.match(/^\d+\.\s+(.+)$/);
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
      out.push("<li>" + inline(ol[1]) + "</li>");
      i++;
      continue;
    }

    closeAll();
    out.push('<p class="my-2 leading-relaxed">' + inline(line) + "</p>");
    i++;
  }

  closeAll();
  return out.join("\n");
}
