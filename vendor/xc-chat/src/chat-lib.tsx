// Spike 入口：把参考项目的聊天时间线打成一个可挂载的 ESM 组件
// 用法（宿主页面，无构建）：import { mountChat } from "./chat-lib.js"
import * as React from "react";
import { createRoot } from "react-dom/client";
import i18next from "i18next";

import { AgentTimeline } from "../src/renderer/agent-timeline.js";
import "./chat-subset.css";
import type { Turn } from "../src/shared/contracts.js";

/** 参考项目样式依赖它自己的深色令牌；在 shadow root 内重建一份，避免顶掉宿主主题 */
const TOKENS = `
:host {
  --canvas: #171717;
  --panel: #1b1b1b;
  --panel-2: #202020;
  --line: #2c2c2c;
  --line-strong: #3a3a3a;
  --text: #f1f3f5;
  --text-dim: #b9bec5;
  --text-muted: #8b9199;
  --accent: #7aa2f7;
  --accent-strong: #5c8bf5;
  --danger: #f7768e;
  --success: #9ece6a;
  --warn: #e0af68;
  --gold: #d7a65b;
  --radius: 10px;
  --radius-sm: 6px;
  color-scheme: dark;
  display: block;
  height: 100%;
  min-height: 0;
}
.chat-host { height: 100%; min-height: 0; display: flex; flex-direction: column; background: var(--canvas); color: var(--text); }
.chat-host * { box-sizing: border-box; }
`;

/** 每个宿主元素只允许一个 React root：重复 mount 会复用，避免旧 root 失效 */
const mounted = new WeakMap<HTMLElement, ChatHandle>();

export interface ChatHandle {
  applyTurns: (turns: Turn[]) => void;
  dispose: () => void;
  shadowRoot: ShadowRoot;
}

export function mountChat(
  el: HTMLElement,
  options: { turns: Turn[]; language?: string; cssUrl?: string },
): ChatHandle {
  const existing = mounted.get(el);
  if (existing) {
    existing.applyTurns(options.turns);
    return existing;
  }
  const shadow = el.shadowRoot ?? el.attachShadow({ mode: "open" });
  if (!shadow.querySelector("style[data-cap]")) {
    const style = document.createElement("style");
    style.dataset.cap = "1";
    style.textContent = TOKENS;
    shadow.appendChild(style);
  }
  // 样式以 <link> 注入 shadow root：CSS 作为独立资源，不进 JS 包
  if (options.cssUrl && !shadow.querySelector("link[data-cap]")) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.dataset.cap = "1";
    link.href = options.cssUrl;
    shadow.appendChild(link);
  }
  let host = shadow.querySelector<HTMLDivElement>(".chat-host");
  if (!host) {
    host = document.createElement("div");
    host.className = "chat-host";
    shadow.appendChild(host);
  }

  const root = createRoot(host);
  const render = (turns: Turn[]) => root.render(<AgentTimeline turns={turns} />);
  render(options.turns);
  // 语言异步生效后再渲染一次，保证工具摘要等文案是中文
  void i18next.changeLanguage(options.language ?? "zh-CN").then(() => render(options.turns));

  const handle: ChatHandle = {
    applyTurns: render,
    dispose: () => {
      mounted.delete(el);
      root.unmount();
    },
    shadowRoot: shadow,
  };
  mounted.set(el, handle);
  return handle;
}
