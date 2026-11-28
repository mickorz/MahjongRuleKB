// 工作台共享样式：viewer 与 /gallery 共用同一份 CSS
export function baseStyles(): string {
  return `
  :root {
    color-scheme: light;
    /* 暖纸 + 墨字 + 金点（取自参考站 design-tokens） */
    --paper: #FEFCF8;
    --paper-2: #F8F4EB;
    --paper-3: #F1E9DA;
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
    --sans: "Noto Sans SC", "PingFang SC", system-ui, sans-serif;
    --serif: "Noto Serif SC", "Songti SC", serif;
    --latin: "Newsreader", Georgia, serif;
    --mono: ui-monospace, "SF Mono", monospace;
    --ease: cubic-bezier(.2,.7,.2,1);
    --ease-out: cubic-bezier(.16,1,.3,1);
    --d-base: .5s;
    --d-slow: 1.25s;
    --d-page: .92s;
    --nav-w: 250px;
    /* 中间栏阅读宽度：正文列的 max-width，改这一个值即可调整整栏宽窄 */
    --doc-w: 1200px;
  }
  * { box-sizing: border-box; }
  /* 入场/交互动画（原站同名关键帧，参数一致） */
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
  @keyframes asstWindowIn { from { opacity: .75; transform: translateY(10px); } to { opacity: 1; transform: none; } }
  @keyframes asstSuggestionIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes asstThinking { 0%, 70%, 100% { opacity: .3; transform: translateY(1px); } 35% { opacity: 1; transform: translateY(-2px); } }
  @keyframes rgPop { from { transform: translateY(26px) scale(.96); } to { transform: none; } }
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
  /* 玩法 tab：原站 .cr-phasebar + .pbi（胶囊，选中金底白字，未选描边） */
  .cr-phasebar { display: flex; gap: 6px; padding-bottom: 12px; border-bottom: 1px solid var(--line); }
  .cr-phasebar .pbi {
    font-size: 11.5px; color: var(--ink-3); background: var(--card);
    border: 1px solid var(--line); border-radius: 999px; padding: 4px 11px;
    cursor: pointer; font-family: inherit; line-height: 1.4;
    transition: background .18s var(--ease), color .18s var(--ease), border-color .18s var(--ease);
  }
  .cr-phasebar .pbi:hover:not(.on) { color: var(--ink); border-color: var(--gold-soft); }
  .cr-phasebar .pbi.done { background: var(--gold-wash); color: var(--gold-deep); border-color: var(--gold-soft); }
  .cr-phasebar .pbi.on { background: var(--gold-deep); color: #fff; border-color: var(--gold-deep); font-weight: 600; }
  .doc-name { font-size: 12px; color: var(--ink-2); white-space: nowrap; }
  .doc-ver {
    font-size: 11px; color: var(--ink-3); font-variant-numeric: tabular-nums;
    border: 1px solid var(--line); border-radius: 999px; padding: 1px 8px;
  }

  .app-body { flex: 1 1 auto; display: flex; min-height: 0; }
  .pane-nav {
    flex: 0 0 var(--nav-w); padding: 14px 12px; background: var(--paper-2);
    border-right: 1px solid var(--line);
    animation: lfColLeftIn var(--d-base) var(--ease-out) both;
  }
  .pane-main { flex: 1 1 auto; padding: 0; min-width: 0; background: var(--paper); scrollbar-gutter: stable both-edges; }
  /* 正文列：宽度由 --doc-w 控制（原 1200px 的硬编码会把自定义宽度顶掉） */
  .doc-col {
    max-width: var(--doc-w); margin: 0 auto; width: 100%; padding: 30px 40px 56px;
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
  .chapter > *:nth-child(n+8) { animation-delay: .37s; }

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
  /* 分组标签（原站 .c-label） */
  .group-label {
    font: 600 11px/1.4 var(--latin); letter-spacing: .08em; text-transform: uppercase;
    color: var(--ink-3); margin: 4px 0 12px;
  }
  /* 章节容器：切章时逐条升起（原站 .cr-dp>*） */
  .chapter { display: block; }
  .chapter.enter > * { animation: crRiseSm var(--d-page) var(--ease-out) both; }
  .chapter.enter > *:nth-child(1) { animation-delay: 0s; }
  .chapter.enter > *:nth-child(2) { animation-delay: .04s; }
  .chapter.enter > *:nth-child(3) { animation-delay: .08s; }
  .chapter.enter > *:nth-child(4) { animation-delay: .12s; }
  .chapter.enter > *:nth-child(5) { animation-delay: .16s; }
  .chapter.enter > *:nth-child(n+6) { animation-delay: .20s; }

  .doc-titlerow { display: flex; align-items: flex-start; gap: 16px; }
  .doc-titlerow h1 { flex: 1 1 auto; min-width: 0; }
  .doc-titlerow .cr-history-trigger { margin-top: 8px; }

  /* 文档大标题（原站 .cr-vol-nm：34px / 600 / 1.1） */
  h1 { font-family: var(--serif); font-size: 34px; font-weight: 600; line-height: 1.1; margin: 3px 0 18px; color: var(--ink); }
  /* 章节标题（衬线小节 + 2px 金线，参考 .cr-vol-paneh） */
  h2 {
    font-family: var(--serif); font-size: 16px; font-weight: 600; line-height: 1.5;
    color: var(--ink); margin: 30px 0 12px; padding-bottom: 11px;
    border-bottom: 2px solid var(--gold-soft);
    position: sticky; top: -26px; background: var(--paper); z-index: 2;
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
  /* 左栏列表逐条升起（原站 .cr-itemlist>* + nth-child 错开） */
  .toc > * { animation: crRiseSm .72s var(--ease-out) both; }
  .toc > *:nth-child(1) { animation-delay: .20s; }
  .toc > *:nth-child(2) { animation-delay: .28s; }
  .toc > *:nth-child(3) { animation-delay: .36s; }
  .toc > *:nth-child(4) { animation-delay: .44s; }
  .toc > *:nth-child(5) { animation-delay: .52s; }
  .toc > *:nth-child(n+6) { animation-delay: .60s; }
  .toc-row:hover { opacity: 1; border-color: var(--gold-soft); }
  .toc-row.on {
    opacity: 1; border-color: var(--gold-deep); box-shadow: 0 0 0 2px var(--gold-soft);
  }
  .toc-row.on .link { font-weight: 600; color: var(--ink); }
  .toc-mid { flex: 1 1 auto; min-width: 0; }
  .toc-nm {
    display: block; font-size: 13.5px; font-weight: 600; color: inherit;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .toc-sub { font-size: 11.5px; color: var(--ink-3); font-weight: 400; margin-top: 2px; }
  .dot { width: 7px; height: 7px; border-radius: 50%; flex: 0 0 auto; background: var(--line); }
  .dot.current { background: var(--gold); }
  button.link {
    background: none; border: none; color: inherit; cursor: pointer; font: inherit;
    font-size: 12.5px; padding: 0; text-align: left; flex: 1 1 auto; min-width: 0;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  button.link:hover { color: var(--gold-deep); }
  button.link:focus-visible { outline: 2px solid var(--gold-deep); outline-offset: 2px; border-radius: 4px; }

  /* 配置卡：label / value 两列（参考站 .cc-row） */
  /* 配置卡：宽屏两列（参考站 .cr-optgrid 的两栏思路） */
  #doc-body { display: flex; flex-direction: column; }
  .cfgcard {
    margin: 0; padding: 14px 16px; border: 1px solid var(--line); border-radius: 9px;
    background: var(--card); display: flex; flex-direction: column; gap: 12px;
  }
  .cfg-grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 22px; align-items: start; margin: 10px 0 14px; }
  @media (max-width: 900px) { .cfg-grid { grid-template-columns: 1fr; } }
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
  .seg-body .ref-inline, .cc-row .cv .ref-inline {
    font-family: inherit; color: var(--gold-deep); border-bottom: 1px dotted var(--gold-soft);
  }
  .seg-body code.ref-inline { font-family: inherit; background: none; border: none; border-bottom: 1px dotted var(--gold-soft); }

  .seg-body code, .cc-row .cv code {
    font-family: var(--mono);
    font-size: .92em; background: var(--paper-2); border: 1px solid var(--line-2);
    border-radius: 4px; padding: 0 4px;
  }

  /* 片段卡片（S3 已细化为两列卡 / 规则卡） */
  .seg {
    margin: 8px 0; padding: 12px 14px; border-radius: 6px;
    border: 1px solid var(--line); border-left: 3px solid var(--gold-soft);
    background: var(--card);
    font-family: var(--serif); font-size: 13px; line-height: 1.8; color: var(--ink);
    text-wrap: pretty;
  }
  .seg[data-lineage="modified"] { border-left-color: var(--gold); background: var(--gold-wash); }
  .seg[data-lineage="added"] { border-left-color: var(--sage); background: var(--sage-wash); }
  .seg[data-lineage$="inherited"] { border-left-color: oklch(0.70 0.06 250); }
  .seg:hover { border-color: var(--gold-soft); }
  .badge.warn { background: var(--gold-wash); border-color: var(--gold-soft); color: var(--gold-deep); font-weight: 600; }
  .badge { animation: crSeal .42s var(--ease-out) both;
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
  .c-btn:disabled { opacity: .45; cursor: default; border-color: var(--line); color: var(--ink-3); }

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

  /* 操作按钮（原站 .c-content-action） */
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

  /* 创作助手（对齐参考站新版 .asst-launch / .asst-drawer / .asst-heading ...） */
  .asst-launch {
    position: fixed; right: 22px; bottom: 84px; z-index: 720;
    width: 48px; height: 48px; display: grid; place-items: center; padding: 0;
    border: 1px solid color-mix(in srgb, var(--gold-deep) 35%, var(--line));
    border-radius: 50%; background: var(--ink); color: var(--paper);
    box-shadow: 0 10px 28px var(--shadow); cursor: pointer;
    transition: background .18s var(--ease), transform .18s var(--ease);
  }
  .asst-launch:hover { background: var(--gold-deep); transform: translateY(-2px); }
  .asst-launch[aria-expanded="true"] { background: var(--gold-deep); }
  .asst-launch:focus-visible { outline: 2px solid var(--gold-deep); outline-offset: 3px; }

  /* 浮动模式：贴右、满高（参考站 floating 几何），可拖拽可缩放 */
  .asst-drawer {
    position: fixed; z-index: 721;
    display: grid; grid-template-rows: auto minmax(0, 1fr) auto;
    overflow: hidden; border: 1px solid var(--line); border-radius: 12px;
    background: var(--paper); box-shadow: 0 16px 44px var(--shadow);
    animation: asstWindowIn .2s var(--ease-out) both;
  }
  .asst-drawer[hidden] { display: none; }
  .asst-drawer--floating {
    right: 16px; top: 16px; width: 480px; height: calc(100vh - 32px);
  }
  .asst-drawer--floating.asst-drawer--placed { right: auto; }

  /* 停靠模式：贴右满高、无圆角、只留左侧分隔线（参考站 --docked） */
  .asst-drawer--docked {
    right: 0; top: 0; bottom: 0; height: 100vh; width: 420px;
    border: 0; border-left: 1px solid var(--line); border-radius: 0;
    box-shadow: -3px 0 12px color-mix(in srgb, var(--shadow) 20%, transparent);
    animation: none;
  }
  /* 停靠时给正文让位（等价参考站 body:has(.asst-drawer--floating) 的 margin-right） */
  .app.asst-docked .app-body { padding-right: var(--asst-dock-w, 420px); }

  .asst-drawer--dragging { user-select: none; }
  .asst-drawer--dragging .asst-heading { cursor: grabbing; }

  /* 缩放手柄：浮动右下角、停靠左缘 */
  .asst-resize {
    position: absolute; z-index: 2; background: transparent;
  }
  .asst-resize--se { right: 0; bottom: 0; width: 16px; height: 16px; cursor: nwse-resize; }
  .asst-resize--se::after {
    content: ""; position: absolute; right: 4px; bottom: 4px; width: 7px; height: 7px;
    border-right: 2px solid var(--ink-3); border-bottom: 2px solid var(--ink-3);
    border-radius: 0 0 2px 0; opacity: .6;
  }
  .asst-resize--left { left: 0; top: 0; bottom: 0; width: 10px; cursor: ew-resize; }
  .asst-resize--left::before {
    content: ""; position: absolute; inset: 0 auto 0 0; width: 1px; background: var(--line);
    transition: background .15s var(--ease);
  }
  .asst-resize--left::after {
    content: ""; position: absolute; top: 50%; left: 4px; width: 3px; height: 40px;
    border-radius: 3px; background: color-mix(in srgb, var(--ink-3) 55%, var(--line));
    transform: translateY(-50%);
  }
  .asst-resize--left:hover::before { background: var(--gold-soft); }
  .asst-resize--left:hover::after { background: var(--gold-deep); height: 56px; }
  .asst-drawer--floating .asst-resize--left { display: none; }
  .asst-drawer--docked .asst-resize--se { display: none; }

  .asst-heading-actions { display: flex; align-items: center; gap: 4px; flex: none; }
  .asst-icon-button {
    width: 28px; height: 28px; display: grid; place-items: center; padding: 0;
    border: 1px solid transparent; border-radius: 6px; background: transparent;
    color: var(--ink-3); cursor: pointer;
    transition: background .15s var(--ease), color .15s var(--ease), border-color .15s var(--ease);
  }
  .asst-icon-button:hover { background: var(--card); border-color: var(--line); color: var(--ink); }
  .asst-icon-button:focus-visible { outline: 2px solid var(--gold-deep); outline-offset: 2px; }
  .asst-drawer--floating .asst-heading { cursor: grab; touch-action: none; }

  .asst-heading {
    display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
    padding: 20px 22px 16px; border-bottom: 1px solid var(--line);
  }
  .asst-heading h2 {
    margin: 0; font-family: var(--serif); font-size: 22px; font-weight: 650; color: var(--ink);
    line-height: 1.25;
  }
  .asst-heading p { max-width: 700px; margin: 7px 0 0; color: var(--ink-2); font-size: 12px; line-height: 1.7; }

  .asst-widget { flex: 1 1 auto; min-height: 0; overflow: hidden; display: block; }
  .asst-widget[hidden] { display: none; }
  .asst-composer { flex: 0 0 auto; display: block; }
  .asst-composer[hidden] { display: none; }
  .asst-compose[hidden] { display: none; }
  .asst-thread {
    min-height: 0; overflow: auto; padding: 20px 18px;
    display: flex; flex-direction: column; gap: 2px;
  }

  /* 空态：衬线大字 + 金线（原站 .asst-empty / ::before） */
  .asst-empty-block { width: 100%; max-width: 380px; margin: clamp(28px, 8vh, 64px) auto 28px; }
  .asst-empty {
    margin: 0 0 22px; color: var(--ink); font: 600 24px/1.45 var(--serif); letter-spacing: -.015em;
    animation: asstSuggestionIn .24s var(--ease-out) both;
  }
  .asst-empty::before {
    content: ""; display: block; width: 28px; height: 2px; margin-bottom: 16px;
    background: var(--gold-deep); border-radius: 1px;
  }
  .asst-examples { display: flex; flex-direction: column; gap: 8px; }
  .asst-example {
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    min-width: 0; min-height: 46px; padding: 12px 14px; text-align: left;
    border: 1px solid var(--line); border-radius: 7px; background: var(--card); color: var(--ink-2);
    font: 12.5px/1.5 var(--sans); cursor: pointer;
    animation: asstSuggestionIn .24s var(--ease-out) both;
    transition: background .15s var(--ease), border-color .15s var(--ease), color .15s var(--ease);
  }
  .asst-example:nth-child(1) { animation-delay: 0s; }
  .asst-example:nth-child(2) { animation-delay: .04s; }
  .asst-example:nth-child(3) { animation-delay: .08s; }
  .asst-example:hover { background: var(--gold-wash); border-color: var(--gold-soft); color: var(--ink); }
  .asst-example__arrow { flex: none; color: var(--ink-3); transition: transform .15s var(--ease-out), color .15s var(--ease-out); }
  .asst-example:hover .asst-example__arrow { color: var(--gold-deep); transform: translateX(3px); }

  /* 消息：原站不用气泡，直接文本块；用户侧右对齐 */
  .asst-message { width: fit-content; max-width: 100%; margin-bottom: 14px; }
  .asst-message strong { display: block; font: 600 11px/1.6 var(--sans); color: var(--ink-3); margin-bottom: 2px; }
  .asst-message p { margin: 0; font: 13px/1.7 var(--sans); color: var(--ink); white-space: pre-wrap; word-break: break-word; }
  .asst-message--user { max-width: min(76%, 30rem); margin-left: auto; }
  .asst-message--user strong { text-align: right; }
  .asst-message--user p { font-size: 13px; line-height: 1.7; color: var(--ink-2); }
  .asst-message--error p { color: var(--terra); }

  .asst-tools { margin-top: 6px; font: 11px/1.5 var(--sans); color: var(--ink-3); }
  .asst-ungrounded {
    margin-top: 4px; font: 11px/1.5 var(--sans); color: var(--terra);
    display: inline-flex; align-items: center; gap: 4px;
  }
  .asst-ungrounded::before { content: ""; width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

  /* 思维中（原站 .asst-thinking + 三点动画） */
  .asst-thinking { display: flex; align-items: center; gap: 7px; margin: 14px 0; color: var(--ink-2); font-size: 12px; }
  .asst-thinking__dots { display: inline-flex; align-items: center; gap: 3px; height: 12px; }
  .asst-thinking__dots i {
    width: 4px; height: 4px; border-radius: 50%; background: currentColor;
    animation: asstThinking 1.15s var(--ease) infinite;
  }
  .asst-thinking__dots i:nth-child(2) { animation-delay: .14s; }
  .asst-thinking__dots i:nth-child(3) { animation-delay: .28s; }

  /* 改稿提案卡（Action） */
  .asst-action {
    margin: 4px 0 16px; padding: 12px 14px; border: 1px solid var(--gold-soft);
    border-radius: 8px; background: var(--gold-wash);
    animation: asstSuggestionIn .24s var(--ease-out) both;
  }
  .asst-action-head {
    display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
    font: 600 11px/1.4 var(--sans); color: var(--gold-deep); letter-spacing: .02em;
  }
  .asst-action-head .seg-id { font-family: var(--mono); font-weight: 400; color: var(--ink-3); }
  .asst-action-old {
    padding: 8px 10px; border-radius: 6px; background: var(--paper-2); color: var(--ink-3);
    font-family: var(--serif); font-size: 12.5px; line-height: 1.7;
    text-decoration: line-through; text-decoration-color: color-mix(in srgb, var(--terra) 60%, transparent);
  }
  .asst-action-new {
    margin-top: 6px; padding: 8px 10px; border-radius: 6px;
    background: var(--card); border: 1px solid var(--gold-soft); color: var(--ink);
    font-family: var(--serif); font-size: 12.5px; line-height: 1.7;
  }
  .asst-action-why { margin: 8px 0 0; font-size: 11.5px; line-height: 1.6; color: var(--ink-2); }
  .asst-action-acts { display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; }
  .asst-action .c-btn.sm { min-height: 26px; padding: 3px 10px; font-size: 11.5px; }
  .asst-icon-button[aria-pressed="true"] {
    background: var(--gold-wash); border-color: var(--gold-soft); color: var(--gold-deep);
  }

  /* 输入区（原站 .asst-compose / .asst-compose-input / .asst-send） */
  .asst-compose {
    display: flex; align-items: flex-end; gap: 8px;
    padding: 14px 18px 16px; border-top: 1px solid var(--line); background: var(--paper);
  }
  .asst-compose-input {
    flex: 1; min-width: 0; border: 1px solid var(--line); border-radius: 8px;
    background: var(--card); overflow: hidden;
  }
  .asst-compose-input:focus-within { outline: 2px solid color-mix(in srgb, var(--gold-deep) 25%, transparent); border-color: var(--gold-deep); }
  .asst-compose textarea {
    display: block; width: 100%; box-sizing: border-box; border: 0; background: transparent;
    min-height: 72px; max-height: 180px; resize: vertical; padding: 11px 13px;
    color: var(--ink); font: 13.5px/1.6 var(--sans); outline: none;
  }
  .asst-send {
    flex: 0 0 auto; width: 38px; height: 38px; display: grid; place-items: center; padding: 0;
    border: 1px solid var(--ink); border-radius: 7px; background: var(--ink); color: var(--paper);
    cursor: pointer; transition: opacity .15s var(--ease), background .15s var(--ease);
  }
  .asst-send:hover:not(:disabled) { background: var(--gold-deep); border-color: var(--gold-deep); }
  .asst-send:disabled { cursor: not-allowed; opacity: .45; }
  .asst-send:focus-visible { outline: 2px solid var(--gold-deep); outline-offset: 3px; }

  /* 修订记录抽屉（原站 .cr-drawer / .cr-revision-*） */
  .cr-drawer-mask {
    position: fixed; inset: 0;
    animation: lfScrimIn .3s ease both; backdrop-filter: blur(3px); z-index: 90000; background: rgba(34,29,22,.18);
    display: flex; justify-content: flex-end;
  }
  .cr-drawer-mask[hidden] { display: none; }
  .cr-drawer {
    width: 680px; max-width: 96vw; height: 100%; background: var(--paper);
    animation: crslidein .26s var(--ease) both;
    border-left: 1px solid var(--line); box-shadow: -30px 0 80px -30px var(--shadow);
    display: flex; flex-direction: column;
  }
  .cr-drawer-head {
    flex: none; display: flex; align-items: center; gap: 12px; padding: 16px 20px;
    border-bottom: 1px solid var(--line); background: var(--paper-2);
  }
  .cr-drawer-head .ad {
    width: 38px; height: 38px; border-radius: 7px; flex: none; background: var(--gold-deep);
    color: #fff; display: grid; place-items: center;
  }
  .cr-drawer-head .ht { display: flex; flex-direction: column; line-height: 1.3; min-width: 0; }
  .cr-drawer-head .ht b { font-family: var(--serif); font-size: 17px; font-weight: 600; }
  .cr-drawer-head .ht i { font-style: normal; font-size: 11.5px; color: var(--ink-3); }
  .edt-x {
    width: 22px; height: 22px; border-radius: 4px; border: none; background: transparent;
    color: var(--ink-3); font-size: 18px; line-height: 1; cursor: pointer; flex: none; margin-left: auto;
  }
  .edt-x:hover { color: var(--terra); }

  .cr-revision-body { display: grid; grid-template-columns: 250px minmax(0, 1fr); flex: 1; min-height: 0; }
  .cr-revision-list {
    overflow-y: auto; padding: 10px; border-right: 1px solid var(--line);
    display: flex; flex-direction: column; gap: 7px;
  }
  .cr-revision-item {
    display: flex; flex-direction: column; gap: 5px; padding: 10px 11px;
    border: 1px solid var(--line); border-radius: 8px; background: var(--card); color: var(--ink-2);
    font-family: var(--sans); text-align: left; cursor: pointer;
  }
  .cr-revision-item.on {
    border-color: var(--gold-deep); background: color-mix(in srgb, var(--gold-deep) 7%, var(--card));
  }
  .cr-revision-item-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .cr-revision-item-top b { font-size: 13.5px; }
  .cr-revision-item time, .cr-revision-item small { font-size: 11px; color: var(--ink-3); }
  .cr-revision-item small { color: var(--ink-2); }

  .cr-revision-detail { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
  .cr-revision-detailbar {
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    padding: 12px 15px; border-bottom: 1px solid var(--line);
  }
  .cr-revision-detailbar b { font-size: 14px; }
  .cr-revision-detailbar span { font-size: 12px; color: var(--ink-3); margin-left: 8px; }
  .cr-revision-detail-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; flex: none; }
  .cr-revision-progress {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    padding: 9px 15px; background: var(--gold-wash); border-bottom: 1px solid var(--gold-soft);
    font-size: 12px; color: var(--ink-3);
  }
  .cr-revision-progress b { color: var(--ink); font-weight: 600; }
  .cr-revision-diff { flex: 1; overflow-y: auto; padding: 14px 15px 24px; display: flex; flex-direction: column; gap: 10px; }
  .cr-rdiff-row { display: flex; flex-direction: column; gap: 6px; animation: crInlineDiffEnter .24s ease-out both; }
  .cr-rdiff-row > h4 {
    margin: 0; font: 600 11px/1.4 var(--sans); letter-spacing: .04em; color: var(--ink-3);
  }
  .cr-rdiff-old {
    padding: 9px 11px; border-radius: 6px; background: var(--paper-2); color: var(--ink-3);
    font-family: var(--serif); font-size: 12.5px; line-height: 1.7;
    text-decoration: line-through; text-decoration-color: color-mix(in srgb, var(--terra) 60%, transparent);
  }
  .cr-rdiff-new {
    padding: 9px 11px; border-radius: 6px; background: var(--gold-wash);
    border: 1px solid var(--gold-soft); color: var(--ink);
    font-family: var(--serif); font-size: 12.5px; line-height: 1.7;
  }
  .cr-revision-empty { padding: 24px 4px; text-align: center; color: var(--ink-3); font-size: 12.5px; }
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
  .c-toast[hidden] { display: none; }
  .c-btn.sm { min-height: 26px; padding: 3px 10px; font-size: 11.5px; }
  .c-btn.gold { border-color: var(--gold-deep); background: var(--gold-deep); color: #fff; }

  @media (max-width: 960px) {
    .splitter:last-of-type { display: none; }
  }
`;
}

