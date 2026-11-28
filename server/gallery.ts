// 卡片形态总览（/gallery）：把工作台里真实在用的卡片形态集中展示，
// 内容用麻将规则库的真实字段。样式与工作台共用 baseStyles()。
import { baseStyles } from "./viewer.ts";

interface Sample {
  /** 家族锚点 id */
  family: string;
  name: string;
  tags: string[];
  where: string;
  classes: string;
  html: string;
}

const badge = (text: string) => `<span class="badge${text.startsWith("待裁决") ? " warn" : ""}">${text}</span>`;

/** 配置卡：左标签 / 右数值 */
const cfg = (label: string, value: string, note: string) =>
  `<div class="cfgcard" data-lineage="default_inherited">
    <div class="cc-row"><span class="cl">${label}</span><span class="cv-note">${note}</span><span class="cv">${value}</span></div>
    <div class="seg-foot"><span class="seg-foot-line">基类固定值，不可改</span></div>
  </div>`;

/** 规则卡 */
const seg = (opts: { lineage: string; badges: string[]; text: string; foot: string; editable?: boolean }) =>
  `<div class="seg${opts.editable ? "" : " locked"}" data-lineage="${opts.lineage}">
    <div class="seg-head">${opts.badges.map(badge).join("")}</div>
    <span class="${opts.editable ? "editable" : "seg-body"}">${opts.text}</span>
    <div class="seg-foot"><span class="seg-foot-line">${opts.foot}</span></div>
  </div>`;

