# zenstory-ai UI 布局调研与借鉴

> 调研对象：`thirdparties/zenstory`（REF-005，commit `93f3654`，2026-11-25 引入）
>
> License：**AGPL-3.0** —— 只读参考，**禁止复制任何代码**。本文记录的是布局思路与结构判断，落地实现须由本项目自行编写。
>
> 目的：为 Rule Studio 本地 Web 工作台（W3-4 之后）提供布局层面的参考，不涉及业务逻辑。

---

## 一、调研对象

| 项 | 内容 |
| --- | --- |
| 形态 | 「对话即创作」的 AI 小说/短剧工作台：三栏工作区 + 对话式改稿 |
| 前端 | React 19 + Vite + Tailwind v4（`@import "tailwindcss"`）+ `react-resizable-panels` + TipTap |
| 后端 | FastAPI + SQLModel（与布局无关，未展开） |
| 前端规模 | `apps/web/src` 下 71 个组件 + 独立 CSS 令牌层（7 个 css 文件，共 2030 行） |
| 关键文件 | `apps/web/src/components/Layout.tsx`（约 480 行）、`sidebar/SidebarTabs.tsx`、`editor/EditorTitleBar.tsx`、`editor/EditorStatusBar.tsx`、`styles/tokens.css`、`components/DiffReviewSplitView.tsx` |

工作区的产品结构与 Rule Studio 高度相似：**左边导航（文件树/技能/素材）→ 中间编辑区（正文）→ 右边 AI 对话**。Rule Studio 是**左导航 → 中间需求文档 → 右侧来源/检查信息**。差别只在右侧面板用途。

## 二、布局实现剖析

### 2.1 单一 React 树跨断点（最值得学的一条）

`Layout.tsx` 里桌面三栏、平板三栏、手机单栏**共用同一个 DOM 结构**：

```tsx
<Group orientation="horizontal" disabled={isMobile}>   // 手机上禁用拖拽
  <Panel id="sidebar" minSize={180}>…</Panel>
  {!isMobile && <Separator />}
  <Panel id="editor" minSize="30%">…</Panel>
  {!isMobile && <Separator />}
  <Panel id="chat" minSize={300}>…</Panel>
</Group>
```

手机端不换布局，而是：

- `Group` 加 `disabled`，`Separator` 不渲染
- 三个 Panel 内部 div 变成 `absolute inset-x-0 top-0`，用 `opacity` + `z-index` + `pointer-events-none` 切换可见性
- 隐藏的面板加 `inert` + `aria-hidden` + `role="tabpanel"`（焦点与读屏都被隔离）
- 底部 `BottomTabs` 切 `activePanel`

**为什么这么做**：跨断点或旋转时不 unmount 编辑器与对话面板 —— 正在输入的内容、正在流式输出的 AI 响应都不会丢。文件头注释写得很直白：`never unmounts middle/right and never aborts an active AI stream`。

对比我们的实现：单页内联 HTML，断点变化不做任何处理，天然不会 unmount，所以这条对我们是"已经满足但没显式化"；**但它提醒了一件事：将来若引入框架重写，必须保持同一棵树。**

### 2.2 三栏比例与最小宽度

| 断点 | 左栏 | 中栏 | 右栏 |
| --- | --- | --- | --- |
| 桌面 ≥1024 | 20%（min 180px） | 48%（min 30%） | 32%（min 300px） |
| 平板 768–1023 | 25%（min 20%） | 40%（min 30%） | 35%（min 280px） |

要点：**最小宽度用两种单位** —— 侧栏用 px（内容决定），正文用百分比（阅读宽度决定）。跨断点时通过 `groupRef.current.setLayout(preset.layout)` 命令式重设比例，而不是重建组件。

### 2.3 分隔条：1px 视觉，8px 命中区

```css
.panel-resize-handle {
  width: 1px; cursor: col-resize; background: hsl(var(--separator-color)); touch-action: none;
}
.panel-resize-handle::before {
  content: ""; position: absolute; inset-block: 0; inset-inline: -4px; z-index: 20;  /* 拖拽命中区 */
}
```

视觉上是 1px 细线，实际可拖区域左右各扩 4px。这条直接对应我们当前的问题：**三栏宽度写死 240 / 1fr / 320，无法调整**。

### 2.4 每栏自己滚动，外层永不滚

```
<div class="h-dvh overflow-hidden flex flex-col fixed inset-0">   ← 外壳
  <Header />                                                       ← 固定
  <main class="flex-1 overflow-hidden min-h-0">                    ← 撑满但不滚
    <Group>…每栏内部 overflow-auto/overflow-hidden…</Group>
  </main>
</div>
```

面板内部再分三段：**Header（shrink-0）/ 内容（flex-1 overflow-auto min-h-0）/ 状态栏（shrink-0）**。

