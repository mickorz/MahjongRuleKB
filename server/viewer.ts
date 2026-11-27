// 工作台前端（无构建，单文件）
// 结构：外壳不滚，三栏各自滚动；1px 分隔条可拖拽，比例记忆（S1/S2）
// 视觉：暖纸 + 墨字 + 金点（S1 已换令牌；卡片细化在 S3）
export function viewerHtml(): string {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta http-equiv="cache-control" content="no-store" />
<title>策划工作台</title>
<style>
  :root {
    color-scheme: light;
    /* 暖纸 + 墨字 + 金点（取自参考站 design-tokens） */
    --paper: #FEFCF8;
    --paper-2: #F8F4EB;
    --card: #FFFFFF;
    --ink: #221D16;
    --ink-2: #5E5447;
    --ink-3: #938979;
    --gold: oklch(0.70 0.125 70);
    --gold-deep: oklch(0.56 0.125 58);
    --gold-soft: oklch(0.92 0.045 78);
    --gold-wash: oklch(0.975 0.018 80);
    --sage: oklch(0.52 0.07 150);
    --sage-wash: oklch(0.95 0.028 150);
    --terra: oklch(0.58 0.15 35);
    --line: rgba(34,29,22,.10);
    --line-2: rgba(34,29,22,.055);
    --shadow: rgba(34,29,22,.16);
    --sans: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
    --serif: "Noto Serif SC", "Songti SC", STSong, Georgia, serif;
    --latin: "Newsreader", Georgia, serif;
    --ease: cubic-bezier(.2,.7,.2,1);
    --nav-w: 250px;
  }
  * { box-sizing: border-box; }
  html, body { height: 100%; margin: 0; overflow: hidden; }
  body {
    font: 13px/1.6 var(--sans);
    color: var(--ink);
    background: var(--paper);
    -webkit-font-smoothing: antialiased;
  }
  ::selection { background: color-mix(in srgb, var(--gold) 30%, transparent); }
  .pane { overflow: auto; min-height: 0; scrollbar-width: thin; scrollbar-color: var(--line) transparent; }
  .pane::-webkit-scrollbar { width: 10px; }
  .pane::-webkit-scrollbar-thumb { background: var(--line); border-radius: 8px; border: 3px solid transparent; background-clip: content-box; }

  /* ===== 外壳（S1）===== */
  .app { height: 100dvh; display: flex; flex-direction: column; }

  .app-head {
    flex: 0 0 auto; height: 52px; display: flex; align-items: center; gap: 18px;
    padding: 0 22px; background: var(--paper); border-bottom: 1px solid var(--line);
  }
  .brand { font-weight: 600; font-size: 13px; letter-spacing: .02em; white-space: nowrap; }

  .head-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
  /* 玩法 tab：参考站 .c-tabs{display:flex;gap:4px} / .c-tab{13px;padding:7px 14px;radius:5px}
     active 为墨色实底 + 纸色字（.c-tab.on{background:var(--ink);color:var(--paper)}） */
  .vseg { display: flex; gap: 4px; }
  .vseg button {
    border: none; background: none; cursor: pointer; font: inherit;
    font-size: 13px; padding: 7px 14px; border-radius: 5px; color: var(--ink-2);
    transition: background .18s var(--ease), color .18s var(--ease);
  }
  .vseg button:hover:not(.on) { background: var(--paper-2); color: var(--ink); }
  .vseg button.on { background: var(--ink); color: var(--paper); font-weight: 500; }
  .doc-name { font-size: 12px; color: var(--ink-2); white-space: nowrap; }
  .doc-ver {
    font-size: 11px; color: var(--ink-3); font-variant-numeric: tabular-nums;
    border: 1px solid var(--line); border-radius: 999px; padding: 1px 8px;
  }

  .app-body { flex: 1 1 auto; display: flex; min-height: 0; }
  .pane-nav { flex: 0 0 var(--nav-w); padding: 14px 12px; background: var(--paper-2); border-right: 1px solid var(--line); }
  .pane-main { flex: 1 1 auto; padding: 0; min-width: 0; background: var(--paper); scrollbar-gutter: stable both-edges; }
  /* 参考站 .c-doc：阅读栏 680px 居中 */
  /* 参考站实测：.c-titled-text-body 在 2048 视口下 1003px 宽、13px/1.8、圆角 6、左 3px 语义条 */
  .doc-col { max-width: 1080px; margin: 0 auto; width: 100%; padding: 26px 32px 56px; }

  /* 分隔条：1px 视觉 + 8px 命中区 */
  .splitter { position: relative; flex: 0 0 1px; background: var(--line); cursor: col-resize; touch-action: none; }
  .splitter::before { content: ""; position: absolute; inset-block: 0; inset-inline: -4px; z-index: 5; }
  .splitter:hover, .splitter[data-dragging="true"] { background: var(--gold); }
  .splitter:focus-visible { outline: 2px solid var(--gold-deep); outline-offset: 2px; }

  /* ===== 底栏（S1 先保持信息，S4 再改操作条）===== */
  .app-foot {
    flex: 0 0 auto; height: 56px; display: flex; align-items: center; gap: 16px;
    padding: 0 22px; background: var(--paper); border-top: 1px solid var(--line);
    font-size: 11.5px; color: var(--ink-3);
  }
  .app-foot b { color: var(--ink-2); font-weight: 600; font-variant-numeric: tabular-nums; }
  .foot-actions { margin-left: auto; display: flex; align-items: center; gap: 8px; }
  .foot-count {
    font-size: 11px; font-family: var(--sans); padding: 2px 9px; border-radius: 999px;
    background: var(--gold-wash); border: 1px solid var(--gold-soft); color: var(--gold-deep);
  }
  .foot-actions[hidden] { display: none; }
  .app-foot .warn { color: var(--gold-deep); }
  .app-foot .danger { color: var(--terra); }

  /* ===== 通用排版 ===== */
  .group-label {
    font-size: 10.5px; letter-spacing: .14em; color: var(--ink-3);
    margin: 4px 0 8px; font-weight: 600;
  }
  h1 { font-family: var(--serif); font-size: 20px; margin: 0 0 14px; color: var(--ink); }
  h2 {
    font-size: 11.5px; letter-spacing: .12em; color: var(--ink-2); font-weight: 600;
    margin: 26px 0 10px; padding-bottom: 7px; border-bottom: 1px solid var(--line);
    position: sticky; top: -20px; background: var(--paper); z-index: 2;
  }
  h2:first-of-type { margin-top: 2px; }
  #doc-body { width: 100%; }

  /* 左栏章节条目：参考站 .cr-itemrow
     padding 11px 12px / gap 10px / radius 7 / 未访问 opacity .5 /
     .active 保金边 / .sel 金边 + 2px 金环 */
  .toc { display: flex; flex-direction: column; gap: 7px; }
  .toc-row {
    display: flex; align-items: center; gap: 10px; padding: 11px 12px;
    border: 1px solid var(--line); border-radius: 7px; background: var(--card);
    opacity: .5; cursor: pointer;
    transition: opacity .2s var(--ease), border-color .2s var(--ease), box-shadow .2s var(--ease);
  }
  .toc-row:hover { opacity: 1; border-color: var(--gold-soft); }
  .toc-row.reviewed { opacity: 1; }
  .toc-row.on {
    opacity: 1; border-color: var(--gold-deep); box-shadow: 0 0 0 2px var(--gold-soft);
  }
  .toc-row.on .link { font-weight: 600; color: var(--ink); }
  .toc-mid { flex: 1 1 auto; min-width: 0; }
  .toc-nm {
    display: block; font-size: 13.5px; font-weight: 600; color: var(--ink);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .toc-sub { font-size: 11.5px; color: var(--ink-3); font-weight: 400; margin-top: 2px; }
  .toc-row.reviewed .dot { background: var(--sage); }
  .dot { width: 7px; height: 7px; border-radius: 50%; flex: 0 0 auto; background: var(--line); }
  .dot.reviewed { background: var(--sage); }
  .dot.current { background: var(--gold); }
  button.link {
    background: none; border: none; color: inherit; cursor: pointer; font: inherit;
    font-size: 12.5px; padding: 0; text-align: left; flex: 1 1 auto; min-width: 0;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  button.link:hover { color: var(--gold-deep); }
  button.link:focus-visible { outline: 2px solid var(--gold-deep); outline-offset: 2px; border-radius: 4px; }
  .mini-action {
    font-size: 10.5px; color: var(--ink-3); border: 1px solid var(--line);
    border-radius: 999px; padding: 1px 7px; white-space: nowrap; opacity: 0;
    transition: opacity .15s var(--ease);
  }
  .toc-row:hover .mini-action, .toc-row:focus-within .mini-action { opacity: 1; }

  /* 配置卡：label / value 两列（参考站 .cc-row） */
  /* 配置卡：宽屏两列（参考站 .cr-optgrid 的两栏思路） */
  #doc-body { display: flex; flex-direction: column; }
  .cfgcard {
    margin: 6px 0; padding: 11px 14px; border: 1px solid var(--line); border-radius: 6px;
    background: var(--card);
  }
  .cfg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 8px 12px; margin: 8px 0; }
  .cfg-grid .cfgcard { margin: 0; }
  .cc-row { display: flex; align-items: center; gap: 11px; font-size: 12.5px; min-height: 26px; }
  .cc-row .cl { color: var(--ink-2); flex: none; min-width: 120px; }
  .cc-row .cv { font-size: 12.5px; font-weight: 600; color: var(--ink); margin-left: auto; text-align: right; }
  .cc-row .cv-note { font-size: 11.5px; color: var(--ink-3); }
  .cc-row + .cc-row { border-top: 1px dashed var(--line-2); }

  /* 规则卡：头部（徽章）+ 正文（serif） */
  .seg-foot {
    margin-top: 10px; padding-top: 8px; border-top: 1px dashed var(--line-2);
    font-size: 11px; color: var(--ink-3); font-family: var(--sans);
  }
  .seg-foot-line { display: inline-block; }
  .seg-foot-line.clickable { cursor: pointer; }
  .seg-foot-line.clickable:hover { color: var(--gold-deep); }
  .seg-foot-ev { margin-top: 6px; line-height: 1.7; }

  .findings-box { margin-top: 14px; font-size: 11.5px; }
  .findings-box > summary {
    cursor: pointer; color: var(--ink-3); font-size: 10.5px; letter-spacing: .08em;
    font-family: var(--sans); list-style: none; padding: 4px 0;
  }
  .findings-box > summary::-webkit-details-marker { display: none; }
  .findings-box > summary::before { content: "▸ "; }
  .findings-box[open] > summary::before { content: "▾ "; }

  .seg-head { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; margin-bottom: 6px; font-family: var(--sans); }
  .seg-body { display: block; }
  .seg-body code, .cc-row .cv code {
    font-family: ui-monospace, "JetBrains Mono", Consolas, monospace;
    font-size: .92em; background: var(--paper-2); border: 1px solid var(--line-2);
    border-radius: 4px; padding: 0 4px;
  }

  /* 片段卡片（S3 已细化为两列卡 / 规则卡） */
  .seg {
    margin: 8px 0; padding: 12px 14px; border-radius: 6px;
    border: 1px solid var(--line); border-left: 3px solid var(--line);
    background: var(--card);
    font-family: var(--serif); font-size: 13px; line-height: 1.8; color: var(--ink);
  }
  .seg[data-lineage="modified"] { border-left-color: var(--gold); background: var(--gold-wash); }
  .seg[data-lineage="added"] { border-left-color: var(--sage); background: var(--sage-wash); }
  .seg[data-lineage$="inherited"] { border-left-color: oklch(0.70 0.06 250); }
  .seg:hover { border-color: var(--gold-soft); }
  .badge {
    display: inline-block; font-family: var(--sans); font-size: 10.5px; line-height: 16px;
    padding: 0 7px; border-radius: 999px; border: 1px solid var(--line);
    color: var(--ink-2); background: var(--paper-2); margin-right: 5px; vertical-align: 1px;
    white-space: nowrap;
  }
  /* 彩底卡片上小字提一档对比度 */
  .seg[data-lineage="modified"] .badge,
  .seg[data-lineage="added"] .badge { color: var(--ink); border-color: var(--line); background: var(--card); }
  .locked { opacity: .95; }
  .muted { color: var(--ink-3); font-size: 12px; }
  .warn { color: var(--terra); }

  .editable {
    outline: 1px dashed var(--gold); outline-offset: 4px; border-radius: 4px;
    cursor: text; transition: background .15s var(--ease);
  }
  .editable:hover { background: var(--gold-wash); }
  .editable:focus { outline: 2px solid var(--gold-deep); background: var(--gold-wash); }
  .badge.editable-flag { color: var(--gold-deep); border-color: var(--gold-soft); background: var(--gold-wash); }
  .seg-head .spacer { flex: 1 1 auto; }

  /* 底栏操作按钮（S4） */
  .c-btn {
    font-size: 12px; padding: 5px 14px; border-radius: 7px; cursor: pointer;
    border: 1px solid var(--line); background: var(--card); color: var(--ink);
    transition: border-color .15s var(--ease), color .15s var(--ease), background .15s var(--ease);
  }
  .c-btn:hover { border-color: var(--gold-deep); color: var(--gold-deep); }
  .c-btn.primary { background: var(--gold-deep); border-color: var(--gold-deep); color: #fff; }
  .c-btn.primary:hover { background: var(--gold); border-color: var(--gold); color: #fff; }

  .diffbox {
    font-size: 12px; border: 1px solid var(--line); border-radius: 8px;
    padding: 10px 12px; margin-bottom: 14px; white-space: pre-wrap; background: var(--card);
  }
  .diffbox[hidden] { display: none; }
  .diffbox .before { color: var(--terra); }
  .diffbox .after { color: var(--sage); }

  .sources { font-family: var(--latin), var(--sans); font-size: 11.5px; line-height: 1.75; white-space: pre-wrap; color: var(--ink-2); }
  .checks-row { display: flex; align-items: center; gap: 8px; font-size: 12px; padding: 3px 0; color: var(--ink-2); }
  .dot-badge { width: 7px; height: 7px; border-radius: 50%; background: var(--sage); flex: 0 0 auto; }
  .dot-badge.warning { background: var(--gold); }
  .dot-badge.failed { background: var(--terra); }
  .dot-badge.unknown { background: var(--ink-3); }
  .finding-list { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
  .finding {
    font-size: 11.5px; line-height: 1.5; padding: 6px 8px; border-radius: 7px;
    border: 1px solid var(--line); background: var(--card); color: var(--ink-2);
  }
  .finding-code { font-family: var(--latin); font-size: 10px; color: var(--gold-deep); margin-right: 6px; }

  /* 修订记录浮层（S5） */
  .revpop {
    position: fixed; z-index: 100000; width: 348px; padding: 15px 16px 14px;
    background: var(--card); border: 1px solid var(--gold-soft); border-radius: 8px;
    box-shadow: 0 24px 56px -18px var(--shadow);
  }
  .revpop[hidden] { display: none; }
  /* 浮层在卡片侧边，箭头朝左 */
  .revpop .rv-arrow {
    position: absolute; left: -7px; top: 26px; width: 12px; height: 12px; background: var(--card);
    border-left: 1px solid var(--gold-soft); border-bottom: 1px solid var(--gold-soft);
    transform: rotate(45deg);
  }
  .revpop .rv-head { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 13px; margin-bottom: 12px; }
  .revpop .rv-ad {
    width: 20px; height: 20px; border-radius: 4px; background: var(--gold-deep); color: #fff;
    display: grid; place-items: center; font-family: var(--serif); font-size: 11px; flex: none;
  }
  .revpop .rv-row { display: flex; gap: 9px; font-size: 12.5px; line-height: 1.6; padding: 9px 11px; border-radius: 6px; }
  .revpop .rv-row.old { background: var(--paper-2); }
  .revpop .rv-row.new { background: var(--gold-wash); border: 1px solid var(--gold-soft); }
  .revpop .rv-k { flex: none; width: 30px; font-size: 10.5px; color: var(--ink-3); font-family: var(--latin); font-style: italic; padding-top: 2px; }
  .revpop .rv-orig { color: var(--ink-3); text-decoration: line-through; text-decoration-color: color-mix(in srgb, var(--terra) 70%, transparent); }
  .revpop .rv-new { color: var(--ink); font-weight: 500; }
  .revpop .rv-conn { display: grid; place-items: center; color: var(--gold-deep); height: 16px; }
  .revpop .rv-why { display: flex; gap: 8px; font-size: 11.5px; color: var(--ink-2); background: var(--paper-2); border-radius: 6px; padding: 9px 11px; margin: 10px 0 12px; }
  .revpop .rv-acts { display: flex; justify-content: flex-end; gap: 8px; }
  .seg-head .rev-btn {
    margin-left: auto; border: 1px solid var(--line-2); background: var(--paper-2);
    color: var(--ink-3); border-radius: 999px; padding: 0 8px; font-size: 10.5px; cursor: pointer;
    font-family: var(--sans);
  }
  .seg-head .rev-btn:hover { color: var(--gold-deep); border-color: var(--gold-soft); }

  @media (max-width: 960px) {
    .splitter:last-of-type { display: none; }
  }
</style>
</head>
<body>
<div class="app" data-layout="two-pane">
  <header class="app-head">
    <span class="brand">策划工作台</span>
    <div class="head-right">
      <div class="vseg" id="variants" role="tablist" aria-label="玩法"></div>
      <span class="doc-name" id="doc-name"></span>
      <span class="doc-ver" id="doc-ver"></span>
    </div>
  </header>

  <div class="app-body">
    <nav class="pane pane-nav" id="pane-nav" aria-label="文档导航">
      <div class="group-label">检查摘要</div>
      <div id="checks"></div>
      <details class="findings-box" id="findings-box">
        <summary id="findings-label">检查明细</summary>
        <div id="findings"></div>
      </details>
      <div class="group-label" style="margin-top:16px">章节</div>
      <div class="toc" id="toc"></div>
    </nav>

    <div class="splitter" data-splitter="nav" role="separator" aria-orientation="vertical" aria-label="调整左栏宽度" tabindex="0"></div>

    <main class="pane pane-main" id="pane-main" aria-label="需求文档">
      <div class="diffbox" id="diff-preview" hidden></div>
      <div class="doc-col"><div id="doc-body"><p class="muted">选择玩法</p></div></div>
    </main>


  </div>

  <footer class="app-foot" aria-label="状态栏">
    <span>章节 <b id="st-section">—</b></span>
    <span>段落 <b id="st-segments">—</b></span>
    <span>改动 <b id="st-edits">0</b></span>
    <span>未审 <b id="st-unreviewed">—</b></span>
    <span>检查 <b id="st-checks">—</b></span>
    <span id="st-version"></span>
    <div class="foot-actions" id="foot-actions" hidden>
      <span class="foot-count" id="foot-count">0 处改动</span>
      <button class="c-btn" onclick="previewChanges()">预览改动</button>
      <button class="c-btn primary" onclick="applyChanges()">应用</button>
      <button class="c-btn" onclick="clearDraft()">清空</button>
    </div>
  </footer>
</div>

<div class="revpop" id="revpop" hidden role="dialog" aria-label="修订记录">
  <div class="rv-arrow" id="rv-arrow"></div>
  <div class="rv-head"><span class="rv-ad" id="rv-ad">段</span><span id="rv-title">修订记录</span></div>
  <div class="rv-row old"><span class="rv-k">原</span><span class="rv-orig" id="rv-before"></span></div>
  <div class="rv-conn">↓</div>
  <div class="rv-row new"><span class="rv-k">新</span><span class="rv-new" id="rv-after"></span></div>
  <div class="rv-why"><span class="rv-k">说明</span><span id="rv-why"></span></div>
  <div class="rv-acts"><button class="c-btn" id="rv-close">关闭</button></div>
</div>

<script>
const el = (id) => document.getElementById(id);

/* 显示名映射：界面不出现拼音与 ruleset_id */
const VARIANTS = [
  { key: "hangzhou", label: "杭州", rulesetId: "hangzhou-friends-4p", docName: "杭州好友房" },
  { key: "xiaoshan", label: "萧山", rulesetId: "xiaoshan-friends-4p", docName: "萧山好友房" },
];
const nameOf = (rulesetId) => (VARIANTS.find((v) => v.rulesetId === rulesetId) || {}).docName || "需求文档";

let currentVariant = "xiaoshan";
let currentDoc = null;
let reviewSections = {};
const draft = new Map();

/* ---------- 左栏拖拽（两栏布局只剩一个分隔条）---------- */
const MIN_NAV = 200, MAX_NAV_RATIO = 0.42;
const layoutKey = (v) => "rs-layout:" + v;

function setPaneWidths(navW) {
  const body = document.querySelector(".app-body");
  const total = body ? body.clientWidth : window.innerWidth;
  const nav = Math.max(MIN_NAV, Math.min(navW || 260, total * MAX_NAV_RATIO));
  el("pane-nav").style.flex = "0 0 " + Math.round(nav) + "px";
}
function applyLayout(v) {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(layoutKey(v)) || "null"); } catch {}
  setPaneWidths(saved && saved.nav);
}
function saveLayout() {
  const nav = el("pane-nav").getBoundingClientRect().width;
  try { localStorage.setItem(layoutKey(currentVariant), JSON.stringify({ nav: Math.round(nav) })); } catch {}
}
function bindSplitters() {
  document.querySelectorAll('[data-splitter="nav"]').forEach((splitter) => {
    splitter.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      splitter.dataset.dragging = "true";
      try { splitter.setPointerCapture?.(ev.pointerId); } catch {}
      const start = el("pane-nav").getBoundingClientRect().width;
      const startX = ev.clientX;
      const onMove = (e) => setPaneWidths(start + (e.clientX - startX));
      const onUp = () => {
        splitter.dataset.dragging = "false";
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        saveLayout();
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    });
    splitter.addEventListener("dblclick", () => { setPaneWidths(260); saveLayout(); });
    splitter.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      const nav = el("pane-nav").getBoundingClientRect().width;
      setPaneWidths(nav + (e.key === "ArrowLeft" ? -16 : 16));
      saveLayout();
    });
  });
}

