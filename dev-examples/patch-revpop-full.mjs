// 变更：修订记录按钮与浮层按原站 .c-content-action / .c-revpop 完整复刻
import { readFileSync, writeFileSync } from "node:fs";
const p = "server/viewer.ts";
let s = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const must = (n, k) => { if (!s.includes(n)) throw new Error("锚点缺失：" + k); };

/* ---------- 1) CSS：按钮 = .c-content-action，浮层 = .c-revpop 原值 ---------- */
const cssStart = s.indexOf("  /* 修订记录浮层（S5） */");
must("  .seg-head .rev-btn {", "rev-btn css");
const cssEnd = s.indexOf("  .seg-head .rev-btn:hover { color: var(--gold-deep); border-color: var(--gold-soft); }");
must("  .seg-head .rev-btn:hover", "rev-btn hover");
const after = s.indexOf("\n", cssEnd) + 1;

const css = `  /* 操作按钮（原站 .c-content-action） */
  .c-content-action {
    display: inline-flex; min-height: 30px; align-items: center; justify-content: center; gap: 4px;
    padding: 4px 10px; border: 1px solid var(--line); border-radius: 5px; background: var(--card);
    color: var(--ink-2); font: 11.5px var(--sans); line-height: 1.35; white-space: nowrap; cursor: pointer;
    transition: border-color .15s var(--ease), background .15s var(--ease), color .15s var(--ease);
  }
  .c-content-action:hover { border-color: var(--gold-soft); background: var(--gold-wash); color: var(--gold-deep); }
  .c-content-action:disabled { color: var(--ink-3); cursor: default; background: var(--card); border-color: var(--line); }
  .c-content-action svg { flex: none; }
  .cr-history-trigger { margin-left: auto; white-space: nowrap; }

  /* 修订记录浮层：尺寸/内距/箭头/行样式取自原站 .c-revpop */
  .c-revpop {
    position: fixed; z-index: 100000; width: 348px;
    background: var(--card); border: 1px solid var(--gold-soft); border-radius: 8px;
    box-shadow: 0 24px 56px -18px var(--shadow); padding: 15px 16px 16px;
  }
  .c-revpop[hidden] { display: none; }
  .c-revpop .rv-arrow {
    position: absolute; top: -7px; left: 40px; width: 12px; height: 12px; background: var(--card);
    border-left: 1px solid var(--gold-soft); border-top: 1px solid var(--gold-soft); transform: rotate(45deg);
  }
  .c-revpop .rv-head { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 13px; margin-bottom: 12px; }
  .c-revpop .rv-ad {
    width: 20px; height: 20px; border-radius: 4px; background: var(--gold-deep); color: #fff;
    display: grid; place-items: center; font-family: var(--serif); font-size: 11px; flex: none;
  }
  .c-revpop .rv-diff { display: flex; flex-direction: column; margin-bottom: 11px; }
  .c-revpop .rv-row {
    display: flex; gap: 9px; font-size: 12.5px; line-height: 1.55; align-items: flex-start;
    border-radius: 6px; padding: 9px 11px;
  }
  .c-revpop .rv-row.old { background: var(--paper-2); }
  .c-revpop .rv-row.new { background: var(--gold-wash); border: 1px solid var(--gold-soft); }
  .c-revpop .rv-k {
    flex: none; width: 30px; font-size: 10.5px; color: var(--ink-3); padding-top: 2px;
    font-family: var(--latin); font-style: italic;
  }
  .c-revpop .rv-orig { color: var(--ink-3); text-decoration: line-through; text-decoration-color: color-mix(in srgb, var(--terra) 70%, transparent); }
  .c-revpop .rv-new { color: var(--ink); font-weight: 500; }
  .c-revpop .rv-conn { display: flex; justify-content: center; align-items: center; color: var(--gold-deep); height: 15px; }
  .c-revpop .rv-conn svg { transform: rotate(90deg); }
  .c-revpop .rv-why {
    display: flex; gap: 8px; font-size: 11.5px; color: var(--ink-2); background: var(--paper-2);
    border-radius: 6px; padding: 9px 11px; margin-bottom: 13px; line-height: 1.55;
  }
  .c-revpop .rv-why .rv-k { font-style: normal; font-family: var(--sans); padding-top: 1px; }
  .c-revpop .rv-acts { display: flex; justify-content: flex-end; gap: 8px; }
`;
s = s.slice(0, cssStart) + css + s.slice(after);

