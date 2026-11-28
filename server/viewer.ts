// 工作台前端（无构建，单文件）
// 结构：外壳不滚，三栏各自滚动；1px 分隔条可拖拽，比例记忆（S1/S2）
// 视觉：暖纸 + 墨字 + 金点（S1 已换令牌；卡片细化在 S3）
export function viewerHtml(options: { localFonts?: boolean } = {}): string {
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
<style>
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
  /* 参考站 .c-doc：阅读栏 680px 居中 */
  /* 参考站实测：.c-titled-text-body 在 2048 视口下 1003px 宽、13px/1.8、圆角 6、左 3px 语义条 */
  .doc-col {
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
  .toc-row.reviewed { opacity: 1; }
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
</style>
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
    <span>未审 <b id="st-unreviewed">—</b></span>
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
let reviewSections = {};
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
    b.onclick = () => { currentVariant = v.key; renderVariants(); applyLayout(v.key); loadDoc(v.key); };
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
    const rv = document.createElement("button");
    rv.className = "link mini-action";
    rv.textContent = "标记已审";
    rv.onclick = (ev) => { ev.stopPropagation(); markReviewed("section", block.section_id); };
    // 整行可点：任一空白处也能跳章
    row.onclick = (ev) => {
      if (ev.target.closest(".mini-action")) return;
      scrollToSection(block.section_id);
    };
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
        refBits.push(fromBase ? "基类固定数值" : "萧山改写值");
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
  await loadReviews(variant);
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
document.addEventListener("click", (e) => {
  const mask = el("rev-drawer");
  if (mask.hidden) return;
  // 点遮罩空白处关闭；点抽屉内部不关
  if (e.target === mask) closeRevpop();
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeRevpop(); });
el("rev-drawer-close").onclick = closeRevpop;
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
