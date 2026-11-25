# Rule Studio 技术路线对比

> 日期：2026-11-24
> 背景：`dev-docs/design/2026-11-24-RuleStudio需求文档.md`（v1.5，产品需求不变）；原实现路线「以 PiBot fork 为基座」已于 2026-11-24 终止，备份在分支 `archive/rule-studio-pibot` 与 fork `mickorz/PiBot`。
> 本文只解决一件事：**换哪条实现路线**，不重写产品需求。

## 一、结论摘要

| 项 | 结论 |
| --- | --- |
| 推荐路线 | 先做 **B（Skill + CLI 内核）**，验证通后再叠 **A（本地 Web 工作台）** 的 UI |
| 不建议 | 再找一个「大而全」的 Agent 桌面应用做二开；自建完整 Agent 运行时 |
| 关键前提 | KB 领域层先拆成纯函数（原执行计划的 Phase A，与路线无关，无论选哪条都要做） |
| 预计工作量 | B：3～5 天；A 的 UI：5～8 天（在 B 的内核之上） |

## 二、PiBot 路线的实测成本（为什么不继续）

| 环节 | 实测 | 说明 |
| --- | --- | --- |
| 环境打通 | 1 天 | submodule 检出、1457 个包 36 分钟、`pnpm check` 基线回归 |
| 改名 | 0.5 天，触及 30+ 文件 | i18n 约 130 处、打包身份 5 项、数据目录名、Linux autostart |
| 功能裁剪 | 试验 1 次即否 | 移除 9 个 Capability 后应用仍可启动，但 UI 与宿主侧有 **142 处引用**，上游每次合并都在这些位置冲突 |
| 后续每个功能 | 高 | 所有改动都要同时理解 PiBot 的分层（L1-L5）、协议聚合、工具策略、i18n、主题 token，且上游持续演进 |

根本问题不是「PiBot 不好」，而是**我们只需要其中 5% 的能力，却要承担 100% 的上游演进成本**。

## 三、候选路线对比

| 路线 | 做法 | 工作量 | 策划体验 | 与上游演进的关系 | 风险 |
| --- | --- | --- | --- | --- | --- |
| **A. 本地 Web 工作台** | 仓库内 `studio/`：Node 本地服务 + React 页面；浏览器打开；模型走 API | 中（UI 为主） | 好：点击浏览、看 Diff、看门禁、点应用 | 无上游 | 低：全自有代码 |
| **B. Skill + CLI 内核** | 仓库内 `studio` CLI 子命令（propose / validate / apply / diff），配 SKILL.md；用现成 AI 客户端（Claude Code、pi CLI 等）对话 | 低 | 中：需在终端或用现成客户端；结果以文本 + git diff 呈现 | 无上游 | 低，但策划要接受终端 |
| **C. VS Code 扩展** | 扩展提供规则树、Diff 视图、命令面板；对话用自带 Chat | 中高（扩展开发 + 发布） | 好（对熟 VS Code 的策划） | 无上游，但受 VS Code API 约束 | 中：扩展权限、发布流程 |
| **D. 自建最小 Electron 壳** | Electron + React，自己接模型 SDK 与工具循环 | 高（Agent 循环要自己写） | 好 | 无上游 | 中高：等于重写 PiBot 的核心 5% 之外那部分 |
| **E. 修好 PiBot 路线** | 不裁剪能力，只加一页 Mahjong 界面 | 低（前期已投入） | 好 | **高**：每个功能都叠加在上游之上 | 高：已实测的合并冲突面 |

## 四、可复用资产盘点（与路线无关，别浪费）

| 资产 | 状态 | 哪条路线都用得上 |
| --- | --- | --- |
| 需求文档 v1.5 + 两轮评审原文 | 已在 main | 是 |
| 领域层拆分设计（`schemas/` + `parser/` + `compiler/` 纯函数，`cli/` 独立） | 设计与关键约束已定，代码未做 | 是（A/B/C/D 全需要） |
| 提案 / 门禁 G1-G4 / 事务状态机 / 新建文件回滚 / 先取锁再校验 Hash | 评审已定稿（需求文档 10.2、10.3） | 是 |
| 工具白名单思路（Agent 只能调用受限子命令） | 评审已定稿（需求文档 I-1、AD-13） | 是（B 路线天然满足：Agent 只有那几个 CLI） |
| Gold Set 门禁 G5（默认关闭、用户触发、固定命令） | 评审已定稿 | 是 |
| KB `AGENTS.md`、`rulebook/compiled/`、计算器、88 个测试 | 已在 main | 是 |

换句话说：**产品设计与安全设计全部保住了，丢掉的只是「宿主」这一层实现选择**。

## 五、推荐路径

```mermaid
flowchart LR
    S1[阶段一 领域层拆纯函数] --> S2[阶段二 CLI 内核 提案 门禁 事务]
    S2 --> S3[阶段三 Skill 与对话流程验证]
    S3 --> S4[阶段四 本地 Web 工作台 UI]
    S4 --> S5[阶段五 变种维护与 Gold Set 门禁]
```

### 阶段一：KB 领域层拆纯函数（1～2 天）

原执行计划的 A-1 至 A-10，去掉与 fork 相关的部分（同步脚本、fork 侧包定义、Zod 双主版本验证）：

