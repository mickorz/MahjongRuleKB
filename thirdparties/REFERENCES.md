# 第三方参考项目清单（REFERENCES.md）

> 维护规则：复用策略分两类——「只读参考」不修改源码、「开发基座」在我方 fork 内修改；复用代码前必须核对 License；本文件随仓库入库。
> 引入方式分两类：本地只读目录（默认也随仓库入库，重新下载/克隆覆盖更新；需排除的单独在 .gitignore 追加）与 Git Submodule（固定 commit，gitlink 入库）。
> 引入日期：逐条在表格登记时记录。

| ID | 项目 | 仓库 | 本地路径 | 固定 commit | License | 复用策略 | 研究目的 |
|---|---|---|---|---|---|---|---|
| REF-001 | PiBot | 上游 `https://github.com/w01fb0ss/PiBot`；fork `https://github.com/mickorz/PiBot`（submodule 指向 fork，`.gitmodules` 跟踪分支 `main`） | `thirdparties/PiBot` | `152425febf89487f6494e002122646fdd3bb041a`（2026-11-24 引入，与上游 `main` 一致） | Apache-2.0（仓库内 `LICENSE`；`NOTICE` 注明 Pi Bot 名称与 Logo 不在许可范围内） | 开发基座（fork，允许在 fork 内修改；规则见 `CLAUDE.md` 第三方参考项目 › 开发基座（fork）） | Mahjong Rule Studio 的桌面工作台与 Agent 运行时底座；在 PiBot 分层内新增 Mahjong Capability（见 `dev-docs/design/2026-11-24-RuleStudio需求文档.md`） |
| REF-002 | PrdGameSkill | `https://github.com/mickorz/PrdGameSkill`（submodule 跟踪分支 `main`） | `thirdparties/PrdGameSkill` | `d28ed0a16cad8d9c23dde925e591ef326b81874d`（2026-11-24 引入，与远端 `main` 一致） | 未发现 LICENSE 文件 | 只读参考，禁止复制任何代码 | 游戏 PRD 技能库与 Interactive Game PRD 方法论；Game Requirement IR、交互式 HTML 需求文档与规则模拟器思路，供 MahjongRuleKB 后续 PRD / 规则代码生成对接参考。**其自身子模块（thirdparties/*）不拉取** |

## Submodule 引入与登记流程

1. 引入：`git submodule add <仓库地址> thirdparties/<项目名>`，克隆后固定到目标 commit。
2. 忽略规则：`.gitignore` 默认不忽略 `thirdparties/`，无需白名单；如某个本地只读目录不入库，单独追加该目录的 ignore 条目。
3. 登记：在本文件表格新增一行，固定 commit 用 `git -C thirdparties/<项目名> rev-parse HEAD` 获取；License 读取仓库内 LICENSE 文件，无 LICENSE 的仓库填「未发现 LICENSE 文件」并将复用策略标为「只读研究，禁止复制任何代码」。
4. 一并提交：`.gitmodules`、submodule gitlink、本文件。
5. 本地只读目录：无 gitlink，其余流程相同（登记、提交清单）；不入库的单独追加 ignore 条目。

## 说明

1. Submodule 是否集成进最终产品由复用策略决定：「只读参考」仅作源码研究与方法论参考；「开发基座」是产品代码库本身（如 PiBot fork）。集成决策记录在 `dev-docs/research/`。
2. 更新方式：本地目录用重新下载/克隆覆盖；Submodule 用 `git submodule update --remote <path>` 固定新 commit 并更新本表。
3. 复用第三方代码前核对其 License 与版权声明；复用思想则把提炼后的内容写进本仓库自己的文档并标注来源。
