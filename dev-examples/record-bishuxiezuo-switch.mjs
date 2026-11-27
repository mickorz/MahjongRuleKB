// 录制「世界观 → 角色表」一次切换的网络交互，并抓两个状态的 DOM
// 用途：为离线回放（方案 B）留下真实的请求/响应样本；同时产出两状态静态快照（方案 A）
// 注意：会在真实站点触发一次生成请求（已获用户同意）
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const URL_ = "https://bishuxiezuo.cn/console/console.html";
const OUT = "dev-examples/style-capture/bishuxiezuo";
const HAR = join(OUT, "network.har");

const run = (args) => execFileSync("chrome-use", args, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
const evalJson = (expr) => {
  const out = run(["eval", expr]);
  const line = out.split("\n").filter((l) => l.trim().startsWith("{")).at(-1);
  if (!line) throw new Error(`eval 未返回 JSON：${out.slice(0, 300)}`);
  return JSON.parse(line);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

mkdirSync(OUT, { recursive: true });

console.log("[1/6] 打开页面并等稳定");
run(["open", URL_]);
await sleep(3000);

const snap = () =>
  evalJson(`JSON.stringify({
    step: ((document.body.innerText || '').match(/\\d\\s*\\/\\s*6/) || [null])[0],
    pbi: [...document.querySelectorAll('.pbi')].map(b => ({ text: b.textContent.trim(), on: b.classList.contains('on') })),
    hasPbi: document.querySelectorAll('.pbi').length,
    hasSteps: document.querySelectorAll('.cs-t').length,
    textHead: (document.body.innerText || '').replace(/\\s+/g, ' ').slice(0, 120),
    rootLen: document.getElementById('root').innerHTML.length,
    html: document.getElementById('root').innerHTML
  })`);

const stateA = await snap();
console.log(`    A：step=${stateA.step} pbi=${stateA.hasPbi} steps=${stateA.hasSteps} DOM=${(stateA.rootLen / 1024).toFixed(1)}KB`);
writeFileSync(join(OUT, "state-A-world.html"), stateA.html, "utf8");

console.log("[2/6] 开始 HAR 录制");
run(["network", "har", "start", HAR]);

// 找一个能切到「角色表」的入口：优先 .pbi 文本匹配，其次步骤条 .cs-t
console.log("[3/6] 点击「角色表」");
let clicked = null;
for (const sel of [".pbi", ".cs-t"]) {
  const idx = evalJson(`(() => {
    const list = [...document.querySelectorAll('${sel}')];
    const i = list.findIndex(e => (e.textContent || '').trim() === '角色表');
    return JSON.stringify({ i, n: list.length });
  })()`);
  if (idx.i >= 0) {
    run(["click", `${sel}:nth-of-type(${idx.i + 1})`]);
    clicked = `${sel}[${idx.i}]`;
    break;
  }
}
if (!clicked) console.log("    未找到「角色表」入口，可能已在其它步骤");
console.log(`    点击目标：${clicked ?? "无"}`);

console.log("[4/6] 等待切换与首次数据返回（8s）");
await sleep(8000);
const stateB = await snap();
console.log(`    B：step=${stateB.step} pbi=${stateB.hasPbi} steps=${stateB.hasSteps} DOM=${(stateB.rootLen / 1024).toFixed(1)}KB`);
writeFileSync(join(OUT, "state-B-chars.html"), stateB.html, "utf8");

console.log("[5/6] 停止 HAR 录制");
run(["network", "har", "stop"]);

console.log("[6/6] 解析 HAR，提取接口样本");
let summary = { entries: 0, api: [], bytes: 0 };
try {
  const har = JSON.parse(require("node:fs").readFileSync(HAR, "utf8"));
  const entries = har.log.entries ?? [];
  summary.entries = entries.length;
  summary.bytes = entries.reduce((a, e) => a + (e.response?.content?.size ?? 0), 0);
  summary.api = entries
    .filter((e) => /\/api\//.test(e.request.url) || /stream|generate|outline|character/i.test(e.request.url))
    .map((e) => ({
      method: e.request.method,
      url: e.request.url,
      status: e.response.status,
      mime: e.response.content?.mimeType,
      size: e.response.content?.size ?? 0,
      startedAt: e.startedDateTime,
    }));
} catch (e) {
  console.log(`    HAR 解析失败：${e.message}`);
}

writeFileSync(
  join(OUT, "RECORDING.md"),
  [
    "# 一次「世界观 → 角色表」切换的录制结果",
    "",
    `- 抓取时间：${new Date().toISOString()}`,
    `- A 状态：step=${stateA.step}，pbi=${stateA.hasPbi}，cs-t=${stateA.hasSteps}，DOM ${(stateA.rootLen / 1024).toFixed(1)} KB`,
    `- B 状态：step=${stateB.step}，pbi=${stateB.hasPbi}，cs-t=${stateB.hasSteps}，DOM ${(stateB.rootLen / 1024).toFixed(1)} KB`,
    `- 点击目标：${clicked ?? "未找到"}`,
    `- HAR 条目：${summary.entries}，接口相关：${summary.api.length}`,
    "",
    "## 接口样本（前 20 条）",
    "",
    "| 方法 | 状态 | 大小 | URL |",
    "| --- | ---: | ---: | --- |",
    ...summary.api.slice(0, 20).map((a) => `| ${a.method} | ${a.status} | ${a.size} | ${a.url} |`),
    "",
    "## 产物",
    "",
    "| 文件 | 用途 |",
    "| --- | --- |",
    "| `state-A-world.html` / `state-B-chars.html` | 两个状态的 `#root` DOM，可用于静态切换快照 |",
    "| `network.har` | 完整 HAR（含响应体），可用于方案 B 的 mock 数据来源 |",
    "",
    "注意：HAR 与状态文件可能含账号相关数据（书稿内容、ID），仅在本地参考，不要外传。",
  ].join("\n") + "\n",
  "utf8",
);

console.log(`\n完成：A/B 状态 + ${HAR}`);
