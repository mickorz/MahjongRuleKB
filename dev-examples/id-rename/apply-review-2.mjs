// 按评审修订：Document Block 模型 + Stage 表 + 对话编辑版本校验 + 实施阶段（v1.2 第二批）
import fs from "node:fs";

const f = "dev-docs/design/2026-11-24-需求全文生成与变体差异标注.md";
let s = fs.readFileSync(f, "utf8");
const rep = (from, to) => {
  const i = s.indexOf(from);
  if (i < 0) throw new Error(`未匹配：${from.slice(0, 40)}`);
  s = s.slice(0, i) + to + s.slice(i + from.length);
};

// ── 1. 六、Document Block 重写 ──
const startMarker = "## 六、Document Block（文档块模型）";
const endMarker = "## 七、四种编辑行为（不能都直接写回 Markdown）";
const i = s.indexOf(startMarker);
const j = s.indexOf(endMarker);
if (i < 0 || j < 0) throw new Error("第六节边界未匹配");

const BLOCK = `## 六、Document Block（文档块模型）

这是整个能力能否长期稳定运行的关键。**不要先生成一大段 Markdown 再回头识别段落，而是先生成结构化文档块，再渲染为 Markdown。**

\`\`\`json
{
  "block_id": "DOC-XS-000123",
  "logical_block_id": "LBL-OPENING-ZHUANG-01",
  "section_id": "opening",
  "type": "paragraph",
  "document_version": 3,
  "content": [
    {
      "segment_id": "SEG-000456",
      "text": "庄家自摸或流局时，原庄继续坐庄。",
      "editable": true,
      "lineage": "modified",
      "decision_status": "confirmed",
      "diff_status": "confirmed",
      "requirement_refs": ["HZ-R-006", "HZ-R-007"],
      "rule_refs": ["XS-R-ZHUANGJIA-02"],
      "config_refs": [],
      "base_rule_ref": "HJ-R-LUNZHUANG"
    },
    {
      "segment_id": "SEG-000457",
      "text": "闲家自摸时，由赢家接庄。",
      "editable": true,
      "lineage": "added",
      "decision_status": "confirmed",
      "diff_status": "confirmed",
      "requirement_refs": ["HZ-R-008"],
      "rule_refs": ["XS-R-ZHUANGJIA-02"],
      "config_refs": []
    }
  ],
  "requirement_refs": ["HZ-R-006", "HZ-R-007", "HZ-R-008"],
  "rule_refs": ["XS-R-ZHUANGJIA-02", "XS-R-ZHUANGJIA-03", "XS-N-LAOSHU"],
  "config_refs": [],
  "source_evidence_refs": ["sources/xiaoshan/xiaoshan-rules.md#R-BANK-02"]
}
\`\`\`

### 6.1 ID 设计：三层身份，`block_id` 与章节解耦

| ID | 稳定性要求 | 说明 |
| --- | --- | --- |
| \`block_id\` | **永久稳定**，形如 \`DOC-XS-000123\` | 不随章节移动、不随文字修改变化；不得包含 \`section_id\`，也不得用文字 Hash |
| \`section_id\` | 可随结构调整变化 | 独立维护；块在章节间移动只改这里 |
| \`segment_id\` | 片段级稳定 | 句子 / 文本片段编辑的最小单位 |
| \`logical_block_id\` | 跨变体稳定 | 需要判断「杭州与萧山哪两段是同一逻辑段落」时使用 |

v1.1 用 \`DOC-XS-OPENING-003\`（章节 + 序号）作 ID，**已废弃**：把段落从开局移到结算时 ID 会变，人工修改记录与对话引用全部脱钩。

### 6.2 引用分四类，不合并成一个 \`source_refs\`

| 引用 | 指向 | 用途 |
| --- | --- | --- |
| \`requirement_refs\` | 原子需求（\`HZ-*\` / \`XS-*\`） | 回答「原文这条要求写进了哪一段」，也是增量重生成的粗粒度触发器 |
| \`rule_refs\` | 规则卡 ID | 追溯规则事实，改卡后定位受影响段落 |
| \`config_refs\` | 配置项 ID | 同上，配置类事实 |
| \`source_evidence_refs\` | 原文位置（文件 + 章节 / 表格行） | 证据链，支撑差异审核 |

四类各司其职。合成一个数组会导致「需求改了不知道要重生成哪段」与「卡改了却去查原文」两种混乱。

\`requirement_refs\` 依赖上游「需求覆盖与补齐」的产出（见 \`2026-11-24-RuleStudio需求覆盖与补齐.md\`）。**没有 \`requirement_refs\` 的段落必须在 Stage 5 报告里列出原因**（例如纯说明性引言），不得静默为空（I-39）。

### 6.3 \`document.json\` 是事实源，\`provenance.json\` 是派生索引

两份文件都含来源关系，必须定主从：

| 文件 | 角色 | 可否单独修改 |
| --- | --- | --- |
| \`document.json\` | **唯一事实源**：块、片段、引用、状态、版本 | 只能由 Stage 3-4 或提案流程写 |
| \`provenance.json\` | **派生索引**：为查询与渲染优化的扁平表，可由 \`document.json\` 完全重建 | **禁止手改**；不一致时以 \`document.json\` 为准并重建 |

\`\`\`text
document.json  --(Stage 4 生成)-->  provenance.json（可随时重建）
document.json  --(Stage 6 渲染)-->  需求全文.md
\`\`\`

### 6.4 字段要求

| 字段 | 作用 | 要求 |
| --- | --- | --- |
| \`block_id\` | 段落永久身份 | 见 6.1；不得含章节、不得用内容 Hash |
| \`logical_block_id\` | 跨变体同一逻辑段落 | 支撑变体间对照；缺失时按 \`section_id\` + 顺序回退匹配 |
| \`section_id\` | 所属需求章节 | 与共享模板一致（3.1） |
| \`type\` | 块类型 | paragraph / table / formula / list / callout |
| \`content\` | **片段数组** | 一段可能同时含基座与变体内容 |
| \`editable\`（片段级） | 是否允许对话修改 | **下沉到片段**：同一段落里文字说明可改、数值不可改（见 6.5） |
| \`lineage\` / \`decision_status\` / \`diff_status\` | 三维标记 | 见 3.2，可在片段级记录 |
| \`document_version\` | 块所属文档版本 | 支撑「重生成不覆盖人工修改」与编辑提案版本校验 |

### 6.5 \`editable\` 必须下沉到片段级

一个 paragraph 里常混着说明文字与规则数值（8 倍、16 倍、24 分）。块级 \`editable: true\` 等于允许 AI 改数字。

- 文字说明片段：\`editable: true\`
- 数值 / 公式片段：\`editable: false\`，由确定性模板或 \`calculators/\` 渲染（AD-19、AD-33）

### 6.6 为什么 \`content\` 必须是数组

一个段落常常是「杭州原有条件 + 萧山新增条件 + 萧山修改结果」的复合体。整段单来源就无法做到文字级差异标注，也回答不了「这一句是基座还是萧山改的」。

有了片段级来源才能做到：

- 点段落 → 引用整段
- 选段落中的一句话 → 只改这句（\`segment_id\` 定位）
- 点萧山差异 → 跳到对应萧山卡
- 点基座继承内容 → 跳到杭州原卡

### 6.7 多对多（不能设计成一个段落一张卡）

\`\`\`text
一个段落
  ├── 原子需求 A / B
  ├── 规则卡 C / D
  └── 配置项 E
\`\`\`

实测已有这种情况：\`XS-R-ZHUANGJIA-02\` 依赖 \`XS-R-ZHUANGJIA-03\` 与 \`XS-N-LAOSHU\`，段落叙述「连庄牢数递增 + 倍率翻倍」时至少涉及两张卡。修改时必须识别全部相关来源，避免只改一张卡漏掉关联规则。

`;
s = s.slice(0, i) + BLOCK + s.slice(j);

