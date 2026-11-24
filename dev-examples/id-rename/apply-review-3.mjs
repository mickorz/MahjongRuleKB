// v1.2 收尾：子节重编号 + 增补 I/FR/AD/AC + 数据产物主从说明 + 附录校正（2026-11-24）
import fs from "node:fs";

const f = "dev-docs/design/2026-11-24-需求全文生成与变体差异标注.md";
let s = fs.readFileSync(f, "utf8");
const must = (from, to) => {
  if (!s.includes(from)) throw new Error(`未匹配：${from.slice(0, 40)}`);
  s = s.split(from).join(to);
};

// 1) 子节编号补齐（8.3 / 8.4）
must("### 8.5 段落与规则卡是多对多（原 8.3）", "### 8.4 段落与规则卡是多对多");
must("### 8.4 三个修改通道统一走提案与版本校验", "### 8.3 三个修改通道统一走提案与版本校验");

// 2) 硬约束 I-35 ~ I-41
must(
  "| I-34 | 改规则卡的对话修改必须走既有提案 + 门禁 + 事务（不得新建写入路径）；改表达只能写 `editorial-overrides.yaml` |",
  [
    "| I-34 | 改规则卡的对话修改必须走既有提案 + 门禁 + 事务（不得新建写入路径）；改表达只能写 `editorial-overrides.yaml` |",
    "| I-35 | 三个修改通道（规则 / 表达 / 结构）都必须人工确认后才落盘；AI 不得直接写规则卡、`editorial-overrides.yaml`、章节映射层或 `需求全文.md` |",
    "| I-36 | 文档类提案必须带 `based_on_document_version`；应用前与当前 `document_version` 比对，不一致即拒绝并重新审核 |",
    "| I-37 | 第一版不支持规则删除：`changeTypes` 只有 inherited / modified / added，展示层与 `changes.json` 不得出现「删除」 |",
    "| I-38 | 差异信息必须按三维（`lineage` / `decision_status` / `diff_status`）同时记录，不得压成一维标签 |",
    "| I-39 | 每个非纯说明性段落必须有 `requirement_refs`；为空时必须在 Stage 5 报告中列出原因，不得静默为空 |",
    "| I-40 | 算例、倍率、金额等数值只能由 `calculators/` 纯函数或确定性模板产生，AI 只组织解释文字，不得自行推算 |",
    "| I-41 | `input-manifest.json` 必须记录基座与变体版本、`content_hash`、需求覆盖结果版本、文档模板版本、Prompt 版本、模型及版本、生成器版本 |",
  ].join("\n"),
);

// 3) 功能需求 FR-44 ~ FR-50
must(
  "| FR-43 | 重生成时按段落状态处理：自动生成 / 人工表达修改 / 人工补充说明 / 上游变化失效；失效项显式待处理，不静默丢弃 |",
  [
    "| FR-43 | 重生成时按段落状态处理：自动生成 / 人工表达修改 / 人工补充说明 / 上游变化失效；失效项显式待处理，不静默丢弃 |",
    "| FR-44 | 所有变体共用同一套文档模板，`section_id` 集合跨变体一致；变体切换只改内容与标记 |",
    "| FR-45 | 支持三维标记的任意组合展示（来源关系 + 规则状态 + 差异审核），不以互斥单选方式呈现 |",
    "| FR-46 | 文档块支持四类引用：`requirement_refs` / `rule_refs` / `config_refs` / `source_evidence_refs`，且可追溯到原子需求 |",
    "| FR-47 | 选中句子发起对话时，工具入参必须包含 `block_id`、`segment_id`、`document_version`、`selected_text`、四类引用 |",
    "| FR-48 | 文档类提案应用前校验 `based_on_document_version`，冲突时拒绝并给出重新审核指引 |",
    "| FR-49 | `input-manifest.json` 记录可复现字段；读历史生成结果完全复现，重新生成时结构 / 规则事实 / 数值必须通过校验 |",
    "| FR-50 | 生成计算案例时调用 `calculators/` 的确定性函数取数值，AI 仅补充解释文字 |",
  ].join("\n"),
);

// 4) 架构决策 AD-27 ~ AD-33
must(
  "| AD-26 | Stage 回流按依赖图最小重跑（规则→1、结构→2、表达→6） | 只改一句话就全量重生，会让长文档的每次校对都变成分钟级等待 |",
  [
    "| AD-26 | Stage 回流按依赖图最小重跑（规则→1、结构→2、表达→6） | 只改一句话就全量重生，会让长文档的每次校对都变成分钟级等待 |",
    "| AD-27 | 所有变体共享同一 Document Template，`section_id` 跨变体一致 | 不共享就无法逐章对照；按规则来源重组章节等于每个变体一套结构，评审和更新成本翻倍 |",
    "| AD-28 | 差异信息拆三维记录，展示时组合 | 来源关系与规则状态正交；压成一维必然丢信息（如 modified + disputed + blocker 同时成立） |",
    "| AD-29 | 块引用拆四类（需求 / 规则 / 配置 / 原文证据） | 单一 `source_refs` 无法回答「需求改了要重生成哪段」，也无法区分事实与证据 |",
    "| AD-30 | `block_id` 永久稳定并与 `section_id` 解耦；另设 `segment_id` 与 `logical_block_id` | 段落会被移动章节；ID 里带章节或文字 Hash 都会让历史修改与引用失效 |",
    "| AD-31 | `document.json` 为唯一事实源，`provenance.json` 为可重建的派生索引 | 两份都含来源关系，必须定主从，否则分叉后无法判断哪份为准 |",
    "| AD-32 | 文档编辑三通道统一走提案 + 版本校验 | 与规则修改共用一套审核/事务纪律，避免「聊天写文件」旁路 |",
    "| AD-33 | 算例数值由 `calculators/` 的纯函数生成（实测已有 6 个导出函数） | 让模型算数迟早算错； calculators 已有 `calculateBaseSettlement`、`calculateContractSettlement` 等能力可直接复用 |",
  ].join("\n"),
);

