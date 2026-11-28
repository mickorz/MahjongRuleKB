// 内容卡片形态总览（/gallery）
// 家族 / 顺序 / 结构对齐参考站 _gallery/cards.html（8 家族 12 种），
// 内容换成本项目（萧山好友房规则库）。
import { baseStyles } from "./viewer.ts";

/* ---------------- 组件样式（mg-*，结构对照原站 c-*） ---------------- */
const COMPONENT_CSS = `
  /* 面板 + 工具栏（原站 c-content-panel / c-content-toolbar） */
  .mg-panel {
    border: 1px solid var(--line); border-radius: 9px; background: var(--card);
    padding: 14px 16px; display: flex; flex-direction: column; gap: 12px;
  }
  .mg-bar { display: flex; align-items: center; gap: 10px; padding-bottom: 10px; border-bottom: 1px solid var(--line-2); }
  .mg-bar-title { display: flex; align-items: baseline; gap: 8px; min-width: 0; }
  .mg-bar-d { width: 7px; height: 7px; border-radius: 50%; background: var(--ink-3); flex: none; }
  .mg-bar-d.gold { background: var(--gold-deep); }
  .mg-bar-d.terra { background: var(--terra); }
  .mg-bar-d.slate { background: oklch(0.62 0.04 250); }
  .mg-bar-t { font-family: var(--serif); font-size: 14.5px; font-weight: 600; color: var(--ink); }
  .mg-bar-c { font-family: var(--latin); font-style: italic; font-size: 12px; color: var(--gold-deep); }
  .mg-bar-acts { margin-left: auto; display: flex; align-items: center; gap: 6px; }
  .mg-panel-body { font-family: var(--serif); font-size: 13px; line-height: 1.8; color: var(--ink); }

  /* 身份卡（原站 c-character-identity-surface：姓名 + 信息条 + 行内编辑） */
  .mg-identity { display: flex; gap: 14px; align-items: flex-start; }
  .mg-avatar {
    width: 52px; height: 52px; border-radius: 8px; flex: none;
    display: grid; place-items: center; background: var(--gold-deep); color: #fff;
    font-family: var(--serif); font-size: 22px; font-weight: 600;
  }
  .mg-identity-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
  .mg-identity-name { display: flex; align-items: baseline; gap: 10px; }
  .mg-identity-name b { font-family: var(--serif); font-size: 19px; font-weight: 600; }
  .mg-identity-name span { font-size: 12px; color: var(--ink-3); }
  .mg-metabar { display: flex; flex-wrap: wrap; gap: 6px 14px; align-items: center; }
  .mg-mi { display: inline-flex; align-items: baseline; gap: 5px; font-size: 12px; }
  .mg-mi i { font-style: normal; color: var(--ink-3); font-size: 11.5px; }
  .mg-mi b { font-family: var(--serif); font-weight: 600; color: var(--ink); }

  /* 结构化列表（原站 c-structured-list：rows / key / value，grid 与 stack 两种布局） */
  .mg-rows { display: grid; gap: 8px 18px; }
  .mg-rows.grid { grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); }
  .mg-rows.stack { grid-template-columns: 1fr; }
  .mg-row { display: flex; gap: 10px; align-items: baseline; min-width: 0; }
  .mg-key { flex: none; width: 96px; font: 11.5px/1.6 var(--sans); color: var(--ink-3); }
  .mg-rows.stack .mg-key { width: 118px; }
  .mg-val { flex: 1; min-width: 0; font: 13px/1.6 var(--serif); color: var(--ink); }

  /* 列表：带序号，可增删 / 编辑中 */
  .mg-list { display: flex; flex-direction: column; gap: 6px; }
  .mg-list-row {
    display: flex; align-items: center; gap: 10px; padding: 7px 10px;
    border: 1px solid var(--line); border-radius: 6px; background: var(--paper);
    font: 12.5px/1.6 var(--serif); color: var(--ink);
  }
  .mg-list-no { font-family: var(--latin); font-style: italic; font-size: 11.5px; color: var(--ink-3); flex: none; width: 18px; }
  .mg-x {
    margin-left: auto; width: 20px; height: 20px; flex: none; display: grid; place-items: center;
    border: none; background: none; color: var(--ink-3); cursor: pointer; border-radius: 4px; font: 14px/1 var(--sans);
  }
  .mg-x:hover { background: var(--paper-2); color: var(--terra); }
  .mg-list-row.editing { border-color: var(--gold-deep); background: var(--gold-wash); }
  .mg-list-row.editing input {
    flex: 1; min-width: 0; border: none; background: transparent; outline: none;
    font: 12.5px/1.6 var(--serif); color: var(--ink);
  }
  .mg-list-acts { display: flex; gap: 4px; flex: none; }

  /* 关系网络：中心节点 + 环绕节点（原站 c-character-rel-graph） */
  .mg-relgraph { position: relative; height: 300px; }
  .mg-relgraph > svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .mg-relgraph line { stroke: var(--ink-3); stroke-width: 1.4; opacity: .5; vector-effect: non-scaling-stroke; }
  .mg-relgraph line.selected { stroke: var(--gold-deep); stroke-width: 2.4; opacity: .95; }
  .mg-relgraph line.hostile { stroke: var(--terra); stroke-width: 2; stroke-dasharray: 6 4; opacity: .8; }
  .mg-rel-center {
    position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
    display: flex; flex-direction: column; align-items: center; gap: 2px; text-align: center;
  }
  .mg-rel-center b { font-family: var(--serif); font-size: 15px; font-weight: 600; color: var(--ink); }
  .mg-rel-center span { font: 10.5px/1.3 var(--sans); color: var(--ink-3); }
  .mg-rel-node {
    position: absolute; transform: translate(-50%, -50%); z-index: 3;
    display: flex; flex-direction: column; align-items: center; gap: 1px;
    min-width: 84px; padding: 6px 10px; border: 1.5px solid var(--line); border-radius: 10px;
    background: var(--card); cursor: pointer; font-family: inherit;
  }
  .mg-rel-node b { font: 600 12px/1.3 var(--sans); color: var(--ink); }
  .mg-rel-node span { font: 10px/1.3 var(--sans); color: var(--ink-3); }
  .mg-rel-node:hover, .mg-rel-node.selected { border-color: var(--gold); background: var(--gold-wash); }

  /* 信念卡：引文 + 来源 + 依据行 */
  .mg-belief-quote {
    margin: 0; padding: 12px 14px; border-left: 3px solid var(--gold-deep);
    background: var(--gold-wash); border-radius: 0 7px 7px 0;
    font: 600 13.5px/1.8 var(--serif); color: var(--ink);
  }
  .mg-belief-quote .badge { margin-left: 8px; vertical-align: 2px; }
  .mg-belief-src { display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 10px; }
  .mg-belief-src .lab { font: 11px/1.5 var(--sans); color: var(--ink-3); margin-right: 4px; }
  .mg-belief-src .v { font: 12px/1.6 var(--serif); color: var(--ink-2); }

  /* 阅读卡：布局切换 + 分组 + 键值行 */
  .mg-reader-waterfall { display: flex; flex-direction: column; gap: 12px; }
  .mg-reader-group h3 {
    margin: 0 0 6px; font: 600 12.5px/1.5 var(--sans); color: var(--ink);
    display: flex; align-items: center; gap: 8px;
  }
  .mg-reader-group h3 span { font-family: var(--latin); font-style: italic; font-size: 11px; color: var(--ink-3); }
  .mg-reader-row { display: flex; gap: 10px; padding: 4px 0; border-top: 1px dashed var(--line-2); }
  .mg-reader-row:first-of-type { border-top: none; }
  .mg-reader-key { flex: none; width: 92px; font: 11.5px/1.6 var(--sans); color: var(--ink-3); }
  .mg-reader-value { flex: 1; min-width: 0; font: 12.5px/1.75 var(--serif); color: var(--ink); }

  /* 声音卡：左侧编号索引 + 右侧内容 */
  .mg-voice-body { display: grid; grid-template-columns: 148px minmax(0, 1fr); gap: 14px; }
  .mg-voice-index { display: flex; flex-direction: column; gap: 4px; }
  .mg-voice-index button {
    display: flex; align-items: baseline; gap: 8px; padding: 7px 9px; text-align: left;
    border: 1px solid var(--line); border-radius: 6px; background: var(--card);
    font: 12px/1.4 var(--sans); color: var(--ink-2); cursor: pointer;
  }
  .mg-voice-index button.on { border-color: var(--gold-deep); background: var(--gold-wash); color: var(--ink); }
  .mg-voice-index .no { font-family: var(--latin); font-style: italic; font-size: 11px; color: var(--gold-deep); }
  .mg-voice-pane { display: flex; flex-direction: column; gap: 8px; }
  .mg-voice-quote {
    padding: 10px 12px; border: 1px dashed var(--line); border-radius: 7px;
    font: 13px/1.7 var(--serif); color: var(--ink);
  }
  .mg-voice-note { font: 11.5px/1.6 var(--sans); color: var(--ink-3); }

  .mg-hint { font: 11.5px/1.6 var(--sans); color: var(--ink-3); }
`;

