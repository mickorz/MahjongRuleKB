// S4 底栏操作条 + S5 修订浮层（写成文件，避免 heredoc 被内容打断）
import { readFileSync, writeFileSync } from "node:fs";
const p = "server/viewer.ts";
let s = readFileSync(p, "utf8").replace(/\r\n/g, "\n");

const must = (needle, name) => {
  if (!s.includes(needle)) throw new Error("锚点未找到：" + name);
};

/* ---------- S4 ---------- */
must("    <span id=\"st-version\"></span>\n  </footer>", "footer");
s = s.replace(
`    <span>检查 <b id="st-checks">—</b></span>
    <span id="st-version"></span>
  </footer>`,
`    <span>检查 <b id="st-checks">—</b></span>
    <span id="st-version"></span>
    <div class="foot-actions" id="foot-actions" hidden>
      <span class="muted" id="foot-count">0 处改动</span>
      <button class="c-btn" onclick="previewChanges()">预览改动</button>
      <button class="c-btn primary" onclick="applyChanges()">应用</button>
      <button class="c-btn" onclick="clearDraft()">清空</button>
    </div>
  </footer>`);

must('id="editor-bar"', "editor-bar markup");
s = s.replace(
`      <div class="toolbar" id="editor-bar" hidden>
        <strong>编辑草稿</strong>
        <span class="muted" id="edit-count">0 处改动</span>
        <button onclick="previewChanges()">预览改动</button>
        <button onclick="applyChanges()">应用</button>
        <button onclick="clearDraft()">清空</button>
      </div>
      <div class="diffbox" id="diff-preview" hidden></div>`,
`      <div class="diffbox" id="diff-preview" hidden></div>`);

// 工具条样式替换为底栏按钮样式
const toolbarStart = s.indexOf("  /* 编辑工具条（S4 移到页脚） */");
if (toolbarStart < 0) throw new Error("工具条样式未找到");
const toolbarEnd = s.indexOf("  .diffbox {", toolbarStart);
if (toolbarEnd < 0) throw new Error("工具条样式结束未找到");
s = s.slice(0, toolbarStart) +
`  /* 底栏操作按钮（S4） */
  .c-btn {
    font-size: 12px; padding: 5px 14px; border-radius: 7px; cursor: pointer;
    border: 1px solid var(--line); background: var(--card); color: var(--ink);
    transition: border-color .15s var(--ease), color .15s var(--ease), background .15s var(--ease);
  }
  .c-btn:hover { border-color: var(--gold-deep); color: var(--gold-deep); }
  .c-btn.primary { background: var(--gold-deep); border-color: var(--gold-deep); color: #fff; }
  .c-btn.primary:hover { background: var(--gold); border-color: var(--gold); color: #fff; }

` + s.slice(toolbarEnd);

// JS 切换到底栏按钮组
must('el("editor-bar").hidden = true;', "editor-bar ref");
s = s.split('el("editor-bar").hidden = true;').join('el("foot-actions").hidden = true;');
s = s.replace(
`function markEdited(segmentId, text) {
  draft.set(segmentId, { text });
  el("foot-actions").hidden = false;
  el("edit-count").textContent = draft.size + " 处改动";`,
`function markEdited(segmentId, text, before) {
  draft.set(segmentId, { text, before });
  el("foot-actions").hidden = false;
  el("foot-count").textContent = draft.size + " 处改动";`);

/* ---------- S5 ---------- */
must("  @media (max-width: 1100px) {", "media query");
s = s.replace(
`  @media (max-width: 1100px) {`,
`  /* 修订记录浮层（S5） */
  .revpop {
    position: fixed; z-index: 100000; width: 348px; padding: 15px 16px 14px;
    background: var(--card); border: 1px solid var(--gold-soft); border-radius: 8px;
    box-shadow: 0 24px 56px -18px var(--shadow);
  }
  .revpop[hidden] { display: none; }
  .revpop .rv-arrow {
    position: absolute; top: -7px; width: 12px; height: 12px; background: var(--card);
    border-left: 1px solid var(--gold-soft); border-top: 1px solid var(--gold-soft);
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

  @media (max-width: 1100px) {`);

must("<script>\nconst el = (id) => document.getElementById(id);", "script start");
s = s.replace(
`<script>
const el = (id) => document.getElementById(id);`,
`<div class="revpop" id="revpop" hidden role="dialog" aria-label="修订记录">
  <div class="rv-arrow" id="rv-arrow"></div>
  <div class="rv-head"><span class="rv-ad" id="rv-ad">段</span><span id="rv-title">修订记录</span></div>
  <div class="rv-row old"><span class="rv-k">原</span><span class="rv-orig" id="rv-before"></span></div>
  <div class="rv-conn">↓</div>
  <div class="rv-row new"><span class="rv-k">新</span><span class="rv-new" id="rv-after"></span></div>
  <div class="rv-why"><span class="rv-k">说明</span><span id="rv-why"></span></div>
  <div class="rv-acts"><button class="c-btn" id="rv-close">关闭</button></div>
</div>

<script>
const el = (id) => document.getElementById(id);`);

must("/** 把反引号包裹的片段渲染成行内代码，其余保持纯文本 */", "renderRich");
s = s.replace(
`/** 把反引号包裹的片段渲染成行内代码，其余保持纯文本 */`,
`let revAnchor = null;

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

  const r = anchor.getBoundingClientRect();
  const w = 348;
  const left = Math.min(Math.max(8, r.left), window.innerWidth - w - 8);
  let top = r.bottom + 8;
  if (top + 220 > window.innerHeight) top = Math.max(8, r.top - 220);
  pop.style.left = left + "px";
  pop.style.top = top + "px";
  el("rv-arrow").style.left = Math.max(12, Math.min(w - 24, r.left + r.width / 2 - left)) + "px";
  pop.hidden = false;
  revAnchor = anchor;
}

/** 把反引号包裹的片段渲染成行内代码，其余保持纯文本 */`);

must('p.title = "点击即可直接修改这段文字";', "editable title");
s = s.replace(
`        // 头部追加「可编辑」徽章，解决"看不出哪里能改"
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
        }`,
`        // 头部追加「可编辑」徽章 + 「✎ 修订」按钮
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
        div.dataset.segId = seg.segment_id;`);

must("bindSplitters();\nrenderVariants();", "bootstrap");
s = s.replace(
`bindSplitters();
renderVariants();`,
`document.addEventListener("click", (e) => {
  const pop = el("revpop");
  if (!pop || pop.hidden) return;
  if (e.target.closest("#revpop")) return;
  if (revAnchor && e.target === revAnchor) return;
  closeRevpop();
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeRevpop(); });
el("rv-close").onclick = closeRevpop;

bindSplitters();
renderVariants();`);

writeFileSync(p, s, "utf8");
console.log("S4 + S5 已接入");
