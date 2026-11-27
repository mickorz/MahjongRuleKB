// 抓取「世界观 / 角色表 / 故事规划」三个 tab 的渲染结果，生成可切换的离线快照
// 说明：页面由 React 条件渲染，DOM 里只存在当前 tab；静态快照要能切换，必须逐 tab 抓取再本地拼装。
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const URL_ = "https://bishuxiezuo.cn/console/console.html";
const OUT = "dev-examples/style-capture/bishuxiezuo";
const TABS = [
  { key: "world", label: "世界观" },
  { key: "chars", label: "角色表" },
  { key: "story", label: "故事规划" },
];

const run = (args, opts = {}) => execFileSync("chrome-use", args, { encoding: "utf8", maxBuffer: 128 * 1024 * 1024, ...opts });
const evalJson = (expr) => {
  const out = run(["eval", expr]);
  const line = out.split("\n").filter((l) => l.trim().startsWith("{")).at(-1);
  if (!line) throw new Error(`eval 未返回 JSON：${out.slice(0, 300)}`);
  return JSON.parse(line);
};

mkdirSync(OUT, { recursive: true });

console.log("[1/5] 打开页面");
run(["open", URL_]);
await new Promise((r) => setTimeout(r, 2500));

console.log("[2/5] 逐 tab 抓取渲染结果");
const states = [];
for (const [i, tab] of TABS.entries()) {
  try {
    run(["click", `.cr-phasebar .pbi:nth-child(${i + 1})`]);
  } catch (e) {
    console.warn(`    点击 ${tab.label} 失败：${String(e.message).slice(0, 120)}`);
  }
  await new Promise((r) => setTimeout(r, 1500));
  const state = evalJson(`(() => {
    const tabs = [...document.querySelectorAll('.pbi')];
    return JSON.stringify({
      active: tabs.findIndex(t => t.classList.contains('on')),
      root: document.getElementById('root').innerHTML,
      head: document.head.innerHTML,
      title: document.title,
      url: location.href
    });
  })()`);
  states.push({ ...tab, ...state });
  console.log(`    ${tab.label}：active=${state.active}，DOM ${(Buffer.byteLength(state.root) / 1024).toFixed(1)} KB`);
}

console.log("[3/5] 抓一份完整文档外壳（用于 head 与 body 属性）");
const shell = evalJson(`JSON.stringify({
  outer: document.documentElement.outerHTML.length > 0 ? '<html ' + document.documentElement.getAttributeNames().map(n => n + '="' + document.documentElement.getAttribute(n) + '"').join(' ') + '>' : '',
  bodyAttrs: document.body.getAttributeNames().map(n => n + '="' + document.body.getAttribute(n) + '"').join(' '),
  head: document.head.innerHTML,
  title: document.title
})`);

console.log("[4/5] 组装可切换快照");
// 去掉加载动画节点，避免快照里冻结点阵
const stripSpinner = (html) =>
  html
    .replace(/<[^>]*class="[^"]*(?:spinner|loading|lf-dots)[^"]*"[^>]*>[\s\S]*?<\/[a-z]+>/gi, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<script\b[^>]*\/>/gi, "");

// 样式改为本地文件（与 offline.html 一致的命名规则）
const mangleUrl = (u) => u.replace(/^https?:\/\//, "").replace(/[^a-zA-Z0-9._-]+/g, "_").slice(-120);
const rewriteCss = (html) =>
  html.replace(/href="([^"]+)"/g, (match, rawHref) => {
    if (!/\.css(\?|$)/.test(rawHref)) return match;
    const abs = new URL(rawHref.replace(/&amp;/g, "&"), URL_).href;
    if (/fonts\.googleapis\.com/.test(abs)) return match;
    return 'href="../css/' + mangleUrl(abs) + '"';
  });

const panels = states
  .map(
    (s, i) => `<div class="rs-state" data-index="${i}" data-key="${s.key}"${i === 0 ? "" : " hidden"}>
${stripSpinner(s.root)}
</div>`,
  )
  .join("\n");

