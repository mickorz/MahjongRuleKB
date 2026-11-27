// 一次性补丁：给内联前端加最小编辑能力（W3-4）
import { readFileSync, writeFileSync } from "node:fs";

const path = "server/app.ts";
let s = readFileSync(path, "utf8").replace(/\r\n/g, "\n");

// 1) 样式：可编辑提示 + 工具条
const styleAnchor = `  .sources { font-size:12px; white-space:pre-wrap; }`;
const styleExtra = `  .sources { font-size:12px; white-space:pre-wrap; }
  .editable { outline:1px dashed #e08a1e88; border-radius:4px; padding:2px 4px; }
  .editable:focus { outline:2px solid #e08a1e; background:#e08a1e10; }
  #editor-bar { position:sticky; top:0; background:canvas; padding:8px 0; border-bottom:1px solid #8884; z-index:5; }
  #editor-bar button { margin-right:6px; }
  .diffbox { font-size:12px; border:1px solid #8884; border-radius:6px; padding:8px; margin-top:8px; white-space:pre-wrap; }
  .diffbox .before { color:#c92a2a; }
  .diffbox .after { color:#2f9e44; }`;
if (!s.includes(styleAnchor)) throw new Error("style 锚点未找到");
s = s.replace(styleAnchor, styleExtra);

// 2) 正文：加编辑工具条容器
const mainAnchor = `<main id="doc"><p class="muted">选择左侧文档</p></main>`;
const mainNew = `<main id="doc">
  <div id="editor-bar" hidden>
    <strong>编辑草稿</strong>
    <span id="edit-count" class="muted">0 处改动</span>
    <button onclick="previewChanges()">预览改动</button>
    <button onclick="applyChanges()">应用</button>
    <button onclick="clearDraft()">清空</button>
    <div id="diff-preview" class="diffbox" hidden></div>
  </div>
  <div id="doc-body"><p class="muted">选择左侧文档</p></div>
</main>`;
if (!s.includes(mainAnchor)) throw new Error("main 锚点未找到");
s = s.replace(mainAnchor, mainNew);

// 3) 脚本：草稿状态与三个动作
const scriptAnchor = `const nav = el("variants");`;
const scriptExtra = `let currentVariant = "xiaoshan";
const draft = new Map();

function markEdited(segmentId, text, before) {
  draft.set(segmentId, { text, before });
  el("editor-bar").hidden = false;
  el("edit-count").textContent = draft.size + " 处改动";
  el("diff-preview").hidden = true;
}

function clearDraft() {
  draft.clear();
  el("editor-bar").hidden = true;
  el("diff-preview").hidden = true;
  loadDoc(currentVariant);
}

function mutationsPayload() {
  return [...draft.entries()].map(([segmentId, d]) => ({
    target: { segment_id: segmentId },
    op: "replace-text",
    text: d.text,
    source: "richtext",
    rationale: "工作台段落编辑",
  }));
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
      line.innerHTML = "";
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
  const res = await fetch("/api/apply", {
    method: "POST",
    headers: { "content-type": "application/json", "x-rule-studio": "1" },
    body: JSON.stringify({ variant: currentVariant, mutations: mutationsPayload() }),
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
  box.textContent = "未应用：" + (data.rejected || [data.message || data.error]).map((r) => r.reasons ? r.reasons.join("；") : r).join(" | ");
}

async function markReviewed(targetType, targetId) {
  const res = await fetch("/api/review", {
    method: "POST",
    headers: { "content-type": "application/json", "x-rule-studio": "1" },
    body: JSON.stringify({ variant: currentVariant, target: { type: targetType, id: targetId }, status: "reviewed", reviewer: "策划" }),
  });
  const data = await res.json();
  el("sources").textContent = data.ok ? "已标记审查：" + targetType + " " + targetId : "标记失败";
  loadChecks(currentVariant);
}

const nav = el("variants");`;
if (!s.includes(scriptAnchor)) throw new Error("script 锚点未找到");
s = s.replace(scriptAnchor, scriptExtra);

// 4) 渲染：可编辑片段用 contenteditable，并在信息面板给审查按钮
const renderAnchor = `      div.onclick = () => showSources(variant, seg.segment_id);
      el("doc").appendChild(div);`;
const renderNew = `      const editableNow = seg.editable && (seg.lineage === "modified" || seg.lineage === "added");
      if (editableNow) {
        p.contentEditable = "true";
        p.className = "editable";
        p.spellcheck = false;
        p.onblur = () => {
          const next = p.textContent.replace(/^\\s+/, "");
          if (next !== seg.text) markEdited(seg.segment_id, next, seg.text);
        };
      }
      div.onclick = (ev) => {
        if (ev.target === p && editableNow) return;
        showSources(variant, seg.segment_id);
      };
      el("doc-body").appendChild(div);`;
if (!s.includes(renderAnchor)) throw new Error("render 锚点未找到");
s = s.replace(renderAnchor, renderNew);

// 5) loadDoc 里把内容挂到 doc-body，并记录当前变体
const loadAnchor = `  const doc = await res.json();
  el("doc").innerHTML = "";`;
const loadNew = `  const doc = await res.json();
  currentVariant = variant;
  el("doc-body").innerHTML = "";
  draft.clear();
  el("editor-bar").hidden = true;`;
if (!s.includes(loadAnchor)) throw new Error("loadDoc 锚点未找到");
s = s.replace(loadAnchor, loadNew);

s = s.replace(/el\("doc"\)\.appendChild\(h1\);/, 'el("doc-body").appendChild(h1);');
s = s.replace(/el\("doc"\)\.appendChild\(h2\);/, 'el("doc-body").appendChild(h2);');

// 6) 章节审查按钮
const tocAnchor = `    link.appendChild(btn);
    toc.appendChild(link);`;
const tocNew = `    link.appendChild(btn);
    const rv = document.createElement("button");
    rv.className = "link";
    rv.textContent = "标为已审";
    rv.style.marginLeft = "6px";
    rv.onclick = () => markReviewed("section", block.section_id);
    link.appendChild(rv);
    toc.appendChild(link);`;
if (!s.includes(tocAnchor)) throw new Error("toc 锚点未找到");
s = s.replace(tocAnchor, tocNew);

writeFileSync(path, s, "utf8");
console.log("前端已加：可编辑片段、草稿计数、预览、应用、章节审查");
