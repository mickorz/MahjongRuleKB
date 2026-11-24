# Rule Studio 执行计划 第二轮评审意见

> 评审对象：`dev-docs/planning/2026-11-24-RuleStudio执行计划.md`
> 日期：2026-11-24
> 说明：评审者读取的是 GitHub 远程分支（当时停在 `3f9136d`，文档为 v1.1）；本地分支当时已是 v2.1（`402572e`，尚未推送）。逐条核对与处理见执行计划头部的「第二轮评审逐条核对」表，处理结果为执行计划 v2.2、需求文档 v1.4。

以下为评审意见原文，未做改动。

---

安装完环境后，我重新读取了 GitHub 上最新的文件，并对照了当前分支的实际代码。

这次的结论是：Phase 0.1 已经完成，但执行计划还没有吸收上一轮评审中的关键架构修改。

目前文档版本是 v1.1，修订记录只有：
- v1：初稿。
- v1.1：完成 main 合并，提交 ab76048。
整体阶段划分没有问题，但我不建议现在直接进入 Phase A。上一轮提出的三个核心工程问题仍然存在，而且我又发现了几个计划内部不一致的地方。
一、上一轮四项 P0 的落实情况
评审问题    当前文档情况    结论
内存 Parser    C-4 提到了路径到内容映射，但 A 阶段没有实现对应接口    未解决
Compiler 输入不可变    A-4 没有明确不可变约束，A-9 没有相应测试    未解决
事务崩溃恢复    仍然只有 prepared 状态    未解决
Agent 工具白名单    有只读约束，但没有明确完整工具集合的运行时验证    部分解决

这里不是文字表述问题，而是会直接影响后续代码实现。

尤其是事务恢复和内存 Parser，我认为必须在 Phase A、C 开始前解决。
二、发现一个比之前更重要的问题：开发分支已经落后 main
新增 P0
我额外检查了 GitHub 两个分支的提交关系，结果：
main 与 Rule Studio 分支
Rule Studio 独有提交

5 个

落后 main

3 个提交

共同基线

23e9dff

两个分支已经分叉

这三个 main 新提交分别涉及：
1. Phase 2.6 未决状态继承修复。
2. Phase 3 + Phase 4：Gold Set、计算函数、结构测试、AGENTS.md。
3. Phase 3 审查问题修复，测试达到 80 个。
可以看这里：
- 最新 main 提交
- Gold Set 和 AGENTS.md
最关键的是：

我检查了 AGENTS.md：
- main 已经有这个文件。
- Rule Studio 分支目前没有这个文件。
但你的 Phase A-6 明确要求使用 KB 的 AGENTS.md 作为 Studio Skill 的唯一内容来源。

这意味着现在存在三个不一致：
项目    执行计划    main 现状    Rule Studio 分支
测试数量    31 个    80 个    尚未同步
Gold Set    Phase E 再接入    已完成基础建设    尚未同步
AGENTS.md    Phase A 创建    已存在    不存在

我的建议
在正式进入 Phase A 之前，先把最新 main 合并进 Rule Studio 分支。

但不要直接盲目合并，先确认三项：
- 保留 Rule Studio 已有的 5 个独立提交。
- 引入 main 的三个提交。
- 检查编译器、Schema、Gold Set 与执行计划的兼容性。
合并后更新 Phase A 的测试基线，避免继续用 31 个测试作为验收标准。

三、Phase A 还有三个明确的架构问题
1. A-3、A-4、C-4 的内存加载设计仍然不闭环
目前计划写的是：
- A-3：loadRuleset(dir, kind)。
- A-4：Kernel 接收 LoadedRuleset。
- C-4：通过路径到内容的映射叠加提案，再重新加载规则集。

问题是，loadRuleset(dir, kind) 本身仍然是磁盘加载。

Kernel 接收 LoadedRuleset，也不代表它能够把尚未落盘的 Markdown 和 YAML 解析成 LoadedRuleset。

