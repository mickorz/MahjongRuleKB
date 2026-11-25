# Rule Studio 主需求 v2.2 安全边界评审意见

> 日期：2026-11-24
> 被评审文档：`dev-docs/design/2026-11-24-RuleStudio需求文档.md`（v2.2）
> 评审结论：设计方向认可，补齐 5 项安全与一致性问题后进入 D0 完成；不扩大开发范围。

## 评审问题

1. **I-2 / I-15 写入权限冲突**：必须区分 Stage 生成写入、UI Apply 触发的 Transaction 人工修改写入、Agent 禁止直写。新 documents 安全不变量不能使用已被需求覆盖文档占用的 I-15，改用 I-51。
2. **第十一节路径白名单未覆盖 documents**：按主体授权，Agent/Capability 无写权限，Stage Executor 仅生成产物白名单，Transaction 仅服务端推导的已批准目标文件，普通文件工具无写权限；保留路径穿越和符号链接逃逸校验。
3. **AD-38 服务端可信字段边界不完整**：Agent 提供 `op`、目标 Block/Segment、`after`、意图与证据；服务端确定/校验变体上下文、生成 `baseRevision`、计算 before/after Hash、推导目标文件。字段统一 camelCase。
4. **documentVersion 生命周期未定义**：`document.json` 顶层事实源；Stage 成功生成和人工 Proposal 应用成功都递增；版本更新与文件修改处于同一 Transaction；Transaction Hash 清单包含版本事实源。
5. **I-15 编号冲突**：`需求覆盖与补齐` 已使用 I-15（原文定位），主需求新增 documents 权限改为 I-51；AD-38/AD-39 作为主需求规范，增补文档引用。

## 处理顺序

主需求安全边界 → 需求全文设计 v1.5 → 修订清单 v6 → 执行计划 v6 → D0 冻结报告 → 最终交叉评审。
