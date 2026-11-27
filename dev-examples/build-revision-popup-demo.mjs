// 生成本地「修订记录」浮层复刻页
// 输入：revision-popup.css（从原站 console.css 抽取的 16 条规则）、design-tokens.css
// 输出：revision-popup/{index.html, tokens-subset.css}
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = "dev-examples/style-capture/bishuxiezuo";
const DIR = join(OUT, "revision-popup");
mkdirSync(DIR, { recursive: true });

const popupCss = readFileSync(join(OUT, "revision-popup.css"), "utf8");
const tokensCss = readFileSync(join(OUT, "design-tokens.css"), "utf8");

// 只保留 popup 用到的变量（从 CSS 里抓 var(--x)）
const used = new Set([...popupCss.matchAll(/var\((--[a-z0-9-]+)\)/g)].map((m) => m[1]));
const allVars = new Map();
for (const m of tokensCss.matchAll(/^\s*(--[a-z0-9-]+):\s*(.+);$/gm)) allVars.set(m[1], m[2]);

// 变量可能互相引用，递归展开一层
const resolveVar = (name, seen = new Set()) => {
  const raw = allVars.get(name);
  if (!raw || seen.has(name)) return raw ?? "";
  const ref = /^var\((--[a-z0-9-]+)\)$/.exec(raw.trim());
  if (ref) return resolveVar(ref[1], new Set([...seen, name]));
  return raw;
};

const missing = [...used].filter((v) => !allVars.has(v));
const subset = [
  "/* 仅保留修订浮层所需的变量（从原站 :root 计算值导出） */",
  ":root {",
  ...[...used].filter((v) => allVars.has(v)).map((v) => `  ${v}: ${resolveVar(v)};`),
  "  /* 原站未在 :root 暴露、或由 Tailwind 注入的变量用近似值兜底 */",
  ...missing.map((v) => `  ${v}: ${fallback(v)};`),
  "}",
  "",
].join("\n");

function fallback(name) {
  const map = {
    "--shadow": "rgba(34,29,22,.18)",
    "--gold-wash": "oklch(0.96 0.03 80)",
    "--gold-deep": "oklch(0.62 0.10 72)",
    "--gold-soft": "oklch(0.92 0.045 78)",
    "--terra": "oklch(0.55 0.10 40)",
    "--card": "#FFFFFF",
    "--paper-2": "#F8F4EC",
    "--ink": "#221D16",
    "--ink-2": "#5E5447",
    "--ink-3": "#938979",
    "--serif": '"Noto Serif SC","Songti SC",serif',
    "--sans": '"Noto Sans SC","PingFang SC",system-ui,sans-serif',
    "--latin": '"Newsreader",Georgia,serif',
  };
  return map[name] ?? "#888";
}

writeFileSync(join(DIR, "tokens-subset.css"), subset, "utf8");

