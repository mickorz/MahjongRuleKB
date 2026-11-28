// 内容卡片形态总览（/gallery）
// 家族与顺序照搬参考站 _gallery/cards.html（8 家族 / 12 种），
// 内容换成本项目（萧山好友房规则库）的真实字段。
// 页面骨架 g-* 与参考站逐值一致；卡片组件用自己的 mg-* 前缀。
import { baseStyles } from "./viewer.ts";

/* ---------------- 卡片组件样式（mg-*） ---------------- */
const COMPONENT_CSS = `
  /* 面板底座 */
  .mg-panel {
    border: 1px solid var(--line); border-radius: 9px; background: var(--card);
    padding: 14px 16px; display: flex; flex-direction: column; gap: 12px;
  }
  .mg-panel-head {
    display: flex; align-items: center; gap: 9px;
    padding-bottom: 10px; border-bottom: 1px solid var(--line-2);
  }
  .mg-panel-title {
    display: flex; align-items: baseline; gap: 8px;
    font-family: var(--serif); font-size: 14.5px; font-weight: 600; color: var(--ink);
  }
  .mg-panel-title i { font-style: normal; font-family: var(--latin); font-size: 12px; color: var(--gold-deep); }
  .mg-panel-actions { margin-left: auto; display: flex; gap: 6px; }
  .mg-panel-body { font-family: var(--serif); font-size: 13px; line-height: 1.8; color: var(--ink); }

  /* 身份卡 */
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
  .mg-metabar { display: flex; flex-wrap: wrap; gap: 6px; }
  .mg-metabar span {
    font: 11.5px/1.4 var(--sans); color: var(--ink-2); background: var(--paper-2);
    border: 1px solid var(--line); border-radius: 999px; padding: 3px 10px;
  }

  /* 键值：网格 / 堆叠 */
  .mg-kv { display: grid; gap: 8px 18px; }
  .mg-kv.grid { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
  .mg-kv.stack { grid-template-columns: 1fr; }
  .mg-kv-row { display: flex; gap: 10px; align-items: baseline; min-width: 0; }
  .mg-kv-k { flex: none; width: 96px; font: 11.5px/1.6 var(--sans); color: var(--ink-3); }
  .mg-kv-v { flex: 1; min-width: 0; font: 13px/1.6 var(--serif); color: var(--ink); }
  .mg-kv.stack .mg-kv-k { width: 112px; }

  /* 列表：可增删 / 编辑中 */
  .mg-list { display: flex; flex-direction: column; gap: 6px; }
  .mg-list-row {
    display: flex; align-items: center; gap: 10px; padding: 7px 10px;
    border: 1px solid var(--line); border-radius: 6px; background: var(--paper);
    font: 12.5px/1.6 var(--serif); color: var(--ink);
  }
  .mg-list-row .mg-x {
    margin-left: auto; width: 20px; height: 20px; flex: none; display: grid; place-items: center;
    border: none; background: none; color: var(--ink-3); cursor: pointer; border-radius: 4px;
    font: 14px/1 var(--sans);
  }
  .mg-list-row .mg-x:hover { background: var(--paper-2); color: var(--terra); }
  .mg-list-row.editing { border-color: var(--gold-deep); background: var(--gold-wash); }
  .mg-list-row.editing input {
    flex: 1; min-width: 0; border: none; background: transparent; outline: none;
    font: 12.5px/1.6 var(--serif); color: var(--ink);
  }
  .mg-list-acts { display: flex; gap: 4px; flex: none; }

  /* 关系列表 */
  .mg-rel { display: flex; flex-direction: column; gap: 6px; }
  .mg-rel-row {
    display: flex; align-items: center; gap: 8px; padding: 7px 10px;
    border: 1px solid var(--line); border-radius: 6px; background: var(--paper);
    font-size: 12.5px;
  }
  .mg-rel-a, .mg-rel-b { font-family: var(--serif); color: var(--ink); }
  .mg-rel-arrow { color: var(--ink-3); font-family: var(--latin); }
  .mg-chip {
    margin-left: auto; font: 11px/1.4 var(--sans); padding: 2px 8px; border-radius: 4px;
    background: var(--sage-wash); color: var(--sage);
  }
  .mg-chip.warn { background: var(--gold-wash); color: var(--gold-deep); }
  .mg-chip.danger { background: oklch(.95 .04 40); color: var(--terra); }

  /* 铁律卡 */
  .mg-belief { display: flex; flex-direction: column; gap: 8px; }
  .mg-belief-row {
    display: flex; gap: 10px; padding: 9px 11px; border-radius: 7px;
    background: var(--paper-2); border-left: 3px solid var(--terra);
    font: 12.5px/1.7 var(--serif); color: var(--ink);
  }
  .mg-belief-row b { font-family: var(--sans); font-size: 11.5px; color: var(--terra); flex: none; }

  /* 可展开阅读 */
  .mg-reader { display: flex; flex-direction: column; gap: 6px; }
  .mg-reader details {
    border: 1px solid var(--line); border-radius: 7px; background: var(--paper);
    padding: 8px 11px;
  }
  .mg-reader summary {
    cursor: pointer; font: 600 12.5px/1.6 var(--sans); color: var(--ink);
    display: flex; align-items: center; gap: 8px;
  }
  .mg-reader summary span { font-weight: 400; color: var(--ink-3); font-size: 11.5px; }
  .mg-reader p { margin: 8px 0 0; font: 12.5px/1.8 var(--serif); color: var(--ink-2); }

  /* 播报文案 */
  .mg-voice { display: flex; flex-direction: column; gap: 6px; }
  .mg-voice-row {
    display: flex; align-items: center; gap: 10px; padding: 8px 11px;
    border: 1px dashed var(--line); border-radius: 7px; background: var(--paper);
  }
  .mg-voice-k { font: 11.5px/1.4 var(--sans); color: var(--ink-3); flex: none; width: 64px; }
  .mg-voice-quote { font: 13px/1.6 var(--serif); color: var(--ink); }
  .mg-voice-note { margin-left: auto; font: 11px/1.4 var(--sans); color: var(--ink-3); }

  /* 依赖图 */
  .mg-map { width: 100%; max-width: 560px; height: auto; display: block; }
  .mg-map .node rect { fill: var(--card); stroke: var(--line); }
  .mg-map .node text { font: 11.5px var(--sans); fill: var(--ink); }
  .mg-map .node.variant rect { stroke: var(--gold-deep); fill: var(--gold-wash); }
  .mg-map .edge { stroke: var(--ink-3); stroke-width: 1.2; fill: none; marker-end: url(#mgArrow); opacity: .7; }
  .mg-map .edge.dash { stroke-dasharray: 4 3; }

  .mg-hint { font: 11.5px/1.6 var(--sans); color: var(--ink-3); }
`;

