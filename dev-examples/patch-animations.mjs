// 动画全量对齐：把原站用到的入场/交互动效逐条搬过来
import { readFileSync, writeFileSync } from "node:fs";
const p = "server/viewer.ts";
let s = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const must = (n, k) => { if (!s.includes(n)) throw new Error("锚点缺失：" + k); };

/* 1) 关键帧全集（原站同名同参数） */
must("  @keyframes crRiseSm {", "keyframes");
s = s.replace(
`  /* 入场动画（原站同名关键帧） */
  @keyframes crRiseSm { 0% { opacity: 0; transform: translateY(14px) scale(.985); } 100% { opacity: 1; transform: none; } }
  @keyframes crFade { 0% { opacity: 0; } 100% { opacity: 1; } }
  @keyframes crslidein { from { transform: translateX(40px); opacity: .4; } to { transform: none; opacity: 1; } }`,
`  /* 入场/交互动画（原站同名关键帧，参数一致） */
  @keyframes crRiseSm { 0% { opacity: 0; transform: translateY(14px) scale(.985); } 100% { opacity: 1; transform: none; } }
  @keyframes crRise { 0% { opacity: 0; transform: translateY(28px); } 100% { opacity: 1; transform: none; } }
  @keyframes crFade { 0% { opacity: 0; } 100% { opacity: 1; } }
  @keyframes crslidein { from { transform: translateX(40px); opacity: .4; } to { transform: none; opacity: 1; } }
  @keyframes crInlineDiffEnter { from { opacity: 0; } to { opacity: 1; } }
  @keyframes crSeal { 0% { opacity: 0; transform: scale(.35) rotate(-14deg); } 60% { opacity: 1; } 100% { opacity: 1; transform: none; } }
  @keyframes lfShiftL { from { transform: translateY(40px); } to { transform: none; } }
  @keyframes lfFadeOnly { from { opacity: 0; } to { opacity: 1; } }
  @keyframes lfTextSettle { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
  @keyframes lfColLeftIn { from { opacity: 0; transform: translateX(-24px); } to { opacity: 1; transform: none; } }
  @keyframes lfScrimIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes ctoast { from { opacity: 0; transform: translate(-50%, 8px); } }
  @keyframes cshim { to { background-position: -200% 0; } }
  @keyframes cblink { 0%, 100% { opacity: .3; transform: scale(.8); } 50% { opacity: 1; transform: scale(1.1); } }
  @keyframes cspin { to { transform: rotate(360deg); } }
  @keyframes rgPop { from { transform: translateY(26px) scale(.96); } to { transform: none; } }`,
);

/* 2) 时长令牌 */
must("    --d-page: .92s;", "d-page");
s = s.replace("    --d-page: .92s;", "    --d-base: .5s;\n    --d-slow: 1.25s;\n    --d-page: .92s;");

/* 3) 首屏：左栏左滑入、中栏上滑淡入、卡片逐条 settle（原站 .c-tree / .c-view / .c-doc>*） */
must("  .pane-nav {", "pane-nav");
s = s.replace(
`  .pane-nav { flex: 0 0 var(--nav-w); padding: 14px 12px; background: var(--paper-2); border-right: 1px solid var(--line); }`,
`  .pane-nav {
    flex: 0 0 var(--nav-w); padding: 14px 12px; background: var(--paper-2);
    border-right: 1px solid var(--line);
    animation: lfColLeftIn var(--d-base) var(--ease-out) both;
  }`,
);

