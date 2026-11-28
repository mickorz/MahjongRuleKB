# xc-chat：参考项目聊天框的预构建封装

把 `thirdparties/xc-ui-flow`（game-workbench，Apache-2.0）的会话时间线打成一份**预构建 ESM +
CSS**，供本仓库的无构建工作台直接挂载（方案 D，见
`dev-docs/research/2026-11-28-xc-ui-flow聊天框复刻方案.md` §5.8）。

## 为什么这样做

- 直接 import 源码 = 把 181 个模块 / 3.9 万行 / 49 个依赖拖进来，还要给工作台加 Vite+React
- 预构建后：React 关在 bundle 里，我们这边 **0 依赖、0 构建**
- 样式注入 Shadow DOM，参考项目的深色令牌不会污染工作台的纸色主题

## 用法

```bash
# 前置：thirdparties/xc-ui-flow 存在，且其 node_modules 已安装
node vendor/xc-chat/build.mjs          # 产出 server/chat-widget/chat-lib.{js,css}
XC_CHAT_FULL_MARKDOWN=1 node vendor/xc-chat/build.mjs   # 保留完整 markdown（含表格），体积 +45KB gz
```

服务端检测到 `server/chat-widget/chat-lib.js` 就在页面里启用 widget，否则回退内置渲染
（`server/app.ts` 的 `chatWidget` 开关 → `server/viewer.ts` 的 `CHAT_WIDGET`）。

## 目录

| 路径 | 说明 |
|---|---|
`src/chat-lib.tsx` | 挂载入口：Shadow DOM + React root + `applyTurns()` |
`src/stub-en.ts` | 英文文案空实现（界面全中文，省 ~25KB gz） |
`src/stub-model-preview.tsx` | 3D 预览空实现（避免带进 model-viewer 1.2MB） |
`src/stub-markdown.tsx` | 轻量 markdown（默认；`XC_CHAT_FULL_MARKDOWN=1` 切回完整实现） |
`src/chat-subset.css` | 由 `patches/extract-css.mjs` 从 383KB 全量样式抽出的聊天子集（生成物，不入库） |
`patches/agent-timeline.mjs` | 唯一需要打到上游的 patch（注入式资源加载 + 内联 hook） |
`patches/extract-css.mjs` | 样式子集抽取（不改上游文件） |
`fork/` | `git worktree`（不入库）；patch 与构建都在这里发生，`thirdparties/` 保持只读 |

## 体积现状

| 产物 | raw | gzip |
|---|---|---|
| `chat-lib.js`（轻量 markdown） | ~660KB | **~173KB** |
| `chat-lib.css`（聊天子集） | 30KB | 6.6KB |

## 同步上游

```bash
git -C thirdparties/xc-ui-flow pull
git -C vendor/xc-chat/fork checkout -B spike/chat-lib origin/master   # 或对应上游分支
node vendor/xc-chat/build.mjs     # patch 幂等，重复执行安全
```

若上游 `ThreadItem` 字段变更，需要同步 `studio/assistant/chat-turns.ts` 的映射。
