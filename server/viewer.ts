// 工作台前端（无构建，单文件）
// 布局要点（S1/S2）：外壳不滚，三栏各自滚动；两条 1px 分隔条可拖拽，比例记忆在 localStorage。
export function viewerHtml(): string {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Rule Studio 需求文档工作台</title>
<style>
  :root {
    color-scheme: light dark;
    --rs-bg: canvas;
    --rs-panel: color-mix(in srgb, canvas 92%, currentColor 8%);
    --rs-line: color-mix(in srgb, currentColor 18%, transparent);
    --rs-text: canvastext;
    --rs-muted: color-mix(in srgb, canvastext 60%, transparent);
    --rs-modified: #e08a1e;
    --rs-added: #2f9e44;
    --rs-inherited: #1c7ed6;
    --rs-danger: #c92a2a;
    --nav-w: 240px;
    --aside-w: 320px;
  }
  * { box-sizing: border-box; }
  html, body { height: 100%; margin: 0; overflow: hidden; }
  body {
    font: 14px/1.6 system-ui, -apple-system, "Segoe UI", "Microsoft YaHei", sans-serif;
    color: var(--rs-text);
    background: var(--rs-bg);
  }
  /* S1：外壳撑满视口且永不滚动，滚动交给三栏 */
  .app { height: 100dvh; display: flex; flex-direction: column; }
  .app-head {
    flex: 0 0 auto; display: flex; align-items: center; gap: 12px;
    padding: 8px 14px; border-bottom: 1px solid var(--rs-line);
  }
  .app-head strong { font-size: 13px; letter-spacing: .2px; }
  .app-head .hint { color: var(--rs-muted); font-size: 12px; }
  .app-body { flex: 1 1 auto; display: flex; min-height: 0; }
  /* 三栏各自滚动 */
  .pane { overflow: auto; min-height: 0; }
  .pane-nav { flex: 0 0 var(--nav-w); border-right: 1px solid var(--rs-line); padding: 12px; }
  .pane-main { flex: 1 1 auto; padding: 16px 24px; min-width: 0; }
  .pane-aside { flex: 0 0 var(--aside-w); border-left: 1px solid var(--rs-line); padding: 12px; }
  /* S2：1px 视觉 + 8px 命中区 */
  .splitter { position: relative; flex: 0 0 1px; background: var(--rs-line); cursor: col-resize; touch-action: none; }
  .splitter::before { content: ""; position: absolute; inset-block: 0; inset-inline: -4px; z-index: 5; }
  .splitter:hover, .splitter[data-dragging="true"] { background: var(--rs-modified); }
  /* 底部常驻状态栏（S3 前置，这里先给出骨架） */
  .app-foot {
    flex: 0 0 auto; display: flex; flex-wrap: wrap; gap: 14px; align-items: center;
    padding: 6px 14px; border-top: 1px solid var(--rs-line);
    font-size: 12px; color: var(--rs-muted);
  }
  .app-foot b { color: var(--rs-text); font-weight: 600; font-variant-numeric: tabular-nums; }
  .app-foot .danger { color: var(--rs-danger); }
  h1 { font-size: 18px; margin: 0 0 12px; }
  h2 { font-size: 15px; margin: 22px 0 8px; }
  .toc { margin-top: 8px; }
  .toc-group { margin: 10px 0 4px; font-size: 12px; color: var(--rs-muted); text-transform: uppercase; letter-spacing: .5px; }
  button.link {
    background: none; border: none; color: inherit; text-decoration: underline;
    text-underline-offset: 2px; cursor: pointer; font-size: 13px; padding: 2px 0;
  }
  button.link:hover { color: var(--rs-modified); }
  button.link:focus-visible { outline: 2px solid var(--rs-modified); outline-offset: 2px; border-radius: 3px; }
  .seg {
    margin: 6px 0; padding: 8px 10px; border-radius: 6px;
    border-left: 3px solid transparent; background: var(--rs-panel);
  }
  .seg[data-lineage="modified"] { border-left-color: var(--rs-modified); background: color-mix(in srgb, var(--rs-modified) 8%, transparent); }
  .seg[data-lineage="added"] { border-left-color: var(--rs-added); background: color-mix(in srgb, var(--rs-added) 8%, transparent); }
  .seg[data-lineage$="inherited"] { border-left-color: var(--rs-inherited); background: color-mix(in srgb, var(--rs-inherited) 7%, transparent); }
  .badge {
    font-size: 11px; padding: 0 5px; border-radius: 4px;
    border: 1px solid currentColor; margin-right: 4px; opacity: .85; white-space: nowrap;
  }
  .locked { opacity: .9; }
  .muted { color: var(--rs-muted); font-size: 12px; }
  .warn { color: var(--rs-danger); }
  .editable { outline: 1px dashed color-mix(in srgb, var(--rs-modified) 55%, transparent); border-radius: 4px; padding: 2px 4px; }
  .editable:focus { outline: 2px solid var(--rs-modified); }
  .sources { font-size: 12px; white-space: pre-wrap; }
  .toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 10px; }
  .toolbar[hidden] { display: none; }
  .toolbar button { font-size: 12px; padding: 4px 10px; border-radius: 6px; border: 1px solid var(--rs-line); background: var(--rs-panel); color: inherit; cursor: pointer; }
  .toolbar button:hover { border-color: var(--rs-modified); }
  .diffbox { font-size: 12px; border: 1px solid var(--rs-line); border-radius: 6px; padding: 8px; margin-top: 8px; white-space: pre-wrap; }
  .diffbox[hidden] { display: none; }
  .diffbox .before { color: var(--rs-danger); }
  .diffbox .after { color: var(--rs-added); }
  @media (max-width: 900px) {
    .pane-aside { display: none; }
    .splitter:last-of-type { display: none; }
  }
