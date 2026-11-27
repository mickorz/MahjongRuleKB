// W2 入口：萧山变体文档（继承复用 + 差异检查 + 三视图 + 基座绑定）
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { loadRuleset } from "../../compiler/validator.ts";
import { compileVariant } from "../../compiler/compile.ts";
import { PATHS } from "../../compiler/paths.ts";
import { documentSchema, type Document } from "../contracts/document.ts";
import { DeterministicGenerator, type Generator } from "../generate/provider.ts";
import { createLlmGeneratorFromTier } from "../generate/llm-generator.ts";
import { DEFAULT_TIER, resolveTierModel } from "../generate/model-tiers.ts";
import { isDocumentOutputDir, writeStageArtifact } from "../paths/stage-writer.ts";
import { buildChangesFile } from "./changes-json.ts";
import { checkVariantDiffs, type CardView } from "./diff-checks.ts";
import { statusOfFindings, type MachineCheckFinding } from "../contracts/machine-check.ts";
import { generateVariantWithProvider, checkInheritedIntegrity, type VariantRule } from "./generate-variant-ai.ts";
import { loadDiffReview } from "./diff-review.ts";
import { buildInputLock } from "./lock.ts";
import { buildHangzhouOutline } from "./outline-hangzhou.ts";
import { renderComparisonView, renderDiffView, renderDocument } from "./render.ts";
import { GenerationRunLog } from "./run-log.ts";
import { readBaseRuleSet } from "./read-ruleset.ts";

export interface RunW2Options {
  outDir?: string;
  kbRoot?: string;
  generator?: Generator;
  useLlm?: boolean;
  tier?: string;
  taskId?: string;
  /** 基座文档路径；缺省 documents/hangzhou/document.json */
  baseDocumentPath?: string;
}

export interface RunW2Result {
  ok: boolean;
  reasons: string[];
  documentPath: string;
  markdownPath: string;
  diffViewPath: string;
  compareViewPath: string;
  changesPath: string;
  baseBinding: { ruleset_version: string; content_hash: string; document_version: number };
  inheritedSegments: number;
  generatedSegments: number;
  diffFindings: number;
  /** 变体机器检查结论（写入 quality-report.json） */
  qualityStatus: "not_checked" | "passed" | "warning" | "failed";
}

const BASE_DOC = "documents/hangzhou/document.json";

