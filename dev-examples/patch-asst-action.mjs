// 助手改稿模式：Action 卡片（提案 → 应用走 /api/apply）
import { readFileSync, writeFileSync } from "node:fs";
const p = "server/viewer.ts";
let s = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const must = (n, k) => { if (!s.includes(n)) throw new Error("锚点缺失：" + k); };

/* 1) 样式：action 卡片 + 改稿按钮激活态 */
must("  /* 输入区（原站 .asst-compose / .asst-compose-input / .asst-send） */", "css anchor");
s = s.replace(
  "  /* 输入区（原站 .asst-compose / .asst-compose-input / .asst-send） */",
  `  /* 改稿提案卡（Action） */
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

  /* 输入区（原站 .asst-compose / .asst-compose-input / .asst-send） */`,
);

/* 2) DOM：改稿切换按钮 */
must('<button class="asst-send" id="asst-send"', "send button");
s = s.replace(
  `    <button class="asst-send" id="asst-send" type="button" title="发送" aria-label="发送">`,
  `    <button class="asst-icon-button" id="asst-edit-mode" type="button" title="改稿模式：让助手给出改写提案" aria-label="改稿模式" aria-pressed="false">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l10-10-4-4L4 16v4z"></path><path d="M14 6l4 4"></path></svg>
    </button>
    <button class="asst-send" id="asst-send" type="button" title="发送" aria-label="发送">`,
);

/* 3) 状态 + 改稿流程 */
must("const asst = {\n  messages: [],", "state");
s = s.replace(
  "const asst = {\n  messages: [],",
  "const asst = {\n  messages: [],\n  editMode: false,",
);

must("async function asstAsk(text) {", "ask anchor");
s = s.replace(
  "async function asstAsk(text) {",
  `/** 改稿模式：请求提案 → 渲染 Action 卡片；应用仍走 /api/apply */
async function asstPropose(text) {
  const instruction = text.trim();
  if (!instruction || asst.busy) return;
  asst.messages.push({ role: "user", content: "（改稿）" + instruction });
  asst.busy = true;
  asstSave();
  asstRender();
  const send = asstEl("asst-send");
  const sendHtml = send.innerHTML;
  send.disabled = true;
  send.innerHTML = '<span class="c-spin"></span>';
  asstEl("asst-input").value = "";
  try {
    const res = await fetch("/api/assistant/edit", {
      method: "POST",
      headers: { "content-type": "application/json", "X-Rule-Studio": "1" },
      body: JSON.stringify({ variant: currentVariant, instruction }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      asst.messages.push({ role: "assistant", content: "（" + (data.message || data.error || res.status) + "）" });
    } else {
      asst.messages.push({
        role: "assistant",
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

async function asstAsk(text) {`,
);

/* 4) 发送分流：改稿模式走提案 */
must('el("asst-send").onclick = () => asstAsk(asstEl("asst-input").value);', "send bind");
s = s.replace(
  'el("asst-send").onclick = () => asstAsk(asstEl("asst-input").value);',
  'el("asst-send").onclick = () => (asst.editMode ? asstPropose(asstEl("asst-input").value) : asstAsk(asstEl("asst-input").value));',
);
must(`  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    asstAsk(asstEl("asst-input").value);
  }`, "enter bind");
s = s.replace(
  `  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    asstAsk(asstEl("asst-input").value);
  }`,
  `  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    const value = asstEl("asst-input").value;
    if (asst.editMode) asstPropose(value); else asstAsk(value);
  }`,
);
must('el("asst-mode").onclick = (ev) => { ev.stopPropagation(); asstToggleMode(); };', "mode bind");
s = s.replace(
  'el("asst-mode").onclick = (ev) => { ev.stopPropagation(); asstToggleMode(); };',
  `el("asst-mode").onclick = (ev) => { ev.stopPropagation(); asstToggleMode(); };
el("asst-edit-mode").onclick = () => {
  asst.editMode = !asst.editMode;
  el("asst-edit-mode").setAttribute("aria-pressed", String(asst.editMode));
  asstEl("asst-input").placeholder = asst.editMode ? "描述要怎么改，例如「把这段写得更简洁」" : "问点什么，回车发送";
  asstEl("asst-input").focus();
};`,
);

writeFileSync(p, s, "utf8");
console.log("改稿模式与 Action 卡片已接入（样式/DOM/流程）");
