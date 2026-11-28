# Rule Copilot 架构设计（MahjongRuleKB 规则策划工作入口）

- 文档版本：v1.1
- 日期：2026-11-28
- 修订记录：
  - **v1.1（2026-11-28，按《2026-11-28-RuleCopilot架构设计评审意见》）**
    1. P1 工具从 5 个增至 **6 个**，新增 `get_config`；`list_dependencies` 明确推迟到 P2（§4.2）
    2. `compare_rules` 改为显式 `CompareScope`（ids / keyword / all_changes），不再用"空 ids 默认全量"；比较按 `base_rule_ref` 建立对应；关键词比较默认上限 20 组 + `truncated`（§4.2）
    3. 工具调用限制改为**全局预算**：每次用户请求 ≤6 次、单工具更低、Runtime ≤4 轮、单次 5s 超时（§4.3）
    4. P0 数值校验从 Set 改为**多重集合 + 数字 Token 分类 + 中文数字规范化**（§8 P0-2）
    5. 降级方案的 grounding 改为**逐条结论结构化引用**，不再以"整段出现一个合法 ID"为准（§4.4）
    6. `ruleCardProposalSchema` 的 `target` **移除 `file_path`**，路径仅由服务端 Path Registry 解析并在内部保存（§6.3）
    7. 新增 §8.1「P0 / P1 双线并行与集成门禁」，替代原先"P0 全部完成后开工"的顺序
  - v1.0（2026-11-28）：初版
- 基线代码：`main` @ `42e30af`（实际核查点为 `14a4299` / `fbd4caf` 之后的 HEAD）
- 定位：**设计文档**。本文件只定义架构与契约，不改动任何现有代码，也不替代执行计划。
- 涉及代码基线：`server/assistant.ts`、`server/viewer.ts`、`server/app.ts`、`studio/pipeline/read-ruleset.ts`、`compiler/validator.ts`、`studio/contracts/proposal.ts`、`studio/change/manager.ts`

---

## 0. 结论摘要

1. 当前助手是「把需求文档喂给模型 → 拿回一段文字」的**问答壳**，它与知识库之间没有任何结构化通道。
2. 因此最先要建的不是"更强的 Agent"，而是**只读的 Rule Query Service**（规则检索 / 读取 / 比较 / 配置查询 / 证据 / 未决项，共 6 个工具），并让模型通过**工具白名单**调用它。
3. 规则写入必须分三条通道（表达层 / 规则事实 / 基座），且**AI 永不直接写规则文件**：AI 只产出 Proposal，Diff 与审批在工作台，正确性由 Compiler 保证。
4. 在写任何 Agent 代码之前，先修 5 个已经确诊的缺陷（P0），否则后续能力会建在错误的数据通道上。
5. 先做 P1（只读查询）并以「每个结论可追溯到真实规则」为验收标准，再考虑 P2（规则修改）。

---

## 1. 现状基线（代码核查结果）

### 1.1 已有能力

| 能力 | 实现位置 | 说明 |
|---|---|---|
| OpenAI 兼容 chat 调用 | `server/assistant.ts` `askAssistant()` | `POST {baseUrl}/chat/completions`，无 `tools` 字段 |
| 模型档位解析 | `studio/generate/model-tiers.ts` → `resolveProviderConfig()` | fast → big → ultra 依次尝试 |
| 需求全文上下文 | `server/viewer.ts` `asstContext()` | 只拼 `block.title + seg.text`，上限 60000 字 |
| 改稿提案 | `server/app.ts` `/api/assistant/edit` → `proposeEdit()` | 模型返回 `{segment_id, after_text, reason}`，服务端三条校验 |
| 应用改稿 | `POST /api/apply` | 复用权限矩阵 + 事务 + `editorial-overrides.yaml` |
| 浏览器浮动/停靠/拖拽/缩放 | `server/viewer.ts` `.asst-drawer` | 与参考站对齐，会话存 localStorage |

### 1.2 缺口（按严重度）

| # | 缺陷 | 证据 | 后果 |
|---|---|---|---|
| D1 | 上下文丢结构 | `asstContext()` 只取 `seg.text`，丢弃 `segment_id` / `lineage` / `rule_refs` / `config_refs` / `source_evidence_refs` / `diff_status` / `decision_status` | 模型看到的是一篇散文，不知道规则的继承关系、状态、证据来源，也无法回答"这条是不是争议项" |
| D2 | 无工具调用 | `assistant.ts` 全文 `grep -c "tools\|tool_call"` = 0 | 模型无法主动检索规则、读卡、比玩法、查未决项 |
| D3 | 改稿 ≠ 改规则 | `editCandidates()` 只收 `lineage ∈ {modified, added}` 且 `editable` 的段；写入只到 `editorial-overrides.yaml` | 「应用」只改表达层。产品界面若不说清，策划会以为规则事实被改了 |
| D4 | 改稿上下文不足 + 校验不全 | `editCandidates()` 下发的 `preview` 是 `seg.text.slice(0, 60)`；提示词却要求"完整覆盖整段" | 模型看不到全文，很难可靠改写；现有校验只查篇幅、反引号数、规则 ID 集合，**不查数值/金额**，也没有版本与 Hash 绑定 |
| D5 | 会话不按玩法隔离 | 单一 `localStorage` key `rs-assistant` | 切玩法后旧对话残留，新请求却用新玩法文档做上下文，跨玩法污染 |