/* ---------------- 样例 ---------------- */

interface Sample {
  family: string;
  name: string;
  tags: string[];
  where: string;
  classes: string;
  html: string;
}

const pencil = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"></path></svg>';
const editBtn = (label = "编辑") => `<button class="c-content-action edit">${pencil} ${label}</button>`;

/** 工具栏：圆点 + 标题 + 计数 + 动作 */
const bar = (opts: { title: string; count?: string; tone?: string; acts?: string }) =>
  `<header class="mg-bar">
    <div class="mg-bar-title">
      <span class="mg-bar-d ${opts.tone ?? ""}"></span>
      <span class="mg-bar-t">${opts.title}</span>
      ${opts.count ? `<span class="mg-bar-c">${opts.count}</span>` : ""}
    </div>
    <div class="mg-bar-acts">${opts.acts ?? editBtn()}</div>
  </header>`;

const row = (k: string, v: string) => `<div class="mg-row"><span class="mg-key">${k}</span><span class="mg-val">${v}</span></div>`;

/* g1 标题正文 */
const panelWithBar = () => `<section class="mg-panel">
  ${bar({ title: "定庄", count: "01" })}
  <div class="mg-panel-body">每场首小局开始时，庄家尚未确定。四名参战玩家已在局内后，从四人中随机定庄；庄标与发牌起点随之确定。</div>
</section>`;

