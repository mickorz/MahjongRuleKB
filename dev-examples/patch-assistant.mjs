// 创作助手：复刻 .asst-launch 悬浮按钮 + .asst-drawer 窗口
import { readFileSync, writeFileSync } from "node:fs";
const p = "server/viewer.ts";
let s = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const must = (n, k) => { if (!s.includes(n)) throw new Error("锚点缺失：" + k); };

/* ---------- 1) 关键帧：原站 asstWindowIn ---------- */
must("  @keyframes rgPop", "keyframes");
s = s.replace(
  "  @keyframes rgPop",
  `  @keyframes asstWindowIn { from { opacity: 0; transform: translateY(10px) scale(.98); } to { opacity: 1; transform: none; } }
  @keyframes rgPop`,
);

/* ---------- 2) 样式 ---------- */
must("  /* 修订记录抽屉", "drawer css anchor");
s = s.replace(
  "  /* 修订记录抽屉",
  `  /* 创作助手：悬浮按钮（原站 .asst-launch） */
  .asst-launch {
    position: fixed; right: 22px; bottom: 84px; z-index: 720;
    width: 48px; height: 48px; display: grid; place-items: center; padding: 0;
    border: 1px solid color-mix(in srgb, var(--gold-deep) 35%, var(--line));
    border-radius: 50%; background: var(--ink); color: var(--paper);
    box-shadow: 0 10px 28px var(--shadow); cursor: pointer;
    transition: transform .18s var(--ease), background .18s var(--ease);
  }
  .asst-launch:hover { transform: translateY(-2px); background: var(--gold-deep); }
  .asst-launch[aria-expanded="true"] { background: var(--gold-deep); }

  /* 助手窗口（原站 .asst-drawer） */
  .asst-drawer {
    position: fixed; right: 22px; bottom: 144px; z-index: 721;
    width: 396px; min-height: 320px; max-height: min(620px, calc(100vh - 180px));
    display: grid; grid-template-rows: auto minmax(0, 1fr) auto;
    overflow: hidden; border: 1px solid var(--line); border-radius: 12px;
    background: var(--paper); box-shadow: 0 16px 44px var(--shadow);
    animation: asstWindowIn .2s var(--ease-out) both;
  }
  .asst-drawer[hidden] { display: none; }
  .asst-drawer-head {
    display: flex; align-items: center; gap: 10px; padding: 12px 14px;
    border-bottom: 1px solid var(--line); background: var(--paper-2);
  }
  .asst-drawer-head .ad {
    width: 28px; height: 28px; border-radius: 7px; flex: none;
    background: var(--ink); color: var(--paper); display: grid; place-items: center;
  }
  .asst-drawer-head .ht { display: flex; flex-direction: column; line-height: 1.25; min-width: 0; }
  .asst-drawer-head .ht b { font-family: var(--serif); font-size: 14px; font-weight: 600; }
  .asst-drawer-head .ht i { font-style: normal; font-size: 11px; color: var(--ink-3); }
  .asst-drawer-body {
    overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px;
    font-size: 12.5px; line-height: 1.7; color: var(--ink);
  }
  .asst-msg { padding: 9px 11px; border-radius: 8px; white-space: pre-wrap; word-break: break-word; }
  .asst-msg.user { align-self: flex-end; max-width: 86%; background: var(--ink); color: var(--paper); }
  .asst-msg.assistant { background: var(--card); border: 1px solid var(--line); }
  .asst-msg.error { background: var(--terra-wash, oklch(.95 .04 40)); border: 1px solid color-mix(in srgb, var(--terra) 30%, transparent); color: var(--terra); }
  .asst-msg .who { display: block; font: 600 10.5px/1.4 var(--sans); color: var(--ink-3); margin-bottom: 3px; }
  .asst-empty { color: var(--ink-3); font-size: 12px; text-align: center; padding: 24px 8px; }
  .asst-drawer-foot {
    display: flex; align-items: flex-end; gap: 8px; padding: 10px 12px 12px;
    border-top: 1px solid var(--line); background: var(--paper-2);
  }
  .asst-drawer-foot textarea {
    flex: 1 1 auto; min-height: 38px; max-height: 120px; resize: none;
    border: 1px solid var(--line); border-radius: 8px; background: var(--card);
    padding: 9px 11px; font: 12.5px/1.5 var(--sans); color: var(--ink); outline: none;
  }
  .asst-drawer-foot textarea:focus { border-color: var(--gold-deep); }

  /* 修订记录抽屉`,
);

