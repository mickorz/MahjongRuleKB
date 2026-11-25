# 第三方参考项目清单（REFERENCES.md）

> 维护规则：所有第三方项目只读，不修改源码；复用代码前必须核对 License；本文件随仓库入库。
> 引入方式分两类：本地只读目录（默认也随仓库入库，重新下载/克隆覆盖更新；需排除的单独在 .gitignore 追加）与 Git Submodule（固定 commit，gitlink 入库）。
> 引入日期：逐条在表格登记时记录。

| ID | 项目 | 仓库 | 本地路径 | 固定 commit | License | 复用策略 | 研究目的 |
|---|---|---|---|---|---|---|---|
| REF-002 | PrdGameSkill | `https://github.com/mickorz/PrdGameSkill`（submodule 跟踪分支 `main`） | `thirdparties/PrdGameSkill` | `d28ed0a16cad8d9c23dde925e591ef326b81874d`（2026-11-24 引入，与远端 `main` 一致） | 未发现 LICENSE 文件 | 只读参考，禁止复制任何代码 | 游戏 PRD 技能库与 Interactive Game PRD 方法论；Game Requirement IR、交互式 HTML 需求文档与规则模拟器思路，供 MahjongRuleKB 后续 PRD / 规则代码生成对接参考。**其自身子模块（thirdparties/*）不拉取** |
| REF-003 | OpenSpec | `https://github.com/Fission-AI/OpenSpec`（submodule 跟踪分支 `main`） | `thirdparties/OpenSpec` | `f1cd852f4edce22b8df9548a4df889172ca8ff25`（2026-11-24 引入，与远端 `main` 一致，tag @fission-ai/openspec@2.2.0） | MIT（Copyright 2025 FISSION AI INC） | 只读参考，复用方法论时可复制（MIT 允许），需保留版权声明 | Spec-driven development（SDD）规范与工作流方法论；供 Rule Studio 的提案、规格变更与验收流程设计参考 |
| REF-004 | universal-spec-mcp | `https://github.com/ahmedelpannann/universal-spec-mcp`（submodule 跟踪分支 `main`） | `thirdparties/universal-spec-mcp` | `36c0eceb0a2c7e82fe7d2ea74f3596fcebf104f2`（2026-11-24 引入，与远端 `main` 一致） | MIT | 只读参考，复用方法论时可复制（MIT 允许），需保留版权声明 | MCP 形式的规格（spec）工作流工具；供 Rule Studio 的规格变更与校验流程设计参考 |

## Submodule 引入与登记流程

1. 引入：`git submodule add <仓库地址> thirdparties/<项目名>`，克隆后固定到目标 commit。
2. 忽略规则：`.gitignore` 默认不忽略 `thirdparties/`，无需白名单；如某个本地只读目录不入库，单独追加该目录的 ignore 条目。
3. 登记：在本文件表格新增一行，固定 commit 用 `git -C thirdparties/<项目名> rev-parse HEAD` 获取；License 读取仓库内 LICENSE 文件，无 LICENSE 的仓库填「未发现 LICENSE 文件」并将复用策略标为「只读研究，禁止复制任何代码」。
4. 一并提交：`.gitmodules`、submodule gitlink、本文件。
5. 本地只读目录：无 gitlink，其余流程相同（登记、提交清单）；不入库的单独追加 ignore 条目。

## 说明

1. Submodule 只作为源码研究与方法论参考，不代表全部集成进最终产品；集成决策记录在 `dev-docs/research/`。
2. 更新方式：本地目录用重新下载/克隆覆盖；Submodule 用 `git submodule update --remote <path>` 固定新 commit 并更新本表。
3. 复用第三方代码前核对其 License 与版权声明；复用思想则把提炼后的内容写进本仓库自己的文档并标注来源。