must("  .doc-col {", "doc-col");
s = s.replace(
`  .doc-col { max-width: 1200px; margin: 0 auto; width: 100%; padding: 30px 40px 56px; }`,
`  .doc-col {
    max-width: 1200px; margin: 0 auto; width: 100%; padding: 30px 40px 56px;
    animation: lfShiftL var(--d-page) var(--ease-out) both, lfFadeOnly var(--d-page) ease both;
  }
  /* 章节内元素首屏逐条落位（原站 .c-doc>* 的 nth-child 错开） */
  .chapter > * { animation: lfTextSettle var(--d-page) var(--ease-out) both, lfFadeOnly var(--d-page) ease both; }
  .chapter > *:nth-child(1) { animation-delay: .04s; }
  .chapter > *:nth-child(2) { animation-delay: .09s; }
  .chapter > *:nth-child(3) { animation-delay: .14s; }
  .chapter > *:nth-child(4) { animation-delay: .19s; }
  .chapter > *:nth-child(5) { animation-delay: .24s; }
  .chapter > *:nth-child(6) { animation-delay: .29s; }
  .chapter > *:nth-child(7) { animation-delay: .33s; }
  .chapter > *:nth-child(n+8) { animation-delay: .37s; }`,
);

/* 4) 抽屉：遮罩淡入 + 抽屉右滑（原站用 --ease） */
must("    animation: crslidein .26s var(--ease-out) both;", "drawer anim");
s = s.replace("    animation: crslidein .26s var(--ease-out) both;", "    animation: crslidein .26s var(--ease) both;");
must("  .cr-drawer-mask {\n    position: fixed; inset: 0;", "mask css");
s = s.replace(
`  .cr-drawer-mask {
    position: fixed; inset: 0;`,
`  .cr-drawer-mask {
    position: fixed; inset: 0;
    animation: lfScrimIn .3s ease both; backdrop-filter: blur(3px);`,
);

/* 5) 差异行淡入 + 徽章印章入 + 空态 shimmer + 加载转圈 */
must("  .cr-rdiff-row { display: flex; flex-direction: column; gap: 6px; }", "rdiff row");
s = s.replace(
`  .cr-rdiff-row { display: flex; flex-direction: column; gap: 6px; }`,
`  .cr-rdiff-row { display: flex; flex-direction: column; gap: 6px; animation: crInlineDiffEnter .24s ease-out both; }`,
);

must("  .badge {", "badge");
s = s.replace(
`  .badge {`,
`  .badge { animation: crSeal .42s var(--ease-out) both;`,
);

must("  .cr-revision-empty {", "empty");
s = s.replace(
`  .cr-revision-empty { padding: 24px 4px; text-align: center; color: var(--ink-3); font-size: 12.5px; }`,
`  .cr-revision-empty { padding: 24px 4px; text-align: center; color: var(--ink-3); font-size: 12.5px; }
  /* 骨架条 shimmer（原站 .cr-vol-skel i） */
  .skel-lines { display: flex; flex-direction: column; gap: 8px; padding: 16px 4px; }
  .skel-lines i {
    height: 13px; border-radius: 4px;
    background: linear-gradient(90deg, var(--paper-2) 30%, var(--paper-3) 50%, var(--paper-2) 70%);
    background-size: 200% 100%; animation: cshim 1.4s linear infinite;
  }
  .c-spin {
    width: 16px; height: 16px; border-radius: 50%; border: 2.5px solid var(--gold-soft);
    border-top-color: var(--gold-deep); animation: cspin .8s linear infinite; flex: none;
  }
  .dot.writing { animation: cblink 1.6s ease-in-out infinite; }
  /* 提示条（原站 .c-toast） */
  .c-toast {
    position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
    max-width: calc(100% - 32px); overflow-wrap: anywhere; text-align: center; z-index: 100001;
    background: var(--ink); color: var(--paper); font-size: 13.5px; font-weight: 500;
    padding: 11px 20px; border-radius: 999px; box-shadow: 0 12px 34px -10px var(--shadow);
    animation: ctoast .25s var(--ease);
  }
  .c-toast[hidden] { display: none; }`,
);

/* 6) 纸质令牌 paper-3（shimmer 用） */
must("    --paper-2: #F8F4EB;", "paper-2");
s = s.replace("    --paper-2: #F8F4EB;", "    --paper-2: #F8F4EB;\n    --paper-3: #F1E9DA;");

writeFileSync(p, s, "utf8");
console.log("关键帧与入场动画已补齐（CSS 部分）");