/* ---------------- 卡片样例 ---------------- */

interface Sample {
  family: string;
  name: string;
  tags: string[];
  where: string;
  classes: string;
  html: string;
}

const btn = (text: string, cls = "c-content-action") => `<button class="${cls}">${text}</button>`;

/** 标题正文（带工具条） */
const panelWithBar = () => `<section class="mg-panel">
  <header class="mg-panel-head">
    <div class="mg-panel-title"><i>01</i>定庄</div>
    <div class="mg-panel-actions">${btn("编辑")}</div>
  </header>
  <div class="mg-panel-body">每场首小局开始时，庄家尚未确定。四名参战玩家已在局内后，从四人中随机定庄；庄标与发牌起点随之确定。</div>
</section>`;

/** 标题正文（纯展示） */
const panelPlain = () => `<section class="mg-panel">
  <div class="mg-panel-body">发牌：掷骰展示后开始发牌。庄标与白板指示牌持续显示。四人各 34 张，庄家起手 14 张。</div>
</section>`;

/** 身份卡 */
const identity = () => `<section class="mg-panel">
  <div class="mg-identity">
    <div class="mg-avatar">庄</div>
    <div class="mg-identity-main">
      <div class="mg-identity-name"><b>庄家</b><span>东位 · 本小局定庄</span></div>
      <div class="mg-metabar"><span>牢数 3</span><span>倍率 8</span><span>连庄 3 次封顶</span></div>
    </div>
  </div>
</section>`;