/* ---------- 3) DOM：按钮 + 窗口 ---------- */
must('<div class="c-toast" id="toast"', "toast anchor");
s = s.replace(
  '<div class="c-toast" id="toast"',
  `<button type="button" class="asst-launch" id="asst-launch" aria-label="创作助手" title="创作助手" aria-expanded="false">
  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z M19 14l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"></path></svg>
</button>
<aside class="asst-drawer" id="asst-drawer" hidden role="dialog" aria-label="创作助手">
  <div class="asst-drawer-head">
    <span class="ad"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z M19 14l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"></path></svg></span>
    <div class="ht"><b>创作助手</b><i>基于当前玩法文档回答，只能读不能改</i></div>
    <button class="edt-x" id="asst-close" title="关闭" type="button">×</button>
  </div>
  <div class="asst-drawer-body" id="asst-body"></div>
  <div class="asst-drawer-foot">
    <textarea id="asst-input" rows="1" placeholder="问点什么，例如「拖底怎么判」"></textarea>
    <button class="c-btn primary" id="asst-send" type="button">发送</button>
  </div>
</aside>
<div class="c-toast" id="toast"`,
);

/* ---------- 4) 交互 ---------- */
must("let refNames = { rules: {}, configs: {} };", "state anchor");
s = s.replace(
  "let refNames = { rules: {}, configs: {} };",
  `let refNames = { rules: {}, configs: {} };

/** 助手会话（只存在页面内存里，不落盘） */
const asst = { messages: [], busy: false };

function asstEl(id) { return document.getElementById(id); }

function asstRender() {
  const body = asstEl("asst-body");
  if (asst.messages.length === 0) {
    body.innerHTML = '<div class="asst-empty">问它与当前文档相关的问题。它只读文档，不会改动任何内容。</div>';
    return;
  }
  body.innerHTML = "";
  for (const m of asst.messages) {
    const d = document.createElement("div");
    d.className = "asst-msg " + m.role;
    const who = document.createElement("span");
    who.className = "who";
    who.textContent = m.role === "user" ? "我" : "助手";
    if (m.role !== "user") d.appendChild(who);
    d.appendChild(document.createTextNode(m.content));
    body.appendChild(d);
  }
  body.scrollTop = body.scrollHeight;
}

/** 文档上下文：标题 + 前若干段正文（够模型判断，又不至于太长） */
function asstContext() {
  if (!currentDoc) return { title: "", excerpt: "" };
  const title = nameOf(currentDoc.ruleset_id) + "需求文档";
  const parts = [];
  for (const block of currentDoc.blocks) {
    parts.push("## " + block.title);
    for (const seg of block.segments.slice(0, 6)) parts.push(seg.text);
    if (parts.join("\\n").length > 5000) break;
  }
  return { title, excerpt: parts.join("\\n").slice(0, 5000) };
}

async function asstAsk(text) {
  const content = text.trim();
  if (!content || asst.busy) return;
  asst.messages.push({ role: "user", content });
  asstRender();
  asst.busy = true;
  const send = asstEl("asst-send");
  send.disabled = true;
  send.innerHTML = '<span class="c-spin"></span>';
  asstEl("asst-input").value = "";
  try {
    const ctx = asstContext();
    const res = await fetch("/api/assistant", {
      method: "POST",
      headers: { "content-type": "application/json", "X-Rule-Studio": "1" },
      body: JSON.stringify({ variant: currentVariant, messages: asst.messages, ...ctx }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      asst.messages.push({ role: "assistant", content: "（" + (data.message || data.error || res.status) + "）" });
    } else {
      asst.messages.push({ role: "assistant", content: data.text });
    }
  } catch (e) {
    asst.messages.push({ role: "assistant", content: "（请求失败：" + e.message + "）" });
  } finally {
    asst.busy = false;
    send.disabled = false;
    send.textContent = "发送";
    asstRender();
  }
}`,
);

must('el("rev-drawer-close").onclick = closeRevpop;', "handlers anchor");
s = s.replace(
  'el("rev-drawer-close").onclick = closeRevpop;',
  `el("rev-drawer-close").onclick = closeRevpop;

el("asst-launch").onclick = () => {
  const drawer = asstEl("asst-drawer");
  const open = drawer.hidden;
  drawer.hidden = !open;
  el("asst-launch").setAttribute("aria-expanded", String(open));
  if (open) {
    asstRender();
    asstEl("asst-input").focus();
  }
};
el("asst-close").onclick = () => {
  asstEl("asst-drawer").hidden = true;
  el("asst-launch").setAttribute("aria-expanded", "false");
};
el("asst-send").onclick = () => asstAsk(asstEl("asst-input").value);
asstEl("asst-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    asstAsk(asstEl("asst-input").value);
  }
});`,
);

writeFileSync(p, s, "utf8");
console.log("创作助手按钮与窗口已接入");
