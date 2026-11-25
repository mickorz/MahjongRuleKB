// 修订清单升 v2：按第 3 轮评审补充 8 项并修正编号/口径（2026-11-24）
import fs from "node:fs";

const f = "dev-docs/planning/2026-11-24-需求全文生成v1.3修订清单.md";
let s = fs.readFileSync(f, "utf8");
const rep = (from, to) => {
  if (!s.includes(from)) throw new Error(`未匹配：${from.slice(0, 50)}`);
  s = s.split(from).join(to);
};

// 1) 头部加修订记录
rep(
  "> 前置核对结论：评审列出的 4 处内部冲突与 7 项数据模型问题**全部属实**（已逐条 grep 复核，见文末附录）。",
  [
    "> 前置核对结论：第 2 轮评审列出的 4 处内部冲突与 7 项数据模型问题**全部属实**（已逐条 grep 复核，见文末附录）。",
    "> 第 3 轮评审：`dev-docs/design/2026-11-24-需求全文生成v1.3修订清单评审意见.md`（针对本清单 v1）。",
    "",
    "## 修订记录",
    "",
    "| 版本 | 日期 | 变更 |",
    "| --- | --- | --- |",
    "| v1 | 2026-11-24 | 初稿：A 内部冲突 4 / B 架构补齐 4 / C 验收与数据模型 3 / D 设计补充 4 / E 编号与同步 3 |",
    "| v2 | 2026-11-24 | 按第 3 轮评审修订：A-3 扩到 6.2 标题与 8.4 并统一自检口径；新增 A-5（Stage 4 三维）；B-3 补持久化身份映射与 split/merge 关系；新增 B-5（五文件主从）与 B-6（文档提案数据契约）；新增 C-4（六态落点映射与两个指标分离）；新增 D-5（`diff_status: not_applicable`）；修正 AD 编号范围（AD-38 定义为文档提案契约，范围维持 AD-34 至 AD-38）；编号扩至 I-50、FR-58、AC-53 |",
    "",
  ].join("\n"),
);

// 2) 总览编号范围
rep(
  "修订后编号分配（沿用现有上限，连续分配不跳号）：**I-42 至 I-47**、**FR-51 至 FR-56**、**AD-34 至 AD-38**、**AC-46 至 AC-51**。",
  "修订后编号分配（沿用现有上限，连续分配不跳号）：**I-42 至 I-50**、**FR-51 至 FR-58**、**AD-34 至 AD-38**、**AC-46 至 AC-53**。",
);

// 3) 总览表格项数
rep("| A 内部冲突修正 | 4 | 是（P0） |", "| A 内部冲突修正 | 5 | 是（P0） |");
rep("| B 架构补齐 | 4 | 是（P0） |", "| B 架构补齐 | 6 | 是（P0） |");
rep("| C 验收与数据模型 | 3 | 是（P0） |", "| C 验收与数据模型 | 4 | 是（P0） |");
rep("| D 设计补充 | 4 | 否（P1，文档内一并写清） |", "| D 设计补充 | 5 | 否（P1，文档内一并写清） |");

// 4) A-3 扩范围
rep(
  "| 位置 | 十四 FR-38、十六 AC-32 |",
  "| 位置 | 十四 FR-38、十六 AC-32、**六 6.2 标题**、**八 8.4 正文** |",
);
rep(
  "| 改成 | 字段清单统一为：`block_id`、`logical_block_id`、`section_id`、`type`、`document_version`、`content[]`（片段含 `segment_id`、`text`、`editable`、`lineage`、`decision_status`、`diff_status`、`release_blocker_refs`、`requirement_refs`、`rule_refs`、`config_refs`、`source_evidence_refs`），块级另需四类引用的聚合字段 |",
  [
    "| 改成 | ① FR-38 / AC-32 字段清单统一为：`block_id`、`logical_block_id`、`section_id`、`type`、`document_version`、`content[]`（片段含 `segment_id`、`text`、`editable`、`lineage`、`decision_status`、`diff_status`、`release_blocker_refs`、`requirement_refs`、`rule_refs`、`config_refs`、`source_evidence_refs`），块级另需四类引用的聚合字段；② 6.2 标题改为「引用分四类，不合并成单一数组」；③ 8.4 改为「修改前必须分四类列全：`requirement_refs`（关联原子需求）、`rule_refs`（关联规则卡）、`config_refs`（关联配置）、`source_evidence_refs`（原始证据），确认改哪几个来源，禁止默认只改第一个」 |",
  ].join(""),
);
rep(
  "| 验收 | `grep -n \"source_refs\"` 应为 **0 命中**；`grep -n \"provenance\"` 只应出现在「`provenance.json` 是派生索引」的语境 |",
  "| 验收 | `grep -n \"source_refs\"` 全文 **0 命中**（含标题；不得以「废弃说明」形式保留）；`grep -n \"provenance\"` 只出现在 `provenance.json` 作为派生索引的语境。G 自检口径与此一致 |",
);