我们的现状是整页滚动 + `position: sticky` 工具条 —— 能用，但滚到中段时候右侧信息面板会跟着消失。改成"每栏独立滚动"是纯 CSS 收益，不需要框架。

### 2.5 左栏 tab 化

`SidebarTabs.tsx`：`role="tablist"` + 三个 `role="tab"` + `aria-selected`，滑动指示条用 `transform: translate3d()`（GPU 合成，不动 layout）。面板内容懒加载（`lazy` + `Suspense`），切换时给 `key` 触发入动画。

对应到我们：左栏现在只有章节列表，可以做成 **章节 / 检查告警 / 规则索引** 三个 tab，把右侧挤不下的信息挪过去。

### 2.6 编辑器三段式（标题栏 / 正文 / 状态栏）

- `EditorTitleBar`：无边框 `input`，回车跳到正文；`isReviewMode` 时字号缩小
- 正文：`overflow-y-auto`，阅读宽度受控
- `EditorStatusBar`：字数、段数、缩放、历史、润色按钮，`border-t` 分隔、`text-xs`、`tabular-nums`

关键细节：状态栏是 `shrink-0` 的常驻条，不是浮层。**我们缺这一层** —— 现在"改动 2 处 / 应用"挤在顶部工具条里，滚动时靠 sticky 撑住。

### 2.7 移动端处理（第一阶段用不上，但值得记录）

- `useIsMobile` / `useIsTablet` 媒体查询 hook，断点 768 / 1024
- 底部 tab（56px）+ 滑动手势切面板（阈值 75px、速度 0.2）
- `useScrollMemory`：切面板时记住各栏滚动位置
- 键盘遮挡检测：`window.visualViewport` 高度差 > 120px 且焦点在可编辑元素 → 隐藏底部 tab

### 2.8 设计令牌集中化

`styles/tokens.css`（262 行）集中定义 HSL 三元组变量：`--bg-primary`、`--bg-rail`、`--separator-color`、`--accent-primary`、`--text-secondary`…，组件里统一写 `bg-[hsl(var(--bg-primary))]`。深色模式靠 `.dark` class 变体整体替换变量。

还有一条工程约束：`lint:tokens` 脚本（`check-web-css-token-vars.mjs`）**禁止组件里写裸颜色值**。

我们的现状：`server/app.ts` 里内联 `<style>` 硬编码 8 个颜色值，深浅色只靠 `color-scheme: light dark` 碰运气。

### 2.9 Diff 审阅（W5-3 的现成范式）

`DiffReviewSplitView.tsx` 的交互结构：

- 左：逐条改动卡片，可 `接受 / 拒绝 / 重置`
- 右：`InlineDiffEditor` 只读展示，点卡片滚动定位到对应 diff
- 顶部筛选：`all / pending / accepted / rejected`
- 键盘可达：方向键在卡片间移动，`Crosshair` 按钮定位到正文
- 卡片按改动长度排序，短改动优先

这几乎就是 Rule Studio W5-3「冲突裁决 UI」需要的形态：卡片 + 三选一（取左 / 取右 / 手改）+ 定位。

## 三、与当前工作台对比

| 维度 | Rule Studio 现状 | zenstory | 差距判断 |
| --- | --- | --- | --- |
| 外壳 | body 滚动，`sticky` 工具条 | `h-dvh overflow-hidden`，三栏各自滚动 | **该改**，纯 CSS |
| 分栏 | 固定 240 / 1fr / 320 | 可拖拽 + 最小宽度 + 记住比例 | **该改**，约 40 行原生实现 |
| 折叠 | 无 | 可拖到最小、手机单栏 | 中优先级 |
| 左栏 | 单一章节列表 | tab 化（文件/技能/素材） | **该改**，对应"章节/检查/规则" |
| 状态条 | 顶部工具条兼任 | 底部常驻状态栏 | **该改** |
| 令牌 | 内联硬编码颜色 | 262 行令牌 + lint 禁裸色 | 该改，但可分批 |
| 移动端 | 无 | 单栏 + tab + 手势 | 第一阶段单人桌面，**不做** |
| Diff 审阅 | 前后两块文本 | 卡片列表 + 接受/拒绝 + 定位 | W5-3 用得上 |
| 框架 | 无构建原生 JS | React + Vite + TipTap | **不引入**（见第四节） |

## 四、值得借鉴的 7 条（按优先级）

