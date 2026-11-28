# 助手工具"类型错配"白烧预算，且被前端计数掩盖

## 现象（三件事叠在一起）

1. 用户在工作台发了消息，问"你能查到吗" —— 服务端**没有任何痕迹**（无会话目录、无日志行），无法判断是"没连上"还是"被拒了"。
2. 修好观测后实跑，问「萧山财神有什么争议」，8 次工具调用里 **3 次落空**：
   - `get_rule({id:"XS-C-CAISHEN"})` → `not_found`（用规则工具查配置）
   - `get_config({id:"HJ-C-CAISHEN"})` → `tool_budget_exceeded`
   - `search_rules({query:"翻财神"})` → `tool_budget_exceeded`
   结果模型想做的"查杭州侧白板财神"这一步没跑完。
3. 界面显示「查了 8 次：…」，把被预算拒绝的调用也算成"查过"，掩盖了上面的浪费。

第二次实跑（同一会话续问）：6 次调用里仍有 1 次
`read_evidence({rule_id:"XS-C-CAISHEN"})` → `not_found` —— 同一类错配换了个工具。

## 排查过程

1. `ls -td .rule-studio/assistant/*/` → 只有我自己脚本的 4 个会话，没有用户那条。
2. `tail server.log` → 只有启动三行。**服务端不记请求日志**，所以"没到"与"被拒"在日志上无法区分。
3. 补日志 + 客户端会话 ID 后重跑，才看到真实调用序列与失败码（即上面第 2 条）。
4. 对着 `tool-calls.jsonl` 逐条看参数，发现失败的共同形态：**调用参数里的 ID 类型与工具不匹配**。

## 根因（三层）

### 根因一：没有请求级观测

`/api/assistant` 只在 `Runtime` 里写"工具审计"，入口处不打日志。前置校验失败（400/403/503）连审计都没有，
于是"用户说发了但查不到"无法定位。

### 根因二：Zod 严格校验把"指路逻辑"挡在门外 —— 这是最关键的一点

想给"你走错工具了"的提示，逻辑写在解析之后：

```ts
const parsed = getRuleInputSchema.safeParse(rawInput);   // id: z.string().regex(ruleIdPattern)
if (!parsed.success) return invalidParams(parsed.error); // ← 配置 ID 在这里就被拒了
if (/-C-/.test(input.id)) { /* 永远到不了 */ }
```

`XS-C-CAISHEN` 不匹配 `ruleIdPattern`（`-C-` 不在类型段白名单里），Zod 先返回 `invalid_params`，
我的"改用 get_config"提示是死代码。模型只能看到"ID 格式不合法"，下一轮照样猜。

同一形状的问题在 `read_evidence` 上复现了两次（`-C-` 配置 ID、`-U-` 未决项 ID 都会被 regex 干掉）。

### 根因三：预算与计数语义

- 全局 6 次对"跨玩法对比"不够：正常需要 `search ×2 + get_rule ×2 + get_config ×2 + list_unresolved`，6 次没有容错余量。
- 预算被拒时只回一句错误，没有把已收集的 ID 带回去，模型等于"什么也没拿到"还要硬收口。
- 前端把 `tool_calls` 全量当成功渲染，`查了 8 次` 里其实 3 次没执行。

## 解决方案

### 1) 请求级观测

`/api/assistant` 每次请求一行结构化日志，成功与失败都记：

```
[assistant] {"ts":"…","status":200,"variant":"xiaoshan","session":"…","messages":6,"ms":16013,
 "mode":"tool_calls","rounds":3,"tools":[…],"tool_failures":["read_evidence:not_found"],
 "grounded":true,"claims":7,"budget_exceeded":false}
```

覆盖 `400 no_messages / 503 assistant_unavailable / 200 / 502 assistant_failed`。
**没有日志 = 请求没到服务**，这条判据解决了"查不到"的定位问题。

### 2) 客户端会话 ID

`crypto.randomUUID()` 生成并持久化，随请求提交，服务端回显并用作审计目录名
`.rule-studio/assistant/<session>/tool-calls.jsonl`。用户报问题时给一个 ID 就能精确翻日志。

### 3) 先宽松收 ID，再分类指路（核心修法）

```ts
// 输入 schema：只校验类型与长度
id: z.string().min(1).max(48)

// 函数内分类
if (configIdPattern.test(id)) return 提示改用 get_config（带 details.suggest）
if (/^(HJ|XS)-U-\d{3}$/.test(id)) return 提示改用 list_unresolved
if (!ruleIdPattern.test(id)) return 格式提示
```

已覆盖三类工具：`get_rule`（收到 `-C-`）、`get_config`（收到规则 ID）、`read_evidence`（收到 `-C-` / `-U-`）。
所有指路错误都带 `hint` + `details.suggest = { tool, args }`，模型下一轮可直接照做。

### 4) 预算与计数

- 全局 6 → **8** 次，Runtime 4 → **5** 轮；单工具上限同步放宽（`search_rules` 3 / `get_rule` 4 / `get_config` 4 / `list_unresolved` 3 / `read_evidence` 4）。
- 预算被拒的错误里回带 `collected_ids`（本次已检索到的 ID），避免模型在"空手"状态下收口。
- 前端区分成功与被拒：`查了 5 次：…（3 次被预算拒绝）`。

## 效果

| 指标 | 修前 | 修后 |
|---|---|---|
| 同一问题的被拒调用 | 3 次 | 0 次 |
| 类型错配导致的 not_found | 2 次 | 0 次（提示后可自纠） |
| 能否判断"请求是否到达" | 不能 | 能（无日志=未到达） |

实跑：`rounds=3`、6 次调用全部成功、`grounded=true`、7 条 claim 全 ok、16s。

## 预防 / 检查清单

新增一个工具时，逐条过：

1. **ID 参数不要用严格正则直接拒**。先收字符串，函数内分类后给 `hint + suggest`。
   严格 schema 只能用于"格式明显非法"的兜底，不能挡住指路逻辑。
2. **每条拒绝都要说清"那该用什么"**。只报 `not_found` 等于把试错成本丢给模型。
3. **请求入口必须有结构化日志**（含 status / 耗时 / 会话 ID），失败分支也要打。
4. **界面数字要能区分"尝试"与"成功"**；被拒的调用不能计入"查了 N 次"。
5. **预算被拒时回带已获得的线索**（ID 摘要），不要只回错误。
6. 预算额度按"最坏正常路径"给：跨玩法对比 = 双搜 + 双读 + 配置 + 未决，至少 8 次。

## 复现与验证

```bash
# 看某次会话的工具调用与失败码
node -e "const fs=require('fs');fs.readFileSync('.rule-studio/assistant/<session>/tool-calls.jsonl','utf8')
  .trim().split('\n').map(JSON.parse).forEach(l=>console.log(l.tool,l.ok?'ok':'X '+l.code,JSON.stringify(l.args)))"

# 看请求级日志
grep '\[assistant\]' /tmp/rule-studio-server.log | tail -5

# 类型错配的单元测试
npx vitest run tests/studio/query -t "走错工具"
```

相关提交：`f415639`（观测与会话 ID）、`9cb8f6e`（预算 8/5、互相指路、collected_ids）、`53a0108`（read_evidence 指路）。