</style>
</head>
<body>
<div class="app" data-layout="three-pane">
  <header class="app-head">
    <strong>Rule Studio</strong>
    <span class="hint">需求文档工作台</span>
    <span class="hint" id="doc-title"></span>
  </header>

  <div class="app-body">
    <nav class="pane pane-nav" id="pane-nav" aria-label="文档导航">
      <div class="toc-group">文档</div>
      <div id="variants"></div>
      <div class="toc-group">章节</div>
      <div class="toc" id="toc"></div>
    </nav>

    <div class="splitter" data-splitter="nav" role="separator" aria-orientation="vertical" aria-label="调整左栏宽度" tabindex="0"></div>

    <main class="pane pane-main" id="pane-main" aria-label="需求文档">
      <div class="toolbar" id="editor-bar" hidden>
        <strong style="font-size:12px">编辑草稿</strong>
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
      <div class="toc-group">检查</div>
      <div id="checks" class="muted"></div>
      <div class="toc-group">来源</div>
      <div id="sources" class="sources muted">点击段落查看来源</div>
    </aside>
  </div>

  <footer class="app-foot" aria-label="状态栏">
    <span>段落 <b id="st-segments">—</b></span>
    <span>改动 <b id="st-edits">0</b></span>
    <span>未审章节 <b id="st-unreviewed">—</b></span>
    <span>检查 <b id="st-checks">—</b></span>
    <span class="muted" id="st-version"></span>
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

function layoutKey(variant) { return "rs-layout:" + variant; }

function applyLayout(variant) {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(layoutKey(variant)) || "null"); } catch { saved = null; }
  setPaneWidths(saved && saved.nav, saved && saved.aside);
}

function setPaneWidths(navW, asideW) {
  const body = document.querySelector(".app-body");
  const total = body ? body.clientWidth : window.innerWidth;
  const maxSide = total * (1 - MIN_MAIN_RATIO);
  let nav = Math.max(MIN_NAV, Math.min(navW || 240, maxSide - MIN_ASIDE));
  let aside = Math.max(MIN_ASIDE, Math.min(asideW || 320, maxSide - nav));
  if (nav + aside > maxSide) aside = Math.max(MIN_ASIDE, maxSide - nav);
  el("pane-nav").style.flex = "0 0 " + Math.round(nav) + "px";
  el("pane-aside").style.flex = "0 0 " + Math.round(aside) + "px";
  return { nav: Math.round(nav), aside: Math.round(aside) };
}

