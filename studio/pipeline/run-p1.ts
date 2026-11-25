// P1 运行入口：萧山变体全文 + changes.json
// 用法：node studio/pipeline/run-p1.ts [--out <dir>]
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { checkCoverage, renderDocument } from "./gates.ts";
import { buildChangesFile } from "./changes-json.ts";
import { compileXiaoshan, generateVariantDocument, sharedOutline } from "./generate-variant.ts";
import { readBaseRuleSet } from "./read-ruleset.ts";

export function runP1(outDir = "documents/xiaoshan"): {
  documentPath: string;
  markdownPath: string;
  changesPath: string;
  report: ReturnType<typeof checkCoverage>;
  blockers: number;
  changes: number;
} {
  const baseRuleset = readBaseRuleSet();
  const outline = sharedOutline(baseRuleset);
  const { compiled } = compileXiaoshan();
  const vm = compiled.manifest as { ruleset_id: string; version: string; base: { ruleset_id: string; version: string } };

  const { document, blockers } = generateVariantDocument(compiled as never, outline, {
    variant: "xiaoshan",
    templateVersion: outline.template_version,
    rulesetId: vm.ruleset_id,
    rulesetVersion: vm.version,
  });
  const report = checkCoverage(baseRuleset, outline, {
    ...document,
    blocks: document.blocks.map((b) => ({
      ...b,
      // 覆盖门禁按基座卡 ID 统计；变体块里是变体 ID，这里只用于章节结构核对
      references: b.references,
    })),
  });
  const changes = buildChangesFile(
    compiled as never,
    baseRuleset.rules.map((r) => ({ id: r.id, body: r.body })),
    {
      rulesetId: vm.ruleset_id,
      baseRulesetId: vm.base.ruleset_id,
      baseVersion: vm.base.version,
      variantVersion: vm.version,
    },
  );

  mkdirSync(outDir, { recursive: true });
  const documentPath = join(outDir, "document.json");
  const markdownPath = join(outDir, "需求全文.md");
  const changesPath = join(outDir, "changes.json");
  writeFileSync(documentPath, `${JSON.stringify(document, null, 2)}\n`, "utf8");
  writeFileSync(markdownPath, renderDocument(document, outline), "utf8");
  writeFileSync(changesPath, `${JSON.stringify(changes, null, 2)}\n`, "utf8");
  return {
    documentPath,
    markdownPath,
    changesPath,
    report,
    blockers: blockers.length,
    changes: changes.entries.length,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const outFlag = process.argv.indexOf("--out");
  const r = runP1(outFlag >= 0 ? process.argv[outFlag + 1] : undefined);
  console.log(`[P1] 章节：${r.report.sections.length}，块数：${r.report.sections.length}`);
  console.log(`[P1] 差异条目：${r.changes}（modified + added）`);
  console.log(`[P1] 待裁决规则卡：${r.blockers}`);
  console.log(`[P1] 产出：${r.documentPath}`);
  console.log(`[P1] 渲染：${r.markdownPath}`);
  console.log(`[P1] 差异：${r.changesPath}`);
}
