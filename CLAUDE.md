# CLAUDE.md

本仓库（MahjongRuleKB）的开发过程文档管理规范。

## 开发文档目录：`dev-docs/`

`dev-docs/` 是本仓库专门保存开发过程文档的目录（随仓库入库，正常提交推送）。

> 边界：仓库根 `docs/` 是**读者向**文档（随项目分发、README 链接引用）；
> `dev-docs/` 只服务开发过程，两者不混放。

### 规则

1. **所有开发过程文档必须放在 `dev-docs/` 目录下**，不要散落在仓库根目录或其他位置。
2. **新建文档时先判断类型**，放入对应类型的子文件夹；子文件夹不存在时按需创建。
3. 子文件夹按文档类型分类，命名使用小写英文和连字符（kebab-case），例如：

   | 类型 | 子文件夹 | 说明 |
   |------|----------|------|
   | 设计方案 | `dev-docs/design/` | 架构设计、技术方案、接口设计 |
   | 会议记录 | `dev-docs/meeting/` | 会议纪要、讨论记录 |
   | 问题排查 | `dev-docs/troubleshooting/` | Bug 分析、故障排查、复盘 |
   | 调研笔记 | `dev-docs/research/` | 技术调研、选型对比、学习笔记 |
   | 任务计划 | `dev-docs/planning/` | 任务拆解、进度计划、里程碑 |
   | 任务待办 | `dev-docs/todos/` | 后续计划中的任务池（backlog，尚未启动的任务想法与待办清单） |
   | 执行进度 | `dev-docs/progress/` | 阶段性进度总结、里程碑状态 |
   | 执行报告 | `dev-docs/progress-result/` | 阶段完整执行报告、验收结果（区别于 progress 的持续进度表） |
   | 使用指南 | `dev-docs/guides/` | 操作手册、环境搭建、工作流说明 |
   | 经验沉淀 | `dev-docs/experience/` | 踩坑记录、问题解决方案、经验教训 |

4. 若现有分类不适用，可新建类型子文件夹，但需保持命名风格一致，并在本文件表格中补充登记。
5. **需求/计划文档生命周期归档**：`dev-docs/design/` 中的需求文档完成后，移动到 `dev-docs/design/completed/` 下归档；`dev-docs/planning/` 中的执行/计划文档同理，完成后移动到 `dev-docs/planning/completed/`；`dev-docs/todos/` 中的待办同理，完成后移动到 `dev-docs/todos/completed/`。归档由后续会话自动执行，无需向用户确认。
6. 文档统一使用 Markdown 格式，文件名应能体现内容，例如 `2026-10-03-workflow-design.md`。
7. **自动归类，无需询问**：发现 `dev-docs/` 根目录下有未归类的文档时，直接按内容判断类型并移动到对应子文件夹，不要向用户确认。

## 进度文件夹：`dev-docs/progress/` 与报告文件夹：`dev-docs/progress-result/`

`dev-docs/progress/` 专门用于记录项目阶段性执行进度；`dev-docs/progress-result/` 专门用于沉淀阶段完整执行报告（区别于 progress 的持续进度表：progress 是滚动维护的状态，progress-result 是一次成稿的阶段报告）。

### 规则

1. **阶段完成必须记录**：每完成一个阶段/里程碑，必须更新进度文档，不得只提交代码不更新进度。
2. **双文件夹同步更新**：每次执行完一个里程碑，除更新 `dev-docs/progress/` 外，还必须同步更新 `dev-docs/progress-result/` 中的对应阶段执行报告（新建或追加）。两个文件夹缺一不可。
3. **每阶段独立报告文件**：阶段报告按阶段命名（`P0-执行报告.md`、`P1-执行报告.md`、`P2-执行报告.md`...），**新阶段内容必须写入新文件，禁止向其他阶段的报告文件追加**（含 `cat >>`）。已完成阶段的报告视为只读；报告内引用其他阶段（如"P2 方向"）允许，但不承载其他阶段的执行记录。
4. **进度文档要求维护到位**：更新 `dev-docs/progress/执行进度.md`（持续维护的总进度文档）中的里程碑状态表，并视情况为该阶段新建独立进度/验收文档；记录内容包括：完成时间、交付清单、commit 记录、经验索引、遗留问题。
5. **进行中也要反映**：阶段启动、中途重要节点（如架构决策、验收通过/失败）都应同步到进度文档，保证文档与仓库实际状态一致。
6. 新的进度文档放入本文件夹，命名体现阶段或日期，例如 `P0-验收报告.md`、`2026-10-03-执行进度.md`。

## 经验文件夹：`dev-docs/experience/`

`dev-docs/experience/` 专门用于沉淀开发过程中遇到的坑点和解决方案。

### 规则

