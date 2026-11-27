// W1-9：杭州基座生成入口
// 一次运行 = 输入锁定 → 章节规划 → 逐章生成 → 装配 → 连贯性检查 → 覆盖门禁 → Gold Set（可选）→ 落盘
// 退出码：0 通过；1 未通过（失败或走降级路径都算未通过）
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { checkCoverage, renderDocument } from "./gates.ts";
import { applyMachineStatus, checkCoherence } from "./coherence.ts";
import { generateDocumentWithProvider } from "./generate-ai.ts";
import { checkGoldSet } from "./goldset.ts";
import { buildInputLock } from "./lock.ts";
import { buildHangzhouOutline } from "./outline-hangzhou.ts";
import { planChapters } from "./plan.ts";
import { readBaseRuleSet } from "./read-ruleset.ts";
import { GenerationRunLog } from "./run-log.ts";
import { DeterministicGenerator, type Generator } from "../generate/provider.ts";
import { DEFAULT_TIER, resolveTierModel } from "../generate/model-tiers.ts";
import { isDocumentOutputDir, writeStageArtifact } from "../paths/stage-writer.ts";

export interface RunW1Options {
  outDir?: string;
  kbRoot?: string;
  /** 生成器；缺省用确定性降级（产物必标 degraded，不算通过） */
  generator?: Generator;
  /** 模型档位；缺省 fast */
  tier?: string;
  /** G5 Gold Set 默认开启（W1 阶段强制） */
  goldset?: boolean;
  taskId?: string;
}

export interface RunW1Result {
  ok: boolean;
  reasons: string[];
  degraded: boolean;
  documentPath: string;
  markdownPath: string;
  lockPath: string;
  qualityPath: string;
  runLogDir: string;
  report: ReturnType<typeof checkCoverage>;
  coherence: ReturnType<typeof checkCoherence>;
  goldset: ReturnType<typeof checkGoldSet>;
  lock: ReturnType<typeof buildInputLock>;
}

export async function runW1(options: RunW1Options = {}): Promise<RunW1Result> {
  const ruleset = readBaseRuleSet();
  const outline = buildHangzhouOutline(ruleset);
  const outDir = options.outDir ?? "documents/hangzhou";
  const kbRoot = options.kbRoot ?? ".";
  const tier = options.tier ?? DEFAULT_TIER;
  const resolved = resolveTierModel(tier, kbRoot);
  const generator = options.generator ?? new DeterministicGenerator();
  const taskId = options.taskId ?? `w1-${new Date().toISOString().replace(/[:.]/g, "-")}`;

  const lock = buildInputLock({
    ruleset_id: ruleset.rulesetId,
    ruleset_version: ruleset.version,
    content_hash: (ruleset as { contentHash?: string }).contentHash ?? "0".repeat(64),
    dir: "rulebook/specs/base/hangzhou",
    outline,
    model: resolved.model ?? "none",
    prompt_version: "assemble-1",
  });

  const runLog = new GenerationRunLog(kbRoot, {
    task_id: taskId,
    ruleset_id: ruleset.rulesetId,
    target_variant: "hangzhou",
    generator: generator.name,
    prompt_version: "assemble-1",
    input_hash: lock.input_hash,
  });

  const assembled = await generateDocumentWithProvider(ruleset, outline, generator, {
    templateVersion: outline.template_version,
    variant: "hangzhou",
    onChapter: (event) => runLog.record(event),
  });

  const coherence = checkCoherence(assembled.document, outline, { ruleset });
  const withStatus = applyMachineStatus(assembled.document, coherence.findings);
  const report = checkCoverage(ruleset, outline, withStatus);
  const goldsetEnabled = options.goldset ?? true;
  const goldset = checkGoldSet(withStatus, { enabled: goldsetEnabled });

  const reasons: string[] = [];
  if (assembled.failures.length > 0) reasons.push(`章节失败：${assembled.failures.map((f) => f.section_id).join(", ")}`);
  if (coherence.status !== "passed") reasons.push(`连贯性检查未通过（${coherence.status}）`);
  if (!report.ok) reasons.push(`覆盖门禁未通过：${report.problems.join("；")}`);
  if (goldsetEnabled && !goldset.ok) reasons.push(`G5 未通过：${goldset.problems.join("；")}`);
  if (assembled.degraded) reasons.push("走了确定性降级路径（degraded），不计为 W1 通过");

  mkdirSync(outDir, { recursive: true });
  const documentJson = `${JSON.stringify(withStatus, null, 2)}\n`;
  const markdown = renderDocument(withStatus, outline);
  const lockJson = `${JSON.stringify(lock, null, 2)}\n`;
  const qualityJson = `${JSON.stringify(
    {
      ruleset_id: ruleset.rulesetId,
      target_variant: "hangzhou",
      document_version: withStatus.document_version,
      checked_at: new Date().toISOString(),
      status: coherence.status,
      findings: coherence.findings,
      summary: {
        total: coherence.findings.length,
        failed: coherence.findings.filter((f) => f.severity === "failed").length,
        warning: coherence.findings.filter((f) => f.severity === "warning").length,
      },
    },
    null,
    2,
  )}\n`;

  const paths = {
    documentPath: join(outDir, "document.json"),
    markdownPath: join(outDir, "需求全文.md"),
    lockPath: join(outDir, "generation.lock.json"),
    qualityPath: join(outDir, "quality-report.json"),
  };

  if (isDocumentOutputDir(outDir)) {
    writeStageArtifact(kbRoot, "hangzhou", "document.json", documentJson);
    writeStageArtifact(kbRoot, "hangzhou", "需求全文.md", markdown);
    writeStageArtifact(kbRoot, "hangzhou", "generation.lock.json", lockJson);
    writeStageArtifact(kbRoot, "hangzhou", "quality-report.json", qualityJson);
  } else {
    for (const [file, content] of [
      ["document.json", documentJson],
      ["需求全文.md", markdown],
      ["generation.lock.json", lockJson],
      ["quality-report.json", qualityJson],
    ] as const) {
      writeFileSync(join(outDir, file), content, "utf8");
    }
  }

  const ok = reasons.length === 0;
  runLog.finish(assembled.degraded ? "degraded" : ok ? "passed" : "failed", {
    reasons,
    coherence_status: coherence.status,
    coverage: { rules: report.rules.covered, configs: report.configs.covered },
    goldset: { enabled: goldsetEnabled, checked: goldset.checked, ok: goldset.ok },
  });

  return {
    ok,
    reasons,
    degraded: assembled.degraded,
    ...paths,
    runLogDir: runLog.dir,
    report,
    coherence,
    goldset,
    lock,
  };
}