- `parser/`（内存 files → 规则集）、`compiler/`（纯函数，不改输入）、`cli/`（磁盘与命令行）
- manifest 加 `id_prefix`，Schema 去掉硬编码前缀
- 解析错误逐文件收集；纯度测试与不可变性测试

### 阶段二：`studio` CLI 内核（2～3 天）

```text
node studio/cli.mjs <命令> [--json]
  rulesets / rules / rule <id>        浏览（读 compiled 或直接解析内存）
  propose --file proposal.json        生成提案（服务端补 before/hash/path）
  validate <proposalId>               门禁 G1-G4
  diff <proposalId>                   行级 Diff
  apply <proposalId>                  事务写入 + 回滚
  proposals                           历史
```

- 提案存 `<kb>/.rule-studio/proposals/`，事务状态机与回滚规则按需求文档 10.3
- `--json` 供 UI 与 Agent 消费；人类可读输出用简洁表格
- 门禁进程内跑（复用纯函数），不走子进程

### 阶段三：Skill + 对话流程（0.5 天）

`SKILL.md` 改写自 KB `AGENTS.md`，规定：引用 ID 先读卡、改底座必须升版并重算 `content_hash`、一次只提一个变更、门禁不过先修门禁。用现成客户端（Claude Code / pi CLI / 任意支持工具调用的客户端）驱动，**Agent 能用的工具其实就是那几个 CLI 子命令**，写盘能力天然被限制。

### 阶段四：本地 Web 工作台（5～8 天）

```text
studio serve            启动本地服务（默认只监听 127.0.0.1）
浏览器打开 http://127.0.0.1:<port>
  规则树 / 筛选 / 搜索      读 CLI 的同一批函数
  规则详情                 Markdown + 元数据 + 三类关系 + 来源
  提案详情                 理由、证据、逐文件 Diff、影响分析、门禁报告、事务步骤
  应用 / 拒绝              走同一套门禁与事务
  引用到对话               复制带 ID 与路径的引用片段
```

- 前端只做展示与触发，业务全在 Node 侧（与阶段二共用代码）
- 不需要 Electron：需求里没有系统级能力要求（不需要托盘、不需要截屏、不需要操作电脑）
- 若将来确实要桌面壳，再包一层 Electron 成本很低（页面已经是 Web）

### 阶段五：变种维护与 Gold Set 门禁（3～5 天）

原执行计划 Phase D、E 中与宿主无关的部分：新建变种、影响分析、未决裁决一致性、G5 宿主端口（默认关闭、用户触发）。G5 的宿主端口在 A/B 路线里就是 CLI 调 `npm test -- --reporter=json`。

## 六、为什么推荐 B 再叠 A，而不是直接 A

- 阶段二的 CLI 是阶段四 UI 的**同一批函数**，先做 CLI 等于先验证流程与门禁，UI 只是换个入口；反过来先做 UI，会把「流程没定」的成本重复付两次。
- 阶段三只有 0.5 天，却能让策划**今天就用上**「对话改规则」，不用等 UI。
- 如果阶段三验证下来发现策划就是要点击式界面，阶段二、三的代码 100% 保留。

## 七、待决策

| # | 决策 | 影响 | 建议 |
| --- | --- | --- | --- |
| 1 | 策划能否接受「先终端、后界面」的两步走 | 阶段三是否值得做 | 建议接受，0.5 天换提前可用 |
| 2 | 对话用哪个现成客户端（Claude Code / pi CLI / 其他） | Skill 写法与工具命名 | 按团队已有习惯选，不引入新账号成本 |
| 3 | Web 工作台是否需要局域网多机访问 | 是否要鉴权与会话 | 默认只监听 127.0.0.1，不做 |
| 4 | 是否保留 `thirdparties/PrdGameSkill` | 与本文无关（只读参考） | 保留 |

## 八、类比理解

- **PiBot 路线**像为了开一家小面馆，盘下一整座商场：门面、电梯、中央空调都是现成的，但每月物业费按整座商场收，装修还得跟商场统一风格（上游合并冲突）。
- **A/B 路线**像租一间街边铺面，自己装灶台：面积小，但每一寸都是自己的，想改就改。
- **阶段二先做 CLI**像先把菜谱和出菜流程跑通，再装修门面。反过来的话，装修完了发现菜谱要改，门面也得返工。
- **领域层拆纯函数**像把厨房设备都改成插电即用（不再依赖特定店面），换哪个铺面都能搬过去 —— 所以这一步跟路线选择无关，先做不吃亏。

## 九、参考引用

- Mermaid 流程图语法：<https://mermaid.js.org/syntax/flowchart.html>
- VS Code 扩展开发（路线 C 的能力边界）：<https://code.visualstudio.com/api>
- Electron 与纯 Web 的权衡（路线 D 为什么不必需）：<https://www.electronjs.org/docs/latest/tutorial/security>
- Node 内置 HTTP 服务（路线 A 的本地服务，无需框架即可起步）：<https://nodejs.org/api/http.html>
- Agent 客户端与工具循环的现成实现（路线 B 的宿主）：<https://github.com/earendil-works/pi>
- 项目内依据：`dev-docs/design/2026-11-24-RuleStudio需求文档.md`、`dev-docs/design/2026-11-24-RuleStudio执行计划评审意见.md`、`dev-docs/design/2026-11-24-RuleStudio执行计划评审意见-第2轮.md`、本仓库 `AGENTS.md`
