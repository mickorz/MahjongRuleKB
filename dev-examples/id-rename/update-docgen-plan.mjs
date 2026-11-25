// 按新目录结构更新需求全文生成执行计划（2026-11-24）
import fs from "node:fs";

const f = "dev-docs/planning/2026-11-24-需求全文生成执行计划.md";
let s = fs.readFileSync(f, "utf8");
const must = (a, b) => {
  if (!s.includes(a)) throw new Error(`未匹配：${a.slice(0, 60)}`);
  s = s.split(a).join(b);
};

// 1) 头部补「目录基线」
must(
  "> Change Manager 方法论评审：",
  "> 目录基线：`dev-docs/planning/2026-11-24-目录重新规划与重构执行计划.md`（P1-A/B/C、P2、P3 已完成，规则资产在 `rulebook/` 下）\n> Change Manager 方法论评审：",
);

// 2) 现状表补 rulebook 路径说明
must(
  "| 杭州规则集 | 61 张规则卡、20 项玩法配置、5 项界面配置 | Stage 1 输入 |",
  "| 目录基线 | `rulebook/{sources,specs/base/hangzhou,specs/variants/xiaoshan,compiled,changes/archive}`；路径常量集中在 `compiler/paths.ts` | 本计划所有输入输出路径以该结构为准 |\n| 杭州规则集（1.2.0） | 61 张规则卡、20 项玩法配置、5 项界面配置 | Stage 1 输入 |",
);
must(
  "| 萧山规则集 | 47 张差异卡；编译后 86 条有效规则 | P1 Stage 1 输入 |",
  "| 萧山规则集（0.3.0，base 1.2.0） | 47 张差异卡；编译后 86 条有效规则 | P1 Stage 1 输入 |",
);
must(
  "| 计算器 | `calculators/` 4 个文件、6 个导出函数 | 生成计算案例的确定性数据来源 |",
  "| 计算器 | `calculators/` 4 个文件、6 个导出函数 | 生成计算案例的确定性数据来源 |\n| 编译入口 | `node compiler/compile.ts` → `rulebook/compiled/`；`validator.ts` 支持 `--kind base|variant` | Stage 1 复用，不重新实现继承 |",
);

// 3) 数据产物章节：明确与 rulebook 的边界
must(
  "`changes.json` 不在 P0-A 生成；P1 正式实现差异引擎后，作为可重建差异索引生成。",
  `\`changes.json\` 不在 P0-A 生成；P1 正式实现差异引擎后，作为可重建差异索引生成。

**与 \`rulebook/\` 的边界（依目录重构结论）**：

| 数据 | 位置 | 入库 | 说明 |
| --- | --- | --- | --- |
| 规则 / 配置事实 | \`rulebook/specs/\` | 是 | 唯一事实源 |
| 原始证据 | \`rulebook/sources/\` | 是 | 只读 |
| 编译产物 | \`rulebook/compiled/\` | 是 | 禁手改 |
| 已归档 Change 全量包 | \`rulebook/changes/archive/<date>-<id>/\` | 是 | 审计留痕，Archive 单向导出 |
| 活动 Change / Proposal / Transaction / Stage 中间产物 | \`<kb>/.rule-studio/\` | 否（\`.gitignore\` 已收口） | 运行时数据 |
| 文档产物（\`document.json\` 等） | \`documents/<variant>/\` | 待定（P0-A 决定） | 需纳入 CLI 白名单与事务边界 |`,
);

// 4) 操作与目标文件映射：修正残留的旧路径
must(
  "| 规则事实修改 | 结构化规则 | `rulesets/` / `rulebook/specs/variants/` / manifest / config，由规则提案处理 |",
  "| 规则事实修改 | 结构化规则 | `rulebook/specs/base/hangzhou/` / `rulebook/specs/variants/<玩法>/` / manifest / config，由规则提案处理 |",
);

// 5) 验收命令补 --kind 与新路径
must(
  "node compiler/validator.ts rulebook/specs/variants/xiaoshan",
  "node compiler/validator.ts rulebook/specs/base/hangzhou --kind base\nnode compiler/validator.ts rulebook/specs/variants/xiaoshan --kind variant",
);

// 6) 风险表补目录耦合风险
must(
  "| 目录边界不清 | `.rule-studio` 统一运行数据与提案；`documents` 明确白名单 | 出现第二套 Proposal 或绕过事务写入 |",
  "| 目录边界不清 | `.rule-studio` 统一运行数据与提案；`documents` 明确白名单 | 出现第二套 Proposal 或绕过事务写入 |\n| 路径再次扩散 | 根路径只在 `compiler/paths.ts` 定义，`tests/compiler/paths.test.ts` 强制 | 代码或测试里重新出现 `rulesets/`、`variants/`、`compiled/` 字面量 |\n| 规则集类型靠路径猜 | 已改为显式 `kind`（P1-A），新增规则集必须显式传 kind | 再次出现 `dir.startsWith(\"variants\")` 类判断 |",
);

// 7) 文档交付补目录计划联动
must(
  "5. 不把 `documents/` 运行数据误提交为规则事实；按 `.gitignore` 和发布策略处理。",
  "5. 不把 `documents/` 运行数据误提交为规则事实；按 `.gitignore` 和发布策略处理。\n6. 任何阶段若改动规则资产目录结构，先更新 `2026-11-24-目录重新规划与重构执行计划.md` 并完成对应迁移，再回到本计划。",
);

fs.writeFileSync(f, s);
console.log("需求全文生成执行计划已按新目录更新");