/* ---------- 顶栏：变体分段 + 步骤圆点 ---------- */
function renderVariants() {
  const box = el("variants");
  box.innerHTML = "";
  for (const v of VARIANTS) {
    const b = document.createElement("button");
    b.textContent = v.label;
    b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", String(v.key === currentVariant));
    if (v.key === currentVariant) b.className = "on";
    b.onclick = () => { currentVariant = v.key; renderVariants(); applyLayout(v.key); loadDoc(v.key); };
    box.appendChild(b);
  }
}

/** 当前章节 = 视口内最靠上的 h2 */
function markCurrentStep() {
  const heads = [...document.querySelectorAll("#doc-body h2")];
  const top = el("pane-main").getBoundingClientRect().top + 40;
  let currentId = heads[0]?.id;
  for (const h of heads) {
    if (h.getBoundingClientRect().top <= top) currentId = h.id;
  }
  const secId = (currentId || "").replace(/^sec-/, "");
  // 同步左栏选中态
  document.querySelectorAll(".toc-row").forEach((row) => {
    row.classList.toggle("on", row.dataset.section === secId);
  });
  const idx = currentDoc ? currentDoc.blocks.findIndex((b) => b.section_id === secId) : -1;
  el("st-section").textContent = idx >= 0 ? (idx + 1) + " / " + currentDoc.blocks.length : "—";
}

