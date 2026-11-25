# 贡献者指南

## 环境与常用命令

需要 Git、Node（≥ 24）与 npm。规则内容用 Markdown 编写，但校验、编译与测试是工程化的：

```bash
npm install                 # 首次
node compiler/validator.ts  # 校验基础规则集
node compiler/validator.ts rulebook/specs/variants/xiaoshan --kind variant
node compiler/compile.ts    # 编译到 rulebook/compiled/
npm test                    # 全部测试（含编译产物一致性）
npm run typecheck           # 类型检查
```

> 根路径统一定义在 `compiler/paths.ts`，不要在代码或测试里硬编码 `rulesets/`、`variants/`、`compiled/`（`tests/compiler/paths.test.ts` 会失败）。

## 架构总览

- **rulebook/**：规则知识资产，按生命周期分层 —— `sources/`（原始证据，只读）、`specs/base/hangzhou/`（基础规范）、`specs/variants/xiaoshan/`（差异规范）、`changes/archive/`（已归档变更）、`compiled/`（编译产物，禁手改）。
- **compiler/、schemas/、calculators/、tests/**：校验编译、数据结构、计算纯函数与测试。
- **docs/**：读者向文档（快速开始、配置、指南等）。
- **dev-docs/**：开发过程文档（设计、调研、进度等），规范见仓库根 `CLAUDE.md`。
- **规则组织方式**：11 类槽位（规则/判定/时序/状态/算分/表格/结算/界面），新增玩法沿用此结构，`modified` 卡必须是完整有效规则。

## 版本与发布

这不是「合并即发布」的纯文档仓库：

- **规则集有版本**：`rulebook/specs/*/manifest.yaml` 的 `version`。
- **基础规则有内容指纹**：`content_hash` 由编译器按规则卡与配置计算；内容变更必须同时升 `version` 并更新指纹，且同步派生玩法的 `base.version`。
- **派生玩法锁定基座**：`variants/*/manifest.yaml` 的 `base.version` 必须与当前基础规则版本一致，否则编译失败。
- **存在发布阻塞项**：`unresolved.yaml` 中 `release_blocker: true` 的未裁决项会让 `compiled/*/manifest.yaml` 的 `releasable` 为 `false`。**`releasable: false` 的规则集不得对外声称已发布。**

版本递增是发布流程约束，编译器只检查 `content_hash` 与内容一致、`base.version` 匹配，**不会**自动发现「改了内容却忘记升版本」。

## 测试

验收方式见 `zh-CN/testing.md`（结构校验、引用闭合、编译产物一致性、Gold Set 回归）。

## 本地开发流程

1. 改 `rulebook/specs/` 下的规则卡或配置（`rulebook/sources/` 只读，`rulebook/compiled/` 只能由编译器生成）。
2. 派生玩法只写「相对杭州麻将的差异」，不重复抄写基础规则。
3. 跑校验 → 编译 → 测试；涉及基础规则内容变更时按上节升版本、更新指纹、同步 `base.version`。
4. 提交并推送；过程性结论同步登记到 `dev-docs/`。