> 结论：D1/D2 决定 AI 是否"懂规则"，D3/D4 决定 AI 的写操作是否安全，D5 是数据正确性问题。四者都必须在 P1 之前或同期解决。

---

## 2. 定位与能力分层

**Rule Copilot = 规则知识库的自然语言操作入口**，不是通用聊天机器人。

### 2.1 四层能力

| 层 | 名称 | 内容 | 阶段 |
|---|---|---|---|
| L1 | Rule Query | 查询、解释、比较、查配置、查公式、查证据、查未决项 | **P1 先做** |
| L2 | Rule Editing | 表达层润色（通道 A）/ 规则事实修改（通道 B）/ 基座修改（通道 C） | P2 |
| L3 | Rule Validation | 依赖与冲突检查、编译、Gold Set、影响分析 | P2 逐步接入 |
| L4 | Rule Authoring | 新建地方玩法（变体 Change + 差异卡 + 完整文档） | P3 |

### 2.2 操作 → 能力映射（防止"一个改稿接口打天下"）

| 用户说法 | 正确能力 | 产出 | 是否需要审批 |
|---|---|---|---|
| "解释一下三摊承包" | L1 `get_rule` + `read_evidence` | 回答 + 引用卡 | 否 |
| "杭州和萧山财神有什么区别" | L1 `search_rules` ×2 + `compare_rules` | 比较卡 | 否 |
| "哪些规则还没定" | L1 `list_unresolved` | 未决项列表 | 否 |
| "这段写清楚点" | L2 通道 A（表达层） | `editorial-overrides.yaml` 提案 | 是（Diff + 应用） |
| "萧山加一条杠开限制" | L2 通道 B（规则事实） | 规则卡 Proposal | 是（Diff + 校验 + 批准） |
| "杭州轮庄加个例外" | L2 通道 C（基座） | 基座规则卡 + 版本提升 + 派生回归 | 是（最严格） |
| "建一个桐庐麻将" | L4 | 变体 Change + 差异卡集 | 是（逐条审核） |

---

## 3. 架构总览

```
┌───────────────────────────── Viewer（server/viewer.ts） ─────────────────────────────┐
│ 聊天消息 / 工具执行卡 / 规则引用卡 / Proposal 卡 / 当前玩法会话头                     │
└───────────────────────────────────────┬──────────────────────────────────────────────┘
                                        │ HTTP（同源 + X-Rule-Studio）
┌───────────────────────────────────────▼──────────────────────────────────────────────┐
│ Assistant API（server/app.ts）                                                        │
│  /api/assistant/chat      会话 + 工具循环（服务端持有循环，浏览器不直连工具）          │
│  /api/assistant/compare   结构化比较（可绕过模型，纯确定性）                          │
│  /api/assistant/edit      通道 A 提案（保留，修 P0 缺陷）                              │
│  /api/proposal/*          通道 B/C 规则卡 Proposal（P2 新增）                          │
└──────────┬─────────────────────────────────────────────────────┬─────────────────────┘
           │                                                     │
┌──────────▼──────────────┐                            ┌─────────▼────────────────────┐
│ Assistant Runtime        │                            │ Tool Registry（白名单）      │
│ - 模型调用（tools）      │  tool_call / tool_result   │ - 参数 Zod Schema            │
│ - 循环（≤N 轮）          │◄──────────────────────────►│ - 能力标签（read/propose）   │
│ - 会话（按 ruleset）     │                            │ - 审计日志                   │
│ - 降级（无 tool_calls）  │                            └─────────┬────────────────────┘
└──────────────────────────┘                                      │
                                                                  │ 只读
                                          ┌───────────────────────▼────────────────────┐
                                          │ Rule Query Service（studio/query/）        │
                                          │ searchRules / getRule / compareRules /     │
                                          │ listUnresolved / readEvidence / getConfig  │
                                          │ 复用：compiler/validator.ts loadRuleset    │
                                          │       studio/pipeline/read-ruleset.ts      │
                                          │       schemas/rule.ts                      │
                                          └───────────────────────┬────────────────────┘
                                                                  │
                                          ┌───────────────────────▼────────────────────┐
                                          │ 事实源：rulebook/specs/**、rulebook/sources/** │
                                          │        rulebook/compiled/**（只读）、    │
                                          │        variants/*/unresolved.yaml        │
                                          └──────────────────────────────────────────┘
```

三条硬边界：

1. **工具只读**（P1）。任何写操作都必须走 Proposal → Diff → 校验 → 人工批准 → Transaction，且由 `studio/paths/registry.ts` 的权限矩阵执行。
2. **工具白名单**。不提供通用文件读、路径参数、Shell、任意 URL 抓取。
3. **确定性优先**。规则规模（杭州 61 卡 + 25 配置、萧山 47 差异卡 → 编译 86 卡）尚不需要向量检索；先做 ID / 名称 / 关键词 / 依赖关系的确定性检索。