/** 跳到某章：直接算偏移，不依赖 scrollIntoView / smooth 动画 */
function scrollToSection(sectionId) {
  const main = el("pane-main");
  const h2 = document.getElementById("sec-" + sectionId);
  if (!h2) return;
  const pad = 8;
  main.scrollTop += h2.getBoundingClientRect().top - main.getBoundingClientRect().top - pad;
  markCurrentStep();
}

/* ---------- 文档渲染 ---------- */
let revAnchor = null;

function closeRevpop() {
  const pop = el("revpop");
  if (!pop || pop.hidden) return;
  pop.hidden = true;
  revAnchor = null;
}

function refsLabel(refs) {
  if (!refs || refs.length === 0) return "";
  return "规则 " + refs.slice(0, 3).join("、") + (refs.length > 3 ? " 等" : "");
}

function openRevpop(anchor, seg) {
  const pop = el("revpop");
  const entry = draft.get(seg.segment_id);
  el("rv-before").textContent = seg.text;
  el("rv-after").textContent = entry ? entry.text : "（尚未修改：在卡片里直接改字）";
  el("rv-title").textContent = "修订记录 · " + (seg.lineage === "modified" ? "修改" : "新增") + "片段";
  el("rv-ad").textContent = seg.references.config_refs.length > 0 ? "配" : "规";
  const diffLabel = { candidate: "待确认", confirmed: "已确认", not_applicable: "不适用" }[seg.diff_status] || seg.diff_status;
  el("rv-why").textContent = ["段落 " + seg.segment_id, "差异 " + diffLabel, refsLabel(seg.references.rule_refs)].filter(Boolean).join("　");

  const card = anchor.closest(".seg") || anchor;
  const cardRect = card.getBoundingClientRect();
  const w = 348;
  const gap = 12;
  const margin = 16;
  const popH = pop.offsetHeight || 260;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // 优先放在卡片右侧空余处，不遮住正在看的段落；右侧不够就反过来放左侧
  let left = cardRect.right + gap;
  if (left + w > vw - margin) left = cardRect.left - gap - w;
  if (left < margin) left = Math.max(margin, Math.min(cardRect.left, vw - w - margin));

  // 垂直对齐卡片顶部，超底则上提；始终留边
  let top = Math.min(Math.max(margin, cardRect.top), vh - popH - margin);

  pop.style.left = Math.round(left) + "px";
  pop.style.top = Math.round(top) + "px";
  el("rv-arrow").style.top = Math.round(Math.min(popH - 24, Math.max(14, cardRect.top + 22 - top))) + "px";
  pop.hidden = false;
  revAnchor = anchor;
}

