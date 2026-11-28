// 助手 UI 同步参考站新版结构：asst-layer / asst-heading / asst-thread /
// asst-empty-block + asst-example / asst-compose + asst-send / asst-thinking
import { readFileSync, writeFileSync } from "node:fs";
const p = "server/viewer.ts";
let s = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const must = (n, k) => { if (!s.includes(n)) throw new Error("锚点缺失：" + k); };

/* ---------- 1) 关键帧：新版 asstWindowIn/asstSuggestionIn/asstThinking ---------- */
must("  @keyframes asstWindowIn", "kf");
s = s.replace(
  "  @keyframes asstWindowIn { from { opacity: 0; transform: translateY(10px) scale(.98); } to { opacity: 1; transform: none; } }",
  `  @keyframes asstWindowIn { from { opacity: .75; transform: translateY(10px); } to { opacity: 1; transform: none; } }
  @keyframes asstSuggestionIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes asstThinking { 0%, 70%, 100% { opacity: .3; transform: translateY(1px); } 35% { opacity: 1; transform: translateY(-2px); } }`,
);

/* ---------- 2) 样式：整段替换旧助手样式 ---------- */
const cssStart = s.indexOf("  /* 创作助手：悬浮按钮（原站 .asst-launch） */");
must("  /* 修订记录抽屉", "css end marker");
const cssEnd = s.indexOf("  /* 修订记录抽屉", cssStart);

const css = `  /* 创作助手（对齐参考站新版 .asst-launch / .asst-drawer / .asst-heading ...） */
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

  /* 浮窗模式：贴右满高（参考站 body:has(.asst-drawer--floating) 的几何） */
  .asst-drawer {
    position: fixed; z-index: 721; right: 16px; top: 16px;
    width: 480px; height: calc(100vh - 32px);
    display: grid; grid-template-rows: auto minmax(0, 1fr) auto;
    overflow: hidden; border: 1px solid var(--line); border-radius: 12px;
    background: var(--paper); box-shadow: 0 16px 44px var(--shadow);
    animation: asstWindowIn .2s var(--ease-out) both;
  }
  .asst-drawer[hidden] { display: none; }

  .asst-heading {
    display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
    padding: 20px 22px 16px; border-bottom: 1px solid var(--line);
  }
  .asst-heading h2 {
    margin: 0; font-family: var(--serif); font-size: 22px; font-weight: 650; color: var(--ink);
    line-height: 1.25;
  }
  .asst-heading p { max-width: 700px; margin: 7px 0 0; color: var(--ink-2); font-size: 12px; line-height: 1.7; }

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

  /* 思维中（原站 .asst-thinking + 三点动画） */
  .asst-thinking { display: flex; align-items: center; gap: 7px; margin: 14px 0; color: var(--ink-2); font-size: 12px; }
  .asst-thinking__dots { display: inline-flex; align-items: center; gap: 3px; height: 12px; }
  .asst-thinking__dots i {
    width: 4px; height: 4px; border-radius: 50%; background: currentColor;
    animation: asstThinking 1.15s var(--ease) infinite;
  }
  .asst-thinking__dots i:nth-child(2) { animation-delay: .14s; }
  .asst-thinking__dots i:nth-child(3) { animation-delay: .28s; }

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

`;
s = s.slice(0, cssStart) + css + s.slice(cssEnd);

writeFileSync(p, s, "utf8");
console.log("助手样式已按新版替换");