const panelPlain = () => `<section class="mg-panel">
  ${bar({ title: "发牌", acts: "" })}
  <div class="mg-panel-body">发牌：掷骰展示后开始发牌。庄标与白板指示牌持续显示。四人各 34 张，庄家起手 14 张。</div>
</section>`;

/* g2 身份卡 */
const identity = () => `<section class="mg-panel">
  <div class="mg-identity">
    <div class="mg-avatar">庄</div>
    <div class="mg-identity-main">
      <div class="mg-identity-name"><b>庄家</b><span>东位 · 本小局定庄</span></div>
      <div class="mg-metabar">
        <span class="mg-mi"><i>牢数</i><b>3</b></span>
        <span class="mg-mi"><i>倍率</i><b>8</b></span>
        <span class="mg-mi"><i>连庄封顶</i><b>3 次</b></span>
        <span class="mg-mi"><i>发牌</i><b>14 张</b></span>
        <button class="c-content-action edit">${pencil} 编辑</button>
      </div>
    </div>
  </div>
</section>`;

/* g3 键值四种 */
const kvGrid = () => `<section class="mg-panel">
  ${bar({ title: "房间基础", tone: "slate", count: "×6" })}
  <div class="mg-rows grid">
    ${row("人数", "4")}${row("局数", "8")}${row("牌数", "136")}
    ${row("最低余牌", "22")}${row("连庄模式", "笃三老庄")}${row("庄家牢数", "3")}
  </div>
</section>`;

