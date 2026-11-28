# 第三方声明（NOTICES）

本仓库除自有代码外，包含以下第三方组件的**算法改写**或**预构建产物引用**。

---

## game-workbench（xc-ui-flow）

- 上游仓库：<https://github.com/mickorz/game-workbench>
- 本地参考副本：`thirdparties/xc-ui-flow`（只读，见 `thirdparties/REFERENCES.md` REF-010）
- 许可：Apache License 2.0（全文见 <https://www.apache.org/licenses/LICENSE-2.0>）
- 使用方式：

  1. **算法改写**：`studio/assistant/chat-turns.ts` 的「连续工具调用合并 + 人话摘要 +
     turn 投影」思路源自上游 `src/renderer/work-items.ts`、`src/renderer/turn-display.ts`，
     类型与文案按本项目重写，未复制其 React 组件。
  2. **预构建产物引用**：`vendor/xc-chat/` 通过 `git worktree` 从上游拉取副本、只应用
     最小 patch（`vendor/xc-chat/patches/agent-timeline.mjs`），构建出
     `server/chat-widget/chat-lib.{js,css}` 供本地工作台挂载。产物与 worktree 均不入库
     （见 `.gitignore`），任何人可执行 `node vendor/xc-chat/build.mjs` 重建。

  上游代码的版权归其作者所有，按 Apache-2.0 使用；本仓库未修改 `thirdparties/xc-ui-flow`。
