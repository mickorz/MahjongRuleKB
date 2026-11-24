## 六、Document Block（文档块模型）

这是整个能力能否长期稳定运行的关键。**不要先生成一大段 Markdown 再回头识别段落，而是先生成结构化文档块，再渲染为 Markdown。**

```json
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
```

### 6.1 ID 设计：三层身份，`block_id` 与章节解耦

| ID | 稳定性要求 | 说明 |
| --- | --- | --- |
| `block_id` | **永久稳定**，形如 `DOC-XS-000123` | 不随章节移动、不随文字修改变化；不得包含 `section_id`，也不得用文字 Hash |
| `section_id` | 可随结构调整变化 | 独立维护；块在章节间移动只改这里 |
| `segment_id` | 片段级稳定 | 句子 / 文本片段编辑的最小单位 |
| `logical_block_id` | 跨变体稳定 | 判断「杭州与萧山哪两段是同一逻辑段落」时使用 |

v1.1 用 `DOC-XS-OPENING-003`（章节 + 序号）作 ID，**已废弃**：把段落从开局移到结算时 ID 会变，人工修改记录与对话引用全部脱钩。

### 6.2 引用分四类，不合并成一个 `source_refs`

| 引用 | 指向 | 用途 |
| --- | --- | --- |
| `requirement_refs` | 原子需求（`HZ-*` / `XS-*`） | 回答「原文这条要求写进了哪一段」，也是增量重生成的粗粒度触发器 |
| `rule_refs` | 规则卡 ID | 追溯规则事实；改卡后定位受影响段落 |
| `config_refs` | 配置项 ID | 同上，配置类事实 |
| `source_evidence_refs` | 原文位置（文件 + 章节 / 表格行） | 证据链，支撑差异审核 |

四类各司其职。合成一个数组会造成两种混乱：「需求改了不知道要重生成哪段」「卡改了却去查原文」。

`requirement_refs` 依赖上游「需求覆盖与补齐」的产出（`dev-docs/design/2026-11-24-RuleStudio需求覆盖与补齐.md`）。**没有 `requirement_refs` 的段落必须在 Stage 5 报告里说明原因**（例如纯说明性引言），不得静默为空（I-39）。

### 6.3 `document.json` 是事实源，`provenance.json` 是派生索引

两份文件都含来源关系，必须定主从：

| 文件 | 角色 | 可否单独修改 |
| --- | --- | --- |
| `document.json` | **唯一事实源**：块、片段、引用、状态、版本 | 只能由 Stage 3-4 或提案流程写 |
| `provenance.json` | **派生索引**：为查询与渲染优化的扁平表，可由 `document.json` 完全重建 | **禁止手改**；不一致时以 `document.json` 为准并重建 |

```text
document.json --(Stage 4)--> provenance.json（可随时重建）
document.json --(Stage 6)--> 需求全文.md
```

### 6.4 字段要求

| 字段 | 作用 | 要求 |
| --- | --- | --- |
| `block_id` | 段落永久身份 | 见 6.1；不得含章节、不得用内容 Hash |
| `logical_block_id` | 跨变体同一逻辑段落 | 变体间对照；缺失时按 `section_id` + 顺序回退匹配 |
| `section_id` | 所属需求章节 | 与共享模板一致（3.1） |
| `type` | 块类型 | paragraph / table / formula / list / callout |
| `content` | **片段数组** | 一段可能同时含基座与变体内容 |
| `editable`（片段级） | 是否允许对话修改 | **下沉到片段**：同一段落里文字说明可改、数值不可改（6.5） |
| `lineage` / `decision_status` / `diff_status` | 三维标记 | 见 3.2，可在片段级记录 |
| `document_version` | 块所属文档版本 | 支撑「重生成不覆盖人工修改」与编辑提案版本校验 |

### 6.5 `editable` 必须下沉到片段级

一个 paragraph 里常混着说明文字与规则数值（8 倍、16 倍、24 分）。块级 `editable: true` 等于允许 AI 改数字。

- 文字说明片段：`editable: true`
- 数值 / 公式片段：`editable: false`，由确定性模板或 `calculators/` 渲染（AD-19、AD-33）

### 6.6 为什么 `content` 必须是数组

一个段落常常是「杭州原有条件 + 萧山新增条件 + 萧山修改结果」的复合体。整段单来源就无法做文字级差异标注，也回答不了「这一句是基座还是萧山改的」。

有了片段级来源才能做到：

- 点段落 → 引用整段
- 选段落中的一句话 → 只改这句（`segment_id` 定位）
- 点萧山差异 → 跳到对应萧山卡
- 点基座继承内容 → 跳到杭州原卡

### 6.7 多对多（不能设计成一个段落一张卡）

```text
一个段落
  ├── 原子需求 A / B
  ├── 规则卡 C / D
  └── 配置项 E
```

实测已有这种情况：`XS-R-ZHUANGJIA-02` 依赖 `XS-R-ZHUANGJIA-03` 与 `XS-N-LAOSHU`，段落叙述「连庄牢数递增 + 倍率翻倍」时至少涉及两张卡。修改时必须识别全部相关来源，避免只改一张卡漏掉关联规则。

