// 入口：把参考项目的聊天时间线 + 输入框打成一个可挂载的 ESM 组件
// 用法（宿主页面，无构建）：import { mountChat, mountComposer } from "./chat-lib.js"
import * as React from "react";
import { createRoot } from "react-dom/client";
import i18next from "i18next";

import { AgentTimeline } from "../src/renderer/agent-timeline.js";
import "./chat-subset.css";
import type { Turn } from "../src/shared/contracts.js";

/**
 * 纸色主题覆盖。
 * 参考项目的令牌定义在它自己的 :root 里，被 shadow root 隔离后取不到，
 * 所以这里按它的变量名重写一套纸色/墨色值，工作台与面板视觉才统一。
 */
const TOKENS = `
:host {
  --canvas: #FEFCF8;
  --surface: #FEFCF8;
  --surface-raised: #FFFFFF;
  --surface-hover: #F8F4EB;
  --border: rgba(34,29,22,.10);
  --border-strong: rgba(34,29,22,.18);
  --scrollbar-thumb: rgba(34,29,22,.14);
  --scrollbar-thumb-hover: rgba(34,29,22,.24);
  --search-border: rgba(34,29,22,.10);
  --text: #221D16;
  --text-secondary: #5E5447;
  --text-muted: #7B7160;
  --text-faint: #938979;
  --accent: #221D16;
  --accent-ink: #FEFCF8;
  --success: #4F7A54;
  --diff-added: #4F7A54;
  --diff-removed: #A34A3C;
  --danger: #A34A3C;
  --warning: #9A6B1F;
  --radius: 8px;
  --radius-panel: 10px;
  --theme-accent: #A8842E;
  --theme-accent-hover: #8C6C22;
  --composer-accent: #A8842E;
  --composer-accent-hover: #8C6C22;
  --composer-border: rgba(34,29,22,.14);
  --composer-surface: #F8F4EB;
  --menu-border: rgba(34,29,22,.10);
  --menu-hover: rgba(34,29,22,.04);
  --menu-shadow: 0 2px 8px rgba(34,29,22,.06);
  --menu-surface: #FFFFFF;
  --control-surface: #F8F4EB;
  --control-selected: #F1E9DA;
  --content-column-width: 760px;
  color-scheme: light;
  display: block;
  height: 100%;
  min-height: 0;
  font-family: "Noto Sans SC", -apple-system, "Segoe UI", sans-serif;
}
.chat-host { height: 100%; min-height: 0; display: flex; flex-direction: column; background: var(--canvas); color: var(--text); }
.chat-host * { box-sizing: border-box; }
/* 输入框：参考项目的 .composer 是 sticky 底栏，沙盒里改成常驻块 */
.composer-shell { position: static; display: block; padding: 0; background: transparent; }
.composer-shell .prompt-box { box-shadow: none; }
.composer-shell textarea { color: var(--text); }
.composer-shell textarea::placeholder { color: var(--text-faint); }
.composer-shell .send-button {
  display: grid; place-items: center; width: 30px; height: 30px; padding: 0;
  border: 0; border-radius: 50%; cursor: pointer;
  background: var(--composer-accent); color: #FEFCF8;
}
.composer-shell .send-button:hover:not(:disabled) { background: var(--composer-accent-hover); }
.composer-shell .send-button:disabled { opacity: .45; cursor: not-allowed; }
/* 规则 ID / 代码片段不要从中间折行（XS-T-JIESUAN-HUAMIAN 曾被拆成两行） */
.markdown-content code { white-space: nowrap; }
/* 用户气泡、编辑器等也写死了深色值，统一改纸色 */
.user-message { background: #F1E9DA; color: #221D16; }
.user-message-editor { background: #FFFFFF; border: .5px solid rgba(34,29,22,.10); }
.user-message-actions button { color: #938979; }
/* 参考项目把标题/代码/链接写死成深色值，纸色下要改回浅底深字 */
.markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4 { color: var(--text); }
.markdown-content code { background: #F1E9DA; color: #7A4A16; }
.markdown-content a { color: #8C6C22; }
`;

/** 每个宿主元素只允许一个 React root：重复 mount 会复用，避免旧 root 失效 */
const mounted = new WeakMap<HTMLElement, ChatHandle>();

export interface ChatHandle {
  applyTurns: (turns: Turn[]) => void;
  dispose: () => void;
  shadowRoot: ShadowRoot;
}

