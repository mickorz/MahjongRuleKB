## 十一、实施优先级（与上游需求覆盖节奏对齐）

v1.1 的 P0 要求「一次生成杭州完整全文」，与上游「需求覆盖与补齐」第一阶段只做 `2.3.3 算分规则` 单章节实验冲突；而本文又规定「覆盖未完成不得宣称全文完整」。三者无法同时成立，故拆分：

| 阶段 | 任务 | 验收 |
| --- | --- | --- |
| **P0-A** | 以 `2.3.3 算分规则` 单章节跑通 Document Block 全流程（Stage 0-6） | 单章节生成；段落可追溯到卡与原子需求；该章节覆盖验证通过 |
| **P0-B** | 扩展杭州全部章节的需求覆盖，生成杭州完整需求全文 | 61 张卡、25 项配置**及原子需求**全部完成映射（AC-24 双检查） |
| **P1** | 萧山变体全文与差异标注 | 与杭州共用同一套 `section_id`；文字级差异可追溯 |
| **P2** | 对话式段落编辑 | 修改提案、版本校验、审核、增量重生成 |

**P0-A / P0-B 都必须预留的字段**（不能等 P2 回头改架构）：`block_id`、`logical_block_id`、`section_id`、`segment_id`、`requirement_refs`、`rule_refs`、`config_refs`、`source_evidence_refs`、`lineage`、`decision_status`、`diff_status`、`editable`（片段级）、`document_version`。

不做：完整文档编辑器（在线所见即所得）；修改 Compiler 以保留配置差异元数据；规则删除机制；让 AI 直接改 `需求全文.md` 或 `editorial-overrides.yaml`。