---

## 4. P1 详设：Rule Query Service

### 4.1 模块划分（新增，不改动现有编译器）

```
studio/query/
  index.ts        # 对外门面：QueryService，统一 variant → RuleSetView 缓存
  rules.ts        # searchRules / getRule
  configs.ts      # getConfig（P1 六工具之一）
  sources.ts      # readEvidence（按 rulebook/sources/**#anchor 读取片段）
  compare.ts      # compareRules（跨 variant 的结构化差异）
  unresolved.ts   # listUnresolved（读 variants/*/unresolved.yaml）
  types.ts        # 返回结构（全部 Zod 定义，供 Tool Registry 复用）
```

复用而非重写：

- `compiler/validator.ts` → `loadRuleset()`：拿到合法规则集（含 front matter 元数据、正文、`depends_on`）
- `studio/pipeline/read-ruleset.ts` → 已产出 `RuleSetView`（`rules[] / configs[]`），直接作为数据源
- `schemas/rule.ts` → `change_type` / `status` / `release_blocker` 等字段语义
- `variants/<v>/unresolved.yaml` → 未决项（当前 `XS-U-001/002/003` 三个 `release_blocker`）
- `documents/<v>/document.json` → 段落与规则的映射（`segment_id ↔ rule_refs`），用于"这条结论出自哪一段"

### 4.2 六个工具契约（P1 全部只读）

**工具清单（v1.1 定稿，6 个）**：`search_rules` / `get_rule` / `compare_rules` / `list_unresolved` / `get_config` / `read_evidence`。

`list_dependencies` **不在 P1**：`get_rule` 已返回 `depends_on`，足以满足正向依赖读取；反向依赖（谁引用了这张卡）与修改影响分析属于 L3 审查，随 P2 的 Rule Validation 一起做，避免 P1 过早扩张。

统一返回外壳（便于 UI 渲染与审计）：

```ts
interface ToolResult<T> {
  ok: boolean;
  data?: T;
  error?: { code: string; message: string };
  /** 每次返回都带上，便于前端展示"查了哪个规则集" */
  context: { variant: string; ruleset_id: string; version: string };
  /** 证据链：这条结果用到了哪些文件/锚点 */
  citations?: Array<{ kind: "rule" | "config" | "source"; id: string; locator?: string }>;
}
```

#### 1) `search_rules`

```ts
input: {
  variant: "hangzhou" | "xiaoshan" | string;   // 必须是已注册规则集
  query?: string;                               // 名称/正文关键词
  id_prefix?: string;                           // HJ-R- / XS-K- ...
  type?: "judgment" | "timing" | "counter" | "record" | "formula" | "lookup" | "settlement" | "static-ui" | "interaction" | "animation";
  change_type?: "inherited" | "modified" | "added";
  status?: "confirmed" | "inferred" | "unresolved" | "disputed";
  include_body?: boolean;  // 默认 false，只回摘要
  limit?: number;          // 默认 20，上限 50
}
output: { total: number; items: Array<{
  id; name; type; change_type?; status; release_blocker;
  summary: string;        // 首槽位截 80 字，避免灌爆上下文
  depends_on: string[];
  matched_in: "name" | "body" | "id";
}> }
```

匹配顺序：ID 精确 → 名称包含 → 正文包含（正文命中需回 `matched_in: "body"` 以免误导）。
**不做**模糊/语义检索（P1 明确不做）；`total` 超 `limit` 时返回 `truncated: true`。

#### 2) `get_rule`

```ts
input: { variant: string; id: string }
output: {
  id; name; type; scope; status; release_blocker; change_type?;
  base_rule_ref?: string; compares_to?: string[];   // 变体卡的对照信息
  body: string;                 // 完整 Markdown 正文（槽位原样）
  slots: Array<{ slot: string; text: string }>;     // 拆好的槽位，便于比较
  depends_on: string[];
  evidence: Array<{ source: string; section?: string; locator: string }>;
  document_segments: string[];  // 哪些 segment_id 引用了这条规则
}
```

`slots` 复用 `studio/pipeline/read-ruleset.ts` 的 `cardSlots()`，不新写解析器。

#### 3) `compare_rules`

**必须显式声明比较范围**（v1.1 变更）：空参数不再默认全量，避免模型漏传 `ids` 就把整个规则集塞进上下文。