我建议明确增加一个接口：
interface RulesetFileSet {
  kind: "base" | "variant";
  files: Map<string, string>;
}

function parseRuleset(
  input: RulesetFileSet
): LoadedRuleset;

function loadRulesetFromDisk(
  dir: string,
  kind: "base" | "variant"
): LoadedRuleset;


然后统一成：
磁盘文件
   │
   ▼
loadRulesetFromDisk
   │
   ▼
parseRuleset
   │
   ▼
LoadedRuleset
   │
   ├── Validator
   │
   └── Compiler Kernel

Proposal
   │
   ▼
内存文件映射
   │
   ▼
parseRuleset
   │
   ▼
Validator + Compiler Kernel


这样磁盘加载和内存加载共享同一套解析逻辑。

另外，A-3 的前缀校验还应明确覆盖：
- rules
- config
- config.ui
- unresolved
不能只检查规则卡。

还有一个实际代码问题：当前 loadRuleset() 对 config.ui.yaml 使用宽泛的 catch，文件格式错误也会被当成可选文件处理。应当只忽略文件不存在，解析错误必须暴露。
2. A-7 同步脚本和 A-3 存在直接冲突
当前 A-3 说：
CLI 部分保留在 validator.ts 底部。

但 A-7 又说：
把 compiler/validator.ts 复制到 PiBot。

这意味着同步过去的文件仍然包含：
- node:fs
- node:path
- 磁盘加载
- CLI 入口
这和「只同步纯领域代码」的约束不一致。

建议拆分：
compiler/
├── parser.ts
├── validator.ts       # 纯校验
├── kernel.ts          # 纯编译
├── load.ts            # 磁盘加载
└── cli/
    ├── validate.ts
    └── compile.ts


同步脚本只复制：
schemas/
compiler/parser.ts
compiler/validator.ts
compiler/kernel.ts


不要同步磁盘 Loader 和 CLI。
3. A-4 必须增加输入不可变测试
我重新检查了当前 compiler/compile.ts。

目前的代码：
out.push({ ...r, origin: "variant" });


之后：
for (const r of out) {
  const meta = r.meta as RuleMeta;
  meta.depends_on = meta.depends_on.map(
    (d) => allAliases[d] ?? d
  );
}


这里的浅拷贝没有复制 meta 对象。

因此编译器仍然可能修改原始规则集的元数据。

建议增加三个硬性测试：
1. 输入对象编译前后深比较完全一致。
2. 相同输入连续编译两次，输出一致。
3. 多个变种以不同顺序编译，输出不受前一次编译影响。
这部分应该作为 A-9 的验收，而不是后续优化。
四、Phase C：事务设计仍然存在崩溃恢复漏洞
这是另一个必须修复的 P0。

当前需求文档 10.3 的顺序：
创建事务目录
    ↓
状态 = prepared
    ↓
备份原文件
    ↓
写入变更
    ↓
重新门禁
    ↓
提交 / 回滚


问题是：如果备份 5 个文件时，备份到第 2 个就崩溃，下次启动仍然会按照 prepared 回滚。

但另外 3 个文件没有备份，无法保证恢复。

建议改成：
preparing
    ↓
完成全部备份
    ↓
检查备份完整性与 Hash
    ↓
prepared
    ↓
writing
    ↓
真实文件系统门禁
    ├── 通过 → committed
    └── 失败 → rolled_back


还需要补充两个要求：

第一，新建文件必须支持回滚删除。

事务清单增加：
{
  path: "rules/xxx.md",
  existedBefore: false,
  originalHash: null,
  newHash: "..."
}


如果应用失败，删除这次创建的文件。

第二，调整 Hash 校验与写入锁顺序。

目前流程是先校验 Hash，再获取写入锁，中间存在外部编辑造成的竞争窗口。

建议先获取应用内部写入锁，再校验 Hash、备份，写入前再次检查原文件状态。

C-11 还要增加：
- 备份过程中崩溃。
- 写入过程中崩溃。
- 恢复时原始文件备份缺失。
- 新建文件回滚。
- 回滚失败后的 recovery_failed。

