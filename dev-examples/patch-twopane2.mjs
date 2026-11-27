// 两栏化后清理分栏拖拽的 aside 残留
import { readFileSync, writeFileSync } from "node:fs";
const p = "server/viewer.ts";
let s = readFileSync(p, "utf8").replace(/\r\n/g, "\n");

const start = s.indexOf("/* ---------- 分栏拖拽（S2）---------- */");
const end = s.indexOf("/* ---------- 顶栏：变体分段 + 步骤圆点 ---------- */");
if (start < 0 || end < 0) throw new Error("分栏段落未找到");

s = s.slice(0, start) + `/* ---------- 左栏拖拽（两栏布局只剩一个分隔条）---------- */
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

` + s.slice(end);

// 清理 --aside-w 变量
s = s.replace("    --aside-w: 320px;\n", "");

writeFileSync(p, s, "utf8");
console.log("分栏代码已简化");
