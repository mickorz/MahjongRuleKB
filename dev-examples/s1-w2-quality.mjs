// 一次性补丁：run-w2 产出 quality-report.json（变体文档此前没有机器检查结论）
import { readFileSync, writeFileSync } from "node:fs";

const path = "studio/pipeline/run-w2.ts";
let s = readFileSync(path, "utf8").replace(/\r\n/g, "\n");

// 1) 引入报告构造
const importAnchor = 'import { checkVariantDiffs, type CardView } from "./diff-checks.ts";';
if (!s.includes(importAnchor)) throw new Error("diff-checks 导入锚点未找到");
s = s.replace(
  importAnchor,
  `${importAnchor}\nimport { statusOfFindings, type MachineCheckFinding } from "../contracts/machine-check.ts";`,
);

// 2) 在 reasons 计算之后、产物写出之前，构造质量报告
const reasonAnchor = `  const changes = buildChangesFile(`;
if (!s.includes(reasonAnchor)) throw new Error("buildChangesFile 锚点未找到");

const reportBlock = `  // 变体的机器检查结论：继承一致性失败 → failed；其余差异告警为 warning
  const findings: MachineCheckFinding[] = [
    ...integrityProblems.map((p) => ({
      code: "inherit.text-drift" as const,
      severity: "failed" as const,
      message: p,
      segment_ids: [] as string[],
      rule_refs: [] as string[],
    })),
    ...diffReport.findings,
  ];
  const qualityStatus = statusOfFindings(findings);
  const qualityReport = {
    ruleset_id: vm.ruleset_id,
    target_variant: "xiaoshan",
    document_version: assembled.document.document_version,
    checked_at: new Date().toISOString(),
    status: qualityStatus,
    findings,
    summary: {
      total: findings.length,
      failed: findings.filter((f) => f.severity === "failed").length,
      warning: findings.filter((f) => f.severity === "warning").length,
    },
  };

${reasonAnchor}`;

s = s.replace(reasonAnchor, reportBlock);

// 3) 产物清单加 quality-report.json
const artifactAnchor = `    ["diff-warnings.json", \`\${JSON.stringify({ findings: diffReport.findings, byRule: diffReport.byRule }, null, 2)}\\n\`],`;
if (!s.includes(artifactAnchor)) throw new Error("diff-warnings 产物锚点未找到");
s = s.replace(
  artifactAnchor,
  `${artifactAnchor}\n    ["quality-report.json", \`\${JSON.stringify(qualityReport, null, 2)}\\n\`],`,
);

// 4) 返回值里带上状态，便于 CLI 打印
const returnAnchor = `    diffFindings: diffReport.findings.length,`;
s = s.replace(returnAnchor, `    diffFindings: diffReport.findings.length,\n    qualityStatus,`);

// 5) 结果类型加字段
const typeAnchor = `  diffFindings: number;\n}`;
s = s.replace(typeAnchor, `  diffFindings: number;\n  /** 变体机器检查结论（写入 quality-report.json） */\n  qualityStatus: "not_checked" | "passed" | "warning" | "failed";\n}`);

// 6) CLI 打印
const cliAnchor = `  console.log(\`[W2] 差异告警：\${result.diffFindings} 条\`);`;
if (!s.includes(cliAnchor)) throw new Error("CLI 打印锚点未找到");
s = s.replace(cliAnchor, `${cliAnchor}\n  console.log(\`[W2] 机器检查：\${result.qualityStatus}\`);`);

writeFileSync(path, s, "utf8");
console.log("run-w2 已产出 quality-report.json");
