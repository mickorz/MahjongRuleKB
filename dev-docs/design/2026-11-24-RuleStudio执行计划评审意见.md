# Rule Studio 执行计划 评审意见

> 评审对象：`dev-docs/planning/2026-11-24-RuleStudio执行计划.md`（评审时为 v1.1）、`dev-docs/design/2026-11-24-RuleStudio需求文档.md`（评审时为 v1.1）
> 日期：2026-11-24
> 处理结果：执行计划修订为 v2，需求文档修订为 v1.2。逐条处理与实测校正见两份文档头部的修订记录；评审中与实测不一致之处按实测写入，并在修订记录中注明。

以下为评审意见原文，未做改动。

---

我看完了这份《Rule Studio 执行计划》。

**整体评价：方向正确，已经具备进入工程实施的基础。我建议保留现有 Phase 0～E 的阶段划分，不需要推翻重写。**

这版相比我们之前讨论的架构，有一个很重要的进步：不再只是描述系统应该有什么，而是明确了两个仓库的职责、代码同步机制、Agent 权限边界、规则修改事务和验收条件。

尤其认可这三个设计：

1. **Phase A：知识库领域层解耦。** 把 Validator 和 Compiler 改造成可以在内存中运行的纯函数，是后面 AI 提案和门禁的基础。
2. **Phase B：先只读。** 先验证 AI 能不能准确理解、搜索和引用规则，不急着开放修改权限。
3. **Phase C：提案式修改。** Agent 只能提出修改，策划审核 Diff 后才能应用，避免 AI 直接破坏规则知识库。

不过，我逐项检查后，发现有几处值得在正式执行前修订。其中有些是架构问题，不只是代码实现细节。

下面按照优先级评审。

## **一、P0：正式执行前必须修正的 4 个问题**

这四项是我认为最值得重视的。

### **1. Phase A：领域层还没有真正实现内存加载**

高优先级

执行计划 A-4 要求 Compiler 变成纯函数，C-4 又要求：

> 把提案变更集叠加到内存，重新加载规则集，然后执行 Validator 和 Compiler。

这个方向是对的，但目前缺少一个关键接口。

