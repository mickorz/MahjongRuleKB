// 抓取 bishuxiezuo.cn 控制台的全部样式，落盘到本地
// 用法：node dev-examples/capture-bishuxiezuo-styles.mjs
// 依赖：chrome-use（已登录目标站点）；样式文件本身多为公开静态资源，用 fetch 直取避免 eval 输出过大
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const URL_ = "https://bishuxiezuo.cn/console/console.html";
const OUT = "dev-examples/style-capture/bishuxiezuo";
const CSS_DIR = join(OUT, "css");

const run = (args) => execFileSync("chrome-use", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

/** chrome-use eval 的 stdout 里除 JSON 外还有横幅行，取最后一个合法 JSON 行 */
function evalJson(expr) {
  const out = run(["eval", expr]);
  const lines = out.split("\n").filter((l) => l.trim().startsWith("{") || l.trim().startsWith("["));
  const last = lines.at(-1);
  if (!last) throw new Error(`eval 未返回 JSON：${out.slice(0, 400)}`);
  return JSON.parse(last);
}

mkdirSync(CSS_DIR, { recursive: true });

console.log("[1/4] 打开页面");
run(["open", URL_]);

console.log("[2/4] 收集样式表与内联样式");
const inventory = evalJson(`(() => {
  const links = [...document.querySelectorAll('link[rel="stylesheet"]')].map(l => l.href);
  const inline = [...document.querySelectorAll('style')].map(s => s.textContent || '');
  const sheets = [...document.styleSheets].map(ss => ({ href: ss.href || '(inline)' }));
  const rootVars = {};
  const cs = getComputedStyle(document.documentElement);
  for (const name of cs) if (name.startsWith('--')) rootVars[name] = cs.getPropertyValue(name).trim();
  return JSON.stringify({
    url: location.href,
    title: document.title,
    capturedAt: new Date().toISOString(),
    viewport: { w: innerWidth, h: innerHeight, dpr: devicePixelRatio },
    fonts: [...document.fonts].map(f => ({ family: f.family, weight: f.weight, style: f.style, status: f.status })),
    links,
    sheets,
    rootVars,
    inlineStyles: inline,
    bodyBaseline: {
      fontFamily: getComputedStyle(document.body).fontFamily,
      fontSize: getComputedStyle(document.body).fontSize,
      lineHeight: getComputedStyle(document.body).lineHeight,
      color: getComputedStyle(document.body).color,
      background: getComputedStyle(document.body).backgroundColor,
    }
  });
})()`);

console.log(`      外部样式 ${inventory.links.length} 个，内联 <style> ${inventory.inlineStyles.length} 个，根变量 ${Object.keys(inventory.rootVars).length} 个`);

console.log("[3/4] 下载外部样式文件");
const downloaded = [];
const combined = [];
for (const href of inventory.links) {
  const name = href
    .replace(/^https?:\/\//, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .slice(-120);
  try {
    const res = await fetch(href);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    writeFileSync(join(CSS_DIR, name), text, "utf8");
    downloaded.push({ href, file: `css/${name}`, bytes: Buffer.byteLength(text) });
    combined.push(`/* ===== ${href} (${Buffer.byteLength(text)} bytes) ===== */\n${text}\n`);
  } catch (e) {
    downloaded.push({ href, file: null, bytes: 0, error: e.message });
  }
}

console.log("[4/4] 写入合并文件与清单");
// 内联样式单独存，并按文档顺序追加到合并文件末尾
inventory.inlineStyles.forEach((text, i) => {
  const file = `inline-${String(i + 1).padStart(2, "0")}.css`;
  writeFileSync(join(CSS_DIR, file), text, "utf8");
  downloaded.push({ href: "(inline style)", file: `css/${file}`, bytes: Buffer.byteLength(text) });
  combined.push(`/* ===== inline <style> #${i + 1} (${Buffer.byteLength(text)} bytes) ===== */\n${text}\n`);
});

writeFileSync(join(OUT, "all.css"), combined.join("\n"), "utf8");

const rootVarsCss = Object.entries(inventory.rootVars)
  .map(([k, v]) => `  ${k}: ${v};`)
  .join("\n");
writeFileSync(join(OUT, "design-tokens.css"), `/* 抓取自 ${inventory.url} 的 :root 计算值 */\n:root {\n${rootVarsCss}\n}\n`, "utf8");

const totalBytes = downloaded.reduce((a, d) => a + d.bytes, 0);
const manifest = [
  `# 样式抓取清单：${inventory.title}`,
  "",
  `- 源地址：${inventory.url}`,
  `- 抓取时间：${inventory.capturedAt}`,
  `- 视口：${inventory.viewport.w}×${inventory.viewport.h} @${inventory.viewport.dpr}x`,
  `- 外部样式：${inventory.links.length} 个；内联 <style>：${inventory.inlineStyles.length} 个`,
  `- 合计：${downloaded.length} 个文件 / ${(totalBytes / 1024).toFixed(1)} KB`,
  "",
  "## body 基线",
  "",
  "```json",
  JSON.stringify(inventory.bodyBaseline, null, 2),
  "```",
  "",
  "## 已加载字体",
  "",
  ...inventory.fonts.map((f) => `- ${f.family} ${f.weight} ${f.style} — ${f.status}`),
  "",
  "## 文件清单",
  "",
  "| 源 | 本地文件 | 大小 |",
  "| --- | --- | ---: |",
  ...downloaded.map((d) => `| ${d.href.startsWith("http") ? d.href : d.href} | ${d.file ?? "（下载失败：" + d.error + "）"} | ${d.bytes} |`),
  "",
  "## 说明",
  "",
  "- `all.css` 按页面加载顺序合并了全部外部样式与内联样式，可直接搜索选择器。",
  "- `css/` 保留每个源文件的原文，便于逐文件比对。",
  "- `design-tokens.css` 是从 `:root` 计算值导出的变量，可能有重复别名。",
  "- 抓取的是**服务器返回的原始 CSS**（未经浏览器插件改写）；字体文件本身未下载。",
].join("\n");

writeFileSync(join(OUT, "MANIFEST.md"), `${manifest}\n`, "utf8");

console.log(`\n完成：${OUT}`);
console.log(`  all.css            ${(Buffer.byteLength(combined.join("\n")) / 1024).toFixed(1)} KB`);
console.log(`  design-tokens.css  ${Object.keys(inventory.rootVars).length} 个变量`);
console.log(`  css/               ${downloaded.filter((d) => d.file).length} 个文件`);
console.log(`  MANIFEST.md        清单`);