```ts
type CompareScope =
  | { kind: "ids"; ids: string[] }          // 指定规则
  | { kind: "keyword"; query: string }      // 关键词发现后比较
  | { kind: "all_changes" };                // 全量（显式授权，规模受限）

input: {
  base: string;      // 例如 "hangzhou"
  variant: string;   // 例如 "xiaoshan"
  scope: CompareScope;
  max_rows?: number; // 默认 20，上限 40；all_changes 强制 ≤20
}
output: {
  scope: CompareScope;
  matched: number;        // 命中规则数（去重前）
  truncated: boolean;     // 超过 max_rows 时为 true
  summary: { modified: number; added: number; inherited_only?: number };
  rows: Array<{
    /** 变体卡 ID（added 时无 base 对应） */
    id: string;
    change_type: "modified" | "added" | "inherited";
    /** 对应关系由 base_rule_ref 建立，不按同名 ID 猜 */
    base_rule_ref?: string;
    base?: { name: string; slots: Slot[]; status: string; version: string };
    variant?: { name: string; slots: Slot[]; status: string; version: string };
    slot_diff: Array<{ slot: string; base?: string; variant?: string }>;
    unresolved_refs: string[];     // 该卡被哪些未决项阻塞
    evidence: { base: string[]; variant: string[] };
  }>;
  caveats: string[];   // 例如 "XS-C-CAISHEN 命中 disputed 项 XS-U-001，AI 不裁决"
}
```

三条实现约束（评审确认）：

1. **对应关系只能来自 `base_rule_ref`**。变体卡的 ID 与基座卡 ID 不同名（如 `XS-R-ZHUANGJIA-02` 对照 `HJ-R-LUNZHUANG`），按同名 ID 比较会直接把差异算错。
2. **关键词比较先检索再比较**：`search_rules(base, keyword)` ∪ `search_rules(variant, keyword)` 得到候选，再用 `base_rule_ref` 配对，最后做槽位级 diff。
3. **规模硬约束**：`max_rows` 默认 20；`all_changes` 固定 20；被截断时 `truncated: true`，并在 `caveats` 里写明"还有 N 组未返回，请缩小范围"。

关键约束（沿用 v1.0）：比较**必须**原样带出 `status` / `release_blocker` / `unresolved_refs`，`caveats` 里显式提示"存在未裁决内容"，**AI 不得自行裁决冲突**。

#### 4) `list_unresolved`

```ts
input: { variant: string; only_blockers?: boolean; status?: "unresolved" | "disputed" }
output: { total: number; items: Array<{
  id; card_ref; description; status; release_blocker; resolution: string | null;
}>; releasable: boolean }
```

`releasable` 直接来自 `documents/<v>/manifest.yaml`/规则集状态，不由模型判断。

#### 5) `get_config`

配置值不一定写进规则卡正文（底分、局数、财神、封顶、玩法开关等独立存放），没有这个工具，模型只能从规则卡里猜。

```ts
input: {
  variant: string;
  id?: string;      // 例如 "HJ-C-DIFEN"
  query?: string;   // 例如 "底分"
  // id 与 query 至少提供一个（服务端校验，二者都缺 → invalid_params）
}
output: { items: Array<{
  id: string;
  name: string;
  value: unknown;          // 原值（布尔/数字/字符串/数组），不做字符串化
  value_display: string;   // 便于阅读的呈现（如 "enabled" → "已启用"）
  description?: string;
  source?: string;         // 配置来源锚点
  scope?: string;
  status: string;          // confirmed / inferred / unresolved / disputed
  release_blocker: boolean;
}>; total: number; }
```

数据源：`rulebook/compiled/<variant>/config.yaml`（复用 `nameIndex` 已建立的加载路径），并保留基座链合并规则（派生规则集未覆盖的配置沿用基座）。

#### 6) `read_evidence`

```ts
input: {
  variant: string;
  ref: string;            // "rulebook/sources/xiaoshan/xiaoshan-rules.md#R-BANK-02"
  max_chars?: number;     // 默认 1200，上限 4000
}
output: { source: string; section?: string; text: string; truncated: boolean }
```

路径安全：`ref` 必须命中"该规则集已登记的证据集合"（由 `get_rule` 的 `evidence` 派生），**不接受任意路径**，不做 `endsWith` 判断，统一 `normalizeRelative` + `realpathSync` 前缀校验。

### 4.3 Tool Registry

```ts
interface ToolSpec<I, O> {
  name: string;                 // search_rules / get_rule / compare_rules / list_unresolved / read_evidence
  description: string;          // 给模型看的一句话
  params: ZodSchema<I>;         // 参数校验（服务端强制，模型输出不可信）
  capability: "read";           // P1 只有 read；P2 增加 propose
  run: (input: I, ctx: QueryContext) => Promise<ToolResult<O>>;
  /** 单工具在该请求内的上限（低于全局预算，用于压制"反复搜同一词"） */
  maxCallsPerTool?: number;     // 默认 3；search_rules 2，read_evidence 4
}
```

- 注册表是**白名单数组**，没有动态发现、没有文件系统工具。
- 所有参数经 Zod 校验；`variant` 只接受 `rulebook/compiled/` 下已存在的目录名。
- 每次调用写入审计日志（`.rule-studio/assistant/<session>/tool-calls.jsonl`），字段：`ts / tool / args(脱敏) / ok / ms / citations`。

**调用预算（v1.1：全局口径，不再"每工具各 6 次"）**