1. **遇到坑必须记录**：开发中碰到坑（如环境问题、依赖冲突、隐蔽 Bug、反直觉行为等）并解决后，将问题现象、原因分析、解决步骤记录到 `dev-docs/experience/` 下，一篇文档记录一个问题。
2. **解决问题前先查经验**：每次遇到问题时，必须先到 `dev-docs/experience/` 下查找是否之前碰到过类似问题：
   - 若有记录，优先按已有经验尝试解决，解决后视情况补充更新原记录（如新的解决方法、适用版本变化）。
   - 若无记录，解决完成后再将完整过程沉淀为新文档。
3. 经验文档建议结构：**问题现象 → 排查过程 → 根因 → 解决方案 → 预防/注意事项**，文件名体现问题关键词，例如 `node-version-conflict.md`。

## 评审意见处理

用户在对话中发送评审意见（对已有设计/计划文档的批注、修改建议、评审结论）时，必须先将评审意见原文完整保存到 `dev-docs/design/` 下，命名为 `<日期>-<被评审文档名>评审意见.md`，再根据评审意见修改对应文档；修改后在被修改文档头部加修订记录，说明按哪份评审意见做了哪些变更。评审意见中引用的数字、事实要核对原文，与实测不一致时按实测写并在修订记录中注明。

## 示例目录：`dev-examples/` —— 开发期沙盒

1. 开发中的脚本试验、联调配置与临时输出一律放 `dev-examples/`（一主题一子目录，kebab-case），
   **不对读者负责**，内容可随时失效或删除，不进 README 宣传、不被其他文档引用。
2. 运行产物（日志、临时输出、node_modules 等）加入 .gitignore 不提交；目录本身与试验脚本随仓库入库。详细约定见 `dev-examples/README.md`。
3. 毕业路径：`dev-examples/` 里验证通过 → 合入正式代码 → 必要时在 `docs/` 落地读者向文档 → 删除沙盒里对应目录。

## 第三方参考项目：`thirdparties/` 与清单 `thirdparties/REFERENCES.md`

`thirdparties/` 存放外部项目，分两类：**只读参考**（本地目录或 Submodule，只查阅不改）与**开发基座**（我方 fork 的 Submodule，允许在 fork 内修改）；`thirdparties/REFERENCES.md` 是项目清单（地址、License、固定 commit、复用策略、研究目的），随仓库入库。

### 通用规则

1. **引入必登记**：每引入一个第三方项目（无论本地目录、Submodule 还是开发基座），必须同步更新 `thirdparties/REFERENCES.md`：ID（REF-xxx 连续编号）、仓库地址、本地路径、固定 commit、License、复用策略、研究目的。
2. **Submodule 固定 commit**：Submodule 固定明确 commit 并随仓库提交（克隆后 `git submodule update --init --recursive` 还原）；`.gitignore` 默认不忽略 `thirdparties/`，直接引入即可；不入库的本地只读目录单独追加 ignore 条目。
3. **复用前检查**：复用第三方代码前核对其 License 与版权声明；无 License 的仓库只读研究、禁止复制代码。

### 只读参考

适用于复用策略标为「只读参考」的项目（如 REF-002 PrdGameSkill）。

4. **只读**：仅用于查阅方法论、模板和文档结构，不得直接修改任何第三方项目内容。
5. **升级方式**：本地目录用重新下载/克隆覆盖；Submodule 用 `git submodule update --remote` 固定新 commit 并更新清单。

### 开发基座（fork）

适用于复用策略标为「开发基座」的项目（如 REF-001 PiBot）：本产品直接在对方代码上二次开发，必须在 fork 里改。

6. **指向我方 fork**：Submodule 的 url 必须是我方 fork；上游地址只作为上游基线写进 `REFERENCES.md`。
7. **改动先去 fork 提交并推送**：两仓库顺序固定——先在 fork 内提交并推送到 fork，再回本仓库 `git add thirdparties/<项目名>` 固定新 gitlink。
8. **禁止只改不推、禁止只改指针**：不得在 submodule 工作区留下未提交、未推送的改动，也不得只提交 gitlink 而不推 fork（否则别人拉下来拿不到代码）。
9. **上游同步与验证**：合并上游用 `git fetch upstream && git merge upstream/main`，合并后必须跑该仓库的检查命令（如 `pnpm check`）并记录基线；冲突点与耗时写进工作流指南 `dev-docs/guides/`。
10. **命名与许可**：改名或二次分发时保留上游 `NOTICE` 与 Apache-2.0 声明，并在 `NOTICE` / README 注明 fork 来源与用途。
11. **裁剪要留说明**：移除上游功能时，在该仓库 README 写「裁剪说明」（移除哪些能力、保留哪些、为什么），并在本仓库进度文档登记。