const styles = `
  .rs-state[hidden] { display: none !important; }
  .rs-tab-switch { position: fixed; left: 8px; bottom: 8px; z-index: 99999; display: flex; gap: 6px;
    padding: 6px 8px; border-radius: 999px; background: rgba(34,29,22,.86); color: #fff;
    font: 12px/1.4 "Noto Sans SC", system-ui, sans-serif; box-shadow: 0 4px 16px rgba(0,0,0,.25); }
  .rs-tab-switch button { border: 1px solid rgba(255,255,255,.35); background: transparent; color: inherit;
    border-radius: 999px; padding: 2px 10px; cursor: pointer; font: inherit; }
  .rs-tab-switch button.on { background: #fff; color: #221D16; border-color: #fff; }
  .rs-tab-switch .hint { opacity: .7; margin-left: 4px; }
`;

const script = `
(function () {
  var states = Array.prototype.slice.call(document.querySelectorAll('.rs-state'));
  var bar = document.querySelector('.rs-tab-switch');
  function show(i) {
    states.forEach(function (s, idx) { s.hidden = idx !== i; });
    Array.prototype.forEach.call(bar.querySelectorAll('button[data-i]'), function (b) {
      b.classList.toggle('on', Number(b.dataset.i) === i);
    });
    // 同步该状态里的 tab 高亮
    var active = states[i];
    var tabs = active.querySelectorAll('.pbi');
    tabs.forEach(function (t, idx) { t.classList.toggle('on', idx === i); });
    window.scrollTo(0, 0);
  }
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-i]');
    if (b) show(Number(b.dataset.i));
  });
  // 页面内的 tab 也能点（点击后切到对应快照）
  document.addEventListener('click', function (e) {
    var pbi = e.target.closest && e.target.closest('.pbi');
    if (!pbi) return;
    var list = Array.prototype.slice.call(pbi.parentElement.children);
    var idx = list.indexOf(pbi);
    if (idx >= 0 && idx < states.length) show(idx);
  });
  show(0);
})();
`;

const head = rewriteCss(shell.head).replace("</title>", "</title>\n<style>" + styles + "</style>");
const html = `<!doctype html>
<html lang="zh-CN">
<head>
${head}
<base href="https://bishuxiezuo.cn/console/" />
</head>
<body ${shell.bodyAttrs}>
${panels}
<div class="rs-tab-switch" role="group" aria-label="快照状态切换">
  ${TABS.map((t, i) => `<button data-i="${i}"${i === 0 ? ' class="on"' : ""}>${t.label}</button>`).join("\n  ")}
  <span class="hint">离线快照</span>
</div>
<script>${script}</script>
</body>
</html>
`;

writeFileSync(join(OUT, "tabbed.html"), html, "utf8");

console.log("[5/5] 写清单");
const manifest = [
  "# 可切换离线快照（tabbed.html）",
  "",
  `- 源地址：${URL_}`,
  `- 抓取时间：${new Date().toISOString()}`,
  `- 抓取状态：${states.map((s) => `${s.label}(active=${s.active}, ${(Buffer.byteLength(s.root) / 1024).toFixed(1)} KB)`).join("；")}`,
  "",
  "## 为什么需要这个文件",
  "",
  "页面由 React **条件渲染**：DOM 里只存在当前 tab 的内容，其余 tab 的内容根本不在文档中。",
  "因此静态快照无法靠切换 class 显示其它 tab —— 必须逐 tab 抓取渲染结果，再在本地按状态切换。",
  "",
  "## 能力与边界",
  "",
  "| 能做 | 不能做 |",
  "| --- | --- |",
  "| 三个 tab 之间切换（左下角按钮或页面内 tab） | 步骤切换（`.cs-t`，会请求后端数据） |",
  "| 完全离线查看样式与文案 | 编辑、抽卡、翻页等任何写操作 |",
  "| 图片/字体走原站 CDN | 需要登录态的接口调用 |",
  "",
  "生成脚本：`dev-examples/capture-bishuxiezuo-tabs.mjs`；预览：`node dev-examples/serve-snapshot.mjs dev-examples/style-capture/bishuxiezuo 4180` 后访问 `/tabbed.html`。",
].join("\n");

writeFileSync(join(OUT, "MANIFEST-tabbed.md"), `${manifest}\n`, "utf8");
console.log(`\n完成：${join(OUT, "tabbed.html")}（${(Buffer.byteLength(html) / 1024).toFixed(1)} KB）`);