| 限制 | 值 | 超限行为 |
|---|---|---|
| 单次用户请求的工具调用总数 | **6**（全局） | 返回 `tool_budget_exceeded`，Runtime 停止循环，直接让模型基于已有结果作答 |
| 单工具调用次数 | ≤3（`search_rules` ≤2、`read_evidence` ≤4） | 该次调用返回错误，模型可见并可换策略 |
| Runtime 轮数 | ≤4 | 第 4 轮后强制收口 |
| 单次工具执行 | 5s 超时 | 返回 `tool_timeout` |

预算判定在 Runtime 里做（不在工具内部），工具自身只管参数与数据。

### 4.4 Assistant Runtime（工具循环）

```
loop (max 4 rounds):
  1. 组装 messages：system + 会话历史 + 本轮 user + 工具结果摘要
  2. 调 /chat/completions（带 tools = 白名单 schema）
  3. 若返回 tool_calls：
       - 逐条 Zod 校验参数
       - 执行工具（只读，超时 5s）
       - 结果压缩：列表类只回前 20 条 + total；正文类截断并标注 truncated
       - tool 消息回填，继续 loop
  4. 若返回 content：结束，转为 UI 消息（见 §5）
```

降级方案（重要）：当前档位模型若不支持 `tool_calls`（例如部分 flash 模型），Runtime 走**服务端预检索**：
先用确定性规则把用户问题映射到 `search_rules(query=问题关键词)` / `get_config(query=…)`，把结果作为上下文注入，再让模型基于注入结果作答。

**Grounding 判定（v1.1：逐条结论，不再整段放行）**

模型必须按结构化格式输出结论与引用：

```json
{
  "claims": [
    { "text": "萧山二牢局不开放点炮", "refs": ["XS-R-HUPAI-01"], "kind": "rule" },
    { "text": "萧山底分为 1", "refs": ["HJ-C-DIFEN"], "kind": "config" }
  ]
}
```

服务端逐条校验：

1. `refs` 中每个 ID 必须出现在**本次请求实际注入/检索到的** ID 集合里，否则该条标 `invalid_ref`。
2. `refs` 为空的实质性结论标 `unverified`（不阻断展示，但 UI 上明确标记）。
3. 只有全部 claim 都通过校验的回答才算 `grounded`；**不允许因为回答里出现过一个合法 ID 就整段放行**。
4. 校验结果随消息落 UI：`claims[]` 携带 `status: "ok" | "invalid_ref" | "unverified"`。

这不能数学上证明模型没有误读，但能建立可靠的来源约束——每条结论要么有出处，要么被标为未验证。

该降级不是可选项——它保证能力不因模型差异而消失。

### 4.5 会话管理（修 D5）

```ts
interface AssistantSession {
  id: string;
  variant: string;          // 隔离键
  ruleset_id: string;
  ruleset_version: string;  // 记录会话开始时的规则集版本
  createdAt: string;
  messages: AssistantMessage[];
}
```

- 存储键：`rs-assistant:<variant>`（替换现在的 `rs-assistant`）。
- 切换玩法时：旧会话保留，新建/切回同玩法会话；顶部显示"当前上下文：萧山好友房 v0.3.0"。
- 规则集版本变化时（重新生成文档 / 规则集升级），会话头提示"上下文已过期"，并提供「新开会话」按钮，避免旧结论被当成现状。

---

## 5. UI 消息协议（Viewer）

保留现有浮动/停靠窗口，只扩展消息类型。消息数组元素：

```ts
type AssistantMessage =
  | { kind: "text"; role: "user" | "assistant"; content: string;
      claims?: Array<{ text: string; refs: string[]; status: "ok" | "invalid_ref" | "unverified" }> }
  | { kind: "tool"; tool: string; args: Record<string, unknown>;
      status: "running" | "ok" | "error"; summary: string; citations: Citation[]; ms?: number }
  | { kind: "citation"; items: Citation[] }        // 规则引用卡（可点击）
  | { kind: "compare"; payload: CompareResult }    // 比较卡（结构化表格）
  | { kind: "proposal"; channel: "expression" | "rule-fact" | "base" | "variant";
      target: string; before?: string; after?: string;
      checks: Array<{ code: string; status: "pass" | "warn" | "fail"; message: string }>;
      state: "draft" | "ready" | "applied" | "rejected"; transactionId?: string };
```

渲染约定：

| 组件 | 视觉要求 | 交互 |
|---|---|---|
| 工具执行卡 | 单行：`🔍 搜索规则 · 财神 → 4 条`（失败为 terra 色 + 原因） | 展开看完整参数与 citations |
| 引用卡 | `财神` + 状态徽章（`.badge.warn` 用于 `disputed`）+ 规则集名 | 点击在中间栏定位该规则段落（复用 `scrollToSection`）/ 打开规则详情 |
| 未验证标记 | 结论行尾小字「未验证」/「引用无效」（`--ink-3` / `--terra`） | hover 显示原因；不阻断阅读 |
| 比较卡 | 左杭州 / 右萧山，槽位级并排；`disputed` 行标红 | 行可展开证据 |
| Proposal 卡 | 复用已有 `.asst-action`（表达层）与新增 `.asst-proposal`（规则事实）：标题 + 目标 + Diff + 校验结果列表 + 应用/丢弃 | 应用仍走 `POST /api/apply` 或 `/api/proposal/apply` |

