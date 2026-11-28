# 《2026-11-28-RuleCopilot架构设计》评审意见（原文存档）

> 存档说明：以下为用户在对话中发送的评审意见原文，逐字保存，未改写。
> 被评审文档：`dev-docs/design/2026-11-28-RuleCopilot架构设计.md`（v1.0）
> 存档日期：2026-11-28

---

我看完了 2026-11-28-RuleCopilot架构设计.md。整体评审结论：架构方向通过，可以进入开发，但我建议先修订三个工具契约细节，再按阶段开工。

你补充的两个问题（模型不支持 tool_calls 的降级、规则卡 Proposal 契约缺口）都很有必要，应该保留。

下面是我对三个待决策问题的正式意见。

## 1. P1 的五个工具够不够？

决定：增加 get_config，暂不增加 list_dependencies

最终 P1 使用六个只读工具：

| 工具 | 是否纳入 | 原因 |
|---|---|---|
| search_rules | 纳入 | 规则检索 |
| get_rule | 纳入 | 读取完整规则 |
| compare_rules | 纳入 | 跨玩法比较 |
| list_unresolved | 纳入 | 查询未决项 |
| read_evidence | 纳入 | 原始证据追溯 |
| get_config | 新增 | 查询玩法配置 |
| list_dependencies | 暂缓 | 放到 P2 |

为什么必须增加 get_config？

因为麻将规则中有大量配置值，例如：

- 底分
- 局数
- 财神配置
- 封顶
- 庄家相关配置
- 玩法开关

这些信息不一定存在于规则卡正文中，而是独立保存在配置文件中。

如果没有 get_config，用户问：
杭州麻将的底分是多少？萧山的底分有没有变化？

AI 就只能从规则卡中猜。

建议接口：

```
get_config({
  variant: "hangzhou",
  id?: "HJ-C-DIFEN",
  query?: "底分"
})
```

要求 id 和 query 至少提供一个，返回：

- 配置 ID
- 配置名称
- 配置值
- 说明
- 来源
- 所属规则集和版本

list_dependencies 暂缓的原因是：当前 get_rule 已经返回 depends_on，可以先满足正向依赖读取。

反向依赖查询、修改影响分析，应该和 P2 的 Rule Validation 一起实现，避免 P1 过早扩张。

## 2. compare_rules 怎么设计？

决定：两种都支持，但必须显式指定比较范围

我赞同你的判断。

支持：

- 指定规则 ID 比较。
- 按关键词发现并比较相关规则。
- 全量比较，但必须显式授权全量范围。

这里我建议稍微调整接口，不要让空 ids 默认代表全量比较。

推荐采用明确的 Scope：

```ts
type CompareScope =
  | { kind: "ids"; ids: string[] }
  | { kind: "keyword"; query: string }
  | { kind: "all_changes" };

interface CompareRulesInput {
  base: string;
  variant: string;
  scope: CompareScope;
}
```

这样有三个好处：

1. 不会因为模型忘记传 ids，就意外比较整个规则集。
2. 关键词比较可以先检索候选规则，再做槽位级比较。
3. 全量比较是明确的操作，便于限制调用规模和记录审计。

例如：

```json
{
  "base": "hangzhou",
  "variant": "xiaoshan",
  "scope": { "kind": "keyword", "query": "财神" }
}
```

另外，关键词比较建议默认最多返回 20 组差异，超过时返回 truncated: true，不允许直接把几十张规则卡全部塞进模型上下文。

还有一个细节：比较时必须根据 base_rule_ref 建立基座与变体的对应关系，不能简单按两个规则集的 ID 相同进行比较。

## 3. P0 与 P1 是串行还是并行？

决定：分两条工作线并行，但设置必要的前置门禁

这里我不赞成把全部 P0 做完才开始 P1。

因为 P0-1、P0-2、P0-3 主要影响表达修改通道，并不阻塞只读 Rule Query Service。

推荐这样安排：

**第一阶段：并行开发**

工作线 A：P0 修复

- P0-1 完整原文
- P0-2 数值校验
- P0-3 版本与 Hash
- P0-4 会话隔离
- P0-5 修改通道区分

工作线 B：P1 查询

- Query Service
- 六个工具契约
- 工具单元测试
- 查询结果验证

