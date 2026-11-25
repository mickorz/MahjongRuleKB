// P0-B 运行入口：杭州全套（61 卡 + 25 配置）→ 11 章全文
// 用法：node studio/pipeline/run-p0b.ts [--out <dir>]
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { PATHS } from "../../compiler/paths.ts";
import { checkCoverage, renderDocument } from "./gates.ts";
import { generateDocument } from "./generate.ts";
import { buildHangzhouOutline } from "./outline-hangzhou.ts";
import { readBaseRuleSet } from "./read-ruleset.ts";

export function runP0B(outDir = "documents/hangzhou"): {
  documentPath: string;
  markdownPath: string;
  report: ReturnType<typeof checkCoverage>;
} {
  const ruleset = readBaseRuleSet();
  const outline = buildHangzhouOutline(ruleset);
  const { document, unassigned } = generateDocument(ruleset, outline, {
    templateVersion: outline.template_version,
    variant: "hangzhou",
    documentVersion: 0,
  });
  const report = checkCoverage(ruleset, outline, document);
  if (unassigned.rules.length || unassigned.configs.length) {
    throw new Error(
      `P0-B 要求全量落位，仍有未分配：规则 ${unassigned.rules.join(", ") || "无"}；配置 ${unassigned.configs.join(", ") || "无"}`,
    );
  }

  mkdirSync(outDir, { recursive: true });
  const documentPath = join(outDir, "document.json");
  const markdownPath = join(outDir, "需求全文.md");
  writeFileSync(documentPath, `${JSON.stringify(document, null, 2)}\n`, "utf8");
  writeFileSync(markdownPath, renderDocument(document, outline), "utf8");
  return { documentPath, markdownPath, report };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const outFlag = process.argv.indexOf("--out");
  const { documentPath, markdownPath, report } = runP0B(outFlag >= 0 ? process.argv[outFlag + 1] : undefined);
  console.log(`[P0-B] 章节：${report.sections.length}`);
  for (const s of report.sections) console.log(`  ${s.section_id.padEnd(10)} ${s.block_id}  ${s.segments} 段`);
  console.log(`[P0-B] 覆盖：规则 ${report.rules.covered}/${report.rules.total}，配置 ${report.configs.covered}/${report.configs.total}`);
  if (!report.ok) {
    console.error(`[P0-B] 门禁未通过：${report.problems.join("；")}`);
    process.exitCode = 1;
  }
  console.log(`[P0-B] 产出：${documentPath}`);
  console.log(`[P0-B] 渲染：${markdownPath}`);
}
