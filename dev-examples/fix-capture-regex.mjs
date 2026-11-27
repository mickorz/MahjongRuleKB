// 一次性补丁 v2：避免在补丁脚本里嵌套模板字符串
import { readFileSync, writeFileSync } from "node:fs";

const path = "dev-examples/capture-bishuxiezuo-page.mjs";
let s = readFileSync(path, "utf8").replace(/\r\n/g, "\n");

const start = s.indexOf("// HTML 里的 href 可能是相对路径");
const end = s.indexOf("// 补 doctype");
if (start < 0 || end < 0) throw new Error("锚点未找到");

const lines = [
  "// HTML 里的 href 可能是相对路径（如 console.css?v=...），逐个按 URL 解析后换成 ../css 本地文件",
  'const mangleUrl = (u) => u.replace(/^https?:\\/\\//, "").replace(/[^a-zA-Z0-9._-]+/g, "_").slice(-120);',
  'offline = offline.replace(/href="([^"]+)"/g, (match, rawHref) => {',
  "  if (!/\\.css(\\?|$)/.test(rawHref)) return match;",
  '  const abs = new URL(rawHref.replace(/&amp;/g, "&"), info.url).href;',
  "  if (/fonts\\.googleapis\\.com/.test(abs)) return match; // 字体仍走 CDN",
  "  return 'href=\"../css/' + mangleUrl(abs) + '\"';",
  "});",
  "",
];

s = s.slice(0, start) + lines.join("\n") + s.slice(end);
writeFileSync(path, s, "utf8");
console.log("已修复（无嵌套模板字符串）");