流式：先发 `tool` 消息（`status: running`），工具返回后原地更新，再发正文；正文按 SSE 流式追加（P1 可先整段，P2 再上流式）。

---

## 6. P2 概要：意图路由与三条修改通道

### 6.1 意图路由

```
用户输入 → Intent Router（模型 + 规则化后验）
  ASK_RULE / COMPARE_RULE / LIST_UNRESOLVED        → P1 只读工具
  EDIT_EXPRESSION                                   → 通道 A（现有 /api/assistant/edit 修好后）
  MODIFY_RULE                                       → 通道 B（规则卡 Proposal）
  RESOLVE_UNRESOLVED                                → 通道 B 的专门形态（要求填 resolution）
  CREATE_VARIANT                                    → L4（P3）
```

路由器输出必须带 `confidence` 与 `reasons`。**低置信度不生成修改**，改为反问：
> "你是想解释这条规则，还是想修改它？修改规则会生成一份待审批的 Proposal。"

P1 阶段路由器可先固定为"只读三意图"，其余一律回答"该操作需要 Proposal 通道，当前版本未开放"，避免误改。

### 6.2 三条通道

| 通道 | 目标文件 | 现有能力 | 需要补 |
|---|---|---|---|
| A 表达层 | `documents/<v>/editorial-overrides.yaml` | ✅ `applySession` + Transaction | 修 P0-D4（完整原文、数值校验、版本绑定） |
| B 规则事实 | `rulebook/specs/variants/<v>/**/*.md` | ⛔ 无 | 规则卡 Proposal 契约（§6.3）、Diff 渲染、`assertWritable("transaction","apply-rule", …)` 已有前缀授权 |
| C 基座 | `rulebook/specs/base/hangzhou/**` | ⛔ 无 | 版本提升 + `content_hash` 更新 + 派生规则集回归验收（AGENTS.md 第 4 条） |

通道 C 必须额外产出：影响分析（哪些变体卡 `base_rule_ref` 命中）→ 派生规则集重新编译 → Gold Set 回归 → 才允许批准。对应已有 `studio/pipeline/impact.ts`、`base-upgrade.ts`。

### 6.3 Proposal 契约缺口

`studio/contracts/proposal.ts` 当前是**文档提案**（`type: z.literal("document")`）。规则卡修改需要新 schema，建议并列新增而不重写：

```ts
export const ruleCardProposalSchema = z.object({
  proposal_id: z.string().regex(/^RCP-\d{3}$/),
  channel: z.enum(["rule-fact", "base"]),
  variant: z.string(),
  intent: z.enum(["add", "modify", "resolve-unresolved"]),
  // v1.1：目标只表达"改哪条规则"，路径绝不进入契约输入
  target: z.object({
    rule_id: z.string(),                   // 必填：服务端据此推导唯一路径
  }),
  base_revision: baseRevisionSchema,       // 规则集版本 + content_hash
  patch: z.object({
    front_matter: z.record(z.unknown()).optional(),
    body: z.string().optional(),           // 完整正文，不允许只给 diff
  }),
  evidence: z.array(z.object({ source: z.string(), section: z.string().optional() })),
  rationale: z.string(),
  checks: z.array(machineCheckSchema),     // 复用 W0 的机器检查
  status: z.enum(["draft", "ready", "approved", "applied", "rejected", "stale"]),
});
```

要点（v1.1 收紧）：

- **`file_path` 不是模型输入，也不是客户端输入**。服务端以 `variant + rule_id` 走 `studio/paths/registry.ts` 解析出唯一路径；解析失败（未注册产物 / 变体越权 / 基座保护）直接拒绝生成 Proposal。
- 解析后的路径只写入**内部**提案记录（供审计与事务执行），不下发模型、不由前端回传。
- 这条与当前文档提案的安全模型完全同构：模型只能表达意图，路径与权限由服务端决定。

---

## 7. P3 概要：地方玩法创作

流程（继承内容**不重新生成**，只生成差异）：

```
create-variant(桐庐, base=hangzhou)
  → 建 `rulebook/specs/variants/tonglu/manifest.yaml`（base 绑定 + version）
  → 逐条差异：MODIFY_RULE / 未改的靠 base 继承
  → 每条差异卡必须是"完整有效规则"（AGENTS.md 约束 2）
  → 未覆盖能力：写进 unresolved.yaml，不编造
  → compile.ts 生成 compiled/tonglu
  → 生成完整需求文档（复用 P0-B/W2 流水线）
  → 展示 继承/修改/新增 关系与 blocker
```

批量提案必须**逐卡可审**（一次呈现 N 张卡，但批准粒度是单卡或显式"全部批准"），且任意一张被拒不影响其他卡落库（事务边界按卡或按批次，需在 P3 定稿时确认）。

---

## 8. P0 修复清单（与 P1 双线并行，见 §8.1）