export async function runW2(options: RunW2Options = {}): Promise<RunW2Result> {
  const outDir = options.outDir ?? "documents/xiaoshan";
  const kbRoot = options.kbRoot ?? ".";
  const baseDocumentPath = options.baseDocumentPath ?? join(kbRoot, BASE_DOC);
  if (!existsSync(baseDocumentPath)) {
    throw new Error(`缺少基座文档 ${baseDocumentPath}：变体文档必须绑定基座，请先运行 run-w1`);
  }
  const baseDocument = documentSchema.parse(JSON.parse(readFileSync(baseDocumentPath, "utf8")));

  const baseRuleset = readBaseRuleSet();
  const outline = buildHangzhouOutline(baseRuleset);
  const base = loadRuleset(PATHS.baseDir, "base");
  const variant = loadRuleset(`${PATHS.variantsDir}/xiaoshan`, "variant");
  const compiled = compileVariant(base, variant);
  const vm = compiled.manifest as { ruleset_id: string; version: string; base: { ruleset_id: string; version: string; content_hash?: string } };

  const variantRules: VariantRule[] = compiled.rules.map((r) => {
    const meta = r.meta as unknown as {
      id: string;
      name: string;
      change_type?: string;
      base_rule_ref?: string;
      status?: string;
      release_blocker?: boolean;
      depends_on?: string[];
      sources?: Array<{ source: string; section?: string }>;
    };
    return {
      id: meta.id,
      name: meta.name,
      body: r.body,
      origin: r.origin,
      ...(meta.change_type ? { change_type: meta.change_type } : {}),
      ...(meta.base_rule_ref ? { base_rule_ref: meta.base_rule_ref } : {}),
      ...(meta.status ? { status: meta.status } : {}),
      ...(meta.release_blocker !== undefined ? { release_blocker: meta.release_blocker } : {}),
      evidence: (meta.sources ?? []).map((s) => (s.section ? `${s.source}#${s.section}` : s.source)),
      depends_on: meta.depends_on ?? [],
    };
  });

  const tier = options.tier ?? DEFAULT_TIER;
  const resolved = resolveTierModel(tier, kbRoot);
  let warning: string | undefined;
  const generator =
    options.generator ??
    (options.useLlm
      ? (() => {
          if (!resolved.model) throw new Error(`无法从档位 ${tier} 解析模型：${resolved.warning ?? "未知原因"}`);
          const built = createLlmGeneratorFromTier(resolved.model);
          warning = built.warning;
          return built.generator;
        })()
      : new DeterministicGenerator());

  const baseManifest = base.manifest as { content_hash?: string };
  const baseContentHash = baseManifest.content_hash;
  if (!baseContentHash) throw new Error("基座 manifest 缺少 content_hash：无法为变体文档绑定基座内容版本");
  const baseBinding = {
    ruleset_version: vm.base.version,
    // 绑定基座规则集内容 Hash（来自 base manifest），不是占位值
    content_hash: baseContentHash,
    document_version: baseDocument.document_version,
  };

  const lock = buildInputLock({
    ruleset_id: vm.ruleset_id,
    ruleset_version: vm.version,
    content_hash: (compiled.manifest as { content_hash?: string }).content_hash ?? "0".repeat(64),
    dir: `${PATHS.variantsDir}/xiaoshan`,
    outline,
    model: resolved.model ?? "none",
    prompt_version: "variant-1",
  });

  const runLog = new GenerationRunLog(kbRoot, {
    task_id: options.taskId ?? `w2-${new Date().toISOString().replace(/[:.]/g, "-")}`,
    ruleset_id: vm.ruleset_id,
    target_variant: "xiaoshan",
    generator: generator.name,
    prompt_version: "variant-1",
    input_hash: lock.input_hash,
  });

  const assembled = await generateVariantWithProvider(baseDocument, {
    rulesetId: vm.ruleset_id,
    version: vm.version,
    rules: variantRules.map((r) => ({ id: r.id, type: "judgment", name: r.name, evidence: r.evidence, body: r.body, depends_on: r.depends_on })),
    configs: [],
  }, variantRules, outline, generator, {
    templateVersion: outline.template_version,
    variant: "xiaoshan",
    documentVersion: 0,
    baseBinding,
    diffReview: loadDiffReview(join(kbRoot, outDir, "diff-review.yaml")),
    unresolved: (variant.unresolved as Array<{ id: string; card_ref: string; release_blocker: boolean }>) ?? [],
    onChapter: (e) => runLog.record(e),
  });

  // W2-5 继承一致性
  const integrityProblems = checkInheritedIntegrity(baseDocument, assembled.document);

  // W2-3 差异检查
  const cardsOf = (rules: ReadonlyArray<VariantRule>, origin: "base" | "variant"): CardView[] =>
    rules
      .filter((r) => r.origin === origin)
      .map((r) => ({
        id: r.id,
        name: r.name,
        body: r.body,
        origin,
        ...(r.change_type ? { change_type: r.change_type } : {}),
        ...(r.base_rule_ref ? { base_rule_ref: r.base_rule_ref } : {}),
      }));
  const diffReport = checkVariantDiffs({
    variantCards: cardsOf(variantRules, "variant"),
    baseCards: cardsOf(variantRules, "base"),
  });

  const reasons: string[] = [];
  if (warning) reasons.push(`模型告警：${warning}`);
  if (assembled.failures.length > 0) reasons.push(`章节失败：${assembled.failures.map((f) => f.section_id).join(", ")}`);
  if (integrityProblems.length > 0) reasons.push(`继承一致性：${integrityProblems.join("；")}`);
  if (baseDocument.ruleset_id !== vm.base.ruleset_id) reasons.push(`基座绑定不一致：${baseDocument.ruleset_id} vs ${vm.base.ruleset_id}`);
  if (options.generator === undefined && !options.useLlm) reasons.push("走了确定性降级路径（degraded），不计为 W2 通过");

  // 变体的机器检查结论：继承一致性失败 → failed；其余差异告警为 warning
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

  const changes = buildChangesFile(
    compiled as never,
    base.rules.map((r) => ({ id: r.meta.id, body: r.body })),
    { rulesetId: vm.ruleset_id, baseRulesetId: vm.base.ruleset_id, baseVersion: vm.base.version, variantVersion: vm.version },
    new Date().toISOString(),
    loadDiffReview(join(kbRoot, outDir, "diff-review.yaml")).rules,
  );

  mkdirSync(outDir, { recursive: true });
  const artifacts: Array<[string, string]> = [
    ["document.json", `${JSON.stringify(assembled.document, null, 2)}\n`],
    ["需求全文.md", renderDocument(assembled.document, outline)],
    ["差异视图.md", renderDiffView(baseDocument, assembled.document, assembled.baseSegmentOfModified)],
    ["对照视图.md", renderComparisonView(baseDocument, assembled.document)],
    ["changes.json", `${JSON.stringify(changes, null, 2)}\n`],
    ["diff-warnings.json", `${JSON.stringify({ findings: diffReport.findings, byRule: diffReport.byRule }, null, 2)}\n`],
    ["quality-report.json", `${JSON.stringify(qualityReport, null, 2)}\n`],
  ];
  if (isDocumentOutputDir(outDir)) {
    for (const [name, content] of artifacts) writeStageArtifact(kbRoot, "xiaoshan", name, content);
  } else {
    for (const [name, content] of artifacts) writeFileSync(join(outDir, name), content, "utf8");
  }

  const ok = reasons.length === 0;
  runLog.finish(ok ? "passed" : "failed", {
    reasons,
    inherited_segments: assembled.inheritedSegments,
    generated_segments: assembled.generatedSegments,
    diff_findings: diffReport.findings.length,
  });

  return {
    ok,
    reasons,
    documentPath: join(outDir, "document.json"),
    markdownPath: join(outDir, "需求全文.md"),
    diffViewPath: join(outDir, "差异视图.md"),
    compareViewPath: join(outDir, "对照视图.md"),
    changesPath: join(outDir, "changes.json"),
    baseBinding,
    inheritedSegments: assembled.inheritedSegments,
    generatedSegments: assembled.generatedSegments,
    diffFindings: diffReport.findings.length,
    qualityStatus,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const outFlag = process.argv.indexOf("--out");
  const result = await runW2({
    ...(outFlag >= 0 ? { outDir: process.argv[outFlag + 1] } : {}),
    ...(process.argv.includes("--llm") ? { useLlm: true } : {}),
  });
  console.log(`[W2] 继承片段：${result.inheritedSegments}，生成片段：${result.generatedSegments}`);
  console.log(`[W2] 基座绑定：v${result.baseBinding.ruleset_version} 文档版本 ${result.baseBinding.document_version}`);
  console.log(`[W2] 差异告警：${result.diffFindings} 条`);
  console.log(`[W2] 机器检查：${result.qualityStatus}`);
  console.log(`[W2] 产出：${result.documentPath}`);
  console.log(`[W2] 视图：${result.diffViewPath} / ${result.compareViewPath}`);
  if (!result.ok) {
    console.error(`[W2] 未通过：${result.reasons.join("；")}`);
    process.exitCode = 1;
  } else {
    console.log("[W2] 通过");
  }
}
