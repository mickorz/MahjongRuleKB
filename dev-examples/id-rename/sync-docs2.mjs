// 同步主需求文档与进度文档：新增「需求全文生成与变体差异标注」能力（2026-11-24）
import fs from "node:fs";

const mainDoc = "dev-docs/design/2026-11-24-RuleStudio需求文档.md";
let s = fs.readFileSync(mainDoc, "utf8");

const re = /(\| v1\.7 \| 2026-11-24 \|[^\n]*\n)/;
if (!re.test(s)) throw new Error("v1.7 行未匹配");
s = s.replace(
  re,
  "$1| v1.8 | 2026-11-24 | 新增第二个核心能力「需求全文生成与变体差异标注」，独立文档 `dev-docs/design/2026-11-24-需求全文生成与变体差异标注.md`（FR-29 至 FR-37、I-22 至 I-28、AD-15 至 AD-20、AC-24 至 AC-31）：复用编译器得有效规则集，按对局流程分章生成完整需求全文，派生变体带五种来源标记与段落级差异；需求覆盖与补齐是其上游质量门 |\n",
);

const frAnchor = "| FR-21 至 FR-28 | 需求覆盖与补齐 | 原子需求拆解、六态覆盖判定、缺口六要素、按目标文件分组、补齐转提案 | MUST | MVP |";
if (!s.includes(frAnchor)) throw new Error("FR 指引行未匹配");
s = s.replace(
  frAnchor,
  frAnchor +
    "\n| FR-29 至 FR-37 | 需求全文生成与变体差异标注 | 按对局流程生成完整需求全文、五种来源标记、段落级差异、逐 Stage 落盘与增量重跑 | SHOULD | 第二阶段 |",
);
fs.writeFileSync(mainDoc, s);

const progress = "dev-docs/progress/执行进度.md";
let t = fs.readFileSync(progress, "utf8");
const anchor = "### 规则命名规范化（2026-11-24）";
if (!t.includes(anchor)) throw new Error("进度 anchor 未匹配");
const block = [
  "### Rule Studio 需求全文生成与变体差异标注（2026-11-24，设计文档待评审）",
  "",
  "第二个核心能力：不是把 Markdown 卡拼起来，而是「结构化规则 → 完整需求文档」的生成引擎。",
  "",
  "- 复用既有 Compiler 得有效规则集（萧山 86 条），不重写继承机制、不改编译器",
  "- 两种能力：完整需求全文（按对局流程分章）/ 全文差异标注（五种标记：基座沿用、变体修改、变体新增、默认继承、待裁决）；明确继承与默认继承分开",
  "- 四个缺口：① 卡没有文档章节顺序（需独立章节映射层）② 差异只到卡级，需段落级 `changes.json`（`XS-R-ZHUANGJIA-02` 与 `HJ-R-LUNZHUANG` 为例）③ 配置差异元数据在编译后丢失（实测 `XS-C-QIANGGANGHU`：源有 `change_type: modified`，产物只剩 `origin: base`，故需三方比对，不改编译器）④ 未决项不得伪装成完整（3 条 blocker + 2 张卡 + 1 条配置）",
  "- Stage 0-6 逐阶段落盘，支持增量重跑；数值与公式由确定性模板渲染，AI 只组织自然语言",
  "- 三个正式产物：`需求全文.md`、`provenance.json`、`changes.json`；全文是产出物**不是事实源**（I-24）",
  "- 上游质量门：需求覆盖与补齐（覆盖未完成不得宣称全文完整）",
  "- 范围提醒：策划给的格式模板含 2/3/4 人与 40/50/60 片，与本仓库四人好友房范围不同，只能当格式模板",
  "",
  "交付：`dev-docs/design/2026-11-24-需求全文生成与变体差异标注.md`（FR-29 至 FR-37、I-22 至 I-28、AD-15 至 AD-20、AC-24 至 AC-31）；主需求文档升 v1.8。",
  "",
  "",
].join("\n");
t = t.replace(anchor, block + anchor);
fs.writeFileSync(progress, t);
console.log("主文档 v1.8 与进度文档已更新");
