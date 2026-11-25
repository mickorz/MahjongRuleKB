// P0-B 运行入口：杭州全套（61 卡 + 25 配置）→ 11 章全文
// 用法：node studio/pipeline/run-p0b.ts [--out <dir>]
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { PATHS } from "../../compiler/paths.ts";
import { appendAudit } from "../audit/log.ts";
import { checkGoldSet } from "./goldset.ts";
import { checkCoverage, renderDocument } from "./gates.ts";
import { generateDocument } from "./generate.ts";
import { buildHangzhouOutline } from "./outline-hangzhou.ts";
import { readBaseRuleSet } from "./read-ruleset.ts";

export interface RunP0BOptions {
  outDir?: string;
  /** G5 默认关闭，只有显式开启才运行 */
  goldset?: boolean;
  /** 给定时写入审计链 */
  kbRoot?: string;
  now?: string;
}

export function runP0B(options: RunP0BOptions | string = {}): {
  documentPath: string;
  markdownPath: string;
  report: ReturnType<typeof checkCoverage>;
  goldset: ReturnType<typeof checkGoldSet>;
} {
  const opts: RunP0BOptions = typeof options === "string" ? { outDir: options } : options;
  const outDir = opts.outDir ?? "documents/hangzhou";
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
  const goldset = checkGoldSet(document, { enabled: opts.goldset === true });
  if (opts.kbRoot) {
    appendAudit(opts.kbRoot, {
      actor: "stage",
      action: "document.generate",
      subject: document.ruleset_id,
      targets: [documentPath, markdownPath],
      inputs: { blocks: document.blocks.length, rules: report.rules.covered, goldset: goldset.checked },
      ...(opts.now ? { at: opts.now } : {}),
    });
  }
  return { documentPath, markdownPath, report, goldset };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const outFlag = process.argv.indexOf("--out");
  const { documentPath, markdownPath, report, goldset } = runP0B({
    outDir: outFlag >= 0 ? process.argv[outFlag + 1] : undefined,
    goldset: process.argv.includes("--goldset"),
  });
  console.log(`[P0-B] 章节：${report.sections.length}`);
  for (const s of report.sections) console.log(`  ${s.section_id.padEnd(10)} ${s.block_id}  ${s.segments} 段`);
  console.log(`[P0-B] 覆盖：规则 ${report.rules.covered}/${report.rules.total}，配置 ${report.configs.covered}/${report.configs.total}`);
  if (!report.ok) {
    console.error(`[P0-B] 门禁未通过：${report.problems.join("；")}`);
    process.exitCode = 1;
  }
  if (goldset.enabled) {
    console.log(`[P0-B] G5 Gold Set：核对 ${goldset.checked}/${goldset.total}（跳过 draft ${goldset.skipped}）`);
    if (!goldset.ok) console.error(`[P0-B] G5 未通过：${goldset.problems.join("；")}`);
    else console.log("[P0-B] G5 通过");
  } else {
    console.log("[P0-B] G5 未启用（默认关闭，加 --goldset 开启）");
  }
  console.log(`[P0-B] 产出：${documentPath}`);
  console.log(`[P0-B] 渲染：${markdownPath}`);
}