const kvStack = () => `<section class="mg-panel">
  ${bar({ title: "得分参数", tone: "slate", count: "×5" })}
  <div class="mg-rows stack">
    ${row("平胡", "1 倍")}${row("七对", "2 / 4 / 8 / 16")}${row("清七对", "8 / 16 / 32 / 128")}
    ${row("庄闲倍率", "庄家 ×8，闲家 ×1")}${row("拖底阈值", "−200 分")}
  </div>
</section>`;

const listStack = () => `<section class="mg-panel">
  ${bar({ title: "三摊承包 · 成立条件", count: "×3" })}
  <div class="mg-list">
    <div class="mg-list-row"><span class="mg-list-no">01</span><span>同一家连续吃、碰、杠累计满三摊</span><button class="mg-x" title="删除">×</button></div>
    <div class="mg-list-row"><span class="mg-list-no">02</span><span>三摊期间其他家未胡牌</span><button class="mg-x" title="删除">×</button></div>
    <div class="mg-list-row"><span class="mg-list-no">03</span><span>承包分由该家独自承担</span><button class="mg-x" title="删除">×</button></div>
  </div>
</section>`;

const listEditing = () => `<section class="mg-panel">
  ${bar({ title: "三摊承包 · 成立条件", count: "×2", acts: `<button class="c-content-action active">${pencil} 编辑中</button>` })}
  <div class="mg-list">
    <div class="mg-list-row editing"><span class="mg-list-no">01</span><input value="同一家连续吃、碰、杠累计满三摊" /><span class="mg-list-acts"><button class="c-btn sm">完成</button><button class="c-btn sm">AI 改写</button></span></div>
    <div class="mg-list-row"><span class="mg-list-no">02</span><span>三摊期间其他家未胡牌</span><button class="mg-x" title="删除">×</button></div>
  </div>
</section>`;

/* g4 关系网络：中心 + 环绕 */
const relationGraph = () => `<section class="mg-panel">
  ${bar({ title: "关系网络", tone: "slate", count: "×3" })}
  <div class="mg-relgraph" aria-label="规则关系图">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <line class="selected" x1="50" y1="50" x2="50" y2="16"></line>
      <line x1="50" y1="50" x2="82" y2="72"></line>
      <line class="hostile" x1="50" y1="50" x2="18" y2="72"></line>
    </svg>
    <div class="mg-rel-center"><b>定庄</b><span>开局链路起点</span></div>
    <button class="mg-rel-node selected" style="left:50%;top:16%"><b>庄家牢数</b><span>写入</span></button>
    <button class="mg-rel-node" style="left:82%;top:72%"><b>掷骰加庄</b><span>前置</span></button>
    <button class="mg-rel-node" style="left:18%;top:72%"><b>财神归属</b><span>冲突 · 未裁决</span></button>
  </div>
</section>`;

/* g5 信念卡 */
const belief = () => `<section class="mg-panel">
  ${bar({ title: "文档硬约束", tone: "gold" })}
  <blockquote class="mg-belief-quote">数值只能来自规则库：番型倍数、牢数、阈值都必须可追溯到配置或计算器，正文不得自行给值。<span class="badge">来源 · 生成契约</span></blockquote>
  <div class="mg-belief-src">
    <span><span class="lab">适用范围</span><span class="v">全部章节</span></span>
    <span><span class="lab">违反表现</span><span class="v">数值检查失败，进不了发布</span></span>
    <span><span class="lab">例外</span><span class="v">无</span></span>
  </div>
</section>`;