// 工作台前端（无构建，单文件）
// 结构：外壳不滚，三栏各自滚动；1px 分隔条可拖拽，比例记忆（S1/S2）
// 视觉：暖纸 + 墨字 + 金点（S1 已换令牌；卡片细化在 S3）
/** 聊天框 bundle 暴露的输入框句柄（避免源码级 import 一个运行时 URL） */
interface WidgetComposerHandle {
  setDisabled: (disabled: boolean) => void;
  setPlaceholder: (text: string) => void;
  clear: () => void;
  focus: () => void;
}

declare global {
  interface Window {
    __xcChat?: {
      mountChat: (el: HTMLElement, options: Record<string, unknown>) => { applyTurns: (turns: unknown[]) => void };
      mountComposer?: (el: HTMLElement, options: Record<string, unknown>) => WidgetComposerHandle;
    };
    __xcChatHandle?: { applyTurns: (turns: unknown[]) => void };
    __xcComposerHandle?: WidgetComposerHandle;
  }
}

export function viewerHtml(
  options: { localFonts?: boolean; chatWidget?: boolean; chatWidgetVersion?: number } = {},
): string {
  // 聊天框：vendor/xc-chat 构建出 server/chat-widget/ 时启用，否则回退内置渲染
  const chatWidget = options.chatWidget === true;
  const chatWidgetVersion = options.chatWidgetVersion ?? 0;
  // 本地有字体就发本地（离线可用），否则回退 Google CDN
  const fontLink = options.localFonts
    ? '<link rel="stylesheet" href="/fonts.css" />'
    : '<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin /><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600;700&family=Noto+Serif+SC:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400;1,6..72,500&display=swap" />';
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta http-equiv="cache-control" content="no-store" />
<title>策划工作台</title>
${fontLink}
<style>${baseStyles()}</style>
</head>
<body>
<div class="app" data-layout="two-pane">
  <header class="app-head">
    <span class="brand">策划工作台</span>
    <div class="head-right">
      <span class="doc-name" id="doc-name"></span>
      <span class="doc-ver" id="doc-ver"></span>
    </div>
  </header>

  <div class="app-body">
    <nav class="pane pane-nav" id="pane-nav" aria-label="文档导航">
      <div class="group-label">玩法</div>
      <div class="cr-phasebar" id="variants" role="tablist" aria-label="玩法"></div>
      <div class="group-label" style="margin-top:16px">检查摘要</div>
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

<button type="button" class="asst-launch" id="asst-launch" aria-label="创作助手" title="创作助手" aria-expanded="false">
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z M19 14l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"></path></svg>
</button>
<aside class="asst-drawer asst-drawer--floating" id="asst-drawer" hidden role="dialog" aria-modal="false" aria-labelledby="asst-title">
  <div class="asst-resize asst-resize--left" id="asst-resize-left" title="拖动调整宽度"></div>
  <div class="asst-resize asst-resize--se" id="asst-resize-se" title="拖动调整大小"></div>
  <header class="asst-heading" id="asst-heading">
    <div>
      <h2 id="asst-title">创作助手</h2>
      <p>基于当前玩法的规则文档回答；只能读，不会改动任何内容。</p>
    </div>
    <div class="asst-heading-actions">
      <button class="asst-icon-button" id="asst-mode" title="切换停靠 / 浮动" aria-label="切换停靠或浮动">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M15 4v16"></path></svg>
      </button>
      <button class="asst-icon-button" id="asst-edit-mode" type="button" title="改稿模式：让助手给出改写提案" aria-label="改稿模式" aria-pressed="false">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l10-10-4-4L4 16v4z"></path><path d="M14 6l4 4"></path></svg>
      </button>
      <button class="asst-icon-button" id="asst-reset" title="清空会话" aria-label="清空会话">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"></path></svg>
      </button>
      <button class="edt-x" id="asst-close" title="关闭" type="button">×</button>
    </div>
  </header>
  <div class="asst-widget" id="asst-widget" hidden></div>
  <div class="asst-composer" id="asst-composer" hidden></div>
  <div class="asst-thread" id="asst-thread"></div>
  <div class="asst-compose">
    <div class="asst-compose-input">
      <textarea id="asst-input" rows="2" placeholder="问点什么，回车发送"></textarea>
    </div>
    <button class="asst-send" id="asst-send" type="button" title="发送" aria-label="发送">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"></path></svg>
    </button>
  </div>
</aside>
<div class="c-toast" id="toast" hidden role="status"></div>
<div class="cr-drawer-mask" id="rev-drawer" hidden>
  <aside class="cr-drawer cr-revision-drawer" role="dialog" aria-modal="true" aria-label="修订记录">
    <div class="cr-drawer-head">
      <span class="ad" id="rev-drawer-icon"></span>
      <div class="ht">
        <b id="rev-drawer-title">修订记录</b>
        <i>每次修改都保留为独立版本，可查看差异或恢复</i>
      </div>
      <button class="edt-x" id="rev-drawer-close" title="关闭" type="button">×</button>
    </div>
    <div class="cr-revision-body">
      <div class="cr-revision-list" id="rev-list"></div>
      <div class="cr-revision-detail">
        <div class="cr-revision-detailbar">
          <div><b class="c-latin" id="rev-ver">—</b><span id="rev-meta"></span></div>
          <div class="cr-revision-detail-actions">
            <button class="c-btn sm" id="rev-original" type="button">查看原版</button>
            <button class="c-btn gold sm" id="rev-restore" type="button">恢复此版本</button>
          </div>
        </div>
        <div class="cr-revision-progress"><span>写入这个版本时</span><b id="rev-progress">—</b></div>
        <div class="cr-revision-diff" id="rev-diff"></div>
      </div>
    </div>
  </aside>
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

/** 按 segment_id 在已加载文档里找片段（修订浮层「恢复此版本」用） */
function currentSegById(segmentId) {
  if (!currentDoc) return null;
  for (const block of currentDoc.blocks) {
    for (const seg of block.segments) {
      if (seg.segment_id === segmentId) return seg;
    }
  }
  return null;
}
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
    b.type = "button";
    b.textContent = v.label;
    b.className = "pbi" + (v.key === currentVariant ? " on" : "");
    b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", String(v.key === currentVariant));
    b.onclick = () => {
      if (v.key !== currentVariant) {
        // 会话按玩法隔离：切玩法即换会话 ID 并清空当前消息
        asst.messages = [];
        asst.sessionId = newAssistantSessionId();
        asstSave();
      }
      currentVariant = v.key;
      renderVariants();
      applyLayout(v.key);
      loadDoc(v.key);
    };
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
  const chap = h2.closest(".chapter");
  if (chap) {
    chap.classList.remove("enter");
    void chap.offsetWidth; // 强制重排，保证动画能重放
    chap.classList.add("enter");
  }
  markCurrentStep();
}