/** 键值列表（四种布局） */
const kvRow = (k: string, v: string) => `<div class="mg-kv-row"><span class="mg-kv-k">${k}</span><span class="mg-kv-v">${v}</span></div>`;
const kvGrid = () => `<section class="mg-panel">
  <header class="mg-panel-head"><div class="mg-panel-title"><i>02</i>房间基础</div><div class="mg-panel-actions">${btn("编辑")}</div></header>
  <div class="mg-kv grid">
    ${kvRow("人数", "4")}${kvRow("局数", "8")}${kvRow("牌数", "136")}
    ${kvRow("最低余牌", "22")}${kvRow("连庄模式", "笃三老庄")}${kvRow("庄家牢数", "3")}
  </div>
</section>`;

const kvStack = () => `<section class="mg-panel">
  <header class="mg-panel-head"><div class="mg-panel-title"><i>03</i>得分参数</div><div class="mg-panel-actions">${btn("编辑")}</div></header>
  <div class="mg-kv stack">
    ${kvRow("平胡", "1 倍")}${kvRow("七对", "2 / 4 / 8 / 16")}${kvRow("清七对", "8 / 16 / 32 / 128")}
    ${kvRow("庄闲倍率", "庄家 ×8，闲家 ×1")}${kvRow("拖底阈值", "−200 分")}
  </div>
</section>`;

const listStack = () => `<section class="mg-panel">
  <header class="mg-panel-head"><div class="mg-panel-title"><i>04</i>三摊承包 · 成立条件</div><div class="mg-panel-actions">${btn("编辑")}</div></header>
  <div class="mg-list">
    <div class="mg-list-row"><span>同一家连续吃、碰、杠累计满三摊</span><button class="mg-x" title="删除">×</button></div>
    <div class="mg-list-row"><span>三摊期间其他家未胡牌</span><button class="mg-x" title="删除">×</button></div>
    <div class="mg-list-row"><span>承包分由该家独自承担</span><button class="mg-x" title="删除">×</button></div>
  </div>
</section>`;

const listEditing = () => `<section class="mg-panel">
  <header class="mg-panel-head"><div class="mg-panel-title"><i>05</i>三摊承包 · 成立条件</div><div class="mg-panel-actions">${btn("编辑", "c-content-action active")}</div></header>
  <div class="mg-list">
    <div class="mg-list-row editing"><input value="同一家连续吃、碰、杠累计满三摊" /><span class="mg-list-acts">${btn("完成", "c-btn sm")}${btn("AI 改写", "c-btn sm")}</span></div>
    <div class="mg-list-row"><span>三摊期间其他家未胡牌</span><button class="mg-x" title="删除">×</button></div>
  </div>
</section>`;

/** 关系列表 */
const relations = () => `<section class="mg-panel">
  <header class="mg-panel-head"><div class="mg-panel-title"><i>06</i>规则依赖</div><div class="mg-panel-actions">${btn("编辑")}</div></header>
  <div class="mg-rel">
    <div class="mg-rel-row"><span class="mg-rel-a">定庄</span><span class="mg-rel-arrow">→</span><span class="mg-rel-b">掷骰加庄</span><span class="mg-chip">前置</span></div>
    <div class="mg-rel-row"><span class="mg-rel-a">连庄与换庄</span><span class="mg-rel-arrow">→</span><span class="mg-rel-b">庄家牢数</span><span class="mg-chip">写入</span></div>
    <div class="mg-rel-row"><span class="mg-rel-a">翻财神</span><span class="mg-rel-arrow">⇄</span><span class="mg-rel-b">财神归属</span><span class="mg-chip danger">未裁决</span></div>
  </div>
</section>`;

