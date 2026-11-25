// 修订清单 v2 第三批：标题项数、B-5 补 I-49、E-1 编号表、G 自检（2026-11-24）
import fs from "node:fs";

const f = "dev-docs/planning/2026-11-24-需求全文生成v1.3修订清单.md";
let s = fs.readFileSync(f, "utf8");
const rep = (from, to) => {
  if (!s.includes(from)) throw new Error(`未匹配：${from.slice(0, 50)}`);
  s = s.split(from).join(to);
};

rep("## A. 内部冲突修正（P0，共 4 项）", "## A. 内部冲突修正（P0，共 5 项）");

// B-5 补 I-49
rep(
  "③ 扩展 **AD-36** 为「五文件角色与主从」，写明「`editorial-overrides.yaml` 是人工表达修改的**权威输入**，不是派生数据，不得被重建覆盖」",
  "③ 扩展 **AD-36** 为「五文件角色与主从」，写明「`editorial-overrides.yaml` 是人工表达修改的**权威输入**，不是派生数据，不得被重建覆盖」；④ 新增 **I-49** 把该条上升为硬约束",
);

// E-1 表：替换整表为扩展版
const eHead = "| 类型 | 编号 | 内容 |";
const eStart = s.indexOf(eHead);
if (eStart < 0) throw new Error("E-1 表头未匹配");
const eEnd = s.indexOf("### E-2 连带修改");
if (eEnd < 0) throw new Error("E-2 标题未匹配");
const E1 = `| 类型 | 编号 | 内容 |
| --- | --- | --- |
| I-42 | 阻塞状态须记录 \`release_blocker_refs\` | B-1 |
| I-43 | 多来源 / 多状态必须拆 segment | B-2 |
| I-44 | \`documents/\` 纳入白名单与事务，不得写 \`sources/\` \`compiled/\` | B-4 |
| I-45 | 文档提案与规则提案共用同一存储与状态机 | B-4 / B-6 |
| I-46 | 重生成匹配失败的人工修改只能进「失效待处理」 | B-3 |
| I-47 | P0-A 产物不得宣称含差异标注 | D-4 |
| I-48 | 不得用「登记到待处理清单」代替覆盖；落点与完整覆盖分开统计 | C-4 |
| I-49 | \`editorial-overrides.yaml\` 是人工表达修改的权威输入，任何重建不得覆盖 | B-5 |
| FR-51 | 片段级四类引用必填（可为空数组） | B-2 |
| FR-52 | 重生成输出块级 / 片段级匹配报告（含 split / merge 关联） | B-3 |
| FR-53 | 重新生成的结构 / 规则事实 / 数值校验口径 | C-3 |
| FR-54 | P0-A 输出不含差异标注 | D-4 |
| FR-55 | \`editorial-overrides\` 支持 \`segment_id\` 级替换 | D-1 |
| FR-56 | \`input-manifest\` 记录 5 项新增可复现字段 | D-3 |
| FR-57 | 覆盖报告分别输出 \`requirement_landed\` 与 \`requirement_complete\` | C-4 |
| FR-58 | 文档提案契约字段与双校验 | B-6 |
| AD-34 | ID 生命周期、持久化身份映射与匹配策略 | B-3 |
| AD-35 | 提案存储单一化（\`.rule-studio/proposals/\`，\`type: document\`） | B-4 |
| AD-36 | 五文件角色与主从（含 \`editorial-overrides\` 为权威输入） | B-5 / D-2 |
| AD-37 | P0-A 不做差异引擎 | D-4 |
| **AD-38** | **文档提案数据契约（版本基线 + 文件 Hash 双校验，复用既有状态机与事务）** | **B-6** |
| AC-46 | 阻塞来源可追溯 | B-1 |
| AC-47 | ID 与人工修改在重生成后可对上（含拆分 / 合并关联） | B-3 |
| AC-48 | P0-A 无差异标注：\`lineage\` 全为 \`base\`、\`diff_status\` 全为 \`not_applicable\` | D-4 / D-5 |
| AC-49 | 提案存储单一（\`documents/*/proposals\` 不存在） | B-4 |
| AC-50 | 片段级四类引用齐全 | B-2 |
| AC-51 | 重生成口径与 FR-37 / FR-53 一致 | C-3 |
| AC-52 | 六态落点齐全，且部分覆盖 / 提取缺失不计入「已完整覆盖」 | C-4 |
| AC-53 | 文档提案双校验：版本失配与 Hash 失配各自被拒绝 | B-6 |

> 编号说明：第 3 轮评审建议把范围收敛为 AD-34 至 AD-37。本轮改为**把 AD-38 定义为「文档提案数据契约」**（即评审第 6 点），这样编号范围 \`AD-34 至 AD-38\` 自洽，也避免契约只写在 B 组正文而没有对应架构决策条目。

`;
s = s.slice(0, eStart) + E1 + s.slice(eEnd);

// G 自检清单整块替换
const gStart = s.indexOf("## G. 改完自检清单");
if (gStart < 0) throw new Error("G 标题未匹配");
const G = `## G. 改完自检清单

\`\`\`text
□ grep -n "source_refs"                  → 0（含 6.2 标题；不得以「废弃说明」保留）
□ grep -n "remove"                       → 仅 3.3 / I-37 / AC-45 的否定句
□ grep -n "五种标记"                     → 仅 3.2 映射说明与修订记录；Stage 4 应为「三维状态判定」
□ grep -n "AD-22"                        → 含「已废弃」
□ grep -n "release_blocker_refs"         → ≥ 4
□ grep -n "lineage"                      → 取值含 base / explicit_inherited / default_inherited / modified / added
□ grep -n "not_applicable"               → 6.4 取值表与 AC-48 均命中
□ grep -n "identity-map"                 → 6.8 命中
□ grep -n "segment_lineage"              → 6.8 命中，且写明 split / merge 两类关系
□ grep -n "requirement_complete"         → FR-57 与 AC-52 均命中
□ grep -n "documents/<variant>/proposals" → 0
□ grep -n "workflow/<taskId>"            → 命中，且不含 需求全文.md
□ grep -n "权威输入"                     → B-5 表与 I-49 均命中
□ grep -n "basedOnDocumentHash"          → B-6 契约与 AC-53 命中
□ grep -n "XS-C-CAISHEN"                 → AC-28 命中
□ grep -n "segment_id"                   → 示例、override、FR-47 / FR-55 均命中
□ 编号连续性                             → I-42~50、FR-51~58、AD-34~38、AC-46~53 无缺号无重复
□ 章节号未错位                           → 一至十八完整、无跳号
□ 与第 2 轮结论无退化                    → 共用模板 / 三维 / 四类引用 / block_id 解耦 / 版本校验 / P0-A·P0-B 拆分均在
\`\`\`

`;
s = s.slice(0, gStart) + G;
fs.writeFileSync(f, s);
console.log("E-1 编号表与 G 自检已更新（v2 完成）");
