// W1-4：用 provider 生成文档并装配 Document Block / Segment
// 边界：
// - 引用一律来自服务端校验过的 claim，不接受模型自报的 Segment 结构
// - 数值由 calculators 注入，provider 不产数值型片段
// - 身份稳定：block_id 按章节序、segment_id 单调分配
import { calculateBankerMultiplier } from "../../calculators/banker-multiplier.ts";
import { documentSchema, looksLikeFormula, numericOnlyPattern, type Document, type DocumentBlock, type Segment } from "../contracts/document.ts";
import { validateDraftReferences, type ChapterDraft } from "../contracts/chapter-draft.ts";
import type { DocumentOutline } from "../contracts/outline.ts";
import { generateChapterOrThrow, type Generator } from "../generate/provider.ts";
import { planChapters, type ChapterPlan } from "./plan.ts";
import type { RuleSetView } from "./read-ruleset.ts";

export interface AssembleOptions {
  templateVersion: string;
  variant: string;
  documentVersion?: number;
  maxRetries?: number;
  /** 章节级日志回调（W1-8）；失败时也会回调 */
  onChapter?: (event: {
    section_id: string;
    phase: "request" | "response" | "rejected" | "accepted";
    detail?: unknown;
  }) => void;
}

export interface AssembleResult {
  document: Document;
  /** 是否走了确定性降级路径（必须显式记录，不允许静默） */
  degraded: boolean;
  plans: ChapterPlan[];
  /** 章节级失败信息；非空时 document 仍会返回，但调用方不得当成合格产物 */
  failures: Array<{ section_id: string; error: string }>;
}

export class DraftRejectedError extends Error {
  readonly sectionId: string;
  readonly issues: string[];
  constructor(sectionId: string, issues: string[]) {
    super(`章节 ${sectionId} 草稿未通过引用校验：${issues.join("；")}`);
    this.name = "DraftRejectedError";
    this.sectionId = sectionId;
    this.issues = issues;
  }
}

const variantCode = (variant: string) => variant.replace(/[^a-z]/g, "").slice(0, 2).toUpperCase().padEnd(2, "X");
const pad = (n: number, width: number) => String(n).padStart(width, "0");

/** 把章节草稿的一段落转成 Segment（不含身份分配） */
function segmentOf(
  draft: ChapterDraft,
  paragraph: ChapterDraft["paragraphs"][number],
  evidenceOf: (ruleId: string) => string[],
): Omit<Segment, "segment_id"> {
  const text = paragraph.title ? `${paragraph.title}：${paragraph.text}` : paragraph.text;
  const ruleRefs = [...new Set(paragraph.claims.flatMap((c) => c.rule_refs))];
  const configRefs = [...new Set(paragraph.claims.flatMap((c) => c.config_refs))];
  const evidence = [...new Set(ruleRefs.flatMap(evidenceOf))];
  return {
    text,
    editable: !looksLikeFormula(text) && !numericOnlyPattern.test(text),
    lineage: "base",
    decision_status: "confirmed",
    diff_status: "not_applicable",
    release_blocker_refs: [],
    references: {
      requirement_refs: [],
      rule_refs: ruleRefs,
      config_refs: configRefs,
      source_evidence_refs: evidence,
    },
  };
}

/**
 * 生成整份文档。
 * 单章失败不会静默跳过：记入 failures，并把该章标记为未产出（章节缺失由覆盖门禁再拦一次）。
 */