| 编号 | 问题 | 修法 | 验收 |
|---|---|---|---|
| P0-1 | 改稿只用 `preview(60 字)` | 确定性选取目标段：用户显式点选 → 传该段完整 `text`；未点选 → `search_rules` 命中段落后再传全文；一次只改一段 | 提案返回的 `after_text` 与原文同段落、可逐句对齐；模型不再"猜开头" |
| P0-2 | 只校验篇幅/反引号/ID | **数值校验用多重集合，不用 Set**：见 §8.2。分类抽取 → 规范化 → 只比较"正文数值"桶的多重集合 | ①"把 8 倍改成 10 倍"被拒；②"自摸 2 倍 → 自摸 3 倍"（同文另有 2 倍）被拒；③"三局 → 四局"被拒（中文数字）；④只改 Markdown 编号 / 证据编号不误报 |
| P0-3 | 无版本绑定 | 提案记录 `document_version` + 目标段 `text` 的 sha256；应用前复核，不一致返回 `stale_proposal` | 提案生成后手动改文档版本 → 应用被拒并提示重新生成 |
| P0-4 | 会话不隔离 | 见 §4.5 | 切玩法后旧消息不可见；会话头显示 ruleset 版本 |
| P0-5 | 表达修改与规则修改混为一谈 | 界面文案分流：表达层提案卡标「文档表达修改」；规则事实入口在 P2 之前保持禁用并说明原因 | 用户不会误以为规则事实已改 |

### 8.1 P0 / P1 双线并行与集成门禁（v1.1）

不做"全部 P0 完成才开工 P1"。P0-1…P0-3 只影响表达修改通道，不阻塞只读查询。

```
工作线 A（表达层安全）            工作线 B（只读查询）
P0-1 完整原文                     studio/query/ 纯函数
P0-2 数值多重集合校验             6 个工具契约 + Zod
P0-3 版本 + Hash 绑定             工具单测（不接模型）
P0-4 会话按 variant 隔离
P0-5 表达 / 事实分流              查询结果人工抽查
        │                                  │
        └──────────┬───────────────────────┘
                   ▼
        集成门禁（三条全过才继续）
        G1 P0-4 完成 → 才能接新的会话管理
        G2 P0-5 完成 → 才能开放新的聊天交互
        G3 Query Service 测试通过 → 才能接 Runtime
                   ▼
        P1 收尾：Tool Registry → Runtime 循环 → UI 四类卡片 → Gold Set 验收
                   ▼
        P2 前提：P0 全部验收通过，才开放规则事实 Proposal 写入
```

门禁是**串行的依赖点**，不是里程碑装饰：G1/G2/G3 任一未过，后续阶段不得开始。

### 8.2 数字 Token 校验细则（P0-2）

分五类抽取，**只在「正文数值」桶内比较多重集合**：

| 类别 | 例 | 处理 |
|---|---|---|
| 规则 / 配置 ID 内的数字 | `XS-U-001`、`HJ-R-DINGZHUANG` | 先整体识别 ID 再排除，不参与数值比较 |
| 证据编号 / 章节号 | `#R-BANK-02`、`第 2.3.3 节` | 归入"引用桶"，由引用集合一致性校验 |
| Markdown 编号 | `1.` `2.` `-` | 按行首模式识别，替换后不参与比较 |
| 公式内数字 | `2^本局实际牢数`、`d1 + d2 > 8` | 参与比较，但单独成桶（公式桶），便于报错定位 |
| 正文数值 | `8 倍`、`−200 分`、`3 牢` | **主比较桶**：多重集合必须完全一致 |

规范化规则：全角→半角、`−`/`-`/`－` 统一、去除千分位、`8 倍` 与 `8倍` 等价；中文数字（一二三四五六七八九十、两）先转阿拉伯数字再入桶（`三局`→`3`、`两牢`→`2`）。

比较语义：

- 主比较桶用 **multiset**（`Map<normalizedValue, count>`），`{2:2}` vs `{2:1, 3:1}` 判为不同——这是 Set 会漏掉的情形。
- 允许"数量增加"仅当该值在原文桶已存在（例如原文已有 `2 倍`，新文再写一次 `2 倍` 属新增提及）；出现**原文没有的数值**即违规。
- 报错需给出：`缺少 X；新增 Y；出现位置（槽位名）`，不返回笼统的"数值不一致"。

---

## 9. P1 验收（四个真实场景 + Gold Set）

| 测试问题 | 期望行为 | 通过标准 |
|---|---|---|
| 杭州和萧山财神规则有什么区别？ | `search_rules` ×2 → `get_rule` ×2 → `compare_rules` → `read_evidence` | 比较卡列出两侧规则 ID 与槽位差异；`XS-U-001` 以 `disputed` 呈现且不裁决 |
| 哪些萧山规则还没有确定？ | `list_unresolved(only_blockers=true)` | 返回 `XS-U-001/002/003` 三条 + `releasable: false` |
| 解释弃牌响应优先级 | `search_rules` → `get_rule` → `read_evidence` | 回答里的每个结论都带 `rule_id`；引用可点击定位 |
| 杭州底分是多少？萧山有没有变？ | `get_config(base,"底分")` + `get_config(variant,"底分")` | 两侧配置 ID / 值 / 来源齐全；萧山未覆盖时明确说"沿用基座"，不猜 |