/* ---------- 2) DOM：类名改回原站 ---------- */
must('<div class="revpop" id="revpop"', "popup dom");
s = s.replace(
`<div class="revpop" id="revpop" hidden role="dialog" aria-label="修订记录">
  <div class="rv-arrow" id="rv-arrow"></div>
  <div class="rv-head"><span class="rv-ad" id="rv-ad">段</span><span id="rv-title">修订记录</span></div>
  <div class="rv-diff">
    <div class="rv-row old"><span class="rv-k">原</span><span class="rv-orig" id="rv-before"></span></div>
    <div class="rv-conn">
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6h6M5 3l3 3-3 3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </div>
    <div class="rv-row new"><span class="rv-k">新</span><span class="rv-new" id="rv-after"></span></div>
  </div>
  <div class="rv-why"><span class="rv-k">为什么</span><span id="rv-why"></span></div>
  <div class="rv-acts">
    <button class="c-btn" id="rv-restore">恢复此版本</button>
    <button class="c-btn" id="rv-close">关闭</button>
  </div>
</div>`,
`<div class="c-revpop" id="revpop" hidden role="dialog" aria-label="修订记录">
  <div class="rv-arrow" id="rv-arrow"></div>
  <div class="rv-head">
    <span class="rv-ad" id="rv-ad">段</span>
    <span id="rv-title">修订记录</span>
  </div>
  <div class="rv-diff">
    <div class="rv-row old">
      <span class="rv-k">原</span>
      <span class="rv-orig" id="rv-before"></span>
    </div>
    <div class="rv-conn">
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6h6M5 3l3 3-3 3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </div>
    <div class="rv-row new">
      <span class="rv-k">新</span>
      <span class="rv-new" id="rv-after"></span>
    </div>
  </div>
  <div class="rv-why">
    <span class="rv-k">为什么</span>
    <span id="rv-why"></span>
  </div>
  <div class="rv-acts">
    <button class="c-content-action" id="rv-restore">恢复此版本</button>
    <button class="c-content-action" id="rv-close">关闭</button>
  </div>
</div>`);

/* ---------- 3) 触发器：.c-content-action + 时钟图标 ---------- */
must(`        const revBtn = document.createElement("button");
        revBtn.className = "rev-btn";
        revBtn.textContent = "修订记录";
        revBtn.onclick = (ev) => { ev.stopPropagation(); openRevpop(revBtn, seg); };
        head.appendChild(revBtn);`, "trigger");
s = s.replace(
`        const revBtn = document.createElement("button");
        revBtn.className = "rev-btn";
        revBtn.textContent = "修订记录";
        revBtn.onclick = (ev) => { ev.stopPropagation(); openRevpop(revBtn, seg); };
        head.appendChild(revBtn);`,
`        const revBtn = document.createElement("button");
        revBtn.type = "button";
        revBtn.className = "c-content-action cr-history-trigger";
        revBtn.setAttribute("aria-expanded", "false");
        revBtn.innerHTML = clockIcon() + "修订记录";
        revBtn.onclick = (ev) => {
          ev.stopPropagation();
          if (!el("revpop").hidden && revAnchor === revBtn) { closeRevpop(); return; }
          openRevpop(revBtn, seg);
        };
        head.appendChild(revBtn);`);

/* ---------- 4) 时钟图标 + aria-expanded 同步 ---------- */
must("let revAnchor = null;", "revAnchor");
s = s.replace("let revAnchor = null;",
`let revAnchor = null;

/** 原站 RevisionHistoryButton 用的 clock 图标 */
function clockIcon() {
  return '<svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6"></circle><path d="M8 4.6V8l2.4 1.6"></path></svg>';
}`);

must(`  if (!pop || pop.hidden) return;
  pop.hidden = true;
  revAnchor = null;`, "close");
s = s.replace(
`  if (!pop || pop.hidden) return;
  pop.hidden = true;
  revAnchor = null;`,
`  if (!pop || pop.hidden) return;
  pop.hidden = true;
  if (revAnchor) revAnchor.setAttribute("aria-expanded", "false");
  revAnchor = null;`);

must(`  pop.dataset.segId = seg.segment_id;
  pop.hidden = false;
  revAnchor = anchor;`, "open tail");
s = s.replace(
`  pop.dataset.segId = seg.segment_id;
  pop.hidden = false;
  revAnchor = anchor;`,
`  pop.dataset.segId = seg.segment_id;
  pop.hidden = false;
  anchor.setAttribute("aria-expanded", "true");
  revAnchor = anchor;`);

/* ---------- 5) 滚动/缩放时重新定位（原站行为）---------- */
must('document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeRevpop(); });', "esc");
s = s.replace(
'document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeRevpop(); });',
`document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeRevpop(); });
const replaceRevpop = () => { if (revAnchor && !el("revpop").hidden) placeRevpop(revAnchor); };
window.addEventListener("resize", replaceRevpop);
document.getElementById("pane-main").addEventListener("scroll", replaceRevpop, { passive: true });`);

writeFileSync(p, s, "utf8");
console.log("修订记录按钮与浮层已完整复刻");
