// 工作台前端（无构建，单文件）
// 结构（S1/S2）：外壳不滚，三栏各自滚动；1px 分隔条可拖拽，比例记忆。
// 视觉（S6）：深色墨蓝 + 琥珀副色 + 衬线阅读字体，参照 zenstory 工作台的视觉语言（自行实现，未复制代码）。
export function viewerHtml(): string {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta http-equiv="cache-control" content="no-store" />
<title>Rule Studio 需求文档工作台</title>
<style>
  :root {
    color-scheme: dark;
    /* 墨蓝深色底（HSL 三元组，便于统一调透明度） */
    --rs-bg: 225 14% 9%;
    --rs-rail: 225 16% 7%;
    --rs-panel: 225 12% 12.2%;
    --rs-panel-2: 225 10% 16%;
    --rs-line: 220 10% 21%;
    --rs-text: 220 15% 93%;
    --rs-muted: 220 10% 71%;
    --rs-accent: 220 65% 56%;
    --rs-accent-soft: 220 65% 56% / 0.14;
    --rs-modified: 38 85% 58%;
    --rs-modified-soft: 38 85% 58% / 0.12;
    --rs-added: 142 60% 52%;
    --rs-added-soft: 142 60% 52% / 0.12;
    --rs-inherited: 205 70% 60%;
    --rs-inherited-soft: 205 70% 60% / 0.1;
    --rs-danger: 0 80% 66%;
    --rs-font-ui: "Plus Jakarta Sans", "PingFang SC", "Microsoft YaHei", system-ui, -apple-system, sans-serif;
    --rs-font-read: "Songti SC", "STSong", "Noto Serif CJK SC", "Source Han Serif SC", Georgia, serif;
    --rs-font-mono: "JetBrains Mono", ui-monospace, Consolas, "Microsoft YaHei", monospace;
    --nav-w: 250px;
    --aside-w: 320px;
  }
  /* 浅色为可选主题（纸感）；默认深色，对齐 zenstory 工作台 */
  html[data-theme="light"] {
      color-scheme: light;
      --rs-bg: 42 30% 97%;
      --rs-rail: 42 26% 93%;
      --rs-panel: 0 0% 100%;
      --rs-panel-2: 42 24% 94%;
      --rs-line: 42 14% 84%;
      --rs-text: 225 30% 12%;
      --rs-muted: 220 10% 42%;
      --rs-accent: 220 65% 44%;
      --rs-accent-soft: 220 65% 44% / 0.1;
      --rs-modified: 32 84% 42%;
      --rs-modified-soft: 32 84% 42% / 0.1;
      --rs-added: 145 60% 32%;
      --rs-added-soft: 145 60% 32% / 0.1;
      --rs-inherited: 210 70% 40%;
      --rs-inherited-soft: 210 70% 40% / 0.08;
      --rs-danger: 0 72% 46%;
  }
  html[data-theme="light"] { color-scheme: light; }
  * { box-sizing: border-box; }
  html, body { height: 100%; margin: 0; overflow: hidden; }
  body {
    font: 14px/1.6 var(--rs-font-ui);
    color: hsl(var(--rs-text));
    background: hsl(var(--rs-bg));
    -webkit-font-smoothing: antialiased;
  }
  ::selection { background: hsl(var(--rs-accent) / 0.35); }
  /* 滚动条：细，深色下不抢眼 */
  .pane { scrollbar-width: thin; scrollbar-color: hsl(var(--rs-line)) transparent; }
  .pane::-webkit-scrollbar { width: 10px; height: 10px; }
  .pane::-webkit-scrollbar-thumb { background: hsl(var(--rs-line)); border-radius: 8px; border: 3px solid transparent; background-clip: content-box; }

  /* S1：外壳撑满视口且永不滚动 */
  .app { height: 100dvh; display: flex; flex-direction: column; }

  .app-head {
    flex: 0 0 auto; display: flex; align-items: center; gap: 10px;
    padding: 0 16px; height: 44px;
    border-bottom: 1px solid hsl(var(--rs-line));
    background: hsl(var(--rs-rail));
  }
  .app-head .brand { font-weight: 700; letter-spacing: .3px; font-size: 13px; }
  .app-head .brand span { color: hsl(var(--rs-accent)); }
  .app-head .chip {
    font-size: 11px; padding: 2px 8px; border-radius: 999px;
    background: hsl(var(--rs-accent-soft)); color: hsl(var(--rs-accent));
    border: 1px solid hsl(var(--rs-accent) / 0.3);
  }
  .app-head .doc { color: hsl(var(--rs-muted)); font-size: 12px; }
  .theme-toggle {
    margin-left: auto; font: inherit; font-size: 11.5px; cursor: pointer;
    padding: 3px 10px; border-radius: 999px;
    border: 1px solid hsl(var(--rs-line)); background: hsl(var(--rs-panel)); color: hsl(var(--rs-muted));
  }
  .theme-toggle:hover { color: hsl(var(--rs-accent)); border-color: hsl(var(--rs-accent) / 0.6); }

  .app-body { flex: 1 1 auto; display: flex; min-height: 0; }

  .pane { overflow: auto; min-height: 0; }
  .pane-nav {
    flex: 0 0 var(--nav-w); padding: 14px 12px;
    background: hsl(var(--rs-rail));
    border-right: 1px solid hsl(var(--rs-line));
  }
  .pane-main { flex: 1 1 auto; padding: 22px 32px 56px; min-width: 0; background: hsl(var(--rs-bg)); }
  /* 阅读宽度：宽屏下不让正文铺满，按 72ch 约束 */
  #doc-body { max-width: 72ch; margin: 0 auto; }
  .pane-aside {
    flex: 0 0 var(--aside-w); padding: 14px;
    background: hsl(var(--rs-rail));
    border-left: 1px solid hsl(var(--rs-line));
  }

  /* S2：1px 视觉 + 8px 命中区 */
  .splitter { position: relative; flex: 0 0 1px; background: hsl(var(--rs-line)); cursor: col-resize; touch-action: none; }
  .splitter::before { content: ""; position: absolute; inset-block: 0; inset-inline: -4px; z-index: 5; }
  .splitter:hover, .splitter[data-dragging="true"] { background: hsl(var(--rs-accent)); box-shadow: 0 0 0 1px hsl(var(--rs-accent) / 0.5); }
  .splitter:focus-visible { outline: 2px solid hsl(var(--rs-accent)); outline-offset: 2px; }

  .app-foot {
    flex: 0 0 auto; display: flex; flex-wrap: wrap; gap: 8px 18px; align-items: center;
    padding: 0 16px; height: 34px;
    border-top: 1px solid hsl(var(--rs-line));
    background: hsl(var(--rs-rail));
    font-size: 11.5px; color: hsl(var(--rs-muted));
  }
  .app-foot b { color: hsl(var(--rs-text)); font-weight: 600; font-variant-numeric: tabular-nums; }
  .app-foot .danger { color: hsl(var(--rs-danger)); }
  .app-foot .warn { color: hsl(var(--rs-modified)); }

  /* 信息层级 */
  .group-label {
    font-size: 10.5px; letter-spacing: .14em; text-transform: uppercase;
    color: hsl(var(--rs-muted)); margin: 4px 0 8px; font-weight: 600;
  }
  h1 { font-family: var(--rs-font-read); font-size: 22px; margin: 0 0 18px; letter-spacing: .2px; }
  h2 {
    font-size: 12px; letter-spacing: .12em; text-transform: uppercase;
    color: hsl(var(--rs-text) / 0.82); font-weight: 600;
    margin: 30px 0 10px; padding-bottom: 6px;
    border-bottom: 1px solid hsl(var(--rs-line));
    position: sticky; top: -22px; background: hsl(var(--rs-bg)); z-index: 2;
  }
  h2:first-of-type { margin-top: 6px; }
  .toc { display: flex; flex-direction: column; gap: 1px; }
  .toc-row { display: flex; align-items: baseline; justify-content: space-between; gap: 6px; border-radius: 6px; padding: 3px 4px; }
  .toc-row:hover { background: hsl(var(--rs-panel)); }

  button.link {
    background: none; border: none; color: inherit; cursor: pointer;
    font: inherit; font-size: 13px; padding: 2px 0; text-align: left;
    border-bottom: 1px solid transparent;
  }
  button.link:hover { color: hsl(var(--rs-accent)); border-bottom-color: hsl(var(--rs-accent) / 0.5); }
  .toc-row button.link { border-bottom: none; }
  button.link:focus-visible { outline: 2px solid hsl(var(--rs-accent)); outline-offset: 2px; border-radius: 4px; }
  .mini-action {
    font-size: 10.5px !important; color: hsl(var(--rs-muted));
    border: 1px solid hsl(var(--rs-line)); border-radius: 999px; padding: 1px 7px !important;
    white-space: nowrap;
  }
  .mini-action:hover { color: hsl(var(--rs-accent)); border-color: hsl(var(--rs-accent) / 0.6); }

  /* 片段卡片 */
  .seg {
    margin: 8px 0; padding: 10px 14px; border-radius: 10px;
    border: 1px solid hsl(var(--rs-line));
    border-left: 3px solid hsl(var(--rs-line));
    background: hsl(var(--rs-panel));
    font-family: var(--rs-font-read);
    font-size: 14.5px; line-height: 1.8;
    color: hsl(var(--rs-text));
  }
  .seg[data-lineage="modified"] { border-left-color: hsl(var(--rs-modified)); background: hsl(var(--rs-modified-soft)); }
  .seg[data-lineage="added"] { border-left-color: hsl(var(--rs-added)); background: hsl(var(--rs-added-soft)); }
  .seg[data-lineage$="inherited"] { border-left-color: hsl(var(--rs-inherited)); background: hsl(var(--rs-inherited-soft)); }
  .seg:hover { border-color: hsl(var(--rs-accent) / 0.35); }
  .badge {
    display: inline-block; font-family: var(--rs-font-ui);
    font-size: 10.5px; line-height: 16px; padding: 0 7px; border-radius: 999px;
    border: 1px solid hsl(var(--rs-line) / 1.4); color: hsl(var(--rs-text) / 0.86);
    margin-right: 5px; vertical-align: 1px; white-space: nowrap;
  }
  .seg[data-lineage="modified"] > .badge:first-child { color: hsl(var(--rs-modified)); border-color: hsl(var(--rs-modified) / 0.5); }
  .seg[data-lineage="added"] > .badge:first-child { color: hsl(var(--rs-added)); border-color: hsl(var(--rs-added) / 0.5); }
  .seg[data-lineage$="inherited"] > .badge:first-child { color: hsl(var(--rs-inherited)); border-color: hsl(var(--rs-inherited) / 0.5); }
  .locked { opacity: .92; }
  .muted { color: hsl(var(--rs-muted)); font-size: 12px; }
  .warn { color: hsl(var(--rs-danger)); }

  .editable {
    outline: 1px dashed hsl(var(--rs-modified) / 0.5); outline-offset: 3px; border-radius: 4px;
  }
  .editable:focus { outline: 2px solid hsl(var(--rs-modified)); background: hsl(var(--rs-modified) / 0.06); }

  /* 工具栏与 Diff */
  .toolbar {
    display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
    margin: 0 0 14px; padding: 8px 10px;
    border: 1px solid hsl(var(--rs-accent) / 0.3); border-radius: 10px;
    background: hsl(var(--rs-accent-soft));
    position: sticky; top: -22px; z-index: 3;
    backdrop-filter: blur(6px);
  }
  .toolbar[hidden] { display: none; }
  .toolbar strong { font-size: 12px; }
  .toolbar button {
    font-size: 12px; padding: 4px 12px; border-radius: 8px; cursor: pointer;
    border: 1px solid hsl(var(--rs-line)); background: hsl(var(--rs-panel)); color: hsl(var(--rs-text));
  }
  .toolbar button:hover { border-color: hsl(var(--rs-accent)); color: hsl(var(--rs-accent)); }
  .toolbar button:first-of-type { border-color: hsl(var(--rs-accent) / 0.6); }

  .diffbox {
    font-family: var(--rs-font-ui); font-size: 12px;
    border: 1px solid hsl(var(--rs-line)); border-radius: 10px;
    padding: 10px 12px; margin-bottom: 14px; white-space: pre-wrap;
    background: hsl(var(--rs-panel));
  }
  .diffbox[hidden] { display: none; }
  .diffbox .before { color: hsl(var(--rs-danger)); }
  .diffbox .after { color: hsl(var(--rs-added)); }

  .sources { font-family: var(--rs-font-mono); font-size: 11.5px; line-height: 1.75; white-space: pre-wrap; color: hsl(var(--rs-muted)); }
  .checks-row { display: flex; align-items: center; gap: 8px; font-size: 12px; padding: 3px 0; }
  .dot { width: 7px; height: 7px; border-radius: 50%; flex: 0 0 auto; background: hsl(var(--rs-added)); }
  .dot.warning { background: hsl(var(--rs-modified)); }
  .dot.failed { background: hsl(var(--rs-danger)); }
  .dot.unknown { background: hsl(var(--rs-muted)); }
  .finding-list { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
  .finding {
    font-size: 11.5px; line-height: 1.5; padding: 6px 8px; border-radius: 8px;
    border: 1px solid hsl(var(--rs-line)); background: hsl(var(--rs-panel));
    color: hsl(var(--rs-text) / 0.82);
  }
  .finding-code {
    display: inline-block; font-family: var(--rs-font-mono); font-size: 10px;
    color: hsl(var(--rs-modified)); margin-right: 6px;
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
    <span class="brand">Rule <span>Studio</span></span>
    <span class="chip" id="build-tag">UI v4</span>
    <span class="doc" id="doc-title"></span>
    <button class="theme-toggle" id="theme-toggle" title="切换深浅色" aria-label="切换深浅色">主题</button>
  </header>

  <div class="app-body">
    <nav class="pane pane-nav" id="pane-nav" aria-label="文档导航">
      <div class="group-label">文档</div>
      <div id="variants"></div>
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
      <div id="doc-body"><p class="muted">选择左侧文档</p></div>
    </main>

    <div class="splitter" data-splitter="aside" role="separator" aria-orientation="vertical" aria-label="调整右栏宽度" tabindex="0"></div>

    <aside class="pane pane-aside" id="pane-aside" aria-label="信息面板">
      <div class="group-label">检查</div>
      <div id="checks"></div>
      <div class="group-label" style="margin-top:16px">来源</div>
      <div id="sources" class="sources">点击段落查看来源</div>
    </aside>
  </div>

  <footer class="app-foot" aria-label="状态栏">
    <span>段落 <b id="st-segments">—</b></span>
    <span>改动 <b id="st-edits">0</b></span>
    <span>未审章节 <b id="st-unreviewed">—</b></span>
    <span>检查 <b id="st-checks">—</b></span>
    <span id="st-version"></span>
  </footer>
</div>

<script>
const el = (id) => document.getElementById(id);
const variants = ["hangzhou", "xiaoshan"];
let currentVariant = "xiaoshan";
const draft = new Map();

/* ---------- S2：分栏拖拽 ---------- */
const MIN_NAV = 180;
const MIN_ASIDE = 260;
const MIN_MAIN_RATIO = 0.4;

const layoutKey = (variant) => "rs-layout:" + variant;

function applyLayout(variant) {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(layoutKey(variant)) || "null"); } catch { saved = null; }
  setPaneWidths(saved && saved.nav, saved && saved.aside);
}

function setPaneWidths(navW, asideW) {
  const body = document.querySelector(".app-body");
  const total = body ? body.clientWidth : window.innerWidth;
  const maxSide = total * (1 - MIN_MAIN_RATIO);
  const nav = Math.max(MIN_NAV, Math.min(navW || 250, maxSide - MIN_ASIDE));
  let aside = Math.max(MIN_ASIDE, Math.min(asideW || 320, maxSide - nav));
  el("pane-nav").style.flex = "0 0 " + Math.round(nav) + "px";
  el("pane-aside").style.flex = "0 0 " + Math.round(aside) + "px";
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
    updateStatus();
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

/* ---------- 文档渲染 ---------- */
function badge(text) {
  const span = document.createElement("span");
  span.className = "badge";
  span.textContent = text;
  return span;
}

async function loadDoc(variant) {
  const res = await fetch("/api/doc/" + variant);
  if (!res.ok) {
    el("doc-body").innerHTML = '<p class="warn">文档不存在：' + variant + "</p>";
    return;
  }
  const doc = await res.json();
  currentVariant = variant;
  draft.clear();
  el("editor-bar").hidden = true;
  el("diff-preview").hidden = true;
  el("doc-title").textContent = doc.ruleset_id + " · v" + doc.document_version;
  el("st-version").textContent = "文档版本 " + doc.document_version;

  const body = el("doc-body");
  body.innerHTML = "";
  const h1 = document.createElement("h1");
  h1.textContent = doc.ruleset_id;
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
      const div = document.createElement("div");
      div.className = "seg" + (seg.editable ? "" : " locked");
      div.dataset.lineage = seg.lineage;
      if (seg.lineage === "modified") div.appendChild(badge("修改"));
      if (seg.lineage === "added") div.appendChild(badge("新增"));
      if (seg.lineage.endsWith("inherited")) div.appendChild(badge("继承"));
      if (seg.diff_status === "candidate") div.appendChild(badge("差异待确认"));
      if (seg.release_blocker_refs && seg.release_blocker_refs.length) div.appendChild(badge("待裁决 " + seg.release_blocker_refs.join("、")));
      if (!seg.editable) div.appendChild(badge("数值·不可改写"));
      if (!seg.editable || seg.lineage.endsWith("inherited") || seg.lineage === "base") div.appendChild(badge("只读"));

      const p = document.createElement("span");
      p.textContent = " " + seg.text;
      const editableNow = seg.editable && (seg.lineage === "modified" || seg.lineage === "added");
      if (editableNow) {
        p.contentEditable = "true";
        p.className = "editable";
        p.spellcheck = false;
        p.onblur = () => {
          const next = p.textContent.replace(/^\\s+/, "");
          if (next !== seg.text) markEdited(seg.segment_id, next);
        };
      }
      div.appendChild(p);
      div.onclick = (ev) => {
        if (ev.target === p && editableNow) return;
        showSources(variant, seg.segment_id);
      };
      body.appendChild(div);
    }
  }

  window.__segCount = segCount;
  loadChecks(variant);
  loadReviews(variant);
  updateStatus();
}

