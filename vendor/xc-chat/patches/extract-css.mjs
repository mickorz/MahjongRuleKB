// 从参考项目的 styles.css 抽聊天相关子集（不改源文件）
// 全量 383KB 源 / 产物 1.8MB，抽出后约 30KB —— 这是方案 D 能把体积压下来的关键一步。
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const KEEP_PREFIXES = [
  ".work-", ".tool-", ".turn-", ".composer", ".chat-", ".message", ".agent-",
  ".timeline", ".markdown", ".md-", ".lazy-", ".badge", ".c-badge", ".c-btn",
  ".c-content-action", ".icon-", ".shimmer", ".change-count", ".file-diff",
  ".artifact", ".prompt-", ".attachment", ".mono", ".serif",
];
const KEEP_EXACT = new Set([
  ":root", "html", "body", "*", "a", "button", "code", "pre", "ul", "ol", "li",
  "table", "th", "td", "blockquote", "hr", "img", "svg", "summary",
]);

function selectorKept(selector) {
  for (const part of selector.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const base = trimmed.split(" ")[0].split(">")[0].split(":")[0].trim();
    if (KEEP_EXACT.has(base)) return true;
    if (KEEP_PREFIXES.some((prefix) => base.startsWith(prefix))) return true;
  }
  return false;
}

/** 从 i 读取一个 `{ ... }` 块（花括号计数），返回 { head, body, next } */
function readBlock(text, i) {
  const open = text.indexOf("{", i);
  if (open < 0) return null;
  let depth = 0;
  for (let k = open; k < text.length; k += 1) {
    const ch = text[k];
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return { head: text.slice(i, open).trim(), body: text.slice(open + 1, k), next: k + 1 };
    }
  }
  return null;
}

export function extractChatCss(forkDir, outFile) {
  const source = readFileSync(join(forkDir, "src/renderer/styles.css"), "utf8");
  const out = [];
  let i = 0;
  let kept = 0;

  while (i < source.length) {
    const block = readBlock(source, i);
    if (!block) {
      out.push(source.slice(i));
      break;
    }
    const { head, body, next } = block;

    if (head.startsWith("@media") || head.startsWith("@supports")) {
      const inner = [];
      let j = 0;
      while (j < body.length) {
        const nested = readBlock(body, j);
        if (!nested) {
          inner.push(body.slice(j));
          break;
        }
        if (selectorKept(nested.head)) inner.push(`${nested.head}{${nested.body}}`);
        j = nested.next;
      }
      if (inner.length > 0) {
        out.push(`${head}{${inner.join("")}}`);
        kept += 1;
      }
    } else if (head.startsWith("@")) {
      // keyframes / font-face 等全局块保留（体积小且可能被引用）
      out.push(`${head}{${body}}`);
    } else if (selectorKept(head)) {
      out.push(`${head}{${body}}`);
      kept += 1;
    }
    i = next;
  }

  const css = out.join("\n");
  writeFileSync(outFile, css, "utf8");
  return { kept, bytes: Buffer.byteLength(css) };
}