/* g6 深化阅读卡 */
const reader = () => `<section class="mg-panel">
  ${bar({
    title: "算分细则",
    tone: "terra",
    count: "×3",
    acts: `<span class="mg-relmode" style="display:inline-flex"><button class="c-content-action utility active">瀑布</button><button class="c-content-action utility">并排</button></span>
      <button class="c-content-action utility active">展开</button>
      ${editBtn()}`,
  })}
  <div class="mg-reader-waterfall">
    <section class="mg-reader-group">
      <h3>起胡门槛<span>01</span></h3>
      <div class="mg-reader-row"><span class="mg-reader-key">条件</span><span class="mg-reader-value">手里至少有一张财神才可起胡</span></div>
      <div class="mg-reader-row"><span class="mg-reader-key">例外</span><span class="mg-reader-value">无财神时只能自摸或杠开，点炮不成立</span></div>
    </section>
    <section class="mg-reader-group">
      <h3>多档同时成立<span>02</span></h3>
      <div class="mg-reader-row"><span class="mg-reader-key">计分</span><span class="mg-reader-value">独立番型各自计倍；其余番型按同一套拆牌相乘，取两者最大值</span></div>
    </section>
    <section class="mg-reader-group">
      <h3>点炮额外环节<span>03</span></h3>
      <div class="mg-reader-row"><span class="mg-reader-key">环节</span><span class="mg-reader-value">放冲判定；成立时由放铳者承担全部得分</span></div>
    </section>
  </div>
</section>`;

/* g7 声音卡：编号索引 + 内容 */
const voice = () => `<section class="mg-panel">
  ${bar({
    title: "播报与字效",
    tone: "slate",
    count: "×3",
    acts: `<span class="mg-relmode" style="display:inline-flex"><button class="c-content-action utility active">索引</button><button class="c-content-action utility">并排</button></span>
      <button class="c-content-action utility">展开</button>
      ${editBtn()}`,
  })}
  <div class="mg-voice-body">
    <nav class="mg-voice-index">
      <button class="on"><span class="no">01</span><span>加庄</span></button>
      <button><span class="no">02</span><span>拖底</span></button>
      <button><span class="no">03</span><span>杠飘</span></button>
    </nav>
    <div class="mg-voice-pane">
      <div class="mg-voice-quote">「加庄」</div>
      <div class="mg-voice-note">加庄动画与语音同时触发，并刷新庄标上的牢数；连庄到第 3 次时不再叠加。</div>
      <div class="mg-voice-quote">「杠飘」</div>
      <div class="mg-voice-note">第 3 次杠飘的档位原文未给，暂按第 2 次档计（待裁决 XS-U-002）。</div>
    </div>
  </div>
</section>`;

/* ---------------- 家族（顺序同原站） ---------------- */

const FAMILIES: Array<{ id: string; title: string; sub: string }> = [
  { id: "g1", title: "标题正文", sub: "小标题 + 段落正文" },
  { id: "g2", title: "身份卡", sub: "庄家身份条：牢数 / 倍率 / 连庄封顶" },
  { id: "g3", title: "结构化键值列表", sub: "房间基础、得分参数与可增删条件列表" },
  { id: "g4", title: "关系网络卡", sub: "中心节点 + 环绕节点" },
  { id: "g5", title: "硬约束卡", sub: "引文 + 来源 + 适用依据" },
  { id: "g6", title: "深化阅读卡", sub: "瀑布分组，可展开 / 可切布局" },
  { id: "g7", title: "播报卡", sub: "编号索引 + 内容" },
  { id: "g8", title: "关系图谱", sub: "规则关系可视化（画布 + 连线标签）" },
];