/** 新旧对比：槽位展开版 vs 生成版，用于判断「换组织方式」到底改了什么 */
export interface DocStats {
  blocks: number;
  segments: number;
  avgSegmentLength: number;
  /** 短且无引用的片段数（空壳） */
  shellSegments: number;
  /** 平均每段引用数 */
  refsPerSegment: number;
  sections: string[];
}

export function statsOf(document: {
  blocks: ReadonlyArray<{ section_id: string; content: ReadonlyArray<{ text: string; references: { rule_refs: string[]; config_refs: string[] } }> }>;
}): DocStats {
  const segments = document.blocks.flatMap((b) => b.content);
  const totalLength = segments.reduce((acc, s) => acc + s.text.replace(/\s+/g, "").length, 0);
  const refs = segments.reduce((acc, s) => acc + s.references.rule_refs.length + s.references.config_refs.length, 0);
  return {
    blocks: document.blocks.length,
    segments: segments.length,
    avgSegmentLength: segments.length === 0 ? 0 : Math.round((totalLength / segments.length) * 10) / 10,
    shellSegments: segments.filter(
      (s) => s.text.replace(/\s+/g, "").length < 8 && s.references.rule_refs.length + s.references.config_refs.length === 0,
    ).length,
    refsPerSegment: segments.length === 0 ? 0 : Math.round((refs / segments.length) * 100) / 100,
    sections: document.blocks.map((b) => b.section_id),
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const outFlag = process.argv.indexOf("--out");
  const tierFlag = process.argv.indexOf("--tier");
  const result = await runW1({
    ...(outFlag >= 0 ? { outDir: process.argv[outFlag + 1] } : {}),
    ...(tierFlag >= 0 ? { tier: process.argv[tierFlag + 1] } : {}),
    goldset: !process.argv.includes("--no-goldset"),
  });
  console.log(`[W1] 章节：${result.report.sections.length}，段数：${result.report.sections.reduce((a, s) => a + s.segments, 0)}`);
  console.log(`[W1] 覆盖：规则 ${result.report.rules.covered}/${result.report.rules.total}，配置 ${result.report.configs.covered}/${result.report.configs.total}`);
  console.log(`[W1] 连贯性：${result.coherence.status}（failed ${result.coherence.findings.filter((f) => f.severity === "failed").length} / warning ${result.coherence.findings.filter((f) => f.severity === "warning").length}）`);
  console.log(`[W1] G5：核对 ${result.goldset.checked}/${result.goldset.total}${result.goldset.ok ? " 通过" : " 未通过"}`);
  console.log(`[W1] 输入锁：${result.lock.input_hash.slice(0, 12)}…`);
  console.log(`[W1] 日志：${result.runLogDir}`);
  console.log(`[W1] 产出：${result.documentPath}`);
  if (!result.ok) {
    console.error(`[W1] 未通过：${result.reasons.join("；")}`);
    process.exitCode = 1;
  } else {
    console.log("[W1] 通过");
  }
}