export async function generateDocumentWithProvider(
  ruleset: RuleSetView,
  outline: DocumentOutline,
  generator: Generator,
  options: AssembleOptions,
): Promise<AssembleResult> {
  const plans = planChapters(ruleset, outline);
  const knownRuleIds = new Set(ruleset.rules.map((r) => r.id));
  const knownConfigIds = new Set(ruleset.configs.map((c) => c.id));
  const ruleById = new Map(ruleset.rules.map((r) => [r.id, r]));
  const evidenceOf = (ruleId: string): string[] => ruleById.get(ruleId)?.evidence ?? [];

  const documentVersion = options.documentVersion ?? 0;
  const code = variantCode(options.variant);
  const blocks: DocumentBlock[] = [];
  const failures: AssembleResult["failures"] = [];
  let segmentSeq = 0;
  let blockSeq = 0;

  for (const plan of plans) {
    if (plan.rule_ids.length === 0 && plan.config_ids.length === 0) continue;
    const request = {
      section_id: plan.section_id,
      title: plan.title,
      rules: plan.rule_ids.map((id) => ruleById.get(id)!).filter(Boolean),
      configs: plan.config_ids
        .map((id) => ruleset.configs.find((c) => c.id === id))
        .filter((c): c is NonNullable<typeof c> => Boolean(c)),
      prompt_version: "assemble-1",
    };
    options.onChapter?.({ section_id: plan.section_id, phase: "request", detail: request });

    let draft: ChapterDraft;
    try {
      const response = await generateChapterOrThrow(generator, request, { maxRetries: options.maxRetries ?? 2 });
      options.onChapter?.({ section_id: plan.section_id, phase: "response", detail: { retries: response.retries } });
      const issues = validateDraftReferences(response.draft!, { knownRuleIds, knownConfigIds }, plan.section_id);
      if (issues.length > 0) {
        options.onChapter?.({ section_id: plan.section_id, phase: "rejected", detail: issues });
        throw new DraftRejectedError(plan.section_id, issues.map((i) => i.message));
      }
      draft = response.draft!;
      options.onChapter?.({ section_id: plan.section_id, phase: "accepted" });
    } catch (e) {
      failures.push({ section_id: plan.section_id, error: (e as Error).message });
      continue;
    }

    const segments: Segment[] = [];
    for (const paragraph of draft.paragraphs) {
      segmentSeq += 1;
      segments.push({ segment_id: `SEG-${pad(segmentSeq, 6)}`, ...segmentOf(draft, paragraph, evidenceOf) });
    }
    if (segments.length === 0) continue;

    blockSeq += 1;
    blocks.push({
      block_id: `DOC-${code}-${pad(blockSeq, 6)}`,
      logical_block_id: `LBL-${plan.section_id.toUpperCase()}-01`,
      section_id: plan.section_id,
      type: "paragraph",
      document_version: documentVersion,
      content: segments,
      references: {
        requirement_refs: [],
        rule_refs: [...new Set(segments.flatMap((s) => s.references.rule_refs))],
        config_refs: [...new Set(segments.flatMap((s) => s.references.config_refs))],
        source_evidence_refs: [...new Set(segments.flatMap((s) => s.references.source_evidence_refs))],
      },
    });
  }

  // 算分算例由 calculators 注入，AI 不得产出（评审 P0-5 第三类）
  const scoringBlock = blocks.find((b) => b.section_id === "scoring");
  if (scoringBlock && ruleset.rulesetId === "hangzhou-friends-4p") {
    const multiplier = calculateBankerMultiplier({ ruleset_id: "hangzhou-friends-4p", winner_is_banker: true, payer_is_banker: false });
    segmentSeq += 1;
    scoringBlock.content.push({
      segment_id: `SEG-${pad(segmentSeq, 6)}`,
      text: `庄家自摸时每笔庄闲倍率：${multiplier}`,
      editable: false,
      lineage: "base",
      decision_status: "confirmed",
      diff_status: "not_applicable",
      release_blocker_refs: [],
      machine_check_status: "passed",
      references: { requirement_refs: [], rule_refs: [], config_refs: [], source_evidence_refs: [] },
    });
  }

  const document = documentSchema.parse({
    ruleset_id: ruleset.rulesetId,
    target_variant: options.variant,
    template_version: options.templateVersion,
    ruleset_version: ruleset.version,
    document_version: documentVersion,
    blocks,
    segment_lineage: [],
  });

  return { document, degraded: generator.name === "deterministic", plans, failures };
}