/* ---------- 文档渲染 ---------- */
let refNames = { rules: {}, configs: {} };

/** 助手会话与窗口状态（持久化到 localStorage，仅本机浏览器） */
const CHAT_WIDGET = ${chatWidget ? "true" : "false"};
const CHAT_WIDGET_V = "?v=${chatWidgetVersion}";
const ASST_KEY = "rs-assistant";
const asst = {
  messages: [],
  editMode: false,
  busy: false,
  mode: "floating", // floating | docked
  width: 480,
  height: 0, // 0 = 用满高
  x: null, // 拖拽后的左上角；null = 默认贴右
  y: null,
};

function asstSave() {
  try {
    localStorage.setItem(ASST_KEY, JSON.stringify({
      sessionId: asst.sessionId,
      mode: asst.mode,
      width: asst.width,
      height: asst.height,
      x: asst.x,
      y: asst.y,
      messages: asst.messages.slice(-40),
    }));
  } catch {}
}

function asstLoad() {
  try {
    const raw = localStorage.getItem(ASST_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (typeof saved.sessionId === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(saved.sessionId)) asst.sessionId = saved.sessionId;
    if (saved.mode === "docked" || saved.mode === "floating") asst.mode = saved.mode;
    if (typeof saved.width === "number") asst.width = saved.width;
    if (typeof saved.height === "number") asst.height = saved.height;
    if (typeof saved.x === "number") asst.x = saved.x;
    if (typeof saved.y === "number") asst.y = saved.y;
    if (Array.isArray(saved.messages)) {
      asst.messages = saved.messages.filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string");
    }
  } catch {}
}

function asstEl(id) { return document.getElementById(id); }

function newAssistantSessionId() {
  try {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
  } catch {}
  return "AS-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

/** 取当前会话 ID；没有就新建并落盘 */
function asstEnsureSession() {
  if (!asst.sessionId) {
    asst.sessionId = newAssistantSessionId();
    asstSave();
  }
  return asst.sessionId;
}

/** 空态示例：进来看得懂的起手问题（参考站 .asst-example 列表） */
const ASST_EXAMPLES = [
  "这个玩法和基座最大的差异在哪？",
  "讲一下「拖底」的判定条件",
  "哪些规则还没定下来？",
];

/** 把 asst 状态应用到窗口（位置/尺寸/模式/正文让位） */
function asstApplyGeometry() {
  const drawer = asstEl("asst-drawer");
  const app = document.querySelector(".app");
  drawer.classList.toggle("asst-drawer--docked", asst.mode === "docked");
  drawer.classList.toggle("asst-drawer--floating", asst.mode === "floating");
  drawer.classList.toggle("asst-drawer--placed", asst.x !== null && asst.mode === "floating");
  drawer.style.width = asst.width + "px";
  drawer.style.height = asst.mode === "floating" && asst.height > 0 ? asst.height + "px" : "";
  if (asst.mode === "floating" && asst.x !== null && asst.y !== null) {
    drawer.style.left = asst.x + "px";
    drawer.style.top = asst.y + "px";
  } else {
    drawer.style.left = "";
    drawer.style.top = "";
  }
  // 只有「停靠且可见」才让正文让位；关闭后必须还原
  const dockedVisible = asst.mode === "docked" && !drawer.hidden;
  app.classList.toggle("asst-docked", dockedVisible);
  app.style.setProperty("--asst-dock-w", asst.width + "px");
}

/** 停靠 / 浮动切换 */
function asstToggleMode() {
  asst.mode = asst.mode === "docked" ? "floating" : "docked";
  if (asst.mode === "floating") {
    asst.x = null;
    asst.y = null;
  }
  asstApplyGeometry();
  asstSave();
}

/** 拖拽窗口（仅浮动模式；抓头部空白处，别抢按钮） */
function asstBindDrag() {
  const drawer = asstEl("asst-drawer");
  const head = asstEl("asst-heading");
  head.addEventListener("pointerdown", (ev) => {
    if (asst.mode !== "floating") return;
    if (ev.target.closest("button")) return;
    ev.preventDefault();
    const rect = drawer.getBoundingClientRect();
    const dx = ev.clientX - rect.left;
    const dy = ev.clientY - rect.top;
    drawer.classList.add("asst-drawer--dragging");
    try { head.setPointerCapture?.(ev.pointerId); } catch {}
    const onMove = (e) => {
      const maxX = window.innerWidth - 160;
      const maxY = window.innerHeight - 80;
      asst.x = Math.max(0, Math.min(maxX, e.clientX - dx));
      asst.y = Math.max(0, Math.min(maxY, e.clientY - dy));
      drawer.classList.add("asst-drawer--placed");
      drawer.style.left = asst.x + "px";
      drawer.style.top = asst.y + "px";
    };
    const onUp = () => {
      drawer.classList.remove("asst-drawer--dragging");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      asstSave();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  });
}

/** 缩放：浮动右下角改宽高，停靠左缘改宽 */
function asstBindResize() {
  const drawer = asstEl("asst-drawer");
  const bind = (handle, axis) => {
    handle.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      try { handle.setPointerCapture?.(ev.pointerId); } catch {}
      const startX = ev.clientX;
      const startY = ev.clientY;
      const startW = drawer.getBoundingClientRect().width;
      const startH = drawer.getBoundingClientRect().height;
      const onMove = (e) => {
        if (axis !== "y") asst.width = Math.max(320, Math.min(760, startW + (e.clientX - startX) * (asst.mode === "docked" ? -1 : 1)));
        if (axis === "xy") asst.height = Math.max(320, Math.min(window.innerHeight - 24, startH + (e.clientY - startY)));
        asstApplyGeometry();
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        asstSave();
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    });
  };
  bind(asstEl("asst-resize-se"), "xy");
  bind(asstEl("asst-resize-left"), "x");
}

/** 预构建聊天框（vendor/xc-chat 产出）；未构建时 chatWidget 为 false，走内置渲染 */
function widgetAvailable() {
  return CHAT_WIDGET === true;
}

/**
 * 把我们的会话历史映射成聊天框的 Turn 结构。
 * 约定与 studio/assistant/chat-turns.ts 一致：user 消息与随后的 assistant 消息合成一个 turn，
 * 否则工具步骤会落在没有提问的孤立 turn 里。
 */
function chatTurnsPayload() {
  const now = Date.now();
  const turns = [];
  let current = null;
  asst.messages.forEach((m, index) => {
    if (!current || m.role === "user") {
      const turnId = "turn-" + (index + 1);
      current = { id: turnId, conversationId: "conv-workbench", status: "completed", items: [] };
      turns.push(current);
    }
    const turnId = current.id;
    // 时间戳来源：user 用发送时刻，assistant 用响应时刻；步骤在区间内均分，
    // 这样参考项目的 turnDurationMs（末项时间 - 首项时间）能算出真实耗时。
    const sentAt = typeof m.at === "number" ? m.at - (typeof m.ms === "number" ? m.ms : 0) : undefined;
    const doneAt = typeof m.at === "number" ? m.at : undefined;
    const span = sentAt !== undefined && doneAt !== undefined ? Math.max(doneAt - sentAt, 1) : 0;
    const stampAt = (ratio) => (span > 0 ? Math.round(sentAt + span * ratio) : now + index);
    if (m.role === "user") {
      current.items.push({ id: turnId + "-user", turnId, type: "userMessage", text: m.content, timestamp: stampAt(0) });
      return;
    }
    // 兼容旧数据：早期只存了工具名字符串
    const stepList = (m.tools || []).map((t) => (typeof t === "string" ? { name: t, ok: true } : t));
    const stepCount = Math.max(stepList.length, 1);
    stepList.forEach((tool, i) => {
      current.items.push({
        id: turnId + "-tool-" + i,
        turnId,
        type: "dynamicToolCall",
        toolCallId: turnId + "-call-" + i,
        tool: tool.name,
        status: tool.ok ? "completed" : "failed",
        arguments: tool.args || {},
        output: tool.ok ? "ok" : String(tool.code || "error"),
        timestamp: stampAt((i + 1) / (stepCount + 1)),
      });
    });
    const bad = (m.claims || []).filter((c) => c.status !== "ok");
    if (bad.length > 0) {
      current.items.push({
        id: turnId + "-notice",
        turnId,
        type: "reasoning",
        status: "completed",
        text: "有 " + bad.length + " 条结论缺少可追溯依据：" + bad.map((c) => c.text.slice(0, 24)).join("；"),
        timestamp: stampAt(stepCount / (stepCount + 1)),
      });
    }
    if (String(m.content || "").trim()) {
      // phase=final_answer 才会被聊天框当作"最终回答"渲染（否则归入工作过程）
      current.items.push({
        id: turnId + "-answer",
        turnId,
        type: "agentMessage",
        status: "completed",
        phase: "final_answer",
        text: m.content,
        timestamp: stampAt(1),
      });
    }
  });
  return turns;
}

/** 输入区切换 + 状态同步：widget composer 与内置 textarea 二选一 */
function syncComposer() {
  const composerHost = asstEl("asst-composer");
  const useWidgetComposer = widgetAvailable() && !!window.__xcChat && typeof window.__xcChat.mountComposer === "function";
  if (composerHost) composerHost.hidden = !useWidgetComposer;
  const builtinCompose = document.querySelector(".asst-compose");
  if (builtinCompose) builtinCompose.hidden = useWidgetComposer;
  const composer = composerHandle();
  if (composer) {
    composer.setDisabled(!!asst.busy);
    composer.setPlaceholder(asst.editMode ? "描述要怎么改，例如「把这段写得更简洁」" : "问点什么，回车发送");
  }
}

/** 用参考项目的输入框替换内置输入区；未就绪返回 null（调用方回退） */
function composerHandle() {
  const host = asstEl("asst-composer");
  if (!host || !widgetAvailable() || !window.__xcChat) return null;
  if (host.__mounted) return window.__xcComposerHandle || null;
  const mountComposer = window.__xcChat.mountComposer;
  if (typeof mountComposer !== "function") return null;
  host.__mounted = true;
  window.__xcComposerHandle = mountComposer(host, {
    cssUrl: "/chat-widget/chat-lib.css" + CHAT_WIDGET_V,
    placeholder: "问点什么，回车发送",
    onSend: (text) => {
      const value = String(text || "").trim();
      if (!value) return;
      if (asst.editMode) asstPropose(value); else asstAsk(value);
    },
  });
  return window.__xcComposerHandle;
}

/** 用预构建聊天框渲染整个会话；返回 false 表示不可用（调用方回退） */
async function renderWithWidget() {
  if (!widgetAvailable()) return false;
  const host = asstEl("asst-widget");
  if (!host) return false;
  if (!window.__xcChat) {
    try {
      window.__xcChat = await import("/chat-widget/chat-lib.js" + CHAT_WIDGET_V);
    } catch (error) {
      console.warn("[chat-widget] 加载失败，回退内置渲染", error);
      return false;
    }
  }
  try {
    if (!host.__mounted) {
      host.__mounted = true;
      window.__xcChatHandle = window.__xcChat.mountChat(host, {
        turns: chatTurnsPayload(),
        language: "zh-CN",
        cssUrl: "/chat-widget/chat-lib.css" + CHAT_WIDGET_V,
      });
    } else {
      window.__xcChatHandle.applyTurns(chatTurnsPayload());
    }
    composerHandle();
    syncComposer();
    return true;
  } catch (error) {
    console.warn("[chat-widget] 渲染失败，回退内置渲染", error);
    return false;
  }
}

function asstRender() {
  const thread = asstEl("asst-thread");
  thread.innerHTML = "";

  // 预构建聊天框可用时：整段会话交给它渲染，内置渲染留作空态与回退
  const widgetHost = asstEl("asst-widget");
  if (widgetHost) widgetHost.hidden = !widgetAvailable() || asst.messages.length === 0;

  syncComposer();
  if (widgetAvailable() && asst.messages.length > 0) {
    thread.hidden = true;
    renderWithWidget();
    return;
  }
  thread.hidden = false;

  if (asst.messages.length === 0) {
    const block = document.createElement("div");
    block.className = "asst-empty-block";
    const h = document.createElement("h3");
    h.className = "asst-empty";
    h.textContent = "想从哪里开始？";
    block.appendChild(h);
    const list = document.createElement("div");
    list.className = "asst-examples";
    for (const text of ASST_EXAMPLES) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "asst-example";
      const span = document.createElement("span");
      span.textContent = text;
      b.appendChild(span);
      const arrow = document.createElement("span");
      arrow.className = "asst-example__arrow";
      arrow.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M13 6l6 6-6 6"></path></svg>';
      b.appendChild(arrow);
      b.onclick = () => { asstEl("asst-input").value = text; asstAsk(text); };
      list.appendChild(b);
    }
    block.appendChild(list);
    thread.appendChild(block);
    return;
  }

  for (const m of asst.messages) {
    const art = document.createElement("article");
    art.className = "asst-message asst-message--" + m.role;
    const who = document.createElement("strong");
    who.textContent = m.role === "user" ? "你" : "助手";
    art.appendChild(who);
    const p = document.createElement("p");
    renderAsstText(p, m.content);
    art.appendChild(p);

    // 工具执行摘要（模型查了哪些工具）
    if (m.role === "assistant" && Array.isArray(m.tools) && m.tools.length) {
      const tools = document.createElement("div");
      tools.className = "asst-tools";
      const okCount = m.tools.filter((t) => t.ok).length;
      const names = [...new Set(m.tools.filter((t) => t.ok).map((t) => t.name))];
      const rejected = m.tools.length - okCount;
      tools.textContent =
        "查了 " + okCount + " 次" + (names.length ? "：" + names.join("、") : "") +
        (rejected > 0 ? "（" + rejected + " 次被预算拒绝）" : "");
      art.appendChild(tools);
    }
    // 逐条 claim 校验：全部通过才算有依据
    if (m.role === "assistant" && m.grounded === false) {
      const flag = document.createElement("div");
      flag.className = "asst-ungrounded";
      const bad = (m.claims || []).filter((c) => c.status !== "ok").length;
      flag.textContent = bad > 0 ? "有 " + bad + " 条结论缺少可追溯依据" : "本次回答未提供可追溯依据";
      art.appendChild(flag);
    }
    thread.appendChild(art);
    if (m.proposal) thread.appendChild(asstActionCard(m.proposal));
  }

  if (asst.busy) {
    const think = document.createElement("div");
    think.className = "asst-thinking";
    think.setAttribute("role", "status");
    const label = document.createElement("span");
    label.textContent = "助手正在读文档";
    think.appendChild(label);
    const dots = document.createElement("span");
    dots.className = "asst-thinking__dots";
    dots.innerHTML = "<i></i><i></i><i></i>";
    think.appendChild(dots);
    thread.appendChild(think);
  }

  thread.scrollTop = thread.scrollHeight;
}

/** 改稿提案卡：原 / 新 / 理由 + 应用·丢弃 */
function asstActionCard(proposal) {
  const box = document.createElement("div");
  box.className = "asst-action";

  const head = document.createElement("div");
  head.className = "asst-action-head";
  head.appendChild(document.createTextNode("改稿提案"));
  const id = document.createElement("span");
  id.className = "seg-id";
  id.textContent = proposal.segment_id;
  head.appendChild(id);
  box.appendChild(head);

  const oldEl = document.createElement("div");
  oldEl.className = "asst-action-old";
  oldEl.textContent = proposal.before;
  box.appendChild(oldEl);

  const newEl = document.createElement("div");
  newEl.className = "asst-action-new";
  newEl.textContent = proposal.after;
  box.appendChild(newEl);

  if (proposal.reason) {
    const why = document.createElement("p");
    why.className = "asst-action-why";
    why.textContent = proposal.reason;
    box.appendChild(why);
  }

  const acts = document.createElement("div");
  acts.className = "asst-action-acts";
  const apply = document.createElement("button");
  apply.type = "button";
  apply.className = "c-btn gold sm";
  apply.textContent = "应用";
  apply.onclick = () => asstApplyProposal(proposal, box);
  const drop = document.createElement("button");
  drop.type = "button";
  drop.className = "c-btn sm";
  drop.textContent = "丢弃";
  drop.onclick = () => {
    asst.messages = asst.messages.filter((m) => m.proposal !== proposal);
    asstSave();
    asstRender();
  };
  acts.appendChild(apply);
  acts.appendChild(drop);
  box.appendChild(acts);
  return box;
}

/** 文档上下文：整篇正文（上限 60000 字，超出截断并注明） */
function asstContext() {
  const NL = String.fromCharCode(10);
  if (!currentDoc) return { title: "", excerpt: "" };
  const title = nameOf(currentDoc.ruleset_id) + "需求文档";
  const parts = [];
  for (const block of currentDoc.blocks) {
    parts.push("## " + block.title);
    for (const seg of block.segments) parts.push(seg.text);
  }
  const full = parts.join(NL);
  // 单篇文档约 2.6 万字，整篇给模型（远低于上下文上限），不要再按字数粗暴截断
  const LIMIT = 60000;
  return { title, excerpt: full.length > LIMIT ? full.slice(0, LIMIT) + NL + "（后文已截断）" : full };
}

/** 极简 markdown：粗体、行内代码、换行（不引入第三方渲染器） */
function renderAsstText(p, text) {
  const NL = String.fromCharCode(10);
  const TICK = String.fromCharCode(96);
  const esc = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const BS = String.fromCharCode(92);
  const bold = new RegExp(BS + "*" + BS + "*([^*]+)" + BS + "*" + BS + "*", "g");
  const code = new RegExp(TICK + "([^" + TICK + "]+)" + TICK, "g");
  p.innerHTML = esc.replace(bold, "<strong>$1</strong>").replace(code, "<code>$1</code>").split(NL).join("<br>");
}

/** 改稿模式：请求提案 → 渲染 Action 卡片；应用仍走 /api/apply */
async function asstPropose(text) {
  const instruction = text.trim();
  if (!instruction || asst.busy) return;
  asst.messages.push({ role: "user", content: "（改稿）" + instruction, at: Date.now() });
  asst.busy = true;
  asstSave();
  asstRender();
  const startedAt = Date.now();
  let assistantAt = 0;
  const send = asstEl("asst-send");
  const sendHtml = send.innerHTML;
  send.disabled = true;
  send.innerHTML = '<span class="c-spin"></span>';
  asstEl("asst-input").value = "";
  try {
    const res = await fetch("/api/assistant/edit", {
      method: "POST",
      headers: { "content-type": "application/json", "X-Rule-Studio": "1" },
      body: JSON.stringify({ variant: currentVariant, instruction, session_id: asstEnsureSession() }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      assistantAt = Date.now();
      asst.messages.push({ role: "assistant", at: assistantAt, ms: assistantAt - startedAt, content: "（" + (data.message || data.error || res.status) + "）" });
    } else {
      assistantAt = Date.now();
      asst.messages.push({
        role: "assistant",
        at: assistantAt,
        ms: assistantAt - startedAt,
        content: data.reason ? "提案：" + data.reason : "提案：",
        proposal: { segment_id: data.segment_id, before: data.before, after: data.after, reason: data.reason },
      });
    }
  } catch (e) {
    asst.messages.push({ role: "assistant", content: "（请求失败：" + e.message + "）" });
  } finally {
    asst.busy = false;
    asstSave();
    send.disabled = false;
    send.innerHTML = sendHtml;
    asstRender();
  }
}

/** 应用提案：复用 /api/apply（权限矩阵 + 事务 + 版本递增） */
async function asstApplyProposal(proposal, card) {
  const btns = card.querySelectorAll("button");
  btns.forEach((b) => { b.disabled = true; });
  try {
    const res = await fetch("/api/apply", {
      method: "POST",
      headers: { "content-type": "application/json", "X-Rule-Studio": "1" },
      body: JSON.stringify({
        variant: currentVariant,
        mutations: [{
          target: { segment_id: proposal.segment_id },
          op: "replace-text",
          text: proposal.after,
          source: "richtext",
          rationale: "助手提案",
        }],
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      const why = (data.rejected || [])[0]?.reasons?.join("；") || data.message || data.error || res.status;
      toast("应用失败：" + why);
      btns.forEach((b) => { b.disabled = false; });
      return;
    }
    toast("已应用，版本 " + data.documentVersionBefore + " → " + data.documentVersionAfter);
    asst.messages = asst.messages.filter((m) => m.proposal !== proposal);
    asstSave();
    await loadDoc(currentVariant);
    asstRender();
  } catch (e) {
    toast("应用失败：" + e.message);
    btns.forEach((b) => { b.disabled = false; });
  }
}

async function asstAsk(text) {
  const content = text.trim();
  if (!content || asst.busy) return;
  asst.messages.push({ role: "user", content, at: Date.now() });
  asstSave();
  asstRender();
  asst.busy = true;
  const send = asstEl("asst-send");
  const sendHtml = send.innerHTML;
  send.disabled = true;
  send.innerHTML = '<span class="c-spin"></span>';
  asstEl("asst-input").value = "";
  asstRender();
  const startedAt = Date.now();
  let assistantAt = 0;
  try {
    const ctx = asstContext();
    const res = await fetch("/api/assistant", {
      method: "POST",
      headers: { "content-type": "application/json", "X-Rule-Studio": "1" },
      body: JSON.stringify({ variant: currentVariant, messages: asst.messages, session_id: asstEnsureSession(), ...ctx }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      assistantAt = Date.now();
      asst.messages.push({ role: "assistant", at: assistantAt, ms: assistantAt - startedAt, content: "（" + (data.message || data.error || res.status) + "）" });
    } else {
      assistantAt = Date.now();
      asst.messages.push({
        role: "assistant",
        at: assistantAt,
        ms: assistantAt - startedAt,
        content: data.text,
        ...(Array.isArray(data.claims) ? { claims: data.claims } : {}),
        ...(typeof data.grounded === "boolean" ? { grounded: data.grounded } : {}),
        ...(Array.isArray(data.tool_calls) ? { tools: data.tool_calls.map((t) => ({ name: t.name, ok: t.ok })) } : {}),
      });
    }
  } catch (e) {
    asst.messages.push({ role: "assistant", content: "（请求失败：" + e.message + "）" });
  } finally {
    asst.busy = false;
    asstSave();
    send.disabled = false;
    send.innerHTML = sendHtml;
    asstRender();
  }
}

/** 取全量 ID→中文名；正文里的 ID 会被换成名字（悬停仍显示 ID） */
async function loadRefNames(variant) {
  refNames = { rules: {}, configs: {} };
  try {
    const res = await fetch("/api/refs/" + variant);
    if (res.ok) refNames = await res.json();
  } catch {}
}

let revAnchor = null;

/** 原站 RevisionHistoryButton 用的 clock 图标 */
function clockIcon() {
  return '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2"></path></svg>';
}

let toastTimer = null;
/** 原站 .c-toast：底部胶囊提示，2.4s 自动消失 */
function toast(text) {
  const box = el("toast");
  box.textContent = text;
  box.hidden = false;
  // 重放动画
  box.style.animation = "none";
  void box.offsetWidth;
  box.style.animation = "";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { box.hidden = true; }, 2400);
}

function closeRevpop() {
  const mask = el("rev-drawer");
  if (!mask || mask.hidden) return;
  mask.hidden = true;
  if (revAnchor) revAnchor.setAttribute("aria-expanded", "false");
  revAnchor = null;
}

let revList = [];
let revSelected = null;
let revShowOriginal = false;

function fmtTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const p = (n) => String(n).padStart(2, "0");
  return d.getFullYear() + "/" + p(d.getMonth() + 1) + "/" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes());
}

async function openDocRevisions(anchor, doc) {
  const mask = el("rev-drawer");
  el("rev-drawer-icon").innerHTML = clockIcon(18);
  el("rev-drawer-title").textContent = nameOf(doc.ruleset_id) + " · 修订记录";
  mask.hidden = false;
  anchor.setAttribute("aria-expanded", "true");
  revAnchor = anchor;

  el("rev-list").innerHTML = '<div class="skel-lines"><i></i><i></i><i></i></div>';
  const res = await fetch("/api/revisions/" + currentVariant);
  if (!res.ok) {
    el("rev-list").innerHTML = '<div class="cr-revision-empty">读取版本失败</div>';
    return;
  }
  const body = await res.json();
  revList = body.revisions || [];
  if (revList.length === 0) {
    el("rev-list").innerHTML = '<div class="cr-revision-empty">还没有历史版本</div>';
    return;
  }
  renderRevList();
  await selectRevision(revList[0].id);
}

function renderRevList() {
  const box = el("rev-list");
  box.innerHTML = "";
  for (const rev of revList) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "cr-revision-item" + (rev.id === revSelected ? " on" : "");
    const top = document.createElement("span");
    top.className = "cr-revision-item-top";
    const v = document.createElement("b");
    v.className = "c-latin";
    v.textContent = "v" + rev.version;
    const src = document.createElement("span");
    src.textContent = rev.source;
    top.appendChild(v);
    top.appendChild(src);
    item.appendChild(top);
    const time = document.createElement("time");
    time.textContent = fmtTime(rev.time);
    item.appendChild(time);
    const small = document.createElement("small");
    small.textContent = rev.note;
    item.appendChild(small);
    item.onclick = () => selectRevision(rev.id);
    box.appendChild(item);
  }
}

async function selectRevision(id) {
  revSelected = id;
  revShowOriginal = false;
  renderRevList();
  const rev = revList.find((r) => r.id === id);
  if (!rev) return;
  el("rev-ver").textContent = "v" + rev.version;
  el("rev-meta").textContent = rev.source + " · " + fmtTime(rev.time);
  el("rev-progress").textContent = rev.id === "current" ? "当前本地版本" : "该版本已提交到本地";
  el("rev-restore").disabled = rev.id === "current";
  el("rev-original").disabled = rev.id === "current";

  const diff = el("rev-diff");
  diff.innerHTML = '<div class="skel-lines"><i></i><i></i><i></i><i></i></div>';
  const res = await fetch("/api/revisions/" + currentVariant + "/" + encodeURIComponent(id));
  if (!res.ok) {
    diff.innerHTML = '<div class="cr-revision-empty">这一版没有可比较的原文（备份缺失）</div>';
    return;
  }
  const body = await res.json();
  renderRevDiff(body.rows || []);
}

function renderRevDiff(rows) {
  const box = el("rev-diff");
  box.innerHTML = "";
  if (rows.length === 0) {
    box.innerHTML = '<div class="cr-revision-empty">这一版与当前文档没有文本差异</div>';
    return;
  }
  for (const row of rows) {
    const wrap = document.createElement("div");
    wrap.className = "cr-rdiff-row";
    const h = document.createElement("h4");
    h.textContent = row.section_title + " · " + row.segment_id;
    wrap.appendChild(h);
    if (!revShowOriginal) {
      const old = document.createElement("div");
      old.className = "cr-rdiff-old";
      old.textContent = row.before;
      wrap.appendChild(old);
    }
    const now = document.createElement("div");
    now.className = "cr-rdiff-new";
    now.textContent = row.after;
    wrap.appendChild(now);
    box.appendChild(wrap);
  }
}

async function restoreRevision() {
  if (!revSelected || revSelected === "current") return;
  el("rev-restore").disabled = true;
  const res = await fetch("/api/restore", {
    method: "POST",
    headers: { "content-type": "application/json", "X-Rule-Studio": "1" },
    body: JSON.stringify({ variant: currentVariant, revision_id: revSelected }),
  });
  const body = await res.json().catch(() => ({}));
  el("rev-restore").disabled = false;
  if (!res.ok) {
    el("rev-diff").insertAdjacentHTML("afterbegin", '<div class="cr-revision-empty">恢复失败：' + (body.message || body.error || res.status) + "</div>");
    return;
  }
  closeRevpop();
  toast("表达层已恢复（" + (body.transaction_id || "") + "）。document.json 需重新生成才会反映");
  await loadDoc(currentVariant);
}

function refsLabel(refs) {
  if (!refs || refs.length === 0) return "";
  return "规则 " + refs.slice(0, 3).join("、") + (refs.length > 3 ? " 等" : "");
}

/** 把反引号包裹的片段渲染成行内代码，其余保持纯文本 */
function nameOfRef(id) {
  return refNames.rules[id] || refNames.configs[id] || "";
}

/** 行内 ID（如 HJ-R-LUNZHUANG）渲染成中文名，悬停显示原 ID */
function appendTextWithRefs(container, text) {
  const re = /(?:HJ|XS)-[A-Z0-9]+(?:-[A-Z0-9]+)*/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    const name = nameOfRef(m[0]);
    if (!name) continue;
    if (m.index > last) container.appendChild(document.createTextNode(text.slice(last, m.index)));
    const span = document.createElement("span");
    span.className = "ref-inline";
    span.textContent = name;
    span.title = m[0];
    container.appendChild(span);
    last = m.index + m[0].length;
  }
  if (last < text.length) container.appendChild(document.createTextNode(text.slice(last)));
}

function renderRich(container, text) {
  const parts = String(text).split(/\`([^\`]+)\`/g);
  for (let i = 0; i < parts.length; i += 1) {
    if (!parts[i]) continue;
    if (i % 2 === 1) {
      // 反引号段（多为规则 ID）：能翻成名字就写名字，翻不到保留 ID
      const name = nameOfRef(parts[i].trim());
      const code = document.createElement("code");
      if (name) {
        code.textContent = name;
        code.title = parts[i];
        code.className = "ref-inline";
      } else {
        code.textContent = parts[i];
      }
      container.appendChild(code);
    } else {
      appendTextWithRefs(container, parts[i]);
    }
  }
}

function badge(text) {
  const span = document.createElement("span");
  span.className = "badge";
  span.textContent = text;
  return span;
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
  toast("应用失败，见上方原因");
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
  await loadRefNames(variant);
  draft.clear();
  el("foot-actions").hidden = true;
  el("diff-preview").hidden = true;
  el("doc-name").textContent = nameOf(doc.ruleset_id);
  el("doc-ver").textContent = "v" + doc.document_version;
  el("st-version").textContent = "版本 " + doc.document_version;

  const body = el("doc-body");
  body.innerHTML = "";
  const titleRow = document.createElement("div");
  titleRow.className = "doc-titlerow";
  const h1 = document.createElement("h1");
  h1.textContent = nameOf(doc.ruleset_id) + "需求文档";
  titleRow.appendChild(h1);
  // 整页唯一一个「修订记录」按钮（原站 RevisionHistoryButton，包在 DetailTools 里）
  const historyBtn = document.createElement("button");
  historyBtn.type = "button";
  historyBtn.className = "c-content-action utility cr-history-trigger";
  historyBtn.setAttribute("aria-expanded", "false");
  historyBtn.innerHTML = clockIcon() + "修订记录";
  historyBtn.onclick = (ev) => {
    ev.stopPropagation();
    if (!el("rev-drawer").hidden && revAnchor === historyBtn) { closeRevpop(); return; }
    openDocRevisions(historyBtn, doc);
  };
  titleRow.appendChild(historyBtn);
  body.appendChild(titleRow);

  const toc = el("toc");
  toc.innerHTML = "";
  let segCount = 0;

  let cfgGrid = null;
  for (const block of doc.blocks) {
    cfgGrid = null;
    const chap = document.createElement("section");
    chap.className = "chapter";
    chap.dataset.section = block.section_id;
    const h2 = document.createElement("h2");
    h2.textContent = block.title;
    h2.id = "sec-" + block.section_id;
    chap.appendChild(h2);

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
    // 整行可点：任一空白处也能跳章
    row.onclick = () => scrollToSection(block.section_id);
    toc.appendChild(row);

    for (const seg of block.segments) {
      segCount += 1;
      const isConfig = seg.references.config_refs.length > 0 && seg.references.rule_refs.length === 0;
      const div = document.createElement("div");
      div.dataset.lineage = seg.lineage;

      // 徽章：只在变体自有片段上显示（基座继承卡本就不可编辑，标了也是噪声）
      const isVariantOwn = seg.lineage === "modified" || seg.lineage === "added";
      const badges = [];
      if (isVariantOwn) {
        if (seg.lineage === "modified") badges.push("修改");
        if (seg.lineage === "added") badges.push("新增");
        if (seg.release_blocker_refs && seg.release_blocker_refs.length) {
          // 待裁决单独标记，渲染时加 .warn 变体（金色），与新增/修改区分
          badges.push({ text: "待裁决 " + seg.release_blocker_refs.join("、"), warn: true });
        }
        if (!seg.editable) badges.push("数值不可改写");
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
          note.textContent = badges.map((b) => (typeof b === "string" ? b : b.text)).join(" · ");
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
          for (const b of badges) {
            const label = typeof b === "string" ? b : b.text;
            const node = badge(label);
            if (typeof b === "object" && b.warn) node.classList.add("warn");
            head.appendChild(node);
          }
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
        let head = div.querySelector(".seg-head");
        if (!head) {
          head = document.createElement("div");
          head.className = "seg-head";
          div.insertBefore(head, div.firstChild);
        }
        const flag = badge("可编辑");
        flag.classList.add("editable-flag");
        head.appendChild(flag);
        div.dataset.segId = seg.segment_id;
        p.onblur = () => {
          const next = p.textContent.replace(/^\s+/, "");
          if (next !== seg.text) markEdited(seg.segment_id, next, seg.text);
        };
      }
      if (p) div.appendChild(p);

      // 来源脚注：显示中文名而不是字段 ID；ID 放 title 供追溯
      const refs = seg.references || {};
      const disp = seg.refs_display || { rules: [], configs: [] };
      const refBits = [];
      const refIds = [];
      if (disp.rules.length) {
        refBits.push("依据 " + disp.rules.map((r) => r.name).join("、"));
        refIds.push(...disp.rules.map((r) => r.id));
      }
      if (disp.configs.length) {
        const fromBase = seg.lineage === "default_inherited" || seg.lineage === "explicit_inherited";
        refBits.push(fromBase ? "基类固定值，不可改" : "萧山改写值");
        refIds.push(...disp.configs.map((c) => c.id));
      }
      const evidence = refs.source_evidence_refs || [];
      const foot = document.createElement("div");
      foot.className = "seg-foot";
      const summary = document.createElement("span");
      summary.className = "seg-foot-line";
      summary.textContent = refBits.join(" · ") || "无引用";
      if (refIds.length) summary.title = refIds.join("、");
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
          chap.appendChild(cfgGrid);
        }
        cfgGrid.appendChild(div);
      } else {
        cfgGrid = null;
        chap.appendChild(div);
      }
    }
    body.appendChild(chap);
  }

  window.__segCount = segCount;
  await loadChecks(variant);
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



/* ---------- 启动 ---------- */
document.addEventListener("click", (e) => {
  const mask = el("rev-drawer");
  if (mask.hidden) return;
  // 点遮罩空白处关闭；点抽屉内部不关
  if (e.target === mask) closeRevpop();
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeRevpop(); });
el("rev-drawer-close").onclick = closeRevpop;

asstLoad();
asstApplyGeometry();
asstBindDrag();
asstBindResize();

el("asst-mode").onclick = (ev) => { ev.stopPropagation(); asstToggleMode(); };
el("asst-edit-mode").onclick = () => {
  asst.editMode = !asst.editMode;
  el("asst-edit-mode").setAttribute("aria-pressed", String(asst.editMode));
  asstEl("asst-input").placeholder = asst.editMode ? "描述要怎么改，例如「把这段写得更简洁」" : "问点什么，回车发送";
  const liveComposer = composerHandle();
  if (liveComposer) liveComposer.focus(); else asstEl("asst-input").focus();
};
el("asst-reset").onclick = (ev) => {
  ev.stopPropagation();
  asst.messages = [];
  asst.sessionId = newAssistantSessionId();
  asstSave();
  asstRender();
  toast("会话已清空");
};

el("asst-launch").onclick = () => {
  const drawer = asstEl("asst-drawer");
  const open = drawer.hidden;
  drawer.hidden = !open;
  el("asst-launch").setAttribute("aria-expanded", String(open));
  asstApplyGeometry();
  if (open) {
    asstRender();
    const liveComposer = composerHandle();
    if (liveComposer) liveComposer.focus(); else asstEl("asst-input").focus();
  }
};
el("asst-close").onclick = () => {
  asstEl("asst-drawer").hidden = true;
  el("asst-launch").setAttribute("aria-expanded", "false");
  asstApplyGeometry();
};
el("asst-send").onclick = () => (asst.editMode ? asstPropose(asstEl("asst-input").value) : asstAsk(asstEl("asst-input").value));
asstEl("asst-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    const value = asstEl("asst-input").value;
    if (asst.editMode) asstPropose(value); else asstAsk(value);
  }
});
el("rev-restore").onclick = restoreRevision;
el("rev-original").onclick = () => {
  revShowOriginal = !revShowOriginal;
  el("rev-original").textContent = revShowOriginal ? "隐藏原版" : "查看原版";
  selectRevision(revSelected);
};

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
