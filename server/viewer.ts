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
    --aside-w: 320px;
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

  /* 步骤圆点：金实心=当前，sage=已审，灰=未审 */
  .steps { display: flex; align-items: center; gap: 2px; min-width: 0; overflow: hidden; }
  .step {
    border: none; background: none; padding: 2px; cursor: pointer; display: grid; place-items: center;
    color: var(--ink-3); font: inherit; font-size: 10px; line-height: 1;
  }
  .step i {
    width: 18px; height: 18px; border-radius: 50%; display: grid; place-items: center;
    border: 1px solid var(--line); background: var(--card); font-style: normal;
    font-variant-numeric: tabular-nums; transition: all .16s var(--ease);
  }
  .step:hover i { border-color: var(--gold); color: var(--gold-deep); }
  .step[data-state="reviewed"] i { background: var(--sage-wash); border-color: var(--sage); color: var(--sage); }
  .step[data-state="current"] i { background: var(--gold); border-color: var(--gold-deep); color: #fff; }
  .step:focus-visible i { outline: 2px solid var(--gold-deep); outline-offset: 2px; }
  .step-sep { width: 10px; height: 1px; background: var(--line); flex: 0 0 auto; }

  .head-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
  .vseg {
    display: inline-flex; padding: 2px; gap: 2px; border-radius: 999px;
    background: var(--paper-2); border: 1px solid var(--line);
  }
  .vseg button {
    border: none; background: none; cursor: pointer; font: inherit; font-size: 12px;
    color: var(--ink); padding: 3px 12px; border-radius: 999px; opacity: .72;
    transition: opacity .15s var(--ease), color .15s var(--ease);
  }
  .vseg button:hover { opacity: 1; color: var(--gold-deep); }
  .vseg button.on { background: var(--card); color: var(--ink); opacity: 1; box-shadow: 0 1px 2px var(--shadow); }
  .doc-name { font-size: 12px; color: var(--ink-2); white-space: nowrap; }
  .doc-ver {
    font-size: 11px; color: var(--ink-3); font-variant-numeric: tabular-nums;
    border: 1px solid var(--line); border-radius: 999px; padding: 1px 8px;
  }

  .app-body { flex: 1 1 auto; display: flex; min-height: 0; }
  .pane-nav { flex: 0 0 var(--nav-w); padding: 14px 12px; background: var(--paper-2); border-right: 1px solid var(--line); }
  .pane-main { flex: 1 1 auto; padding: 20px 28px 56px; min-width: 0; background: var(--paper); }
  .pane-aside { flex: 0 0 var(--aside-w); padding: 14px; background: var(--paper-2); border-left: 1px solid var(--line); }

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
  #doc-body { max-width: 72ch; margin: 0 auto; }

  /* 左栏章节列表（S2 会换成 rail-item 卡片） */
  .toc { display: flex; flex-direction: column; gap: 1px; }
  .toc { gap: 4px; }
  .toc-row {
    display: flex; align-items: center; gap: 9px; padding: 9px 11px;
    border: 1px solid var(--line-2); border-radius: 7px; background: var(--card);
    transition: border-color .16s var(--ease), box-shadow .16s var(--ease);
  }
  .toc-row:hover { border-color: var(--gold-soft); }
  .toc-row.on { border-color: var(--gold-deep); box-shadow: 0 0 0 2px var(--gold-soft); }
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
  .cfgcard {
    margin: 8px 0; padding: 10px 14px; border: 1px solid var(--line); border-radius: 8px;
    background: var(--card);
  }
  .cc-row { display: flex; align-items: center; gap: 11px; font-size: 12.5px; min-height: 26px; }
  .cc-row .cl { color: var(--ink-2); flex: none; min-width: 120px; }
  .cc-row .cv { font-size: 12.5px; font-weight: 600; color: var(--ink); margin-left: auto; text-align: right; }
  .cc-row .cv-note { font-size: 11.5px; color: var(--ink-3); }
  .cc-row + .cc-row { border-top: 1px dashed var(--line-2); }

  /* 规则卡：头部（徽章）+ 正文（serif） */
  .seg-head { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; margin-bottom: 6px; font-family: var(--sans); }
  .seg-body { display: block; }
  .seg-body code, .cc-row .cv code {
    font-family: ui-monospace, "JetBrains Mono", Consolas, monospace;
    font-size: .92em; background: var(--paper-2); border: 1px solid var(--line-2);
    border-radius: 4px; padding: 0 4px;
  }

  /* 片段卡片（S3 已细化为两列卡 / 规则卡） */
  .seg {
    margin: 8px 0; padding: 10px 14px; border-radius: 8px;
    border: 1px solid var(--line); border-left: 3px solid var(--line);
    background: var(--card);
    font-family: var(--serif); font-size: 14.5px; line-height: 1.8; color: var(--ink);
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

  /* 编辑工具条（S4 移到页脚） */
  .toolbar {
    display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
    margin: 0 0 14px; padding: 8px 10px; border-radius: 8px;
    border: 1px solid var(--gold-soft); background: var(--gold-wash);
    position: sticky; top: -20px; z-index: 3;
  }
  .toolbar[hidden] { display: none; }
  .toolbar strong { font-size: 12px; color: var(--gold-deep); }
  .toolbar button, .c-btn {
    font-size: 12px; padding: 4px 12px; border-radius: 7px; cursor: pointer;
    border: 1px solid var(--line); background: var(--card); color: var(--ink);
    transition: border-color .15s var(--ease), color .15s var(--ease);
  }
  .toolbar button:hover, .c-btn:hover { border-color: var(--gold-deep); color: var(--gold-deep); }

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

  @media (max-width: 1100px) {
    .steps { display: none; }
  }
  @media (max-width: 960px) {
    .pane-aside { display: none; }
    .splitter:last-of-type { display: none; }
  }
</style>
</head>
<body>
<div class="app" data-layout="three-pane">
  <header class="app-head">
    <span class="brand">策划工作台</span>
    <div class="steps" id="steps" role="tablist" aria-label="章节进度"></div>
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
      <div class="group-label" style="margin-top:16px">章节</div>
      <div class="toc" id="toc"></div>
    </nav>

    <div class="splitter" data-splitter="nav" role="separator" aria-orientation="vertical" aria-label="调整左栏宽度" tabindex="0"></div>

    <main class="pane pane-main" id="pane-main" aria-label="需求文档">
      <div class="toolbar" id="editor-bar" hidden>
        <strong>编辑草稿</strong>
        <span class="muted" id="edit-count">0 处改动</span>
        <button onclick="previewChanges()">预览改动</button>
        <button onclick="applyChanges()">应用</button>
        <button onclick="clearDraft()">清空</button>
      </div>
      <div class="diffbox" id="diff-preview" hidden></div>
      <div id="doc-body"><p class="muted">选择玩法</p></div>
    </main>

    <div class="splitter" data-splitter="aside" role="separator" aria-orientation="vertical" aria-label="调整右栏宽度" tabindex="0"></div>

    <aside class="pane pane-aside" id="pane-aside" aria-label="信息面板">
      <div class="group-label">来源</div>
      <div id="sources" class="sources">选中一个段落查看它的出处</div>
      <div class="group-label" style="margin-top:18px" id="findings-label">检查明细</div>
      <div id="findings"></div>
    </aside>
  </div>

  <footer class="app-foot" aria-label="状态栏">
    <span>章节 <b id="st-section">—</b></span>
    <span>段落 <b id="st-segments">—</b></span>
    <span>改动 <b id="st-edits">0</b></span>
    <span>未审 <b id="st-unreviewed">—</b></span>
    <span>检查 <b id="st-checks">—</b></span>
    <span id="st-version"></span>
  </footer>
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

/* ---------- 分栏拖拽（S2）---------- */
const MIN_NAV = 180, MIN_ASIDE = 260, MIN_MAIN_RATIO = 0.4;
const layoutKey = (v) => "rs-layout:" + v;

function setPaneWidths(navW, asideW) {
  const body = document.querySelector(".app-body");
  const total = body ? body.clientWidth : window.innerWidth;
  const maxSide = total * (1 - MIN_MAIN_RATIO);
  const nav = Math.max(MIN_NAV, Math.min(navW || 250, maxSide - MIN_ASIDE));
  let aside = Math.max(MIN_ASIDE, Math.min(asideW || 320, maxSide - nav));
  el("pane-nav").style.flex = "0 0 " + Math.round(nav) + "px";
  el("pane-aside").style.flex = "0 0 " + Math.round(aside) + "px";
}
function applyLayout(v) {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(layoutKey(v)) || "null"); } catch {}
  setPaneWidths(saved && saved.nav, saved && saved.aside);
}
function saveLayout() {
  const nav = el("pane-nav").getBoundingClientRect().width;
  const aside = el("pane-aside").getBoundingClientRect().width;
  try { localStorage.setItem(layoutKey(currentVariant), JSON.stringify({ nav: Math.round(nav), aside: Math.round(aside) })); } catch {}
}
function startDrag(side, ev) {
  ev.preventDefault();
  const splitter = ev.currentTarget;
  splitter.dataset.dragging = "true";
  try { splitter.setPointerCapture?.(ev.pointerId); } catch {}
  const navStart = el("pane-nav").getBoundingClientRect().width;
  const asideStart = el("pane-aside").getBoundingClientRect().width;
  const startX = ev.clientX;
  const onMove = (e) => {
    const dx = e.clientX - startX;
    if (side === "nav") setPaneWidths(navStart + dx, asideStart);
    else setPaneWidths(navStart, asideStart - dx);
  };
  const onUp = () => {
    splitter.dataset.dragging = "false";
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    saveLayout();
  };
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}
function bindSplitters() {
  document.querySelectorAll(".splitter").forEach((s) => {
    s.addEventListener("pointerdown", (e) => startDrag(s.dataset.splitter, e));
    s.addEventListener("dblclick", () => { setPaneWidths(250, 320); saveLayout(); });
    s.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      const nav = el("pane-nav").getBoundingClientRect().width;
      const aside = el("pane-aside").getBoundingClientRect().width;
      const step = e.key === "ArrowLeft" ? -16 : 16;
      if (s.dataset.splitter === "nav") setPaneWidths(nav + step, aside);
      else setPaneWidths(nav, aside - step);
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

function renderSteps(doc) {
  const box = el("steps");
  box.innerHTML = "";
  doc.blocks.forEach((block, i) => {
    if (i > 0) {
      const sep = document.createElement("span");
      sep.className = "step-sep";
      box.appendChild(sep);
    }
    const state = reviewSections[block.section_id] === "reviewed" ? "reviewed" : "unreviewed";
    const b = document.createElement("button");
    b.className = "step";
    b.dataset.state = state;
    b.dataset.section = block.section_id;
    b.title = block.title + "（" + (state === "reviewed" ? "已审" : "未审") + "）";
    b.setAttribute("role", "tab");
    b.innerHTML = "<i>" + (i + 1) + "</i>";
    b.onclick = () => {
      const h2 = document.getElementById("sec-" + block.section_id);
      if (h2) h2.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    box.appendChild(b);
  });
  markCurrentStep();
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
  let idx = 0;
  document.querySelectorAll(".step").forEach((s) => {
    if (s.dataset.section === secId) idx = Number(s.textContent) - 1;
    if (s.dataset.state === "current") s.dataset.state = "unreviewed";
  });
  const active = [...document.querySelectorAll(".step")].find((s) => s.dataset.section === secId);
  if (active && active.dataset.state !== "reviewed") active.dataset.state = "current";
  // 同步左栏选中态
  document.querySelectorAll(".toc-row").forEach((row) => {
    row.classList.toggle("on", row.dataset.section === secId);
  });
  el("st-section").textContent = secId ? (idx + 1) + " / " + currentDoc.blocks.length : "—";
}

/* ---------- 文档渲染 ---------- */
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
  el("editor-bar").hidden = true;
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

  for (const block of doc.blocks) {
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
    const btn = document.createElement("button");
    btn.className = "link";
    btn.textContent = block.title;
    btn.onclick = () => h2.scrollIntoView({ behavior: "smooth", block: "start" });
    row.appendChild(btn);
    const rv = document.createElement("button");
    rv.className = "link mini-action";
    rv.textContent = "标记已审";
    rv.onclick = () => markReviewed("section", block.section_id);
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
        // 头部追加「可编辑」徽章，解决"看不出哪里能改"
        const head = div.querySelector(".seg-head");
        if (head) {
          const flag = badge("可编辑");
          flag.classList.add("editable-flag");
          head.appendChild(flag);
        } else {
          const headNew = document.createElement("div");
          headNew.className = "seg-head";
          const flag = badge("可编辑");
          flag.classList.add("editable-flag");
          headNew.appendChild(flag);
          div.insertBefore(headNew, div.firstChild);
        }
        p.onblur = () => {
          const next = p.textContent.replace(/^\\s+/, "");
          if (next !== seg.text) markEdited(seg.segment_id, next);
        };
      }
      if (p) div.appendChild(p);
      div.onclick = (ev) => {
        if (p && ev.target === p && editableNow) return;
        showSources(variant, seg.segment_id);
      };
      body.appendChild(div);
    }
  }

  window.__segCount = segCount;
  await loadChecks(variant);
  await loadReviews(variant);
  renderSteps(doc);
  updateStatus();
}

async function showSources(variant, segmentId) {
  const res = await fetch("/api/segment/" + variant + "/" + segmentId);
  if (!res.ok) { el("sources").textContent = "找不到该段落"; return; }
  const seg = await res.json();
  const 差异 = { not_applicable: "不适用", candidate: "待确认", confirmed: "已确认" }[seg.diff_status] || seg.diff_status;
  const 归属 = { base: "基座", default_inherited: "继承", explicit_inherited: "继承", modified: "修改", added: "新增" }[seg.lineage] || seg.lineage;
  el("sources").textContent = [
    "段落 " + seg.segment_id,
    "章节 " + seg.section_title,
    "归属 " + 归属 + "｜差异 " + 差异,
    "",
    "规则 " + (seg.references.rule_refs.join("、") || "—"),
    "配置 " + (seg.references.config_refs.join("、") || "—"),
    "",
    "原文证据",
    seg.references.source_evidence_refs.join("\\n") || "—",
  ].join("\\n");
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
  if (currentDoc) renderSteps(currentDoc);
}

function updateStatus() {
  el("st-segments").textContent = window.__segCount === undefined ? "—" : String(window.__segCount);
  el("st-edits").textContent = String(draft.size);
}

/* ---------- 编辑草稿 ---------- */
function markEdited(segmentId, text) {
  draft.set(segmentId, { text });
  el("editor-bar").hidden = false;
  el("edit-count").textContent = draft.size + " 处改动";
  el("diff-preview").hidden = true;
  updateStatus();
}

function clearDraft() {
  draft.clear();
  el("editor-bar").hidden = true;
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
    el("editor-bar").hidden = true;
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
bindSplitters();
renderVariants();
applyLayout(currentVariant);
el("pane-main").addEventListener("scroll", markCurrentStep, { passive: true });
window.addEventListener("resize", () => setPaneWidths(
  el("pane-nav").getBoundingClientRect().width,
  el("pane-aside").getBoundingClientRect().width,
));
loadDoc(currentVariant);
</script>
</body>
</html>
`;
}
