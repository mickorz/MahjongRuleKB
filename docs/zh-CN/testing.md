# 安装与运行验收清单

## 概述

本仓库既有 Markdown 规则内容，也有配套的校验器、编译器与测试。验收对象是「规则结构 + 编译产物 + 回归测试」，不是单纯的文档排版。

## 安装检查

- [ ] 克隆成功，无 LFS / 编码报错
- [ ] `npm install` 成功（Node ≥ 24）
- [ ] `rulebook/sources/`、`rulebook/specs/`、`rulebook/compiled/`、`rulebook/changes/archive/` 四个层级都存在

## 冒烟测试

- [ ] `node compiler/validator.ts` 通过（基础规则集）
- [ ] `node compiler/validator.ts rulebook/specs/variants/xiaoshan --kind variant` 通过（差异规则集）
- [ ] `node compiler/compile.ts` 成功，且 `git status rulebook/compiled/` 无变更（产物与 specs 一致）
- [ ] `npm test` 全绿（含规则结构、引用闭合、编译产物一致性、Gold Set 回归）
- [ ] `npm run typecheck` 通过

## 规则内容检查

- [ ] 差异卡 `change_type` 只有 `inherited` / `modified` / `added`；`modified` 卡是完整有效规则
- [ ] `base_rule_ref` / `compares_to` 指向真实存在的杭州卡
- [ ] 新增或修改基础规则后：`manifest.version` 已提升、`content_hash` 已更新、派生玩法 `base.version` 已同步
- [ ] 未裁决项仍在 `unresolved.yaml`；含 `release_blocker: true` 时 `releasable` 为 `false`
- [ ] 文档内引用的文件名真实存在（交叉引用有效）

## 最终清单

- [ ] 新增玩法放在 `rulebook/specs/variants/<玩法>/`，只写差异
- [ ] `rulebook/compiled/` 的变更来自编译器，没有手工编辑
- [ ] `README` 概述已同步新增的玩法条目
- [ ] 提交信息说明变更范围；过程性结论已登记到 `dev-docs/`