/** 把反引号包裹的片段渲染成行内代码，其余保持纯文本 */
function renderRich(container, text) {
  const parts = String(text).split(/\`([^\`]+)\`/g);
  for (let i = 0; i < parts.length; i += 1) {
    if (!parts[i]) continue;
    if (i % 2 === 1) {
      const code = document.createElement("code");
      code.textContent = parts[i];
      container.appendChild(code);
    } else {
      container.appendChild(document.createTextNode(parts[i]));
    }
  }
}

function badge(text) {
  const span = document.createElement("span");
  span.className = "badge";
  span.textContent = text;
  return span;
}

async function loadDoc(variant) {
  const res = await fetch("/api/doc/" + variant);
  if (!res.ok) {
    el("doc-body").innerHTML = '<p class="warn">文档不存在</p>';
    return;
  }
  const doc = await res.json();
  currentDoc = doc;
  currentVariant = variant;
  draft.clear();
  el("foot-actions").hidden = true;
  el("diff-preview").hidden = true;
  el("doc-name").textContent = nameOf(doc.ruleset_id);
  el("doc-ver").textContent = "v" + doc.document_version;
  el("st-version").textContent = "版本 " + doc.document_version;

  const body = el("doc-body");
  body.innerHTML = "";
  const h1 = document.createElement("h1");
  h1.textContent = nameOf(doc.ruleset_id) + "需求文档";
  body.appendChild(h1);

  const toc = el("toc");
  toc.innerHTML = "";
  let segCount = 0;

  let cfgGrid = null;
  for (const block of doc.blocks) {
    cfgGrid = null;
    const h2 = document.createElement("h2");
    h2.textContent = block.title;
    h2.id = "sec-" + block.section_id;
    body.appendChild(h2);

    const row = document.createElement("div");
    row.className = "toc-row";
    row.dataset.section = block.section_id;
    const dot = document.createElement("span");
    dot.className = "dot";
    row.appendChild(dot);
    const mid = document.createElement("div");
    mid.className = "toc-mid";
    const btn = document.createElement("button");
    btn.className = "link toc-nm";
    btn.textContent = block.title;
    btn.onclick = () => scrollToSection(block.section_id);
    mid.appendChild(btn);
    const sub = document.createElement("div");
    sub.className = "toc-sub";
    sub.textContent = block.segments.length + " 段";
    mid.appendChild(sub);
    row.appendChild(mid);
    const rv = document.createElement("button");
    rv.className = "link mini-action";
    rv.textContent = "标记已审";
    rv.onclick = (ev) => { ev.stopPropagation(); markReviewed("section", block.section_id); };
    // 整行可点：任一空白处也能跳章
    row.onclick = (ev) => {
      if (ev.target.closest(".mini-action")) return;
      scrollToSection(block.section_id);
    };
    row.appendChild(rv);
    toc.appendChild(row);

    for (const seg of block.segments) {
      segCount += 1;
      const isConfig = seg.references.config_refs.length > 0 && seg.references.rule_refs.length === 0;
      const div = document.createElement("div");
      div.dataset.lineage = seg.lineage;

      // 徽章集合（两种卡共用）
      const badges = [];
      if (seg.lineage === "modified") badges.push("修改");
      if (seg.lineage === "added") badges.push("新增");
      if (seg.lineage.endsWith("inherited")) badges.push("继承");
      if (seg.diff_status === "candidate") badges.push("差异待确认");
      if (seg.release_blocker_refs && seg.release_blocker_refs.length) badges.push("待裁决 " + seg.release_blocker_refs.join("、"));
      const isVariantOwn = seg.lineage === "modified" || seg.lineage === "added";
      if (!isVariantOwn) {
        if (!seg.editable) badges.push("数值不可改写");
        badges.push("只读");
      } else if (!seg.editable) {
        badges.push("数值不可改写");
      }

      let p;
      if (isConfig) {
        // 配置：拆成 label / value 两列
        div.className = "cfgcard";
        const row = document.createElement("div");
        row.className = "cc-row";
        const raw = seg.text.replace(/^s+/, "");
        const idx = raw.search(/[：:]/);
        const label = idx > 0 ? raw.slice(0, idx) : raw;
        const value = idx > 0 ? raw.slice(idx + 1).trim() : "";
        const cl = document.createElement("span");
        cl.className = "cl";
        cl.textContent = label;
        row.appendChild(cl);
        if (badges.length) {
          const note = document.createElement("span");
          note.className = "cv-note";
          note.textContent = badges.join(" · ");
          row.appendChild(note);
        }
        const cv = document.createElement("span");
        cv.className = "cv";
        renderRich(cv, value);
        row.appendChild(cv);
        div.appendChild(row);
        // 配置卡不再单独挂 body：p 置为 null，后续逻辑跳过
        p = null;
      } else {
        div.className = "seg" + (seg.editable ? "" : " locked");
        if (badges.length) {
          const head = document.createElement("div");
          head.className = "seg-head";
          for (const b of badges) head.appendChild(badge(b));
          div.appendChild(head);
        }
        p = document.createElement("span");
        p.className = "seg-body";
        renderRich(p, seg.text);
      }
      const editableNow = !isConfig && seg.editable && (seg.lineage === "modified" || seg.lineage === "added");
      if (p && editableNow) {
        p.contentEditable = "true";
        p.className = "editable";
        p.title = "点击即可直接修改这段文字";
        p.spellcheck = false;
        // 头部追加「可编辑」徽章 + 「✎ 修订」按钮
        let head = div.querySelector(".seg-head");
        if (!head) {
          head = document.createElement("div");
          head.className = "seg-head";
          div.insertBefore(head, div.firstChild);
        }
        const flag = badge("可编辑");
        flag.classList.add("editable-flag");
        head.appendChild(flag);
        const revBtn = document.createElement("button");
        revBtn.className = "rev-btn";
        revBtn.textContent = "✎ 修订";
        revBtn.onclick = (ev) => { ev.stopPropagation(); openRevpop(revBtn, seg); };
        head.appendChild(revBtn);
        div.dataset.segId = seg.segment_id;
        p.onblur = () => {
          const next = p.textContent.replace(/^\\s+/, "");
          if (next !== seg.text) markEdited(seg.segment_id, next, seg.text);
        };
      }
      if (p) div.appendChild(p);

      // 来源脚注：规则 / 配置 / 原文证据，默认收起
      const refs = seg.references || {};
      const refBits = [];
      if ((refs.rule_refs || []).length) refBits.push("规则 " + refs.rule_refs.join("、"));
      if ((refs.config_refs || []).length) refBits.push("配置 " + refs.config_refs.join("、"));
      const evidence = refs.source_evidence_refs || [];
      const foot = document.createElement("div");
      foot.className = "seg-foot";
      const summary = document.createElement("span");
      summary.className = "seg-foot-line";
      summary.textContent = refBits.join(" · ") || "无引用";
      foot.appendChild(summary);
      if (evidence.length) {
        const more = document.createElement("div");
        more.className = "seg-foot-ev";
        more.hidden = true;
        more.textContent = "原文证据：" + evidence.join("；");
        foot.appendChild(more);
        summary.classList.add("clickable");
        summary.onclick = (ev) => { ev.stopPropagation(); more.hidden = !more.hidden; };
      }
      div.appendChild(foot);
      if (isConfig) {
        if (!cfgGrid) {
          cfgGrid = document.createElement("div");
          cfgGrid.className = "cfg-grid";
          body.appendChild(cfgGrid);
        }
        cfgGrid.appendChild(div);
      } else {
        cfgGrid = null;
        body.appendChild(div);
      }
    }
  }

  window.__segCount = segCount;
  await loadChecks(variant);
  await loadReviews(variant);
  markCurrentStep();
  updateStatus();
}

async function loadChecks(variant) {
  const box = el("checks");
  box.innerHTML = "";
  let status = "unknown";
  for (const [label, url] of [["质量报告", "/api/checks/"], ["差异告警", "/api/diffs/"]]) {
    const res = await fetch(url + variant);
    if (!res.ok) continue;
    const data = await res.json();
    const row = document.createElement("div");
    row.className = "checks-row";
    const dot = document.createElement("span");
    if (label === "质量报告") {
      status = data.status;
      dot.className = "dot-badge " + (data.status === "failed" ? "failed" : data.status === "warning" ? "warning" : "");
      row.appendChild(dot);
      row.appendChild(Object.assign(document.createElement("span"), {
        textContent: label + "：" + ({ passed: "通过", warning: "警告", failed: "失败" }[data.status] || data.status)
          + "（失败 " + data.summary.failed + " / 警告 " + data.summary.warning + "）",
      }));
    } else {
      const n = (data.findings || []).length;
      dot.className = "dot-badge " + (n ? "warning" : "");
      row.appendChild(dot);
      row.appendChild(Object.assign(document.createElement("span"), { textContent: label + "：" + n + " 条" }));
      box.appendChild(row);
      const list = el("findings");
      list.innerHTML = "";
      el("findings-label").textContent = "检查明细 ×" + (data.findings || []).length;
      // 同 code 的告警聚合成一条：code ×N + 首条说明 + 涉及对象
      const groups = new Map();
      for (const f of data.findings || []) {
        const g = groups.get(f.code) || { code: f.code, items: [] };
        g.items.push(f);
        groups.set(f.code, g);
      }
      for (const g of groups.values()) {
        const item = document.createElement("div");
        item.className = "finding";
        const head = document.createElement("span");
        head.className = "finding-code";
        head.textContent = g.code.replace(/^diff\\./, "") + " ×" + g.items.length;
        const msg = document.createElement("span");
        msg.textContent = g.items[0].message.replace(/^\\S+\\s/, "");
        item.append(head, msg);
        const targets = [...new Set(g.items.flatMap((x) => (x.rule_refs || []).slice(0, 1)))];
        if (targets.length) {
          const t = document.createElement("div");
          t.className = "muted";
          t.style.marginTop = "4px";
          t.textContent = "涉及 " + targets.slice(0, 6).join("、") + (targets.length > 6 ? " 等 " + targets.length + " 条" : "");
          item.appendChild(t);
        }
        list.appendChild(item);
      }
      continue;
    }
    box.appendChild(row);
  }
  el("st-checks").textContent = status === "unknown" ? "—" : ({ passed: "通过", warning: "警告", failed: "失败" }[status] || status);
  el("st-checks").className = status === "failed" ? "danger" : status === "warning" ? "warn" : "";
}

async function loadReviews(variant) {
  const res = await fetch("/api/reviews/" + variant);
  if (!res.ok) { el("st-unreviewed").textContent = "—"; return; }
  const data = await res.json();
  reviewSections = data.sections || {};
  const values = Object.values(reviewSections);
  const unreviewed = values.filter((s) => s !== "reviewed").length;
  el("st-unreviewed").textContent = unreviewed + " / " + values.length;
  // 同步左栏圆点与步骤圆点
  document.querySelectorAll(".toc-row").forEach((row) => {
    const dot = row.querySelector(".dot");
    if (!dot) return;
    dot.className = "dot" + (reviewSections[row.dataset.section] === "reviewed" ? " reviewed" : "");
  });
}

function updateStatus() {
  el("st-segments").textContent = window.__segCount === undefined ? "—" : String(window.__segCount);
  el("st-edits").textContent = String(draft.size);
}

/* ---------- 编辑草稿 ---------- */
function markEdited(segmentId, text, before) {
  draft.set(segmentId, { text, before });
  el("foot-actions").hidden = false;
  el("foot-count").textContent = draft.size + " 处改动";
  el("diff-preview").hidden = true;
  updateStatus();
}

function clearDraft() {
  draft.clear();
  el("foot-actions").hidden = true;
  el("diff-preview").hidden = true;
  loadDoc(currentVariant);
}

async function previewChanges() {
  const box = el("diff-preview");
  box.hidden = false;
  box.innerHTML = "";
  for (const [segmentId, d] of draft) {
    const res = await fetch("/api/proposal", {
      method: "POST",
      headers: { "content-type": "application/json", "x-rule-studio": "1" },
      body: JSON.stringify({
        variant: currentVariant,
        mutation: { target: { segment_id: segmentId }, op: "replace-text", text: d.text, source: "richtext", rationale: "工作台段落编辑" },
      }),
    });
    const data = await res.json();
    const line = document.createElement("div");
    if (!data.ok) {
      line.className = "before";
      line.textContent = segmentId + " 被拒：" + (data.reasons || [data.error]).join("；");
    } else {
      const b = document.createElement("div"); b.className = "before"; b.textContent = "改动前：" + (data.before || "");
      const a = document.createElement("div"); a.className = "after"; a.textContent = "改动后：" + (data.after || "");
      const meta = document.createElement("div"); meta.className = "muted";
      meta.textContent = "基线版本 " + data.base_revision.document_version;
      line.append(b, a, meta);
    }
    box.appendChild(line);
  }
}

async function applyChanges() {
  if (draft.size === 0) return;
  const mutations = [...draft.entries()].map(([segmentId, d]) => ({
    target: { segment_id: segmentId },
    op: "replace-text",
    text: d.text,
    source: "richtext",
    rationale: "工作台段落编辑",
  }));
  const res = await fetch("/api/apply", {
    method: "POST",
    headers: { "content-type": "application/json", "x-rule-studio": "1" },
    body: JSON.stringify({ variant: currentVariant, mutations }),
  });
  const data = await res.json();
  const box = el("diff-preview");
  box.hidden = false;
  if (data.ok) {
    box.textContent = "已应用 " + data.applied + " 处，版本 " + data.documentVersionBefore + " → " + data.documentVersionAfter;
    draft.clear();
    el("foot-actions").hidden = true;
    await loadDoc(currentVariant);
    return;
  }
  box.textContent = "未应用：" + (data.rejected || [data.message || data.error]).map((r) => (r.reasons ? r.reasons.join("；") : r)).join(" | ");
}

async function markReviewed(targetType, targetId) {
  const res = await fetch("/api/review", {
    method: "POST",
    headers: { "content-type": "application/json", "x-rule-studio": "1" },
    body: JSON.stringify({ variant: currentVariant, target: { type: targetType, id: targetId }, status: "reviewed", reviewer: "策划" }),
  });
  const data = await res.json();
  el("sources").textContent = data.ok ? "已标记审查：" + targetId : "标记失败";
  await loadReviews(currentVariant);
}

/* ---------- 启动 ---------- */
document.addEventListener("click", (e) => {
  const pop = el("revpop");
  if (!pop || pop.hidden) return;
  if (e.target.closest("#revpop")) return;
  if (revAnchor && e.target === revAnchor) return;
  closeRevpop();
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeRevpop(); });
el("rv-close").onclick = closeRevpop;

bindSplitters();
renderVariants();
applyLayout(currentVariant);
el("pane-main").addEventListener("scroll", markCurrentStep, { passive: true });
window.addEventListener("resize", () => setPaneWidths(
  el("pane-nav").getBoundingClientRect().width,
));
loadDoc(currentVariant);
</script>
</body>
</html>
`;
}