const SAMPLES: Sample[] = [
  { family: "g1", name: "带工具条 · 可编辑", tags: ["只读"], where: "开局与发牌", classes: "mg-panel + mg-bar(dot/title/count/acts) + c-content-action.edit", html: panelWithBar() },
  { family: "g1", name: "纯展示 · 无工具条", tags: ["只读"], where: "开局与发牌", classes: "mg-panel + mg-bar(无动作) + mg-panel-body", html: panelPlain() },
  { family: "g2", name: "姓名 + 身份 + 基本信息条", tags: ["可直接编辑"], where: "定庄", classes: "mg-identity + mg-avatar + mg-identity-name + mg-metabar + mg-mi", html: identity() },
  { family: "g3", name: "键值 · 网格（列数自适应）", tags: ["可直接编辑"], where: "游戏规则概述", classes: "mg-rows.grid + mg-row(.mg-key/.mg-val)", html: kvGrid() },
  { family: "g3", name: "键值 · 单列堆叠", tags: ["可直接编辑"], where: "算分规则", classes: "mg-rows.stack + mg-row", html: kvStack() },
  { family: "g3", name: "列表 · 堆叠可增删", tags: ["可直接编辑"], where: "三摊承包", classes: "mg-list + mg-list-row + mg-list-no + mg-x", html: listStack() },
  { family: "g3", name: "列表 · 编辑中", tags: ["可直接编辑", "含 完成/AI 改写"], where: "三摊承包 · 编辑态", classes: "mg-list-row.editing + input + mg-list-acts", html: listEditing() },
  { family: "g4", name: "关系网络（中心 + 环绕）", tags: ["可直接编辑"], where: "规则关系", classes: "mg-relgraph(svg line) + mg-rel-center + mg-rel-node(.selected)", html: relationGraph() },
  { family: "g5", name: "硬约束 · 引文 + 依据", tags: ["可直接编辑"], where: "文档约束", classes: "mg-belief-quote + badge + mg-belief-src(.lab/.v)", html: belief() },
  { family: "g6", name: "瀑布分组 · 可展开", tags: ["可直接编辑"], where: "算分规则", classes: "mg-reader-waterfall + mg-reader-group(h3) + mg-reader-row(.key/.value) + 布局/展开按钮", html: reader() },
  { family: "g7", name: "编号索引 + 内容", tags: ["可直接编辑"], where: "UI 交互及表现", classes: "mg-voice-body + mg-voice-index(button.on/.no) + mg-voice-quote", html: voice() },
  { family: "g8", name: "图形化节点图", tags: ["只读"], where: "规则关系", classes: "mg-relmap + mg-relcanvas + mg-rel-edge + mg-rel-node + mg-rel-edge-label + mg-relmode", html: relationMapSample() },
];

/* g8：画布式的自由布局图谱（与原站 c-relationship-map.mode-graph 同构） */
function relationMapSample(): string {
  return `<section class="mg-panel">
  ${bar({
    title: "规则关系",
    count: "×4",
    acts: `<span class="mg-relmode" style="display:inline-flex"><button class="c-content-action utility active">图谱</button><button class="c-content-action utility">列表</button></span>`,
  })}
  <div class="mg-relcanvas" aria-label="规则关系图">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <line class="mg-rel-edge ally selected" x1="50" y1="30" x2="78" y2="58"></line>
      <line class="mg-rel-edge" x1="50" y1="30" x2="22" y2="58"></line>
      <line class="mg-rel-edge mixed" x1="78" y1="58" x2="22" y2="58"></line>
      <line class="mg-rel-edge secret" x1="22" y1="58" x2="50" y2="82"></line>
    </svg>
    <button class="mg-rel-edge-label ally selected" style="left:64%;top:44%">写入牢数</button>
    <button class="mg-rel-edge-label" style="left:36%;top:44%">前置</button>
    <button class="mg-rel-edge-label mixed" style="left:50%;top:58%">冲突</button>
    <button class="mg-rel-edge-label" style="left:36%;top:70%">触发</button>
    <button class="mg-rel-node selected" style="left:50%;top:30%"><b>定庄</b><span>2 条关系</span></button>
    <button class="mg-rel-node selected" style="left:78%;top:58%"><b>庄家牢数</b><span>2 条关系</span></button>
    <button class="mg-rel-node" style="left:22%;top:58%"><b>财神归属</b><span>未裁决</span></button>
    <button class="mg-rel-node" style="left:50%;top:82%"><b>拖底</b><span>1 条关系</span></button>
  </div>
</section>`;
}

/* ---------------- 页面 ---------------- */