我检查了现有的 [compiler/validator.ts](https://github.com/mickorz/MahjongRuleKB/blob/mickorz/Mahjong-Rule-Studio/compiler/validator.ts?utm_source=chatgpt.com)。

现在的 `loadRuleset(dir)` 直接依赖：

- `node:fs`
- `node:path`
- 磁盘上的 Markdown 文件
- 磁盘上的 YAML 文件

而 A-4 只是把 Compiler 拆成内存编译函数，并没有明确提供如何把提案修改后的文件内容重新解析成 `LoadedRuleset`。

建议 Phase A 增加一个纯内存解析接口：

```
parseRuleset({
  kind: "variant",
  files: {
    "manifest.yaml": "...",
    "config.yaml": "...",
    "rules/xxx.md": "..."
  }
})
```

再把领域层拆成：

```
mahjong-kb/
├── schemas/
├── parser/
│   ├── markdown.ts
│   ├── yaml.ts
│   └── ruleset.ts
├── compiler/
│   ├── validator.ts
│   └── kernel.ts
└── cli/
    ├── validate.ts
    └── compile.ts
```

其中：

- Parser：解析内存中的文件内容。
- Validator：纯规则校验。
- Kernel：纯规则编译。
- CLI：负责磁盘读写。

**这样 Phase C 才能真正实现不落盘的预检查。**

另外，A-7 现在计划复制整个 `compiler/validator.ts`，但它包含文件系统加载和 CLI 代码，与 AD-3 的纯函数同步原则不完全一致。应该只同步纯领域代码。

### **2. Phase A：现有 Compiler 存在输入对象被修改的问题**

高优先级

我检查了现有 [compiler/compile.ts](https://github.com/mickorz/MahjongRuleKB/blob/mickorz/Mahjong-Rule-Studio/compiler/compile.ts?utm_source=chatgpt.com)。

发现一个需要特别注意的问题。

当前 `compileVariant()` 对输出规则做了浅拷贝：

```
out.push({ ...r, origin: "variant" });
```

但是后续又直接修改：

```
const meta = r.meta as RuleMeta;
meta.depends_on = meta.depends_on.map(
  (d) => allAliases[d] ?? d
);
```

问题在于：浅拷贝并没有复制 `meta` 对象。

因此，编译结果会反过来修改原始规则集中的 `meta.depends_on`。

更麻烦的是，现有 CLI 会依次编译多个变种，而这些变种共用同一个 `base` 对象。

可能发生这样的情况：

1. 编译萧山，杭州规则的依赖 ID 被重写。
2. 再编译桐庐，使用的已经不是原始杭州规则。
3. 编译结果受到前一个变种的影响。

这与我们希望实现的纯函数 Compiler 是冲突的。

建议 A-4 明确增加三个要求：

- Compiler 不得修改输入对象。
- 输出对象必须拥有独立的嵌套元数据。
- 同一规则集连续编译多次，结果必须一致。

A-9 增加三个测试：

| 测试    | 验收目标              |
| ----- | ----------------- |
| 输入不可变 | 编译前后输入深比较一致       |
| 重复编译  | 同一输入连续编译两次结果一致    |
| 多变种顺序 | 先编译萧山再桐庐，与反过来结果一致 |

这项我认为比单纯完成目录解耦更重要。

### **3. Phase C：事务恢复状态机需要调整**

高优先级

目前需求文档 10.3 的流程是：

```
创建事务目录
    ↓
状态 = prepared
    ↓
备份原文件
    ↓
写入修改
    ↓
重新门禁
    ↓
提交或回滚
```

这里有一个崩溃恢复漏洞。

假设：

- 事务状态已经是 `prepared`。
- 原本需要修改 5 个文件。
- 备份到第 2 个文件时，程序崩溃。

下次启动时发现 `prepared`，开始回滚。

但是另外 3 个文件还没有备份，无法保证完整恢复。

建议改为：

**1. preparing**

创建事务目录，记录文件清单，完成所有原始文件备份。

**2. prepared**

检查所有备份完整，Hash 一致，正式允许写入。

**3. writing**

开始逐文件写入。

**4. committed / rolled_back**

真实文件系统门禁通过则提交，否则恢复。

启动恢复策略：

| 状态              | 恢复动作              |
| --------------- | ----------------- |
| preparing       | 没有开始写规则文件，清理未完成事务 |
| prepared        | 恢复原文件             |
| writing         | 恢复原文件             |
| committed       | 保留结果              |
| rolled_back     | 保留记录              |
| recovery_failed | 保留现场并提示人工处理       |

还有一个细节：

Phase D 会增加创建规则卡、创建变种目录的操作。

因此事务必须记录：

```
{
  path: "rules/xxx.md",
  existedBefore: false
}
```

回滚时，如果原文件不存在，就删除本次新建的文件，而不是只恢复备份。

否则 Phase C 的事务系统无法安全承接 Phase D。

### **4. Phase B：必须明确限制 Mahjong Bot 的工具权限**

安全边界

这是我认为目前执行计划中最容易被忽略的地方。

计划已经明确：

> Agent 不允许直接修改知识库文件，只能生成 Proposal。

但 PiBot 本身有工作区、文件工具、命令执行等能力。

仅仅在 `brain-app/src/index.ts` 移除 computer-use、browser 等 Capability，并不等于麻将 Bot 自动失去了所有文件写入能力。

建议新增一个明确的工具白名单：

```
const mahjongBotTools = [
  "mahjong_list_rulesets",
  "mahjong_search_rules",
  "mahjong_read_rule",
  "mahjong_read_source",
  "mahjong_compare_rules",
  "mahjong_find_dependents",
  "mahjong_propose_change",
  "mahjong_proposal_read",
  "mahjong_proposal_validate",
  "mahjong_proposal_update",
];
```

具体名称按阶段启用。

麻将 Bot 不允许使用：

- 通用文件写入工具。
- Patch 工具。
- Shell / Bash。
- 通用工作区修改工具。

正式修改只能由 UI 按钮调用 `mahjong.proposals.apply`。

注意：Proposal JSON 可以由领域专用工具写入 `.rule-studio/`，这不等于 Agent 获得了修改正式规则文件的权限。

**AC-6 应该直接检查实际运行中的 Mahjong Bot 工具集合，而不只是检查 Mahjong Capability 注册了哪些工具。**

## **二、P1：建议补充的 5 项细节**

| 位置  | 问题                                  | 修改建议                                                                        |
| --- | ----------------------------------- | --------------------------------------------------------------------------- |
| A-3 | 没有明确检查 config/config.ui 的 ID 前缀     | 按 manifest 的 `id_prefix` 校验规则、配置、UI 配置和未决 ID                                |
| A-3 | 可选文件解析异常被吞掉                         | 现有 validator 对 config.ui.yaml、unresolved.yaml 使用宽泛 catch，应只忽略文件不存在，不能忽略解析错误 |
| B-4 | 外部编辑器修改后索引可能过期                      | 增加文件变化监听或手动刷新入口                                                             |
| B-9 | FilePreviewPane 是否支持打开知识库外部目录文件尚未验证 | 增加 Spike，不能假设原预览组件可以直接使用                                                    |
| E-2 | Gold Set 执行会运行知识库目录里的 npm test 脚本   | 默认关闭，首次执行明确授权，显示执行目录、命令和超时设置                                                |

最后一项尤其值得注意。

用户选择的知识库目录属于外部工作区。运行其中的 `npm test`，实际上是在执行该目录的代码。

建议 G5：

- 只能由用户主动触发。
- 首次执行必须确认。
- 使用固定命令，不允许 Agent 拼接命令。
- 有超时、取消和输出记录。
- 不授予 Agent 通用 Shell 权限。

这不影响 Phase C 的核心功能，可以放在 Phase E 处理。

## **三、Phase 0 环境方面有一个小修正**

我核对了 PiBot 当前上游：

**PiBot main**

Commit 一致

[152425febf89487f6494e002122646fdd3bb041a](https://github.com/w01fb0ss/PiBot/commit/152425febf89487f6494e002122646fdd3bb041a?utm_source=chatgpt.com)

执行计划使用的上游基线是正确的，目前 `main` 仍然指向这个提交。

不过环境要求可以再精确一点：

| 项目           | 当前情况                            |
| ------------ | ------------------------------- |
| Node         | `.nvmrc` 指定 26.11.1             |
| Node engines | 实际允许 22.12.0、24.0.0 及 26.0.0 以上 |
| pnpm         | `package.json` 固定 12.14.0       |

参考 [PiBot package.json](https://github.com/w01fb0ss/PiBot/blob/main/package.json?utm_source=chatgpt.com)。

因此，你目前的 Node 24.18.0 并不是不兼容，只是没有使用上游 `.nvmrc` 指定的版本。

我的建议是：为了减少环境差异，正式开发还是使用 26.11.1，pnpm 直接固定 12.14.0：

```
corepack enable
corepack prepare pnpm@12.14.0 --activate
```

## **四、我建议保留的原有设计**

下面这些内容我不建议再折腾。

| 设计                 | 我的判断 |
| ------------------ | ---- |
| PiBot 作为 submodule | 保留   |
| PiBot Fork 独立开发分支  | 保留   |
| KB 作为唯一事实源         | 保留   |
| 领域代码同步复制           | 保留   |
| 内存门禁               | 保留   |
| Proposal JSON 文件存储 | 保留   |
| UI 人工审批            | 保留   |
| Hash + 事务回滚        | 保留   |
| Gold Set 第二阶段接入    | 保留   |
| 不做多人协作             | 保留   |
| 不做独立 Web Dashboard | 保留   |

另外，Zod 4 迁移可以按照 S-7 的时间盒先做验证，不要在迁移出现行为差异时强行推进。由于 `mahjong-kb` 是独立包，也可以评估让它暂时使用 Zod 3，而 PiBot 的 RPC 契约使用 Zod 4，避免为了依赖对齐扩大迁移范围。

## **五、第一阶段范围是否合理？**

这里有一个产品层面的取舍值得明确。

**第一阶段：Phase 0 + A + B + C**

形成可用产品

- 杭州规则浏览。
- 杭州规则问答。
- 杭州规则引用。
- 通过聊天修改一张杭州规则卡。
- Diff 审核。
- 门禁验证。
- 人工应用。
- 失败回滚。

**第二阶段：Phase D + E**

- 新建萧山、桐庐等变种。
- 继承与差异管理。
- 底座影响分析。
- 未决项裁决。
- Gold Set。
- 审计历史。

我认为这个拆分合理。

第一阶段先证明：

**AI 能够安全、准确地修改一张已经存在的规则卡。**

这个能力跑通后，新增变种实际上是复用同一套 Proposal、Diff、Gate、Apply 机制，扩展规则集管理能力。

没必要一开始就把所有地方麻将的管理功能都做完。

## **六、最终修改建议清单**

我建议你不要推翻现有文档，而是在 v1 上做一次小幅修订。

**Rule Studio 执行计划 v2 修订清单**

0/8 项完成

0%

A-3/A-4

增加纯内存 Parser，明确文件系统 Loader 与领域 Validator 的边界

A-4/A-9

修复 Compiler 输入对象变异，增加重复编译与多变种顺序测试

A-3

增加 config、config.ui、unresolved 的前缀校验和解析错误测试

A-7

只同步纯领域模块，不同步带 CLI 的 validator 文件

B-7

增加 Mahjong Bot 精确工具白名单和实际运行时权限测试

B-9

验证外部知识库文件能否复用 PiBot 预览组件

C-5

完善 preparing/prepared/writing 事务状态机和新文件回滚

E-2

Gold Set 执行增加明确授权和安全限制

**最终结论：这份执行计划可以作为正式开发基线，但建议先修订上述问题，再开始 Phase 0。**

尤其是 Parser 内存化、Compiler 不可变性、事务恢复，这三个问题直接决定后面整个规则修改闭环是否可靠。

我建议下一步直接把这些评审意见整理进原来的 `2026-11-24-RuleStudio执行计划.md`，形成 v2，不再另起一套架构文档。 先根据评审修改