Gold Set：新增 `tests/gold-set/copilot-questions.yaml`（20~30 条），每条包含：

```yaml
- id: CP-001
  question: 杭州和萧山财神规则有什么区别？
  expected_tools: [search_rules, search_rules, get_rule, compare_rules]
  expected_rule_ids: [HJ-R-CAISHEN, XS-C-CAISHEN]
  expected_config_ids: [HJ-C-CAISHEN]
  must_not_claim: ["XS-U-001 已裁决"]
  must_include_status: [disputed, release_blocker]
```

评分采用**确定性比对**（工具序列包含关系 + 规则/配置 ID 集合 + `must_not_claim` 反例），不依赖模型自评；`claims[]` 的 grounding 状态也计入评分（`invalid_ref` 一律扣分）。

---

## 10. 明确不做（P1）

1. 不做向量检索 / embedding（规则规模不足以证明收益）。
2. 不做通用文件工具、Shell、任意 URL 抓取。
3. 不做后台自动改规则（所有写入必须人在环内）。
4. 不引入 Electron / 外部 Agent 框架（历史结论已否决 PiBot 二开路线）。
5. 不让模型决定"哪条规则正确"——冲突由策划裁决，AI 只提供证据与候选。
6. 不在 P1 做 `list_dependencies` / 反向依赖 / 影响分析（随 P2 的 L3 一起做）。
7. 不允许"回答里出现一个合法 ID 就整段算有依据"（v1.1 已改为逐条 claim 校验）。

---

## 11. 类比理解

把这套系统想成**医院的影像科**：

- **Rule Query Service** = 拍片机。它只负责拍出清晰、可追溯的片子（规则 + 证据 + 状态），不负责下诊断。
- **Assistant Runtime** = 影像科医生。他看着片子说话，说的每句话都要指向某张片子（`rule_id` + `citation`）；没有片子支撑的结论，不许说（`ungrounded` 会被标出）。
- **Proposal** = 会诊意见书。医生不能直接给病人开刀（改文件），只能写建议书；建议书里必须写明依据、改动、风险。
- **Diff + 审批** = 主刀医生签字。工作台把意见书摊开给策划看，策划签字后才进手术室。
- **Compiler** = 术中监护。它不管意见书写得好不好，只保证切开之后规则集仍然合法（Schema、引用、槽位、编译）。
- **AI 不能直接改文件** = 医生没有手术权。这不是不信任医生，而是**责任要落在能签字的人身上**。

再换一个更贴近本项目的类比：现在的助手像一个只能读"论文摘要"的实习生，你问他"财神归属定了吗"，他只能从摘要里猜。P1 要做的是给他**图书馆的检索权限**：能查目录（`search_rules`）、能取原书（`get_rule`）、能对照两版（`compare_rules`）、能看批注（`list_unresolved`）、能翻原始笔记（`read_evidence`）。但他**没有笔**——想改书内容，必须写申请单交给主编（Proposal → 审批）。

---

## 12. 下一步

评审已通过（见《2026-11-28-RuleCopilot架构设计评审意见》），按 §8.1 双线并行开工：

1. **工作线 B 第一步**：`studio/query/` 纯函数（`rules / configs / compare / unresolved / sources`）+ 单测，**不接模型**。
2. **工作线 A 第一步**：P0-1（完整原文）+ P0-2（数值多重集合）+ P0-3（版本 + Hash），三项各自带独立测试。
3. 两条线到 G1/G2/G3 门禁后，才做 Tool Registry → Runtime → UI 卡片 → Gold Set。
4. P2（规则事实修改）**不在本阶段**；开启前必须 P0 全部验收通过。

---

## 引用与参考

- 本仓库：`dev-docs/design/2026-11-28-RuleCopilot架构设计评审意见.md`（v1.1 全部修订的来源）
- 本仓库：`dev-docs/design/2026-11-25-RuleStudio基座与变体需求文档工作流.md`（Proposal → Diff → 校验 → 批准 → 写回 的既定流程）
- 本仓库：`AGENTS.md`（规则集不可手改、基座版本与 `content_hash` 约束、未决项不得 AI 补全）
- 本仓库：`dev-docs/experience/css-variable-overridden-by-hardcoded-width.md`（本轮 UI 改动的失败模式复盘，与本设计无直接关系，但属于同一时期的工程经验）
- 本仓库代码：`server/assistant.ts`、`server/viewer.ts`、`server/app.ts`、`studio/pipeline/read-ruleset.ts`、`compiler/validator.ts`、`studio/contracts/proposal.ts`、`studio/paths/registry.ts`
- OpenAI Function Calling 文档：<https://platform.openai.com/docs/guides/function-calling>
- JSON Schema 规范：<https://json-schema.org/>
- Zod（参数校验）：<https://zod.dev/>