async function showSources(variant, segmentId) {
  const res = await fetch("/api/segment/" + variant + "/" + segmentId);
  if (!res.ok) { el("sources").textContent = "找不到该段落"; return; }
  const seg = await res.json();
  el("sources").textContent = [
    "段落 " + seg.segment_id,
    "章节 " + seg.section_title,
    "归属 " + seg.lineage + "｜差异 " + seg.diff_status + "｜机器检查 " + (seg.machine_check_status || "未检查"),
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
      dot.className = "dot " + (data.status === "failed" ? "failed" : data.status === "warning" ? "warning" : "");
      row.appendChild(dot);
      row.appendChild(Object.assign(document.createElement("span"), {
        textContent: label + "：" + data.status + "（failed " + data.summary.failed + " / warning " + data.summary.warning + "）",
      }));
    } else {
      const n = (data.findings || []).length;
      dot.className = "dot " + (n ? "warning" : "");
      row.appendChild(dot);
      row.appendChild(Object.assign(document.createElement("span"), { textContent: label + "：" + n + " 条" }));
      box.appendChild(row);
      // 明细：让右栏有内容可读，而不是一片空白
      const list = document.createElement("div");
      list.className = "finding-list";
      for (const f of (data.findings || []).slice(0, 12)) {
        const item = document.createElement("div");
        item.className = "finding";
        const head = document.createElement("span");
        head.className = "finding-code";
        head.textContent = f.code.replace(/^diff./, "");
        const msg = document.createElement("span");
        msg.textContent = f.message.replace(/^S+s/, "");
        item.append(head, msg);
        list.appendChild(item);
      }
      if (n > 12) {
        const more = document.createElement("div");
        more.className = "muted";
        more.textContent = "还有 " + (n - 12) + " 条…";
        list.appendChild(more);
      }
      box.appendChild(list);
      continue;
    }
    box.appendChild(row);
  }
  el("st-checks").textContent = status === "unknown" ? "—" : status;
  el("st-checks").className = status === "failed" ? "danger" : status === "warning" ? "warn" : "";
}

