// 同步主需求文档与进度文档（v1.1 定稿补充，2026-11-24）
import fs from "node:fs";

const mainDoc = "dev-docs/design/2026-11-24-RuleStudio需求文档.md";
let s = fs.readFileSync(mainDoc, "utf8");
const re = /(\| v1\.6 \| 2026-11-24 \|[^\n]*\n)/;
if (!re.test(s)) throw new Error("v1.6 行未匹配");
s = s.replace(
  re,
  "$1| v1.7 | 2026-11-24 | 需求覆盖与补齐的定位与优先级确定（细节在增补文档）：规则结构化是基础设施、需求覆盖是质量保障，两者不是并列开发线路；新增 AD-14（规则原子与需求原子分离）与 I-21（需求必须从原文独立提取，不得从规则卡反推）；优先级 P0 保持现有结构化 → P1-P3 原子需求与覆盖分析 → P4-P5 补齐建议与提案；第一阶段范围收窄为原文 `2.3.3 算分规则` 单章节实验 |\n",
);
fs.writeFileSync(mainDoc, s);

const progress = "dev-docs/progress/执行进度.md";
let t = fs.readFileSync(progress, "utf8");
const anchor = "交付：`dev-docs/design/2026-11-24-RuleStudio需求覆盖与补齐.md`";
if (!t.includes(anchor)) throw new Error("进度 anchor 未匹配");
const extra = [
  "定稿补充（同日 v1.1）：规则原子（A 线，已有）与需求原子（B 线，新增）不是两条开发线路，",
  "而是同一份原文的两条支线，在覆盖分析处汇合；**B 线必须独立从 `sources/` 提取需求，不得从规则卡反推**",
  "（否则漏项永远查不出，记为 I-21）；新增 AD-14（两种原子分离、ID 独立、多对多映射）；",
  "优先级 P0 保持现有结构化 → P1-P3 原子需求与六态覆盖 → P4-P5 补齐建议与提案；",
  "第一阶段范围从「杭州全文 550 行」收窄为原文 `2.3.3 算分规则`（6 行表格）单章节完整实验，",
  "人工核对无系统性偏差后再扩。",
  "",
  "交付：`dev-docs/design/2026-11-24-RuleStudio需求覆盖与补齐.md`（v1.1）",
].join("\n");
t = t.replace(anchor, extra);
fs.writeFileSync(progress, t);
console.log("主文档 v1.7 与进度文档已更新");