// ── 2. Stage 表：Stage 0 / 2 / 5 收紧 ──
rep(
  "| 0 | 规则集、基座版本、变体版本、生成任务 ID | 锁定版本与范围，记录输入 Hash | `input-manifest.json` |",
  "| 0 | 规则集、基座版本、变体版本、生成任务 ID | 锁定版本与范围；记录可复现字段（基座/变体版本与 `content_hash`、需求覆盖结果版本、文档模板版本、Prompt 版本、模型及版本、生成器版本） | `input-manifest.json` |",
);
rep(
  "| 2 | 模板 + 有效规则集 | 建游戏流程章节；把卡与配置分配到章节；检查未分配项 | `document-outline.yaml` |",
  "| 2 | **共享文档模板** + 有效规则集 | 用所有变体共用的章节模板（3.1）建章节；把卡与配置按同一 `section_id` 分配；检查未分配项。**变体不重组章节** | `document-outline.yaml` |",
);
rep(
  "| 5 | 上游全部产物 + 需求覆盖结果 | 规则覆盖、需求覆盖、来源追踪、差异正确性、未决项检查 | `validation-report.md` |",
  "| 5 | 上游全部产物 + 需求覆盖结果 | 规则覆盖、需求覆盖（**含每条原子需求是否被正文表达**）、来源追踪、差异正确性、未决项检查、三维标记合法性、`requirement_refs` 缺失清单 | `validation-report.md` |",
);

