// 助手：停靠/浮动、拖拽、缩放、会话持久化（对齐参考站 .asst-drawer--docked / --floating 行为）
import { readFileSync, writeFileSync } from "node:fs";
const p = "server/viewer.ts";
let s = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const must = (n, k) => { if (!s.includes(n)) throw new Error("锚点缺失：" + k); };

/* ---------- 1) 样式：浮动 / 停靠 / 拖拽 / 缩放柄 ---------- */
must("  /* 浮窗模式：贴右满高（参考站 body:has(.asst-drawer--floating) 的几何） */", "css anchor");
const cssStart = s.indexOf("  /* 浮窗模式：贴右满高（参考站 body:has(.asst-drawer--floating) 的几何） */");
const cssEnd = s.indexOf("  .asst-heading {", cssStart);

const drawerCss = `  /* 浮动模式：贴右、满高（参考站 floating 几何），可拖拽可缩放 */
  .asst-drawer {
    position: fixed; z-index: 721;
    display: grid; grid-template-rows: auto minmax(0, 1fr) auto;
    overflow: hidden; border: 1px solid var(--line); border-radius: 12px;
    background: var(--paper); box-shadow: 0 16px 44px var(--shadow);
    animation: asstWindowIn .2s var(--ease-out) both;
  }
  .asst-drawer[hidden] { display: none; }
  .asst-drawer--floating {
    right: 16px; top: 16px; width: 480px; height: calc(100vh - 32px);
  }
  .asst-drawer--floating.asst-drawer--placed { right: auto; }

  /* 停靠模式：贴右满高、无圆角、只留左侧分隔线（参考站 --docked） */
  .asst-drawer--docked {
    right: 0; top: 0; bottom: 0; height: 100vh; width: 420px;
    border: 0; border-left: 1px solid var(--line); border-radius: 0;
    box-shadow: -3px 0 12px color-mix(in srgb, var(--shadow) 20%, transparent);
    animation: none;
  }
  /* 停靠时给正文让位（等价参考站 body:has(.asst-drawer--floating) 的 margin-right） */
  .app.asst-docked .app-body { padding-right: var(--asst-dock-w, 420px); }

  .asst-drawer--dragging { user-select: none; }
  .asst-drawer--dragging .asst-heading { cursor: grabbing; }

  /* 缩放手柄：浮动右下角、停靠左缘 */
  .asst-resize {
    position: absolute; z-index: 2; background: transparent;
  }
  .asst-resize--se { right: 0; bottom: 0; width: 16px; height: 16px; cursor: nwse-resize; }
  .asst-resize--se::after {
    content: ""; position: absolute; right: 4px; bottom: 4px; width: 7px; height: 7px;
    border-right: 2px solid var(--ink-3); border-bottom: 2px solid var(--ink-3);
    border-radius: 0 0 2px 0; opacity: .6;
  }
  .asst-resize--left { left: 0; top: 0; bottom: 0; width: 10px; cursor: ew-resize; }
  .asst-resize--left::before {
    content: ""; position: absolute; inset: 0 auto 0 0; width: 1px; background: var(--line);
    transition: background .15s var(--ease);
  }
  .asst-resize--left::after {
    content: ""; position: absolute; top: 50%; left: 4px; width: 3px; height: 40px;
    border-radius: 3px; background: color-mix(in srgb, var(--ink-3) 55%, var(--line));
    transform: translateY(-50%);
  }
  .asst-resize--left:hover::before { background: var(--gold-soft); }
  .asst-resize--left:hover::after { background: var(--gold-deep); height: 56px; }
  .asst-drawer--floating .asst-resize--left { display: none; }
  .asst-drawer--docked .asst-resize--se { display: none; }

  .asst-heading-actions { display: flex; align-items: center; gap: 4px; flex: none; }
  .asst-icon-button {
    width: 28px; height: 28px; display: grid; place-items: center; padding: 0;
    border: 1px solid transparent; border-radius: 6px; background: transparent;
    color: var(--ink-3); cursor: pointer;
    transition: background .15s var(--ease), color .15s var(--ease), border-color .15s var(--ease);
  }
  .asst-icon-button:hover { background: var(--card); border-color: var(--line); color: var(--ink); }
  .asst-icon-button:focus-visible { outline: 2px solid var(--gold-deep); outline-offset: 2px; }
  .asst-drawer--floating .asst-heading { cursor: grab; touch-action: none; }

`;
s = s.slice(0, cssStart) + drawerCss + s.slice(cssEnd);

/* ---------- 2) DOM：模式按钮 + 缩放柄 ---------- */
must('<aside class="asst-drawer" id="asst-drawer"', "dom");
s = s.replace(
  `<aside class="asst-drawer" id="asst-drawer" hidden role="dialog" aria-modal="false" aria-labelledby="asst-title">
  <header class="asst-heading">
    <div>
      <h2 id="asst-title">创作助手</h2>
      <p>基于当前玩法的规则文档回答；只能读，不会改动任何内容。</p>
    </div>
    <button class="edt-x" id="asst-close" title="关闭" type="button">×</button>
  </header>`,
  `<aside class="asst-drawer asst-drawer--floating" id="asst-drawer" hidden role="dialog" aria-modal="false" aria-labelledby="asst-title">
  <div class="asst-resize asst-resize--left" id="asst-resize-left" title="拖动调整宽度"></div>
  <div class="asst-resize asst-resize--se" id="asst-resize-se" title="拖动调整大小"></div>
  <header class="asst-heading" id="asst-heading">
    <div>
      <h2 id="asst-title">创作助手</h2>
      <p>基于当前玩法的规则文档回答；只能读，不会改动任何内容。</p>
    </div>
    <div class="asst-heading-actions">
      <button class="asst-icon-button" id="asst-mode" title="切换停靠 / 浮动" aria-label="切换停靠或浮动">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M15 4v16"></path></svg>
      </button>
      <button class="asst-icon-button" id="asst-reset" title="清空会话" aria-label="清空会话">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"></path></svg>
      </button>
      <button class="edt-x" id="asst-close" title="关闭" type="button">×</button>
    </div>
  </header>`,
);

writeFileSync(p, s, "utf8");
console.log("停靠/浮动样式与 DOM 已加");