// 5) 验收 AC-38 ~ AC-45
must(
  "| AC-37 | 增量范围：只改文档表达时，Stage 1-5 产物字节级不变；只改章节结构时，Stage 1 产物字节级不变 |",
  [
    "| AC-37 | 增量范围：只改文档表达时，Stage 1-5 产物字节级不变；只改章节结构时，Stage 1 产物字节级不变 |",
    "| AC-38 | 章节模板一致：杭州与萧山的 `section_id` 集合完全相同，且同一规则在两份文档落在同一 `section_id` |",
    "| AC-39 | 三维标记：存在一条「modified + disputed + release_blocker」的规则，正文同时显示来源、状态与审核三类标记，不丢信息 |",
    "| AC-40 | 需求追溯：抽查 10 个段落，能从 `requirement_refs` 追到原子需求与原文位置；非纯说明性段落的 `requirement_refs` 不为空 |",
    "| AC-41 | ID 稳定：把某段落从 `opening` 移到 `settlement`，`block_id` 不变、人工修改记录仍关联、对话引用仍有效 |",
    "| AC-42 | 版本冲突：基于 V3 生成的文档提案在 V4 上应用被拒绝，且给出重新审核提示 |",
    "| AC-43 | 复现性：读历史生成结果完全一致；重新调用模型生成时，`document.json` 的结构、规则事实与数值三项校验通过（文字不要求字节级一致） |",
    "| AC-44 | 算例一致：对话补充「三牢连庄计算案例」后，案例数值与 `calculators/` 计算结果一致，AI 未自行推算 |",
    "| AC-45 | 无删除能力：`changes.json` 中不出现 `remove`，差异对照视图不显示删除标记 |",
  ].join("\n"),
);

// 6) 数据产物表补主从说明
must(
  "| `document.json` | 文档块、章节与段落结构 | Stage 3 |",
  "| `document.json`（**唯一事实源**） | 文档块、片段、引用、三维标记、版本 | Stage 3-4 |",
);
must(
  "| `provenance.json` | 每段文字的来源与规则关联 | Stage 4 |",
  "| `provenance.json`（**派生索引，可重建，禁止手改**） | 每段文字的来源与规则关联 | Stage 4 |",
);

// 7) 类比补两条
must(
  "- **四种编辑行为分流**像医院的四个窗口：改指词去文案窗、改剂量去医生开方、加检查项目要开单、调章节顺序去找排版 —— 全挤在一个窗口就会直接把处方抄成说明书。",
  [
    "- **四种编辑行为分流**像医院的四个窗口：改指词去文案窗、改剂量去医生开方、加检查项目要开单、调章节顺序去找排版 —— 全挤在一个窗口就会直接把处方抄成说明书。",
    "- **block_id 与章节解耦**像书架上的书用 ISBN 而不是「第 3 排第 2 格」编号：书挪了位置，编号仍然指得到它。",
    "- **三个标记维度**像快递单上的「寄件地 / 状态 / 已签收」：这是三列信息，硬塞进一个下拉框就只能写一种。",
  ].join("\n"),
);

// 8) 附录校正
s = s.trimEnd() + "\n" + [
  "| 评审提出的「差异对照模式支持删除」 | 属实不支持：`schemas/rule.ts` 的 `changeTypes` 只有 `inherited` / `modified` / `added`，`compiler/compile.ts` 只分支处理这三类，无 `removed` | 采纳：移除删除标记，新增 3.3 节与 I-37、AC-45 |",
  "| 评审引用的「4 个计算纯函数」 | `calculators/` 4 个文件、共 **6 个导出函数**：`calculateBankerMultiplier`、`calculateBaseSettlement`、`calculateCapDistribution`、`calculateContractSettlement`、`calculateGenZhuangPayment`、`isGenZhuangEstablished` | AD-33 按实测写 6 个 |",
  "| 评审建议 `requirement_refs` 连接原子需求 | 上游 `2026-11-24-RuleStudio需求覆盖与补齐.md` 已定义 `HZ-*` / `XS-*` 需求 ID 与六态，但**尚未有实际需求登记表产物**（该文档还处于单章节实验前的状态） | 6.2 与 I-39 按「依赖上游产出」写；P0-A 先建立 2.3.3 的需求登记表 |",
].join("\n") + "\n";

fs.writeFileSync(f, s);
console.log("I/FR/AD/AC 与附录已增补");
