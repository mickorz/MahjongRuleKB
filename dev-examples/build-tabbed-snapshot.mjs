// 以已知可用的 offline.html 为骨架拼「可切换快照」
// 关键：offline.html 保留了 <html class="lf-tx" data-theme> 与 <body> 属性，
//      主题变量与排版规则挂在这些属性上；只抄 <head> 会导致样式「加载了但不生效」。
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const OUT = "dev-examples/style-capture/bishuxiezuo";
const read = (f) => readFileSync(join(OUT, f), "utf8");

for (const f of ["offline.html", "state-A-world.html", "state-B.html"]) {
  if (!existsSync(join(OUT, f))) throw new Error(`缺少 ${f}`);
}

const offline = read("offline.html");
const stripNoise = (html) =>
  html
    .replace(/<[^>]*class="[^"]*(?:spinner|lf-dots|loading-dots)[^"]*"[^>]*>[\s\S]*?<\/[a-z]+>/gi, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");

// 1) 取 offline.html 的 html / head / body 开标签（含主题与排版依赖的属性）
const htmlTag = offline.match(/<html[^>]*>/i)?.[0];
const headInner = offline.match(/<head>([\s\S]*?)<\/head>/i)?.[1];
const bodyTag = offline.match(/<body[^>]*>/i)?.[0];
if (!htmlTag || !headInner || !bodyTag) throw new Error("offline.html 结构不符，无法提取骨架");

// 2) 抓到的两个状态
const states = [
  { key: "world", label: "世界观", html: stripNoise(read("state-A-world.html")) },
  { key: "later", label: "后续步骤（抓取时）", html: stripNoise(read("state-B.html")) },
];

const extraStyle = `
  <style>
    html, body { margin: 0; }
    .rs-state[hidden] { display: none !important; }
    .rs-hint {
      position: fixed; left: 50%; bottom: 64px; transform: translateX(-50%);
      background: rgba(34,29,22,.9); color: #fff; padding: 8px 14px; border-radius: 10px;
      font: 13px/1.5 "Noto Sans SC", system-ui, sans-serif; opacity: 0; transition: opacity .2s;
      pointer-events: none; z-index: 99999; max-width: 70vw; text-align: center;
    }
    .rs-hint.show { opacity: 1; }
    .rs-bar {
      position: fixed; left: 10px; bottom: 10px; z-index: 99999; display: flex; align-items: center; gap: 6px;
      padding: 6px 10px; border-radius: 999px; background: rgba(34,29,22,.88); color: #fff;
      font: 12px/1.4 "Noto Sans SC", system-ui, sans-serif; box-shadow: 0 6px 20px rgba(0,0,0,.25);
    }
    .rs-bar button {
      border: 1px solid rgba(255,255,255,.35); background: transparent; color: inherit;
      border-radius: 999px; padding: 3px 12px; cursor: pointer; font: inherit;
    }
    .rs-bar button.on { background: #fff; color: #221D16; border-color: #fff; }
    .rs-bar .tag { opacity: .65; padding-left: 4px; }
  </style>
`;

const script = `
<script>
(function () {
  var states = Array.prototype.slice.call(document.querySelectorAll('.rs-state'));
  var bar = document.querySelector('.rs-bar');
  var hint = document.getElementById('rs-hint');
  var timer = null;
  function toast(msg) {
    hint.textContent = msg;
    hint.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(function () { hint.classList.remove('show'); }, 2200);
  }
  function show(i) {
    states.forEach(function (s, idx) { s.hidden = idx !== i; });
    Array.prototype.forEach.call(bar.querySelectorAll('button[data-i]'), function (b) {
      b.classList.toggle('on', Number(b.dataset.i) === i);
    });
    window.scrollTo(0, 0);
  }
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-i]');
    if (b) show(Number(b.dataset.i));
  });
  var MAP = { '世界观': 0, '角色表': 1, '故事规划': 1 };
  document.addEventListener('click', function (e) {
    var tab = e.target.closest && e.target.closest('.pbi, .cs-t, .cr-stepi');
    if (!tab) return;
    e.preventDefault();
    e.stopPropagation();
    var text = (tab.textContent || '').trim().replace(/^\\d+\\s*/, '');
    if (text in MAP) {
      var i = MAP[text];
      show(i);
      toast(i === 1 ? '已切到「后续步骤」快照（抓取时的冻结画面，不是真实生成结果）' : '已切回「世界观」快照');
    } else {
      toast('「' + (text || '该步骤') + '」未抓取：离线快照只含两个状态');
    }
  }, true);
  show(0);
})();
</script>
`;

const absolutizeAssets = (html) =>
  html.replace(/(src|poster)="([^"]+)"/gi, (match, attr, value) => {
    if (/^(https?:|data:|\/\/|\.\.?\/)/i.test(value)) return match;
    return attr + '="https://bishuxiezuo.cn/console/' + value.replace(/^\//, '') + '"';
  });

const html = `<!doctype html>
${htmlTag}
<head>
${headInner}${extraStyle}
</head>
${bodyTag}
${states
  .map(
    (s, i) => `<div class="rs-state" data-index="${i}" data-key="${s.key}"${i === 0 ? "" : " hidden"}>
${absolutizeAssets(s.html)}
</div>`,
  )
  .join("\n")}
<div class="rs-hint" id="rs-hint"></div>
<div class="rs-bar" role="group" aria-label="快照状态切换">
  ${states.map((s, i) => `<button data-i="${i}"${i === 0 ? ' class="on"' : ""}>${s.label}</button>`).join("\n  ")}
  <span class="tag">离线快照</span>
</div>
${script}
</body>
</html>
`;

// 最后再兜底去一次 base：任何来源的 <base> 都会把相对 CSS 解析回线上
const stripBase = (h) => h.split("<base").map((part, i) => (i === 0 ? part : part.slice(part.indexOf(">") + 1))).join("");
const finalHtml = stripBase(html);
writeFileSync(join(OUT, "tabbed.html"), finalHtml, "utf8");
console.log(`tabbed.html 已重建：${(Buffer.byteLength(finalHtml) / 1024).toFixed(1)} KB（base 已移除：${/<base/i.test(finalHtml) ? "否" : "是"}）`);
console.log(`  骨架：${htmlTag.slice(0, 80)}…`);
console.log(`  body：${bodyTag.slice(0, 80)}…`);