const SAMPLES: Sample[] = [
  {
    family: "card",
    name: "配置卡 · 基类继承",
    tags: ["只读", "两列"],
    where: "游戏规则概述",
    classes: "cfgcard + cc-row(.cl/.cv-note/.cv) + seg-foot",
    html: cfg("人数", "4", "") + cfg("允许杠的最低余牌数", "22", ""),
  },
  {
    family: "card",
    name: "配置卡 · 萧山改写",
    tags: ["变体自有"],
    where: "开局与发牌",
    classes: "cfgcard + cc-row + seg-foot（萧山改写值）",
    html: `<div class="cfgcard" data-lineage="modified">
      <div class="cc-row"><span class="cl">庄家牢数</span><span class="cv-note"></span><span class="cv">3</span></div>
      <div class="seg-foot"><span class="seg-foot-line">萧山改写值</span></div>
    </div>`,
  },
  {
    family: "rule",
    name: "规则卡 · 基类继承",
    tags: ["只读"],
    where: "开局与发牌",
    classes: "seg[data-lineage=default_inherited] + seg-body + seg-foot",
    html: seg({
      lineage: "default_inherited",
      badges: [],
      text: "定庄：触发：每场首小局开始，庄家尚未确定；结果：首局从四名参战玩家中随机定庄，庄标与发牌起点随之确定。",
      foot: "依据 定庄",
    }),
  },
  {
    family: "rule",
    name: "规则卡 · 变体修改",
    tags: ["修改", "可编辑"],
    where: "连庄与换庄",
    classes: "seg[data-lineage=modified] + badge.editable-flag + .editable",
    html: seg({
      lineage: "modified",
      badges: ["修改", "可编辑"],
      text: "连庄与换庄：胡牌者坐庄；流局由原庄连庄。连庄后仍是三牢、8 倍，三牢封顶。",
      foot: "依据 轮庄、换庄",
      editable: true,
    }),
  },
  {
    family: "rule",
    name: "规则卡 · 数值锁定",
    tags: ["新增", "数值不可改写"],
    where: "掷骰加庄",
    classes: "seg.locked + badge（数值不可改写）",
    html: seg({
      lineage: "added",
      badges: ["新增", "数值不可改写"],
      text: "掷骰加庄：两颗骰子 d1 == d2，或 d1 + d2 > 8 时加一庄；牢数写入掷骰前牢数。",
      foot: "依据 掷骰加庄",
    }),
  },
  {
    family: "rule",
    name: "规则卡 · 待裁决",
    tags: ["新增", "待裁决"],
    where: "番型规则",
    classes: "badge（待裁决 XS-U-002）",
    html: seg({
      lineage: "added",
      badges: ["新增", "待裁决 XS-U-002"],
      text: "杠飘：第 3 次杠飘的档位原文未给，暂按第 2 次档计。",
      foot: "依据 杠飘",
    }),
  },
  {
    family: "nav",
    name: "左栏章节条目",
    tags: ["卡片", "选中态"],
    where: "左侧导航",
    classes: "toc-row(.on/.reviewed) + toc-mid + toc-nm + toc-sub",
    html: `<div class="toc" style="max-width:260px">
      <div class="toc-row on"><span class="dot current"></span><div class="toc-mid"><button class="link toc-nm">游戏规则概述</button><div class="toc-sub">4 段</div></div></div>
      <div class="toc-row"><span class="dot"></span><div class="toc-mid"><button class="link toc-nm">开局与发牌</button><div class="toc-sub">10 段</div></div></div>
      <div class="toc-row"><span class="dot"></span><div class="toc-mid"><button class="link toc-nm">算分规则</button><div class="toc-sub">9 段</div></div></div>
    </div>`,
  },
  {
    family: "nav",
    name: "玩法胶囊",
    tags: ["tab"],
    where: "左栏顶部",
    classes: "cr-phasebar + pbi(.on/.done)",
    html: `<div class="cr-phasebar" style="border-bottom:0;padding-bottom:0">
      <button class="pbi">杭州</button>
      <button class="pbi on">萧山</button>
      <button class="pbi done">已审完</button>
    </div>`,
  },
  {
    family: "feed",
    name: "检查明细条目",
    tags: ["折叠区"],
    where: "左栏 · 检查明细",
    classes: "finding + finding-code",
    html: `<div class="findings-box" open style="margin:0">
      <div id="findings">
        <div class="finding"><span class="finding-code">change-type-mismatch ×18</span><span>声明 modified 但未给 compares_to</span></div>
        <div class="finding"><span class="finding-code">missing-config ×2</span><span>文案里提到配置但段落未引用</span></div>
      </div>
    </div>`,
  },
  {
    family: "assistant",
    name: "助手消息",
    tags: ["用户 / 助手"],
    where: "创作助手",
    classes: "asst-message(.--user/--assistant) + strong + p",
    html: `<div class="asst-thread" style="padding:0">
      <article class="asst-message asst-message--user"><strong>你</strong><p>拖底怎么判？</p></article>
      <article class="asst-message asst-message--assistant"><strong>助手</strong><p>胡牌或流局分数入账后，任一玩家累计净分 ≤ −200 即结束本场，该玩家按 −200 计。</p></article>
      <div class="asst-thinking"><span>助手正在读文档</span><span class="asst-thinking__dots"><i></i><i></i><i></i></span></div>
    </div>`,
  },
  {
    family: "assistant",
    name: "空态与示例",
    tags: ["引导"],
    where: "创作助手（无消息）",
    classes: "asst-empty-block + asst-empty + asst-example",
    html: `<div class="asst-empty-block" style="margin:0;max-width:none">
      <h3 class="asst-empty">想从哪里开始？</h3>
      <div class="asst-examples">
        <button class="asst-example"><span>这个玩法和基座最大的差异在哪？</span><span class="asst-example__arrow">→</span></button>
        <button class="asst-example"><span>讲一下「拖底」的判定条件</span><span class="asst-example__arrow">→</span></button>
      </div>
    </div>`,
  },
  {
    family: "assistant",
    name: "改稿提案卡",
    tags: ["Action"],
    where: "创作助手 · 改稿模式",
    classes: "asst-action + head/old/new/why/acts",
    html: `<div class="asst-action" style="margin:0">
      <div class="asst-action-head">改稿提案<span class="seg-id">SEG-000127</span></div>
      <div class="asst-action-old">拖底额度：挂配置「拖底额度」；差异：新增；出现条件：进入该好友房；位置：房间信息。</div>
      <div class="asst-action-new">拖底额度：挂配置「拖底额度」；差异：新增；出现条件：进入该好友房；位置：房间信息；文案格式：「拖底200」。</div>
      <p class="asst-action-why">补回漏掉的文案格式，数值与配置名保持不变。</p>
      <div class="asst-action-acts"><button class="c-btn gold sm">应用</button><button class="c-btn sm">丢弃</button></div>
    </div>`,
  },
  {
    family: "assistant",
    name: "修订记录条目",
    tags: ["历史版本"],
    where: "修订记录抽屉",
    classes: "cr-revision-item(.on) + cr-rdiff-row(old/new)",
    html: `<div class="cr-revision-list" style="border:0;padding:0;max-width:250px">
      <button class="cr-revision-item on"><span class="cr-revision-item-top"><b class="c-latin">v1</b><span>手工编辑</span></span><time>2026/11/28 09:12</time><small>当前已发布到本地的版本</small></button>
      <button class="cr-revision-item"><span class="cr-revision-item-top"><b class="c-latin">v0</b><span>AI 生成</span></span><time>2026/11/27 14:30</time><small>可查看这一版原文</small></button>
    </div>
    <div class="cr-rdiff-row" style="margin-top:10px"><h4>结算流程 · SEG-000127</h4><div class="cr-rdiff-old">拖底额度：挂配置「拖底额度」；差异：新增；出现条件：进入该好友房；位置：房间信息。</div><div class="cr-rdiff-new">拖底额度：挂配置「拖底额度」；差异：新增；出现条件：进入该好友房；位置：房间信息；文案格式：「拖底200」。</div></div>`,
  },
  {
    family: "control",
    name: "按钮与提交中",
    tags: ["操作"],
    where: "底栏 / 卡片 / 助手",
    classes: "c-btn(.primary/.gold/.sm) + c-content-action + asst-send + c-spin",
    html: `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <button class="c-btn">清空</button>
      <button class="c-btn primary">应用</button>
      <button class="c-btn gold sm">恢复此版本</button>
      <button class="c-btn" disabled>无改动可恢复</button>
      <button class="c-content-action">查看原版</button>
      <button class="c-content-action" style="margin-left:0"><span class="c-spin"></span> 应用中</button>
      <button class="asst-send" title="发送">↑</button>
    </div>`,
  },
  {
    family: "control",
    name: "提示条",
    tags: ["反馈"],
    where: "全局",
    classes: "c-toast",
    html: `<div class="c-toast" style="position:static;transform:none;display:inline-block;animation:none">已应用，版本 0 → 1</div>`,
  },
];

