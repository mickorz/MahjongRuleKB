// 助手交互：模式切换、拖拽、缩放、会话持久化
import { readFileSync, writeFileSync } from "node:fs";
const p = "server/viewer.ts";
let s = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const must = (n, k) => { if (!s.includes(n)) throw new Error("锚点缺失：" + k); };

/* 1) 状态：模式 + 几何 + 会话，读写 localStorage */
must("/** 助手会话（只存在页面内存里，不落盘） */\nconst asst = { messages: [], busy: false };", "state");
s = s.replace(
  "/** 助手会话（只存在页面内存里，不落盘） */\nconst asst = { messages: [], busy: false };",
  `/** 助手会话与窗口状态（持久化到 localStorage，仅本机浏览器） */
const ASST_KEY = "rs-assistant";
const asst = {
  messages: [],
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
    if (saved.mode === "docked" || saved.mode === "floating") asst.mode = saved.mode;
    if (typeof saved.width === "number") asst.width = saved.width;
    if (typeof saved.height === "number") asst.height = saved.height;
    if (typeof saved.x === "number") asst.x = saved.x;
    if (typeof saved.y === "number") asst.y = saved.y;
    if (Array.isArray(saved.messages)) {
      asst.messages = saved.messages.filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string");
    }
  } catch {}
}`,
);

/* 2) 几何应用 + 模式切换 + 拖拽 + 缩放 */
must("function asstRender() {", "render anchor");
s = s.replace(
  "function asstRender() {",
  `/** 把 asst 状态应用到窗口（位置/尺寸/模式/正文让位） */
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
  app.classList.toggle("asst-docked", asst.mode === "docked");
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
    head.setPointerCapture?.(ev.pointerId);
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
      handle.setPointerCapture?.(ev.pointerId);
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

function asstRender() {`,
);

/* 3) 开关窗口时应用几何 + 持久化；清空会话；初始加载 */
must('el("asst-launch").onclick = () => {', "bind anchor");
s = s.replace(
  `el("asst-launch").onclick = () => {
  const drawer = asstEl("asst-drawer");
  const open = drawer.hidden;
  drawer.hidden = !open;
  el("asst-launch").setAttribute("aria-expanded", String(open));
  if (open) {
    asstRender();
    asstEl("asst-input").focus();
  }
};`,
  `asstLoad();
asstApplyGeometry();
asstBindDrag();
asstBindResize();

el("asst-mode").onclick = (ev) => { ev.stopPropagation(); asstToggleMode(); };
el("asst-reset").onclick = (ev) => {
  ev.stopPropagation();
  asst.messages = [];
  asstSave();
  asstRender();
  toast("会话已清空");
};

el("asst-launch").onclick = () => {
  const drawer = asstEl("asst-drawer");
  const open = drawer.hidden;
  drawer.hidden = !open;
  el("asst-launch").setAttribute("aria-expanded", String(open));
  if (open) {
    asstApplyGeometry();
    asstRender();
    asstEl("asst-input").focus();
  }
};`,
);

/* 4) 每次问答后落盘 */
must("    asst.busy = false;\n    send.disabled = false;", "persist anchor");
s = s.replace(
  "  asst.messages.push({ role: \"user\", content });\n  asstRender();",
  "  asst.messages.push({ role: \"user\", content });\n  asstSave();\n  asstRender();",
);
s = s.replace(
  "    asst.busy = false;\n    send.disabled = false;",
  "    asst.busy = false;\n    asstSave();\n    send.disabled = false;",
);

writeFileSync(p, s, "utf8");
console.log("交互逻辑已接入（模式/拖拽/缩放/持久化）");
