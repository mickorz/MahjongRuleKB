// 一次性补丁：默认深色（对齐 zenstory 工作台），顶栏加主题开关并持久化
import { readFileSync, writeFileSync } from "node:fs";

const path = "server/viewer.ts";
let s = readFileSync(path, "utf8").replace(/\r\n/g, "\n");

// 1) 浅色令牌从 media query 改为 data-theme 覆盖；默认即深色
const oldLightBlock = `  @media (prefers-color-scheme: light) {
    :root {`;
const newLightBlock = `  /* 浅色为可选主题（纸感）；默认深色，对齐 zenstory 工作台 */
  html[data-theme="light"] {
    :root {`;

if (!s.includes(oldLightBlock)) throw new Error("浅色媒体查询锚点未找到");
s = s.replace(oldLightBlock, newLightBlock);

// 关闭原 media query 的右括号位置：把结尾 "  }\n  }" 替换为仅 "  }"
const oldLightTail = `      --rs-danger: 0 72% 46%;
    }
  }
`;
const newLightTail = `      --rs-danger: 0 72% 46%;
  }
`;
if (!s.includes(oldLightTail)) throw new Error("浅色块结尾未匹配");
s = s.replace(oldLightTail, newLightTail);

// 2) 顶栏加主题开关
const headAnchor = `    <span class="doc" id="doc-title"></span>`;
const headNew = `    <span class="doc" id="doc-title"></span>
    <button class="theme-toggle" id="theme-toggle" title="切换深浅色" aria-label="切换深浅色">主题</button>`;
if (!s.includes(headAnchor)) throw new Error("顶栏锚点未找到");
s = s.replace(headAnchor, headNew);

// 3) 开关样式
const styleAnchor = `  .app-head .doc { color: hsl(var(--rs-muted)); font-size: 12px; }`;
const styleNew = `  .app-head .doc { color: hsl(var(--rs-muted)); font-size: 12px; }
  .theme-toggle {
    margin-left: auto; font: inherit; font-size: 11.5px; cursor: pointer;
    padding: 3px 10px; border-radius: 999px;
    border: 1px solid hsl(var(--rs-line)); background: hsl(var(--rs-panel)); color: hsl(var(--rs-muted));
  }
  .theme-toggle:hover { color: hsl(var(--rs-accent)); border-color: hsl(var(--rs-accent) / 0.6); }`;
if (!s.includes(styleAnchor)) throw new Error("顶栏样式锚点未找到");
s = s.replace(styleAnchor, styleNew);

// 4) 启动时应用主题 + 绑定开关
const startAnchor = `bindSplitters();
applyLayout(currentVariant);`;
const startNew = `/* 主题：默认深色，用户可切浅色并记忆 */
const THEME_KEY = "rs-theme";
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem(THEME_KEY, theme); } catch {}
}
let savedTheme = null;
try { savedTheme = localStorage.getItem(THEME_KEY); } catch {}
applyTheme(savedTheme === "light" ? "light" : "dark");
el("theme-toggle").onclick = () => {
  applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
};

bindSplitters();
applyLayout(currentVariant);`;

if (!s.includes(startAnchor)) throw new Error("启动锚点未找到");
s = s.replace(startAnchor, startNew);

writeFileSync(path, s, "utf8");
console.log("已改为默认深色 + 主题开关");
