// 抓取 bishuxiezuo.cn/console/console.html 的完整页面：渲染后 HTML + 全部 JS + 离线可看快照
// 前置：同目录 capture-bishuxiezuo-styles.mjs 已抓过 CSS（落到 style-capture/bishuxiezuo/css）
import { execFileSync } from "node:child_process";
import fs, { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const URL_ = "https://bishuxiezuo.cn/console/console.html";
const ROOT = "dev-examples/style-capture/bishuxiezuo";
const JS_DIR = join(ROOT, "js");
const CSS_DIR = join(ROOT, "css");

const run = (args) => execFileSync("chrome-use", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const evalJson = (expr) => {
  const out = run(["eval", expr]);
  const line = out.split("\n").filter((l) => l.trim().startsWith("{") || l.trim().startsWith("[")).at(-1);
  if (!line) throw new Error(`eval 未返回 JSON：${out.slice(0, 300)}`);
  return JSON.parse(line);
};

/** 与 CSS 抓取保持同一套命名规则，便于把 <link> 指向本地文件 */
const mangle = (href) =>
  href
    .replace(/^https?:\/\//, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .slice(-120);

mkdirSync(JS_DIR, { recursive: true });

console.log("[1/5] 打开页面");
run(["open", URL_]);

console.log("[2/5] 取渲染后的 HTML 与资源清单");
const info = evalJson(`(() => {
  const scripts = [...document.scripts].map(s => ({ src: s.src || null, text: s.src ? "" : (s.textContent || ''), type: s.type || '' }));
  const links = [...document.querySelectorAll('link[rel="stylesheet"]')].map(l => l.href);
  return JSON.stringify({
    url: location.href,
    title: document.title,
    capturedAt: new Date().toISOString(),
    html: document.documentElement.outerHTML,
    scripts,
    links
  });
})()`);

console.log(`      HTML ${(Buffer.byteLength(info.html) / 1024).toFixed(1)} KB；脚本 ${info.scripts.length} 个（外部 ${info.scripts.filter((s) => s.src).length}）`);

writeFileSync(join(ROOT, "rendered.html"), `${info.html}\n`, "utf8");

console.log("[3/5] 保存内联脚本");
const inlineFiles = [];
info.scripts.forEach((s, i) => {
  if (s.src) return;
  if (!s.text.trim()) return;
  const name = `inline-${String(i + 1).padStart(3, "0")}.js`;
  writeFileSync(join(JS_DIR, name), s.text, "utf8");
  inlineFiles.push({ file: `js/${name}`, bytes: Buffer.byteLength(s.text) });
});

console.log("[4/5] 下载全部外部脚本");
const saved = [];
for (const s of info.scripts) {
  if (!s.src) continue;
  const name = mangle(s.src);
  const { existsSync } = await import("node:fs");
  if (existsSync(join(JS_DIR, name))) {
    const bytes = Buffer.byteLength(fs.readFileSync(join(JS_DIR, name)));
    saved.push({ src: s.src, file: `js/${name}`, bytes });
    continue;
  }
  try {
    const res = await fetch(s.src);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    writeFileSync(join(JS_DIR, name), text, "utf8");
    saved.push({ src: s.src, file: `js/${name}`, bytes: Buffer.byteLength(text) });
  } catch (e) {
    saved.push({ src: s.src, file: null, bytes: 0, error: e.message });
  }
}

console.log("[5/5] 生成离线快照与清单");
// 离线快照：保留渲染后 DOM；样式改指本地；去掉脚本（脚本会拉 API 并重渲染，离线必失败）
let offline = info.html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
  .replace(/<script\b[^>]*\/>/gi, "");
// HTML 里的 href 可能是相对路径（如 console.css?v=...），逐个按 URL 解析后换成 ../css 本地文件
const mangleUrl = (u) => u.replace(/^https?:\/\//, "").replace(/[^a-zA-Z0-9._-]+/g, "_").slice(-120);
offline = offline.replace(/href="([^"]+)"/g, (match, rawHref) => {
  if (!/\.css(\?|$)/.test(rawHref)) return match;
  const abs = new URL(rawHref.replace(/&amp;/g, "&"), info.url).href;
  if (/fonts\.googleapis\.com/.test(abs)) return match; // 字体仍走 CDN
  return 'href="../css/' + mangleUrl(abs) + '"';
});
// 补 doctype（渲染后 DOM 不含）
if (!/^<!doctype/i.test(offline)) offline = `<!doctype html>
${offline}`;
offline = offline.replace("<head>", `<head>\n<base href="https://bishuxiezuo.cn/console/" />`);
writeFileSync(join(ROOT, "offline.html"), `${offline}\n`, "utf8");

const manifest = [
  `# 完整页面抓取：${info.title}`,
  "",
  `- 源地址：${info.url}`,
  `- 抓取时间：${info.capturedAt}`,
  `- 渲染后 HTML：${(Buffer.byteLength(info.html) / 1024).toFixed(1)} KB → \`rendered.html\``,
  `- 外部脚本：${saved.length} 个（成功 ${saved.filter((s) => s.file).length}）→ \`js/\``,
  `- 内联脚本：${inlineFiles.length} 个 → \`js/\``,
  `- 样式：见 \`MANIFEST-styles.md\` 与 \`css/\`（${info.links.length} 个外部样式）`,
  `- 离线快照：\`offline.html\`（去掉脚本、样式改本地路径、图片仍走 CDN）`,
  "",
  "## 三个文件的用途",
  "",
  "| 文件 | 用途 |",
  "| --- | --- |",
  "| `rendered.html` | 浏览器渲染后的完整 DOM（含 React 输出），可读结构与文案 |",
  "| `offline.html` | 视觉快照：用本地 CSS 还原当前屏幕，不依赖网络（图片除外） |",
  "| `js/` | 全部脚本原文，可按文件阅读实现（React vendor、业务模块、页面模块） |",
  "",
  "## 脚本清单",
  "",
  "| 源 | 本地文件 | 大小 |",
  "| --- | --- | ---: |",
  ...saved.map((s) => `| ${s.src} | ${s.file ?? "（失败：" + s.error + "）"} | ${s.bytes} |`),
  ...inlineFiles.map((s) => `| (inline) | ${s.file} | ${s.bytes} |`),
  "",
  "## 说明",
  "",
  "- 抓的是**渲染后**的 DOM（React 已执行）；原始 HTML 只有空壳，不含页面内容。",
  "- 业务脚本依赖登录态与后端 API，离线直接运行会失败，因此 `offline.html` 不含脚本。",
  "- 脚本未做格式化（压缩文件如 react.production.min.js 保持原样）。",
].join("\n");

writeFileSync(join(ROOT, "MANIFEST-page.md"), `${manifest}\n`, "utf8");

const totalJs = saved.reduce((a, s) => a + s.bytes, 0);
console.log(`\n完成：${ROOT}`);
console.log(`  rendered.html   ${(Buffer.byteLength(info.html) / 1024).toFixed(1)} KB`);
console.log(`  offline.html    ${(Buffer.byteLength(offline) / 1024).toFixed(1)} KB`);
console.log(`  js/             ${saved.filter((s) => s.file).length + inlineFiles.length} 个文件 / ${(totalJs / 1024).toFixed(1)} KB`);