| # | 借鉴点 | 为什么值 | 我们的落点 | 成本 |
| --- | --- | --- | --- | --- |
| 1 | 外壳 `h-dvh` + 每栏独立滚动 | 右侧信息在阅读中段不会消失；工具条不必靠 sticky hack | `server/app.ts` 的 `viewerHtml()` 样式层 | 小（纯 CSS） |
| 2 | 分隔条拖拽 + 最小宽度 + 记忆 | 三栏比例因人而异；固定 240/320 在小屏挤压正文 | 原生 `pointerdown/move/up`，比例存 `localStorage` | 小（约 40 行） |
| 3 | 底部常驻状态栏 | "N 处改动 / 未审章节 / 检查结果"应随时可见 | 新增 `#status-bar`，工具条只留动作按钮 | 小 |
| 4 | 左栏 tab 化 | 检查告警、规则索引挤在右侧会溢出 | 章节 / 检查 / 规则 三 tab | 中 |
| 5 | 隐藏面板 `inert` + `aria-hidden` | 折叠侧栏后键盘 Tab 不会跑进不可见区域 | 折叠逻辑一并加 | 小 |
| 6 | Diff 审阅卡片（接受/拒绝/重置 + 定位 + 筛选） | W5-3 冲突裁决直接复用该形态 | 新增冲突裁决视图 | 中 |
| 7 | 颜色令牌化 + 禁裸色 | 深浅色一致、后续换主题只改一处 | 抽出 `--rs-*` 变量集中定义 | 小到中 |

### 明确不照搬的

| 项 | 理由 |
| --- | --- |
| React + Vite + Tailwind + TipTap 全家桶 | 我们当前工作台是零依赖单文件，为布局引入整套框架不划算；D-02（三种编辑器优先级）未拍板 |
| `react-resizable-panels` 依赖 | 只需水平三栏拖拽，原生 pointer 事件 40 行即可，不值得加依赖 |
| 移动端手势 / 键盘避让 / 滚动记忆 | 第一阶段单人桌面使用；等真有移动需求再补 |
| `inert` 之外的无障碍全套（axe、skip link、focus ring 体系） | 值得做，但优先级低于布局；先做 `inert` + `focus-visible` |

## 五、落地计划（映射到现有待办）

### S1 布局骨架（0.5 天）

- 外壳 `h-dvh overflow-hidden`；三栏各自 `overflow-auto`
- 顶部只留文档标题与变体切换；编辑动作移到状态栏
- 验收：滚动中段时左/右栏仍在视口内；`npm test` 522 不变

### S2 可拖拽分栏（0.5 天）

- 两条 1px 分隔条 + 左右各 4px 命中区
- 最小宽度：左 180px / 右 260px / 中 40%
- 比例存 `localStorage`（键含变体名），刷新保持
- 验收：拖到最小不塌陷；双击分隔条恢复默认

### S3 底部状态栏（0.5 天）

- 显示：段数 / 改动数 / 未审章节数 / 质量报告状态
- 验收：改一段后计数立即变化；应用后归零

### S4 左栏 tab 化（1 天）

- tab1 章节（现有）；tab2 检查告警（`diff-warnings.json`）；tab3 规则索引（规则 ID → 段落）
- 用 `role="tablist"` + `aria-selected`，指示条 `translate3d`

### S5 冲突裁决视图（W5-3，1 天）

- 卡片列表：`conflict_id / kind / 段落 / 旧文本 / 新文本 / 人工文本`
- 三个动作：取人工 / 取新生成 / 手改；未全部裁决时禁用「落盘」
- 复用 `resolveConflicts()`（已有）与 `POST /api/apply`

### S6 颜色令牌（0.5 天）

- 抽出 `--rs-bg`、`--rs-panel`、`--rs-line`、`--rs-text`、`--rs-muted`、`--rs-modified`、`--rs-added`、`--rs-inherited`
- 深色 via `prefers-color-scheme` + `.dark` 覆盖

## 六、参考文件清单（只读）

| 文件 | 行数 | 看什么 |
| --- | ---: | --- |
| `apps/web/src/components/Layout.tsx` | ~480 | 单树跨断点、三栏预设、`inert`/`aria-hidden`、移动端处理 |
| `apps/web/src/components/sidebar/SidebarTabs.tsx` | ~90 | tab 语义与滑动指示条 |
| `apps/web/src/components/editor/EditorTitleBar.tsx` | ~66 | 无边框标题输入、回车跳正文 |
| `apps/web/src/components/editor/EditorStatusBar.tsx` | ~200 | 常驻状态栏的信息密度 |
| `apps/web/src/styles/tokens.css` | 262 | 令牌组织方式 |
| `apps/web/src/styles/base.css` | 299 | 分隔条命中区、滚动容器 |
| `apps/web/src/components/DiffReviewSplitView.tsx` | — | 改动卡片 + 接受/拒绝/定位 |

> 以上仅供阅读。AGPL-3.0 下复制代码会带来许可证传染风险，本项目实现须独立编写。
