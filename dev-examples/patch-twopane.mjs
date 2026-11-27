// S3-b：去掉右栏（来源并入卡片脚注），中栏按参考站 680px 阅读宽度
import { readFileSync, writeFileSync } from "node:fs";
const p = "server/viewer.ts";
let s = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const must = (n, k) => { if (!s.includes(n)) throw new Error("锚点缺失：" + k); };

/* 1) 布局：三栏 → 两栏 */
must('data-layout="three-pane"', "layout");
s = s.replace('data-layout="three-pane"', 'data-layout="two-pane"');

must('  .pane-aside { flex: 0 0 var(--aside-w); padding: 14px; background: var(--paper-2); border-left: 1px solid var(--line); }\n', "aside css");
s = s.replace('  .pane-aside { flex: 0 0 var(--aside-w); padding: 14px; background: var(--paper-2); border-left: 1px solid var(--line); }\n', '');

must('    .pane-aside { display: none; }\n', "aside media");
s = s.replace('    .pane-aside { display: none; }\n', '');

must('  .pane-main { flex: 1 1 auto; padding: 20px 28px 56px; min-width: 0; background: var(--paper); }\n', "main css");
s = s.replace(
'  .pane-main { flex: 1 1 auto; padding: 20px 28px 56px; min-width: 0; background: var(--paper); }\n',
`  .pane-main { flex: 1 1 auto; padding: 0; min-width: 0; background: var(--paper); }
  /* 参考站 .c-doc：阅读栏 680px 居中 */
  .doc-col { max-width: 680px; margin: 0 auto; width: 100%; padding: 28px 24px 56px; }
`);

/* 2) 移除右栏 DOM 与分隔条 */
must('    <div class="splitter" data-splitter="aside" role="separator" aria-orientation="vertical" aria-label="调整右栏宽度" tabindex="0"></div>\n', "aside splitter");
s = s.replace('    <div class="splitter" data-splitter="aside" role="separator" aria-orientation="vertical" aria-label="调整右栏宽度" tabindex="0"></div>\n', '');

must(`    <aside class="pane pane-aside" id="pane-aside" aria-label="信息面板">
      <div class="group-label">来源</div>
      <div id="sources" class="sources">选中一个段落查看它的出处</div>
      <div class="group-label" style="margin-top:18px" id="findings-label">检查明细</div>
      <div id="findings"></div>
    </aside>
`, "aside dom");
s = s.replace(`    <aside class="pane pane-aside" id="pane-aside" aria-label="信息面板">
      <div class="group-label">来源</div>
      <div id="sources" class="sources">选中一个段落查看它的出处</div>
      <div class="group-label" style="margin-top:18px" id="findings-label">检查明细</div>
      <div id="findings"></div>
    </aside>
`, '');

/* 3) 检查明细搬进左栏（折叠） */
must(`      <div class="group-label" style="margin-top:16px">章节</div>
      <div class="toc" id="toc"></div>`, "nav dom");
s = s.replace(`      <div class="group-label" style="margin-top:16px">章节</div>
      <div class="toc" id="toc"></div>`,
`      <details class="findings-box" id="findings-box">
        <summary id="findings-label">检查明细</summary>
        <div id="findings"></div>
      </details>
      <div class="group-label" style="margin-top:16px">章节</div>
      <div class="toc" id="toc"></div>`);

/* 4) 中栏包一层 680px 列 */
must('      <div id="doc-body"><p class="muted">选择玩法</p></div>', "doc body");
s = s.replace('      <div id="doc-body"><p class="muted">选择玩法</p></div>',
'      <div class="doc-col"><div id="doc-body"><p class="muted">选择玩法</p></div></div>');

/* 5) 卡片样式按参考站 .cr-cfgcard / .c-titled-text-body */
s = s.replace(`  .cfgcard {
    background: var(--card); border: 1px solid var(--line); border-radius: 8px;
    padding: 8px 12px; margin-bottom: 6px;
  }`,
`  .cfgcard {
    background: var(--card); border: 1px solid var(--line); border-radius: 9px;
    padding: 13px 16px; margin-bottom: 8px;
  }`);
s = s.replace(`  .seg {
    position: relative;
    background: var(--card); border: 1px solid var(--line); border-radius: 8px;
    padding: 12px 14px 13px 16px;
    margin-bottom: 10px;
  }`,
`  .seg {
    position: relative;
    background: var(--card); border: 1px solid var(--line); border-radius: 9px;
    padding: 14px 16px;
    margin-bottom: 10px;
    font-size: 13.5px; line-height: 1.9;
  }`);

/* 6) 来源不再是右栏：改成卡片脚注（规则/配置/证据），点击卡片展开 */
must('async function showSources(variant, segmentId) {', "showSources");
const srcStart = s.indexOf('async function showSources(variant, segmentId) {');
const srcEnd = s.indexOf('async function loadChecks(variant) {', srcStart);
s = s.slice(0, srcStart) + s.slice(srcEnd);

s = s.replace(`      if (p) div.appendChild(p);
      div.onclick = (ev) => {
        if (p && ev.target === p && editableNow) return;
        showSources(variant, seg.segment_id);
      };
      body.appendChild(div);`,
`      if (p) div.appendChild(p);

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
      body.appendChild(div);`);

/* 7) 脚注样式 */
must('  .seg-head {', "seg-head");
s = s.replace('  .seg-head {',
`  .seg-foot {
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

  .seg-head {`);

/* 8) 分隔条只剩左栏一个；去掉 aside 相关引用 */
s = s.replace(`  el("pane-aside").style.flex = "0 0 " + Math.round(aside) + "px";\n`, '');
s = s.replace(`  const aside = el("pane-aside").getBoundingClientRect().width;\n`, '');
s = s.replace(`  const asideStart = el("pane-aside").getBoundingClientRect().width;\n`, '');
s = s.replace(`      const aside = el("pane-aside").getBoundingClientRect().width;\n`, '');
s = s.replace(`  el("pane-nav").getBoundingClientRect().width,\n  el("pane-aside").getBoundingClientRect().width,`, `  el("pane-nav").getBoundingClientRect().width,`);

writeFileSync(p, s, "utf8");
console.log("两栏改造完成");