五、另外五项 P1 修改
这些不需要推翻架构，但应该在对应阶段开始前补充。
位置    问题    建议
A-1 / AC-2    ID 前缀允许 2～4 位，但验收写任意两字母    统一约束，增加不同长度测试
A-5    Zod 4 被列为必做，但 S-7 又允许不迁移    改为条件性迁移，先做 Spike
B-9    假设 FilePreviewPane 能预览 KB 外部目录    增加独立 Spike 验证
C-3    同会话草稿自动更新，可能覆盖同会话其他提案    更新必须指定 proposalId，否则创建新提案
E-2    Gold Set 默认自动执行，可能执行外部工作区的 npm 脚本    默认关闭，首次执行需要用户明确授权

特别说一下 E-2
这项容易被低估。

npm test 并不只是运行测试，它实际上会执行知识库目录 package.json 中定义的脚本。

而用户可以选择任意知识库工作区。

因此建议：
1. 第一次运行 Gold Set 时明确授权。
2. 默认不自动执行。
3. 用户可以主动开启「应用后自动运行 Gold Set」。
4. Agent 不能直接触发宿主 Shell。
5. 使用固定命令参数、明确工作目录、超时和取消机制，禁止 Shell 字符串拼接。
这不影响整体架构，只是把执行权限放在正确的位置。
B-9 的 Spike
目前 S-8 只验证了 Side Pane 和虚拟 Diff。

但你还没有验证：

FilePreviewPane 能否打开 PiBot 自己工作区之外的 MahjongRuleKB 文件。

这可能直接影响规则浏览功能的实现。

建议新增 S-9：
- 外部目录 Markdown 能否读取。
- 是否支持绝对路径。
- 是否能安全限制在 KB 根目录。
- 能否复用现有 Markdown 预览。
- 不支持时采用独立只读 Markdown 预览组件。

六、我建议的 v1.2 修改清单
不需要重新设计 Rule Studio。只需要对原执行计划进行以下修改。
优先修订的 8 项
修订进度

0/8



[ ] P0
分支同步

处理 main 落后的 3 个提交，统一 80 个测试与 AGENTS.md 基线

[ ] P0
内存 Parser

新增路径到内容的解析接口，打通 C-4

[ ] P0
领域层拆分

将 validator 的 CLI、磁盘 Loader 与纯校验逻辑分离

[ ] P0
Compiler 不可变

修复嵌套对象变异，增加重复编译测试

[ ] P0
事务状态机

增加 preparing、writing、recovery_failed 和新文件回滚

[ ] P0
工具权限

明确麻将 Bot 完整工具白名单，验证运行时实际工具集合

[ ] P1
提案管理

通过 proposalId 明确更新对象，支持同会话多个提案

[ ] P1
执行安全

补充 FilePreviewPane Spike 和 Gold Set 执行授权


七、最终评审结论
有条件通过
Rule Studio 总体架构不需要推翻，主要问题集中在领域层和事务实现细节。

可以继续
- Phase 0 环境验证
- PiBot Fork 与 submodule 接入
- 桌面应用改名和 Capability Spike
暂缓进入
- Phase A 正式开发
- Phase C 事务实现
进入 Phase A 的前置条件
1. 处理 main 分支同步。
2. 确定纯内存 Parser 接口。
3. 明确领域代码同步边界。
4. 把 Compiler 不可变性纳入验收。

我的整体判断是：

Rule Studio 最重要的技术资产不是聊天界面，也不是 AI 能生成规则卡，而是把现有 MahjongRuleKB 变成一个可以被 Agent 安全调用的规则引擎。

只要 Parser、Validator、Compiler、Proposal、Transaction 这条链路足够可靠，PiBot 只是交互宿主。未来即使换成其他 Agent，也不需要重做规则引擎。

所以我建议这次 v1.2 重点收敛工程边界，不要继续增加产品功能。完成这轮修订，就可以正式进入开发了。 根据这个修改执行计划