/** 铁律卡（对应原站信念卡） */
const beliefs = () => `<section class="mg-panel">
  <header class="mg-panel-head"><div class="mg-panel-title"><i>07</i>硬约束</div><div class="mg-panel-actions">${btn("编辑")}</div></header>
  <div class="mg-belief">
    <div class="mg-belief-row"><b>数值</b><span>番型倍数、牢数、阈值只能来自规则库，文档正文不得自行给值。</span></div>
    <div class="mg-belief-row"><b>引用</b><span>正文里出现的规则一律写中文名，ID 只做追溯，不参与阅读。</span></div>
    <div class="mg-belief-row"><b>基座</b><span>杭州基座内容不可人工改写；变体改写必须在变体规则里声明。</span></div>
  </div>
</section>`;

/** 深化阅读卡 */
const reader = () => `<section class="mg-panel">
  <header class="mg-panel-head"><div class="mg-panel-title"><i>08</i>算分细则</div><div class="mg-panel-actions">${btn("编辑")}</div></header>
  <div class="mg-reader">
    <details open><summary>起胡门槛<span>有财 2 番起胡</span></summary><p>手里至少有一张财神才可起胡；无财神时只能自摸或杠开，点炮不成立。</p></details>
    <details><summary>多档同时成立<span>取乘积，独立番型取最大值</span></summary><p>独立番型各自计倍，不与其他番型相乘；其余番型按同一套拆牌相乘，取两者中的最大值。</p></details>
    <details><summary>点炮额外环节<span>放冲</span></summary><p>点炮后还需经过放冲判定；放冲成立时由放铳者承担全部得分。</p></details>
  </div>
</section>`;

/** 播报文案（对应原站声音卡） */
const voice = () => `<section class="mg-panel">
  <header class="mg-panel-head"><div class="mg-panel-title"><i>09</i>播报与字效</div><div class="mg-panel-actions">${btn("编辑")}</div></header>
  <div class="mg-voice">
    <div class="mg-voice-row"><span class="mg-voice-k">加庄</span><span class="mg-voice-quote">「加庄」</span><span class="mg-voice-note">动画 + 语音，同时更新庄标</span></div>
    <div class="mg-voice-row"><span class="mg-voice-k">拖底</span><span class="mg-voice-quote">「拖底了，−200 结束本场」</span><span class="mg-voice-note">大结算前播报</span></div>
    <div class="mg-voice-row"><span class="mg-voice-k">杠飘</span><span class="mg-voice-quote">「杠飘」</span><span class="mg-voice-note">第 3 次档位待裁决</span></div>
  </div>
</section>`;

/** 依赖图 */
const map = () => `<section class="mg-panel">
  <header class="mg-panel-head"><div class="mg-panel-title"><i>10</i>开局链路</div></div>
  <svg class="mg-map" viewBox="0 0 520 150" role="img" aria-label="开局规则依赖图">
    <defs>
      <marker id="mgArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M0 0 L10 5 L0 10 z" fill="currentColor" opacity=".6"></path>
      </marker>
    </defs>
    <g class="node"><rect x="10" y="52" width="96" height="34" rx="7"></rect><text x="58" y="73" text-anchor="middle">定庄</text></g>
    <g class="node variant"><rect x="136" y="52" width="112" height="34" rx="7"></rect><text x="192" y="73" text-anchor="middle">掷骰加庄</text></g>
    <g class="node"><rect x="278" y="52" width="96" height="34" rx="7"></rect><text x="326" y="73" text-anchor="middle">发牌</text></g>
    <g class="node"><rect x="404" y="52" width="104" height="34" rx="7"></rect><text x="456" y="73" text-anchor="middle">行牌</text></g>
    <path class="edge" d="M106 69 H136"></path>
    <path class="edge" d="M248 69 H278"></path>
    <path class="edge dash" d="M374 69 H404"></path>
    <g class="node"><rect x="136" y="8" width="112" height="28" rx="6"></rect><text x="192" y="26" text-anchor="middle">连庄与换庄</text></g>
    <path class="edge dash" d="M192 36 V52"></path>
  </svg>
  <p class="mg-hint">实线＝顺序依赖，虚线＝条件分支；金色节点表示萧山相对基座有改写。</p>
</section>`;