// 5) 新增 A-5（Stage 4 三维），插在 A-4 之后
rep(
  "---\n\n## B. 架构补齐（P0，共 4 项）",
  `### A-5 Stage 4 改为三维状态判定

| 项 | 内容 |
| --- | --- |
| 位置 | 五、Stage 执行架构 › Stage 4 行 |
| 现状 | \`| 4 | 文档块 + 有效规则集 | 五种标记判定；段落级差异；变化摘要 | ...\` |
| 改成 | 「五种标记判定」→ **「三维状态判定」**，并补一句三维各自判断什么：\`lineage\` 判断内容从哪里继承或产生、\`decision_status\` 判断规则是否已裁决、\`diff_status\` 判断差异是否经人工确认。五种展示标签仅为 UI 表现，不是底层数据模型 |
| 验收 | \`grep -n "五种标记"\` 只出现在 3.2 的映射说明与修订记录里；Stage 4 行出现「三维状态判定」 |

---

## B. 架构补齐（P0，共 6 项）`,
);

// 6) B-3 强化：持久化身份映射
rep(
  "| 改成 | 新增 **6.8「ID 生命周期规则」**，写明五条：① `block_id` 由确定性分配器分配，禁止文字 Hash；② `logical_block_id` 由章节模板 + 规则映射层维护；③ 重生成先做**逻辑块匹配**再做片段匹配；④ 被修改片段保留原 `segment_id`，拆分/合并产生的新片段写入 `segment_lineage`（新→旧关联）记录；⑤ 人工修改目标片段匹配失败时进入「失效待处理」，**禁止自动迁移到相似文本**。配套 AD-34（身份分配与匹配策略）、FR-52（重生成时输出块级/片段级匹配报告）、AC-47（同一规则改两次后重生成，原 `block_id` 与人工修改仍能对上；被合并的片段在报告中列出关联） |",
  [
    "| 改成 | 新增 **6.8「ID 生命周期与身份映射」**，写明八条：① `block_id` 由确定性分配器分配，禁止文字 Hash；② `logical_block_id` 由章节模板 + 规则映射层维护；③ **逻辑身份映射必须持久化**（存 `documents/<variant>/identity-map.json`），重生成时**读取**而非每次重新推断；④ 重生成先按 `logical_block_id` 做逻辑块匹配，再做片段匹配；⑤ 片段匹配依据持久化映射（来源卡 + 槽位 + 顺序），**不依赖文本相似度**；⑥ 被修改片段保留原 `segment_id`；拆分 / 合并产生的新片段写入 `segment_lineage`，**明确支持一对多（split）与多对一（merge）两种关系类型**；⑦ 无法确定身份对应关系时**不自动迁移**人工修改，原修改进入「失效待处理」并列出候选；⑧ `identity-map.json` 与 `document.json` 同版本号，两者不一致时以 `document.json` 为准并重建映射。配套 AD-34（身份分配、持久化映射与匹配策略）、FR-52（输出块级/片段级匹配报告，含 split/merge 关联）、AC-47（同一规则改两次后重生成，原 `block_id` 与人工修改仍能对上；被合并的片段在报告中列出关联） |",
    "",
    "| 不做 | 不实现语义（文本相似）匹配算法；匹配只依据持久化映射与结构信息 |",
  ].join("\n"),
);

fs.writeFileSync(f, s);
console.log("A/B 组已补齐（v2 第一批）");