async function loadReviews(variant) {
  const res = await fetch("/api/reviews/" + variant);
  if (!res.ok) { el("st-unreviewed").textContent = "—"; return; }
  const data = await res.json();
  const sections = Object.values(data.sections || {});
  const unreviewed = sections.filter((s) => s !== "reviewed").length;
  el("st-unreviewed").textContent = unreviewed + " / " + sections.length;
}

function updateStatus() {
  const segs = window.__segCount;
  el("st-segments").textContent = segs === undefined ? "—" : String(segs);
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
    box.textContent = "已应用 " + data.applied + " 处，文档版本 " + data.documentVersionBefore + " → " + data.documentVersionAfter;
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
  el("sources").textContent = data.ok ? "已标记审查：" + targetType + " " + targetId : "标记失败";
  loadReviews(currentVariant);
}

/* ---------- 启动 ---------- */
const nav = el("variants");
for (const v of variants) {
  const btn = document.createElement("button");
  btn.className = "link";
  btn.textContent = v;
  if (v === currentVariant) btn.style.color = "hsl(var(--rs-accent))";
  btn.onclick = () => { applyLayout(v); loadDoc(v); };
  nav.appendChild(btn);
  nav.appendChild(document.createElement("br"));
}

/* 主题：默认深色，用户可切浅色并记忆 */
const THEME_KEY = "rs-theme";
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem(THEME_KEY, theme); } catch {}
}
let savedTheme = null;
try { savedTheme = localStorage.getItem(THEME_KEY); } catch {}
applyTheme(savedTheme === "light" ? "light" : "dark");
el("theme-toggle").onclick = () => {
  applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
};

bindSplitters();
applyLayout(currentVariant);
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