**第二阶段：集成门禁**

- P0-4 必须完成，才能接入新的会话管理。
- P0-5 必须完成，才能开放新的聊天交互。
- Query Service 测试通过，才能接入 Runtime。

**第三阶段：P1 完成**

- Tool Registry
- Assistant 工具调用循环
- UI 消息组件
- Gold Set 验收

**第四阶段：进入 P2**

P0 全部通过验收，才开放规则事实修改和 Proposal 写入。

这样既不会因为修复表达层问题拖慢只读查询，也不会让规则写入能力建立在不安全的旧机制上。

## 4. 我还发现设计文档有四个值得补充的细节

这些不是方向性问题，但建议在开工前明确。

### 4.1 数值校验不能简单使用 Set

现在设计是：原文数字集合 === 新文数字集合

我建议改成数字 Token 多重集合（Multiset）。

例如：

原文：杠分 2 倍，自摸 2 倍
修改：杠分 2 倍，自摸 3 倍

普通 Set 在某些重复数字场景下无法准确识别变化。

同时需要区分：

- 规则 ID 中的数字。
- 证据编号。
- 正文中的数值。
- Markdown 编号。
- 公式中的数字。

建议先建立数字 Token 分类和规范化，再比较正文数值。另需覆盖中文数字表达，避免「三局」被改成「四局」却漏检。

### 4.2 降级方案的 ungrounded 判断还不够严格

目前设计是：回答出现的 rule_id ∩ 实际注入的 rule_id，交集非空就算有依据。

但这存在一个问题：模型可能引用了一条真实规则，同时对另一条规则编造结论。

建议：

- 模型必须输出结构化引用。
- 每个重要结论绑定一个或多个 rule_id。
- 服务端验证引用是否属于实际检索结果。
- 没有引用的实质性结论标记为未验证。
- 不允许仅仅因为回答中出现一个合法 ID，就把整段回答认定为 grounded。

这仍不能数学上证明模型没有误读，但可以建立可靠的来源约束。

### 4.3 Proposal 中的 file_path 不应该成为模型输入

你已经明确要求路径由服务端推导，但目前示例 Schema 仍然包含：

```ts
target: {
  rule_id: z.string(),
  file_path: z.string()
}
```

建议调整为：

```ts
target: { rule_id: z.string() }
```

服务端通过 `variant + rule_id` → Path Registry → 确定唯一目标路径，生成内部 Proposal 时再保存解析后的路径。

这是一个重要的安全边界。

### 4.4 工具调用上限应该是全局上限

目前 maxCallsPerTurn 写在每个 ToolSpec 中，而 Runtime 又设置了最多 4 轮。

容易出现每种工具各调用 6 次的情况。

建议明确：

- 每个用户请求最多 6 次工具调用（全局）。
- 单个工具可以有更低的独立上限。
- Runtime 最多 4 轮。
- 单个工具执行超时 5 秒。
- 超出限制返回明确错误，不继续循环。

## 5. 最终确认的开发顺序

Rule Copilot 第一阶段：可以开工。6 Tools，只读工具体系，不开放规则事实写入。

开发检查清单（0/7）：

- [ ] 设计文档修订：补 get_config、CompareScope、安全与调用限制
- [ ] P0 修复：五项缺陷全部有独立测试
- [ ] Query Service：纯函数实现 + 单元测试
- [ ] Tool Registry：六个工具契约 + Zod 测试
- [ ] Assistant Runtime：Tool Calling + 模型降级
- [ ] UI 消息协议：text / tool / citation / compare
- [ ] Gold Set：20～30 条真实问题验收

我的最终意见：批准架构，按上述调整后开工。

尤其注意三条原则：

1. P1 不做写入，只验证 AI 能否准确理解 MahjongRuleKB。
2. AI 的回答必须能追溯到真实规则、配置和原始证据。
3. P2 才开放规则修改，且 Proposal、Compiler、人工审批不能绕过。

这次不要再扩张 Agent 框架，也不需要引入新的 Agent 基座。现有 Rule Studio 就是运行环境，Rule Query Service 是第一块真正需要补齐的能力。

先把 P1 做成一个能够正确回答麻将策划问题的助手，再让它逐步获得修改规则的能力。