export function galleryHtml(options: { localFonts?: boolean } = {}): string {
  const fontLink = options.localFonts
    ? '<link rel="stylesheet" href="/fonts.css" />'
    : '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;600&family=Noto+Serif+SC:wght@400;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap" />';

  const nav = FAMILIES.map((f) => {
    const n = SAMPLES.filter((s) => s.family === f.id).length;
    return `<a href="#${f.id}">${f.title} <b>${n}</b></a>`;
  }).join("\n");

  const sections = FAMILIES.map((f) => {
    const items = SAMPLES.filter((s) => s.family === f.id);
    const body = items
      .map(
        (s) => `  <section class="g-item">
    <div class="g-meta">
      <span class="g-name">${s.name}</span>
      ${s.tags.map((t) => `<span class="g-tag${t === "可直接编辑" ? " g-edit" : ""}">${t}</span>`).join("\n      ")}
      <span class="g-screen">${s.where}</span>
    </div>
    <details class="g-cls"><summary>类名</summary><code>${s.classes}</code></details>
    <div class="g-preview">${s.html}</div>
  </section>`,
      )
      .join("\n");
    return `<h2 class="g-family" id="${f.id}">${f.title} <span class="g-count">${items.length} 种</span><em>${f.sub}</em></h2>\n\n${body}`;
  }).join("\n\n");

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta http-equiv="cache-control" content="no-store" />
<title>内容卡片形态总览 · 策划工作台</title>
${fontLink}
<style>${baseStyles()}</style>
<style>
  /* 共享样式是给工作台写的「外壳不滚」，这里是普通文档页，必须还原 */
  html, body { height: auto; overflow: auto; }

  body { background: #f6f3ec; margin: 0; padding: 40px 56px 90px; font-family: system-ui, -apple-system, "Noto Sans SC", sans-serif; }
  .g-head h1 { font-size: 27px; margin: 0 0 10px; }
  .g-head p { color: #6b6558; margin: 0 0 22px; font-size: 13.5px; line-height: 1.75; max-width: 900px; }
  .g-nav { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 34px; }
  .g-nav a { font-size: 12.5px; padding: 6px 12px; border: 1px solid #d9d3c4; border-radius: 999px; color: #4a4436; text-decoration: none; background: #fffdf8; }
  .g-nav a:hover { border-color: #b8863b; color: #8a5f1d; }
  .g-nav b { color: #b8863b; }
  .g-family { font-size: 17px; margin: 44px 0 6px; padding-bottom: 8px; border-bottom: 1px solid #e2dbcb; scroll-margin-top: 20px; }
  .g-count { font-size: 12px; color: #b8863b; font-weight: 500; margin-left: 6px; }
  .g-family em { display: block; font-size: 12px; color: #9a9280; font-style: normal; margin-top: 6px; font-weight: 400; }
  .g-item { margin: 22px 0 0; }
  .g-meta { display: flex; align-items: center; gap: 9px; font-size: 12.5px; color: #6b6558; margin-bottom: 8px; flex-wrap: wrap; }
  .g-name { font-weight: 600; color: #3f3a2e; }
  .g-tag { background: #eef1ea; color: #4e5a44; padding: 2px 8px; border-radius: 4px; font-size: 11.5px; }
  .g-edit { background: #f6ecdb; color: #8a5f1d; }
  .g-screen { margin-left: auto; color: #a9a190; font-size: 11.5px; }
  .g-cls { margin-bottom: 10px; }
  .g-cls summary { cursor: pointer; font-size: 11.5px; color: #8d8574; }
  .g-cls code { display: block; margin-top: 6px; font-size: 11.5px; color: #6b6558; background: #f1ece0; padding: 8px 10px; border-radius: 6px; line-height: 1.7; word-break: break-all; }
  .g-preview { border: 1px dashed #d9d3c4; border-radius: 10px; padding: 18px; background: #fffdf8; }
  .g-preview > * { margin-top: 0 !important; }
  /* 共享样式给 h1/h2 设了衬线体与吸顶，这里还原成原站的普通文档流 */
  .g-head h1, .g-family { font-family: inherit; font-weight: 700; }
  .g-family { position: static; background: none; }
</style>
<style>${COMPONENT_CSS}</style>
</head>
<body>
<div class="g-head">
  <h1>内容卡片形态总览</h1>
  <p>工作台里在用的内容卡片形态，共 <strong>${SAMPLES.length}</strong> 种，归为 <strong>${FAMILIES.length}</strong> 个家族。家族划分与顺序对齐参考站的内容卡片总览；示例内容取自萧山好友房规则库，样式与工作台共用同一份 <code>baseStyles()</code>。</p>
</div>
<div class="g-nav">${nav}</div>

${sections}
</body>
</html>
`;
}