const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>修订记录浮层（本地复刻）</title>
<link rel="stylesheet" href="tokens-subset.css" />
<link rel="stylesheet" href="../revision-popup.css" />
<style>
  html, body { margin: 0; height: 100%; }
  body {
    background: #F8F4EC; color: #221D16;
    font: 14px/1.6 "Noto Sans SC", "PingFang SC", system-ui, sans-serif;
    display: grid; place-items: start center; padding: 64px 16px;
  }
  .demo-note { max-width: 620px; margin-bottom: 20px; color: #5E5447; font-size: 12.5px; line-height: 1.7; }
  .demo-note b { color: #221D16; }
  /* 触发器（原站为 .c-content-action.utility） */
  .anchor { position: relative; display: inline-block; }
  .c-content-action {
    display: inline-flex; align-items: center; gap: 6px;
    border: 1px solid rgba(34,29,22,.14); background: #fff; color: #221D16;
    border-radius: 8px; padding: 7px 12px; font: inherit; font-size: 13px; cursor: pointer;
  }
  .c-content-action:hover { border-color: oklch(0.62 0.10 72); color: oklch(0.62 0.10 72); }
  .c-content-action .icon { font-size: 12px; opacity: .8; }
  .demo-frame { background: #FEFCF8; border: 1px solid rgba(34,29,22,.08); border-radius: 12px; padding: 28px 28px 64px; min-height: 360px; }
  .field-label { font-size: 12px; color: #938979; letter-spacing: .04em; margin-bottom: 6px; }
  .field-value { font-family: "Noto Serif SC", "Songti SC", serif; font-size: 15px; line-height: 1.9; max-width: 520px; }
</style>
</head>
<body>
  <div class="demo-note">
    <b>这是本地复刻，不是在线页面。</b>
    浮层样式来自原站 <code>console.css</code> 中 <code>.c-revpop</code> 的 16 条规则（原样抽取，见 <code>../revision-popup.css</code>）；
  DOM 结构按类名语义重建（<code>rv-head / rv-diff / rv-row.old / rv-conn / rv-row.new / rv-why / rv-acts</code>），示例数据为构造值。
  </div>

  <div class="demo-frame">
    <div class="field-label">角色 · 陈烬 · 核心欲望</div>
    <div class="field-value">活下去，并弄清楚自己为什么会记得别人的死。</div>

    <div class="anchor" style="margin-top:18px">
      <button class="c-content-action utility cr-history-trigger" id="trigger" aria-expanded="false">
        <span class="icon">◷</span><span>修订记录</span>
      </button>

      <!-- 浮层：结构与类名按原站 CSS 复原 -->
      <div class="c-revpop" id="revpop" hidden>
        <div class="rv-arrow"></div>
        <div class="rv-head">
          <span class="rv-ad">陈</span>
          <span>核心欲望 · 修订记录</span>
        </div>

        <div class="rv-diff">
          <div class="rv-row old">
            <span class="rv-k">原</span>
            <span class="rv-orig">活下去。</span>
          </div>
          <div class="rv-conn">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6h6M5 3l3 3-3 3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </div>
          <div class="rv-row new">
            <span class="rv-k">新</span>
            <span class="rv-new">活下去，并弄清楚自己为什么会记得别人的死。</span>
          </div>
        </div>

        <div class="rv-why">
          <span class="rv-k">为什么</span>
          <span>原句只给出生存目标，未体现他的记忆异常；本版把「记得别人的死」写进欲望，为后续与鬼医的师徒线留钩子。</span>
        </div>

        <div class="rv-acts">
          <button class="c-content-action" data-act="restore">恢复此版本</button>
          <button class="c-content-action" data-act="close">关闭</button>
        </div>
      </div>
    </div>
  </div>

<script>
  var trigger = document.getElementById('trigger');
  var pop = document.getElementById('revpop');
  function toggle(open) {
    var next = open == null ? pop.hidden : open;
    pop.hidden = !next;
    trigger.setAttribute('aria-expanded', String(next));
  }
  trigger.addEventListener('click', function (e) { e.stopPropagation(); toggle(); });
  pop.addEventListener('click', function (e) {
    var act = e.target.closest('[data-act]');
    if (act) toggle(false);
    e.stopPropagation();
  });
  document.addEventListener('click', function () { toggle(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggle(false); });
</script>
</body>
</html>
`;

writeFileSync(join(DIR, "index.html"), html, "utf8");

const readme = [
  "# 修订记录浮层（本地复刻）",
  "",
  "## 来源",
  "",
  "- 原站：`https://bishuxiezuo.cn/console/console.html`",
  "- 样式：从 `css/bishuxiezuo.cn_console_console.css_v_20261126_df44` 抽取 `.c-revpop` 相关 16 条规则 → `../revision-popup.css`",
  "- 变量：从 `design-tokens.css`（`:root` 计算值）筛出浮层用到的部分 → `tokens-subset.css`，缺失项用近似值兜底",
  "- 组件来源：原站 JS `create.js` 中的 `CreateRevisionHistory` / `RevisionHistoryButton`（触发器类名 `cr-history-trigger`，文案「修订记录」）",
  "- **线上真实浮层 DOM 未抓到**：该按钮只在特定流程状态的屏幕上出现，当前会话里多次尝试未再进入该屏幕；因此 DOM 按 CSS 类名语义重建，样式为原样抽取",
  "- 原站 `.rv-conn svg` 带 `rotate(90deg)`，所以本复刻的源箭头朝右，旋转后朝下",
  "",
  "## 复刻程度",
  "",
  "| 部分 | 保真度 |",
  "| --- | --- |",
  "| 浮层外观（尺寸、圆角、投影、金色描边、箭头、行样式） | **原站 CSS 原样** |",
  "| 配色与字体变量 | 取自原站 `:root` 计算值 |",
  "| DOM 结构与类名 | 按 CSS 选择器语义重建（`rv-head / rv-diff / rv-row.old / rv-conn / rv-row.new / rv-why / rv-acts`） |",
  "| 数据 | 示例值，非线上数据 |",
  "| 交互 | 本地点开/关闭/恢复按钮（不调用后端） |",
  "",
  "## 未复刻的部分",
  "",
  "- 原组件的多资源切换（`config.resources`）、版本列表与详情拉取、恢复确认二次弹窗、国际化文案切换",
  "- 线上浮层的触发位置依赖角色详情头部（`.c-character-header-actions`），该屏幕需要特定流程状态才会出现",
  "",
  "## 预览",
  "",
  "```bash",
  "node dev-examples/serve-snapshot.mjs dev-examples/style-capture/bishuxiezuo 4180",
  "# 打开 http://127.0.0.1:4180/revision-popup/index.html",
  "```",
].join("\n");

writeFileSync(join(DIR, "README.md"), `${readme}\n`, "utf8");

console.log(`已生成：${DIR}`);
console.log(`  tokens-subset.css  ${used.size} 个变量（缺失 ${missing.length} 个已兜底）`);
if (missing.length) console.log("  缺失变量：", missing.join(", "));