/** 在 shadow root 内准备 style/link/host 三件套（幂等） */
function ensureShadow(el: HTMLElement, cssUrl?: string): ShadowRoot {
  const shadow = el.shadowRoot ?? el.attachShadow({ mode: "open" });
  // 样式以 <link> 注入 shadow root：CSS 作为独立资源，不进 JS 包
  if (cssUrl && !shadow.querySelector("link[data-cap]")) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.dataset.cap = "1";
    link.href = cssUrl;
    shadow.appendChild(link);
  }
  // 覆盖样式必须排在 link 之后，否则同优先级下被参考项目的样式盖回去
  let style = shadow.querySelector<HTMLStyleElement>("style[data-cap]");
  if (!style) {
    style = document.createElement("style");
    style.dataset.cap = "1";
    style.textContent = TOKENS;
  }
  shadow.appendChild(style);
  return shadow;
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
  const shadow = ensureShadow(el, options.cssUrl);
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

export interface ComposerHandle {
  setDisabled: (disabled: boolean) => void;
  setPlaceholder: (text: string) => void;
  clear: () => void;
  focus: () => void;
  dispose: () => void;
  shadowRoot: ShadowRoot;
}

interface ComposerState {
  value: string;
  disabled: boolean;
  placeholder: string;
}

const composerMounted = new WeakMap<HTMLElement, ComposerHandle>();

function SendArrow() {
  return React.createElement(
    "svg",
    { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" },
    React.createElement("path", { d: "M12 19V5M5 12l7-7 7 7" }),
  );
}

/** 参考项目输入框的外壳（.composer + .prompt-box），行为回调交给宿主 */
function ChatComposer(props: { state: ComposerState; onChange: (value: string) => void; onSend: () => void }) {
  const { state, onChange, onSend } = props;
  const areaRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    area.style.height = "auto";
    area.style.height = Math.min(area.scrollHeight + 1, 132) + "px";
  }, [state.value]);

  const submit = () => {
    if (state.disabled || !state.value.trim()) return;
    onSend();
  };

  return React.createElement(
    "form",
    {
      className: "composer composer-shell",
      onSubmit: (event: React.FormEvent) => {
        event.preventDefault();
        submit();
      },
    },
    React.createElement(
      "div",
      { className: "prompt-box prompt-box-project" },
      React.createElement(
        "div",
        { className: "prompt-box-input" },
        React.createElement(
          "div",
          { className: "prompt-box-editor" },
          React.createElement("textarea", {
            ref: areaRef,
            rows: 1,
            value: state.value,
            disabled: state.disabled,
            placeholder: state.placeholder,
            "aria-label": state.placeholder,
            onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value),
            onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (event.key !== "Enter" || event.shiftKey) return;
              if (event.nativeEvent.isComposing) return;
              event.preventDefault();
              submit();
            },
          }),
        ),
      ),
      React.createElement(
        "div",
        { className: "prompt-box-toolbar" },
        React.createElement("div", { className: "prompt-box-leading" }),
        React.createElement(
          "div",
          { className: "prompt-box-actions" },
          React.createElement(
            "button",
            { type: "submit", className: "send-button", disabled: state.disabled || !state.value.trim(), title: "发送", "aria-label": "发送" },
            React.createElement(SendArrow),
          ),
        ),
      ),
    ),
  );
}

/**
 * 挂载参考项目的输入框。
 * 与 mountChat 分开成两个宿主：时间线滚动区与输入区互不影响重渲染。
 */
export function mountComposer(
  el: HTMLElement,
  options: { placeholder?: string; cssUrl?: string; onSend: (text: string) => void },
): ComposerHandle {
  const existing = composerMounted.get(el);
  if (existing) return existing;

  const shadow = ensureShadow(el, options.cssUrl);
  let host = shadow.querySelector<HTMLDivElement>(".composer-host");
  if (!host) {
    host = document.createElement("div");
    host.className = "composer-host";
    shadow.appendChild(host);
  }

  let state: ComposerState = { value: "", disabled: false, placeholder: options.placeholder ?? "问点什么，回车发送" };
  const root = createRoot(host);
  const render = () => {
    root.render(
      React.createElement(ChatComposer, {
        state,
        onChange: (value) => {
          state = { ...state, value };
          render();
        },
        onSend: () => {
          const text = state.value;
          state = { ...state, value: "" };
          render();
          options.onSend(text);
        },
      }),
    );
  };
  render();
  void i18next.changeLanguage("zh-CN");

  const handle: ComposerHandle = {
    setDisabled: (disabled) => {
      if (state.disabled === disabled) return;
      state = { ...state, disabled };
      render();
    },
    setPlaceholder: (placeholder) => {
      if (state.placeholder === placeholder) return;
      state = { ...state, placeholder };
      render();
    },
    clear: () => {
      state = { ...state, value: "" };
      render();
    },
    focus: () => {
      host?.querySelector("textarea")?.focus();
    },
    dispose: () => {
      composerMounted.delete(el);
      root.unmount();
    },
    shadowRoot: shadow,
  };
  composerMounted.set(el, handle);
  return handle;
}
