# AGENTS.md

麻将规则知识库的使用规范。Agent 读本仓库时按以下顺序。

## 目录职责

规则资产统一收在 `rulebook/`，按生命周期分层：

| 目录 | 用途 | 可改 |
| --- | --- | --- |
| `rulebook/sources/` | 规则方原始材料 | 否，只读 |
| `rulebook/specs/base/hangzhou/` | 杭州基础规则卡与配置 | 是 |
| `rulebook/specs/variants/xiaoshan/` | 萧山差异规则卡与配置 | 是 |
| `rulebook/compiled/` | 编译器产物 | **否**，只能由 `node compiler/compile.ts` 生成 |
| `rulebook/changes/archive/` | 已归档变更（审计留痕） | 否，只由归档流程写入 |
| `schemas/` | Zod 数据结构定义 | 是 |
| `studio/contracts/` | Rule Studio 领域契约（Document / Block / Segment / Outline / Proposal / Change 的 Zod Schema） | 是 |
| `studio/paths/` | 路径注册表与主体权限（唯一路径推导、规范化、逃逸防护） | 是 |（Document / Block / Segment / Outline / Proposal / Change 的 Zod Schema，K0 阶段只含类型；与 `schemas/` 的规则卡 Schema 分开） | 是 |
| `studio/transaction/` | 事务状态机、双校验、原子提交与崩溃恢复 | 是 |
| `studio/graph/` | Artifact Graph 与失效传播（静态依赖图，不调度） | 是 |
| `studio/identity/` | 片段身份匹配（结构锚点、split/merge、失效待处理） | 是 |
| `studio/pipeline/` | 生成链路：读规则集 → 章节装配 → Document Block → 覆盖门禁 → 渲染；`run-p0a.ts` 单章节、`run-p0b.ts` 杭州全量、`run-p1.ts` 萧山变体；G5 Gold Set 门禁默认关闭（`--goldset` 开启） | 是 |
| `studio/change/` | Change Manager：创建、挂提案、产物推进、Verify、归档导出 | 是 |
| `studio/edit/` | 对话编辑意图路由（四种编辑行为分流，禁止直写） | 是 |
| `studio/audit/` | 审计哈希链（`.rule-studio/workflow/audit.jsonl`，运行时） | 是 |
| `compiler/` | 校验与编译 | 是 |
| `calculators/` | 确定性计算纯函数 | 是 |
| `tests/gold-set/` | Gold Set 用例（YAML） | 是 |
| `dev-docs/` | 开发过程文档 | 是 |

> 活动变更（Change / Proposal / Transaction / 生成中间产物）在 `<kb>/.rule-studio/`，属运行时数据，不入库（`.gitignore` 已忽略）。

## 查询规则

**按玩法拉完整规则集**：读 `rulebook/compiled/<玩法>/`。这是唯一可用的事实源，不需要再读 `rulebook/specs/` 或 `rulebook/sources/`。

```
rulebook/compiled/xiaoshan/
├── manifest.yaml        # ruleset_id、版本、base 锁定、releasable、blockers
├── config.yaml          # 合并后的玩法参数
├── config.ui.yaml       # 界面参数（纯继承杭州）
├── rule-index.json      # HJ↔XS 规则 ID 映射
├── compile-report.md    # 继承/替换/新增数量、阻塞项、映射表
├── unresolved.yaml      # 未裁决项
└── guize/ shixu/ zhuangtai/ gongshi/ biaoge/ jiesuan/ jiemian/   # 规则卡（拼音目录，类型字母见下表）
```

| 目录 | 类型字母 | front matter 的 `type` |
| --- | --- | --- |
| `guize/` | R | judgment |
| `shixu/` | T | timing |
| `zhuangtai/` | N / M | counter / record |
| `gongshi/` | F | formula |
| `biaoge/` | K | lookup |
| `jiesuan/` | P | settlement |
| `jiemian/` | V / I / A | static-ui / interaction / animation |

**按 ID 查规则**：`grep -r "HJ-R-ZHUANGJIA-02" rulebook/compiled/`

**查两玩法差异**：读 `rulebook/compiled/xiaoshan/compile-report.md` 的「规则 ID 映射」。

**查规则依赖**：解析规则卡 front matter 的 `depends_on` 与正文里的反引号 ID。

## 规则卡格式

每张卡一个 Markdown 文件，文件名 = ID 小写。front matter 是机器可读元数据，正文按 11 类槽位书写。

```markdown
---
id: HJ-R-ZHUANGJIA-02
origin: base            # base | variant
type: judgment          # 11 类之一
name: 连庄与换庄
status: confirmed       # confirmed | inferred | unresolved | disputed
release_blocker: false
depends_on: [HJ-N-ZHUANGJIA-LAOSHU]
sources:
  - source: rulebook/sources/hangzhou/hangzhou-core-flow.md
    section: "2.3.2.4"
---
```

差异卡额外字段：`change_type`（inherited / modified / added）、`base_rule_ref`、`compares_to`。

## 关键约束

1. **不要手改 `rulebook/compiled/`**。改规则改 `rulebook/specs/`，再跑编译。
2. **`modified` 卡必须是完整有效规则**，不能只写差异。「杭麻」槽是对照信息，不是有效规则的一部分。
3. **`base_rule_ref` 和 `compares_to` 永远指向原始杭州卡**，不随编译重写；只有 `depends_on` 和正文依赖引用会被重写。
4. **杭州规则内容发生任何变更，必须同时**：提升 `rulebook/specs/base/hangzhou/manifest.yaml` 的 `version`、更新 `content_hash`、检查 `rulebook/specs/variants/*/manifest.yaml` 的 `base.version`、完成派生规则集回归验收。

   编译器只检查 `content_hash` 与当前内容是否一致，以及派生规则集的 `base.version` 是否匹配。**编译器不保存上一发布版本基线，无法自动检测「更新了 `content_hash` 但忘记提升 `version`」的情况。** `version` 递增属于发布流程约束，必须通过 PR 或发布评审人工确认。
5. **未决项不准 AI 自行补全**。`rulebook/specs/variants/xiaoshan/unresolved.yaml` 里的 `release_blocker: true` 项必须由规则方裁决，改 `status: confirmed` 同时填非空 `resolution`。
6. **`releasable: false` 的规则集不能对外声称已发布**。

## 常用命令

```bash
node compiler/validator.ts                                          # 校验杭州（默认基础规则集）
node compiler/validator.ts rulebook/specs/variants/xiaoshan           # 校验萧山（按目录推断 kind）
node compiler/validator.ts <目录> --kind base|variant                 # 显式指定规则集类型
node compiler/compile.ts                                            # 编译并生成 rulebook/compiled/
npm test                                                            # 全部测试
```

## 当前状态

```bash
cat rulebook/compiled/xiaoshan/manifest.yaml   # 看 releasable 和 blockers
```

当前萧山有 3 个发布阻塞项：翻财神归属、K-GANG 飘财第 3 次档、K-FAN 十风倍数。这些是规则空缺，不是编译错误。
