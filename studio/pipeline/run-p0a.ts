// P0-A 运行入口（CLI）
// 用法：node studio/pipeline/run-p0a.ts [--out <dir>]
// 流程：读 specs → 读/建章节装配（仅 2.3.3 涉及的章节）→ 生成 Document Block → 覆盖门禁 → 渲染
// 边界：P0-A 只验证单章节链路，不生成完整 11 章，不写 override，不动规则事实。
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

import { documentOutlineSchema, type DocumentOutline } from "../contracts/outline.ts";
import { PATHS } from "../../compiler/paths.ts";
import { checkCoverage, renderDocument } from "./gates.ts";
import { generateDocument } from "./generate.ts";
import { readBaseRuleSet } from "./read-ruleset.ts";

/** P0-A 试点章节：2.3.3 算分规则涉及的三类章节 */
function p0aOutline(): DocumentOutline {
  return documentOutlineSchema.parse({
    template_version: "1.0.0",
    sections: [
      {
        section_id: "contract",
        title: "三摊承包",
        rule_refs: ["HJ-R-CHENGBAO", "HJ-P-CHENGBAO-RUZHANG"],
        config_refs: ["HJ-C-SANTAN-CHENGBAO"],
        cross_reference_sections: [],
      },
      {
        section_id: "scoring",
        title: "算分规则",
        rule_refs: [
          "HJ-F-YUANYING-PEIFEN",
          "HJ-F-ZHUANGXIAN-BEILV",
          "HJ-P-ZIMO-RUZHANG",
          "HJ-P-DIANPAO-RUZHANG",
          "HJ-P-QIANGGANG-RUZHANG",
          "HJ-P-HUANGZHUANG",
        ],
        config_refs: ["HJ-C-DIFEN"],
        cross_reference_sections: ["contract"],
      },
    ],
  });
}

export function runP0A(outDir = join(PATHS.compiledDir, "..", "..", "documents", "hangzhou") as string): {
  documentPath: string;
  markdownPath: string;
  report: ReturnType<typeof checkCoverage>;
} {
  const ruleset = readBaseRuleSet();
  const outline = p0aOutline();
  const { document, unassigned } = generateDocument(ruleset, outline, {
    templateVersion: outline.template_version,
    variant: "hangzhou",
    documentVersion: 0,
  });
  const report = checkCoverage(ruleset, outline, document);
  // 单章节试点：未分配的规则属正常（P0-B 才要求全量），但需在报告中体现
  if (unassigned.rules.length === ruleset.rules.length) {
    throw new Error("P0-A 未生成任何规则段落，检查 outline 的 rule_refs 是否与规则集一致");
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
  const outDir = outFlag >= 0 ? process.argv[outFlag + 1] : undefined;
  const { documentPath, markdownPath, report } = runP0A(outDir);
  console.log(`[P0-A] 文档块：${report.sections.length} 个章节`);
  for (const s of report.sections) console.log(`  ${s.section_id}  ${s.block_id}  ${s.segments} 段`);
  console.log(`[P0-A] 覆盖：规则 ${report.rules.covered}/${report.rules.total}，配置 ${report.configs.covered}/${report.configs.total}`);
  if (!report.ok) {
    console.error(`[P0-A] 门禁未通过：${report.problems.join("；")}`);
    process.exitCode = 1;
  }
  console.log(`[P0-A] 产出：${documentPath}`);
  console.log(`[P0-A] 渲染：${markdownPath}`);
  if (!existsSync(markdownPath)) process.exitCode = 1;
}