function saveLayout(variant) {
  const nav = el("pane-nav").getBoundingClientRect().width;
  const aside = el("pane-aside").getBoundingClientRect().width;
  try { localStorage.setItem(layoutKey(variant), JSON.stringify({ nav: Math.round(nav), aside: Math.round(aside) })); } catch {}
}

function startDrag(side, ev) {
  ev.preventDefault();
  const splitter = ev.currentTarget;
  splitter.dataset.dragging = "true";
  // 合成事件或失效 pointerId 下 setPointerCapture 会抛错，不能让它中断拖拽
  try { splitter.setPointerCapture?.(ev.pointerId); } catch {}
  const body = document.querySelector(".app-body");
  const total = body.clientWidth;
  const navStart = el("pane-nav").getBoundingClientRect().width;
  const asideStart = el("pane-aside").getBoundingClientRect().width;
  const startX = ev.clientX;

  const onMove = (e) => {
    const dx = e.clientX - startX;
    if (side === "nav") {
      setPaneWidths(navStart + dx, asideStart);
    } else {
      setPaneWidths(navStart, asideStart - dx);
    }
  };
  const onUp = () => {
    splitter.dataset.dragging = "false";
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    saveLayout(currentVariant);
    updateStatus();
  };
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  void total;
}

function bindSplitters() {
  document.querySelectorAll(".splitter").forEach((s) => {
    s.addEventListener("pointerdown", (e) => startDrag(s.dataset.splitter, e));
    // 双击恢复默认
    s.addEventListener("dblclick", () => { setPaneWidths(240, 320); saveLayout(currentVariant); });
    // 键盘可达：左右箭头微调
    s.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      const nav = el("pane-nav").getBoundingClientRect().width;
      const aside = el("pane-aside").getBoundingClientRect().width;
      const step = e.key === "ArrowLeft" ? -16 : 16;
      if (s.dataset.splitter === "nav") setPaneWidths(nav + step, aside);
      else setPaneWidths(nav, aside - step);
      saveLayout(currentVariant);
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

    const link = document.createElement("div");
    const btn = document.createElement("button");
    btn.className = "link";
    btn.textContent = block.title;
    btn.onclick = () => h2.scrollIntoView({ behavior: "smooth", block: "start" });
    link.appendChild(btn);
    const rv = document.createElement("button");
    rv.className = "link";
    rv.textContent = "标为已审";
    rv.style.marginLeft = "8px";
    rv.style.fontSize = "11px";
    rv.onclick = () => markReviewed("section", block.section_id);
    link.appendChild(rv);
    toc.appendChild(link);

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
    "段落：" + seg.segment_id,
    "章节：" + seg.section_title,
    "归属：" + seg.lineage + "｜差异：" + seg.diff_status + "｜机器检查：" + (seg.machine_check_status || "未检查"),
    "规则：" + (seg.references.rule_refs.join("、") || "—"),
    "配置：" + (seg.references.config_refs.join("、") || "—"),
    "原文证据：" + (seg.references.source_evidence_refs.join("\\n") || "—"),
  ].join("\\n");
}

async function loadChecks(variant) {
  const box = el("checks");
  box.textContent = "";
  let status = "—";
  for (const [label, url] of [["质量报告", "/api/checks/"], ["差异告警", "/api/diffs/"]]) {
    const res = await fetch(url + variant);
    if (!res.ok) continue;
    const data = await res.json();
    const line = document.createElement("div");
    if (label === "质量报告") {
      status = data.status;
      line.textContent = label + "：" + data.status + "（failed " + data.summary.failed + " / warning " + data.summary.warning + "）";
      line.className = data.summary.failed ? "warn" : "";
    } else {
      line.textContent = label + "：" + (data.findings || []).length + " 条";
    }
    box.appendChild(line);
  }
  el("st-checks").textContent = status;
  el("st-checks").className = status === "failed" ? "danger" : "";
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
  btn.onclick = () => { applyLayout(v); loadDoc(v); };
  nav.appendChild(btn);
  nav.appendChild(document.createElement("br"));
}

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
