// 修订记录浮层：补齐原站的「恢复此版本」与「为什么」语义，触发器改名
import { readFileSync, writeFileSync } from "node:fs";
const p = "server/viewer.ts";
let s = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const must = (n, k) => { if (!s.includes(n)) throw new Error("锚点缺失：" + k); };

/* 1) 浮层 DOM：原 / 箭头 / 新 / 为什么 / 恢复此版本 + 关闭 */
must('  <div class="rv-acts"><button class="c-btn" id="rv-close">关闭</button></div>', "acts");
s = s.replace(
`<div class="revpop" id="revpop" hidden role="dialog" aria-label="修订记录">
  <div class="rv-arrow" id="rv-arrow"></div>
  <div class="rv-head"><span class="rv-ad" id="rv-ad">段</span><span id="rv-title">修订记录</span></div>
  <div class="rv-row old"><span class="rv-k">原</span><span class="rv-orig" id="rv-before"></span></div>
  <div class="rv-conn">↓</div>
  <div class="rv-row new"><span class="rv-k">新</span><span class="rv-new" id="rv-after"></span></div>
  <div class="rv-why"><span class="rv-k">说明</span><span id="rv-why"></span></div>
  <div class="rv-acts"><button class="c-btn" id="rv-close">关闭</button></div>
</div>`,
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
</div>`);

/* 2) 样式：按原站 .c-revpop 的尺寸与结构（348px / 圆角 8 / 行 9px 11px / 箭头朝下） */
must("  .revpop .rv-conn { display: grid; place-items: center; color: var(--gold-deep); height: 16px; }", "conn css");
s = s.replace(
`  .revpop .rv-conn { display: grid; place-items: center; color: var(--gold-deep); height: 16px; }`,
`  .revpop .rv-diff { display: flex; flex-direction: column; margin-bottom: 11px; }
  .revpop .rv-conn { display: flex; justify-content: center; align-items: center; color: var(--gold-deep); height: 15px; }
  .revpop .rv-conn svg { transform: rotate(90deg); }
  .revpop .rv-why .rv-k { font-style: normal; font-family: var(--sans); padding-top: 1px; }`);

/* 3) 触发器文案改「修订记录」 */
must('        revBtn.textContent = "✎ 修订";', "rev btn label");
s = s.replace('        revBtn.textContent = "✎ 修订";', '        revBtn.textContent = "修订记录";');

/* 4) 打开逻辑：标题取段落主题、为什么写清依据、记录锚点供恢复 */
must(`  const diffLabel = { candidate: "待确认", confirmed: "已确认", not_applicable: "不适用" }[seg.diff_status] || seg.diff_status;
  el("rv-why").textContent = ["段落 " + seg.segment_id, "差异 " + diffLabel, refsLabel(seg.references.rule_refs)].filter(Boolean).join("　");`,
"why text");
s = s.replace(
`  const diffLabel = { candidate: "待确认", confirmed: "已确认", not_applicable: "不适用" }[seg.diff_status] || seg.diff_status;
  el("rv-why").textContent = ["段落 " + seg.segment_id, "差异 " + diffLabel, refsLabel(seg.references.rule_refs)].filter(Boolean).join("　");`,
`  const diffLabel = { candidate: "待确认", confirmed: "已确认", not_applicable: "不适用" }[seg.diff_status] || seg.diff_status;
  const why = entry
    ? "人工改写草稿，尚未应用。依据：" + (refsLabel(seg.references.rule_refs) || "本段引用")
    : "尚无改动，当前显示文档原文。本段依据：" + (refsLabel(seg.references.rule_refs) || "本段引用");
  el("rv-why").textContent = why;
  el("rv-restore").disabled = !entry;
  el("rv-restore").textContent = entry ? "恢复此版本" : "无改动可恢复";`);

/* 5) 标题用段落首句，像原站「修订记录 · 核心欲望」 */
must(`  el("rv-title").textContent = "修订记录 · " + (seg.lineage === "modified" ? "修改" : "新增") + "片段";`, "title");
s = s.replace(
`  el("rv-title").textContent = "修订记录 · " + (seg.lineage === "modified" ? "修改" : "新增") + "片段";`,
`  const主题 = (seg.text.split(/[：:；。]/)[0] || "本段").trim().slice(0, 14);
  el("rv-title").textContent = "修订记录 · " + 主题;`);

/* 6) 恢复此版本：撤销该段草稿 */
must('el("rv-close").onclick = closeRevpop;', "close handler");
s = s.replace(
`el("rv-close").onclick = closeRevpop;`,
`el("rv-close").onclick = closeRevpop;
el("rv-restore").onclick = () => {
  const id = el("revpop").dataset.segId;
  if (!id || !draft.has(id)) { closeRevpop(); return; }
  const card = document.querySelector('.seg[data-seg-id="' + id + '"] .editable');
  draft.delete(id);
  if (card) {
    const seg = currentSegById(id);
    if (seg) { card.innerHTML = ""; renderRich(card, seg.text); }
  }
  el("foot-count").textContent = draft.size + " 处改动";
  if (draft.size === 0) el("foot-actions").hidden = true;
  el("diff-preview").hidden = true;
  updateStatus();
  closeRevpop();
};`);

/* 7) 打开时记录当前段落，便于恢复 */
must('  pop.hidden = false;\n  revAnchor = anchor;', "open tail");
s = s.replace('  pop.hidden = false;\n  revAnchor = anchor;',
'  pop.dataset.segId = seg.segment_id;\n  pop.hidden = false;\n  revAnchor = anchor;');

writeFileSync(p, s, "utf8");
console.log("修订记录浮层已按原站结构补齐");
