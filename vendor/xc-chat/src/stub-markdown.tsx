// 轻量 markdown 渲染：替换参考项目的 react-markdown（约 45KB gz）
// 只覆盖助手回答里真正会出现的语法：粗体、行内代码、围栏代码块、无序列表、表格、换行。
// 实现约束：**一次遍历，不修改输入数组**（用下标推进）——
// 之前在 for..of 里 splice 会造成死循环/静默失败，整棵 React 树被卸载。
import * as React from "react";

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inline(text: string): string {
  const escaped = escapeHtml(text);
  const bold = new RegExp("\\*\\*([^*]+)\\*\\*", "g");
  const tick = String.fromCharCode(96);
  const code = new RegExp(tick + "([^" + tick + "]+)" + tick, "g");
  return escaped.replace(bold, "<strong>$1</strong>").replace(code, "<code>$1</code>");
}

const isTableRow = (line: string): boolean => /^\s*\|.*\|\s*$/.test(line);
const isFence = (line: string): boolean => /^```/.test(line.trim());
const bulletOf = (line: string): string | null => /^\s*[-*]\s+(.*)$/.exec(line)?.[1] ?? null;

function cellsOf(row: string): string[] {
  return row.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
}

function tableToHtml(rows: readonly string[]): string {
  const head = cellsOf(rows[0] ?? "");
  const body = rows.slice(2).map(cellsOf);
  const th = head.map((c) => "<th>" + inline(c) + "</th>").join("");
  const trs = body
    .map((r) => "<tr>" + r.map((c) => "<td>" + inline(c) + "</td>").join("") + "</tr>")
    .join("");
  return "<table><thead><tr>" + th + "</tr></thead><tbody>" + trs + "</tbody></table>";
}

function toHtml(text: string): string {
  const lines = text.split(/\r?\n/);
  const out: string[] = [];
  let listOpen = false;
  let inFence = false;

  const closeList = () => {
    if (listOpen) {
      out.push("</ul>");
      listOpen = false;
    }
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";

    if (isFence(line)) {
      if (inFence) {
        out.push("</code></pre>");
        inFence = false;
      } else {
        closeList();
        out.push("<pre><code>");
        inFence = true;
      }
      continue;
    }
    if (inFence) {
      out.push(escapeHtml(line) + "\n");
      continue;
    }

    if (isTableRow(line)) {
      let end = i;
      while (end < lines.length && isTableRow(lines[end] ?? "")) end += 1;
      const rows = lines.slice(i, end);
      if (rows.length >= 2) {
        closeList();
        out.push(tableToHtml(rows));
        i = end - 1;
        continue;
      }
    }

    const bullet = bulletOf(line);
    if (bullet !== null) {
      if (!listOpen) {
        out.push("<ul>");
        listOpen = true;
      }
      out.push("<li>" + inline(bullet) + "</li>");
      continue;
    }

    closeList();
    if (line.trim() === "") continue;
    out.push("<p>" + inline(line) + "</p>");
  }

  closeList();
  if (inFence) out.push("</code></pre>");
  return out.join("");
}

export function MarkdownContent({ text }: { text: string }) {
  const html = React.useMemo(() => toHtml(text ?? ""), [text]);
  return React.createElement("div", {
    className: "markdown-content",
    dangerouslySetInnerHTML: { __html: html },
  });
}

export default MarkdownContent;