const FAMILIES: Array<{ id: string; title: string; sub: string }> = [
  { id: "cfg", title: "配置卡", sub: "键值对：左标签 / 右数值" },
  { id: "rule", title: "规则卡", sub: "徽章 + 衬线正文 + 来源脚注" },
  { id: "nav", title: "导航形态", sub: "左栏章节与玩法切换" },
  { id: "feed", title: "检查与反馈", sub: "机器检查明细" },
  { id: "assistant", title: "助手形态", sub: "消息、空态、改稿提案、修订记录" },
  { id: "control", title: "操作与提示", sub: "按钮族与 toast" },
];

const familyOf = (s: Sample): string => {
  if (s.family === "card") return "cfg";
  if (s.family === "rule") return "rule";
  return s.family;
};

export function galleryHtml(options: { localFonts?: boolean } = {}): string {
  const fontLink = options.localFonts
    ? '<link rel="stylesheet" href="/fonts.css" />'
    : '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;600&family=Noto+Serif+SC:wght@400;600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap" />';

  const nav = FAMILIES.map((f) => {
    const n = SAMPLES.filter((s) => familyOf(s) === f.id).length;
    return `<a href="#${f.id}">${f.title} <b>${n}</b></a>`;
  }).join("\n  ");

  const sections = FAMILIES.map((f) => {
    const items = SAMPLES.filter((s) => familyOf(s) === f.id)
      .map(
        (s) => `  <section class="g-item">
    <div class="g-meta">
      <span class="g-name">${s.name}</span>
      ${s.tags.map((t) => `<span class="g-tag${t === "可编辑" ? " g-edit" : ""}">${t}</span>`).join("")}
      <span class="g-screen">${s.where}</span>
    </div>
    <details class="g-cls"><summary>类名</summary><code>${s.classes}</code></details>
    <div class="g-preview">${s.html}</div>
  </section>`,
      )
      .join("\n");
    return `<h2 class="g-family" id="${f.id}">${f.title} <span class="g-count">${SAMPLES.filter((s) => familyOf(s) === f.id).length} 种</span><em>${f.sub}</em></h2>
${items}`;
  }).join("\n\n");

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta http-equiv="cache-control" content="no-store" />
<title>卡片形态总览 · 策划工作台</title>
${fontLink}
<style>${baseStyles()}</style>
<style>
  /* baseStyles 给工作台写了外壳不滚，这里是普通文档页，必须覆盖回来 */
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
  /* 共享样式（baseStyles）给 h1/h2 设了衬线体与吸顶，这里要还原成原站的普通文档流 */
  .g-head h1, .g-family { font-family: inherit; font-weight: 700; }
  .g-family { position: static; background: none; }
  .g-preview > * { margin-top: 0 !important; }
</style>
</head>
<body>
<div class="g-head">
  <h1>卡片形态总览</h1>
  <p>工作台里实际在用的卡片形态，共 <strong>${SAMPLES.length}</strong> 种，归为 <strong>${FAMILIES.length}</strong> 个家族。示例内容取自萧山好友房规则库，样式与工作台共用同一份 <code>baseStyles()</code>，改一处两边同步。</p>
</div>
<div class="g-nav">${nav}</div>

${sections}
</body>
</html>
`;
}