/* ---------------- 家族（顺序与参考站一致） ---------------- */

const FAMILIES: Array<{ id: string; title: string; sub: string }> = [
  { id: "g1", title: "标题正文", sub: "小标题 + 段落正文" },
  { id: "g2", title: "身份卡", sub: "庄家身份条：牢数 / 倍率 / 连庄封顶" },
  { id: "g3", title: "结构化键值列表", sub: "房间基础、得分参数与可增删条件列表" },
  { id: "g4", title: "规则关系卡", sub: "规则依赖与冲突" },
  { id: "g5", title: "硬约束卡", sub: "文档级红线" },
  { id: "g6", title: "深化阅读卡", sub: "算分细则，可展开" },
  { id: "g7", title: "播报卡", sub: "动画与语音文案" },
  { id: "g8", title: "依赖图谱", sub: "开局链路可视化" },
];

const SAMPLES: Sample[] = [
  { family: "g1", name: "带工具条 · 可编辑", tags: ["只读"], where: "开局与发牌", classes: "mg-panel + mg-panel-head + mg-panel-title + mg-panel-actions + mg-panel-body", html: panelWithBar() },
  { family: "g1", name: "纯展示 · 无工具条", tags: ["只读"], where: "开局与发牌", classes: "mg-panel + mg-panel-body", html: panelPlain() },
  { family: "g2", name: "身份 + 基本信息条", tags: ["可直接编辑"], where: "定庄", classes: "mg-identity + mg-avatar + mg-identity-name + mg-metabar", html: identity() },
  { family: "g3", name: "键值 · 网格（列数自适应）", tags: ["可直接编辑"], where: "游戏规则概述", classes: "mg-kv.grid + mg-kv-row(.mg-kv-k/.mg-kv-v)", html: kvGrid() },
  { family: "g3", name: "键值 · 单列堆叠", tags: ["可直接编辑"], where: "算分规则", classes: "mg-kv.stack + mg-kv-row", html: kvStack() },
  { family: "g3", name: "列表 · 堆叠可增删", tags: ["可直接编辑"], where: "三摊承包", classes: "mg-list + mg-list-row + .mg-x", html: listStack() },
  { family: "g3", name: "列表 · 编辑中", tags: ["可直接编辑", "含 完成/AI 改写"], where: "三摊承包 · 编辑态", classes: "mg-list-row.editing + input + mg-list-acts", html: listEditing() },
  { family: "g4", name: "规则依赖列表", tags: ["可直接编辑"], where: "规则依赖", classes: "mg-rel + mg-rel-row + mg-chip(.warn/.danger)", html: relations() },
  { family: "g5", name: "硬约束（红线）", tags: ["可直接编辑"], where: "文档约束", classes: "mg-belief + mg-belief-row", html: beliefs() },
  { family: "g6", name: "细则 · 可展开", tags: ["可直接编辑"], where: "算分规则", classes: "mg-reader + details/summary + p", html: reader() },
  { family: "g7", name: "播报文案", tags: ["可直接编辑"], where: "UI 交互及表现", classes: "mg-voice + mg-voice-row(.mg-voice-k/.mg-voice-quote/.mg-voice-note)", html: voice() },
  { family: "g8", name: "依赖图（节点图）", tags: ["只读"], where: "开局链路", classes: "mg-map + node/edge（SVG）", html: map() },
];

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