// ── 3. 八、对话编辑：加 8.4 三通道事务与版本校验 ──
rep(
  "### 8.3 段落与规则卡是多对多",
  `### 8.4 三个修改通道统一走提案与版本校验

三个通道（规则 / 表达 / 结构）都必须**人工确认**，AI 不得直接写文件（I-35）：

| 通道 | 目标 | 提案形态 | 冲突校验 |
| --- | --- | --- | --- |
| 规则 | 规则卡 / 配置 | 复用主需求文档 10.2 的提案结构（\`before\`、\`path\`、Hash） | 复核目标文件 Hash（既有机制） |
| 表达 | \`editorial-overrides.yaml\` | 文档提案 \`DOC-P-###\` | 复核 \`based_on_document_version\` |
| 结构 | 章节映射层 | 文档提案 \`DOC-P-###\` | 复核 \`based_on_document_version\` |

**版本冲突必须拒绝应用**：用户打开 V3 发起修改，AI 生成提案期间文档已到 V4 —— 应用前校验

\`\`\`text
proposal.based_on_document_version == current.document_version
\`\`\`

不一致时拒绝并提示重新审核或重新生成提案（I-36）。参考主需求文档 10.3 的事务纪律：先取写入锁、再校验版本与 Hash、写入前逐文件复查。

### 8.5 段落与规则卡是多对多`,
);

// ── 4. 十一、实施优先级：P0-A / P0-B / P1 / P2 ──
const implStart = "## 十一、实施优先级（P0 预留字段，P2 才实现 UI）";
const implEnd = "## 十二、数据产物";
const a = s.indexOf(implStart);
const b = s.indexOf(implEnd);
if (a < 0 || b < 0) throw new Error("第十一节边界未匹配");
const IMPL = `## 十一、实施优先级（与上游需求覆盖节奏对齐）

v1.1 的 P0 要求「一次生成杭州完整全文」，与上游「需求覆盖与补齐」第一阶段只做 \`2.3.3 算分规则\` 单章节实验冲突；而本文又规定「覆盖未完成不得宣称全文完整」。三者无法同时成立，故拆分：

| 阶段 | 任务 | 验收 |
| --- | --- | --- |
| **P0-A** | 以 \`2.3.3 算分规则\` 单章节跑通 Document Block 全流程（Stage 0-6） | 单章节生成；段落可追溯到卡与原子需求；该章节覆盖验证通过 |
| **P0-B** | 扩展杭州全部章节的需求覆盖，生成杭州完整需求全文 | 61 张卡、25 项配置**及原子需求**全部完成映射（AC-24 双检查） |
| **P1** | 萧山变体全文与差异标注 | 与杭州共用同一套 \`section_id\`；文字级差异可追溯 |
| **P2** | 对话式段落编辑 | 修改提案、版本校验、审核、增量重生成 |

**P0-A/P0-B 都必须预留的字段**（不能等 P2 回头改架构）：\`block_id\`、\`logical_block_id\`、\`section_id\`、\`segment_id\`、\`requirement_refs\`、\`rule_refs\`、\`config_refs\`、\`source_evidence_refs\`、\`lineage\`、\`decision_status\`、\`diff_status\`、\`editable\`（片段级）、\`document_version\`。

不做：完整文档编辑器（在线所见即所得）；修改 Compiler 以保留配置差异元数据；规则删除机制；让 AI 直接改 \`需求全文.md\` 或 \`editorial-overrides.yaml\`。

`;
s = s.slice(0, a) + IMPL + s.slice(b);

fs.writeFileSync(f, s);
console.log("六、八、十一 已按评审重写");
