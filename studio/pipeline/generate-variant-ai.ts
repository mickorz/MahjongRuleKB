// W2-2：变体文档生成 —— 继承片段复用基座 Segment，只有 modified / added 走 AI
// 关键设计（评审 P0-6）：继承内容不重新生成，而是逐字复用基座 document.json 的片段并保留 segment_id。
// 因此「逐字一致」是构造结果，不需要按文本反查对应段落。
import {
  documentSchema,
  looksLikeFormula,
  numericOnlyPattern,
  type Document,
  type DocumentBlock,
  type Segment,
} from "../contracts/document.ts";
import { validateDraftReferences, type ChapterDraft } from "../contracts/chapter-draft.ts";
import type { DocumentOutline } from "../contracts/outline.ts";
import { generateChapterOrThrow, type Generator } from "../generate/provider.ts";
import type { ConfigSummary, RuleSetView } from "./read-ruleset.ts";
import { cardSlots } from "./read-ruleset.ts";
import { sectionOfRule } from "./outline-hangzhou.ts";

export interface VariantRule {
  id: string;
  name: string;
  body: string;
  origin: "base" | "variant";
  change_type?: "inherited" | "modified" | "added" | string;
  base_rule_ref?: string | null;
  status?: string;
  release_blocker?: boolean;
  evidence: string[];
  depends_on: string[];
}

export interface VariantGenerateOptions {
  templateVersion: string;
  variant: string;
  documentVersion?: number;
  /** 差异审核：已人工确认的规则 ID */
  diffReview?: { rules: ReadonlySet<string>; segments: ReadonlySet<string> };
  /** 未决项：card_ref → XS-U-### */
  unresolved?: Array<{ id: string; card_ref: string; release_blocker: boolean }>;
  /** 基座绑定：变体文档必须记录它依赖哪个基座版本 */
  baseBinding: { ruleset_version: string; content_hash: string; document_version: number };
  onChapter?: (event: { section_id: string; phase: "request" | "response" | "rejected" | "accepted"; detail?: unknown }) => void;
  maxRetries?: number;
}

export interface VariantAssembleResult {
  document: Document;
  failures: Array<{ section_id: string; error: string }>;
  /** 复用自基座的片段数 */
  inheritedSegments: number;
  /** AI 生成的片段数 */
  generatedSegments: number;
  /** 基座片段 id → 变体片段 id（仅 modified，用于对照视图） */
  baseSegmentOfModified: Record<string, string>;
}

const pad = (n: number, width: number) => String(n).padStart(width, "0");

/** 变体卡的 beats：只用该卡实际有的槽位 */
const beatsOf = (body: string): string[] => [...new Set(cardSlots(body).map((s) => s.slot))];

/**
 * 生成变体文档。
 * 步骤：
 * 1. 遍历章节：先把基座文档里属于「继承卡」的片段原样搬过来（保留 segment_id）
 * 2. 再为本章的 modified / added 卡调用 provider 生成内容
 * 3. 组装块，写 base_binding 与 generation 之外的差异标记
 */
export async function generateVariantWithProvider(
  baseDocument: Document,
  ruleset: RuleSetView,
  variantRules: ReadonlyArray<VariantRule>,
  outline: DocumentOutline,
  generator: Generator,
  options: VariantGenerateOptions,
): Promise<VariantAssembleResult> {
  const review = options.diffReview ?? { rules: new Set<string>(), segments: new Set<string>() };
  const unresolvedOf = (ruleId: string) =>
    (options.unresolved ?? []).filter((u) => u.card_ref === ruleId && u.release_blocker).map((u) => u.id);

  const ruleById = new Map(variantRules.map((r) => [r.id, r]));
  const variantOnly = variantRules.filter((r) => r.origin === "variant");
  // 被变体改写的基座规则：这些规则的基座片段不再继承，由生成内容替代
  const overridden = new Set(
    variantOnly.filter((r) => r.change_type === "modified" && r.base_rule_ref).map((r) => r.base_rule_ref as string),
  );
  // 显式声明沿用（inherited）的基座规则
  const explicitInherited = new Set(
    variantOnly.filter((r) => r.change_type === "inherited" && r.base_rule_ref).map((r) => r.base_rule_ref as string),
  );

  // 基座片段索引：规则 ID → 该规则在基座文档中的片段
  const baseSegmentsByRule = new Map<string, Segment[]>();
  for (const block of baseDocument.blocks) {
    for (const seg of block.content) {
      for (const ref of seg.references.rule_refs) {
        baseSegmentsByRule.set(ref, [...(baseSegmentsByRule.get(ref) ?? []), seg]);
      }
    }
  }

  const failures: VariantAssembleResult["failures"] = [];
  const blocks: DocumentBlock[] = [];
  const baseSegmentOfModified: Record<string, string> = {};
  let inheritedSegments = 0;
  let generatedSegments = 0;
  let maxSegmentNumber = 0;
  const usedSegmentIds = new Set<string>();
  const usedBlockIds = new Set<string>();

  // 先占住基座片段 ID，避免新片段撞号
  for (const block of baseDocument.blocks) {
    usedBlockIds.add(block.block_id);
    for (const seg of block.content) {
      usedSegmentIds.add(seg.segment_id);
      const n = Number(seg.segment_id.replace(/^SEG-/, ""));
      if (Number.isFinite(n)) maxSegmentNumber = Math.max(maxSegmentNumber, n);
    }
  }
  const nextSegmentId = () => {
    maxSegmentNumber += 1;
    return `SEG-${pad(maxSegmentNumber, 6)}`;
  };

  const code = options.variant.replace(/[^a-z]/g, "").slice(0, 2).toUpperCase().padEnd(2, "X");
  let blockSeq = 0;

  for (const section of outline.sections) {
    const segments: Segment[] = [];

    // 1) 继承片段 = 基座该章片段 − 被改写规则；原样复用并保留 segment_id / text
    for (const baseBlock of baseDocument.blocks.filter((b) => b.section_id === section.section_id)) {
      for (const baseSeg of baseBlock.content) {
        const refs = baseSeg.references.rule_refs;
        if (refs.length > 0 && refs.every((r) => overridden.has(r))) continue;
        // 无任何规则/配置引用的片段是计算器注入的算例，不属于「可继承的规则事实」，跳过
        if (refs.length === 0 && baseSeg.references.config_refs.length === 0) continue;
        if (segments.some((s) => s.segment_id === baseSeg.segment_id)) continue;
        const explicit = refs.some((r) => explicitInherited.has(r));
        // 继承片段必须声明它沿用哪条基座规则 / 配置（Schema 对该 lineage 有要求）
        const baseRuleRef = baseSeg.base_rule_ref ?? refs[0] ?? baseSeg.references.config_refs[0];
        segments.push({
          ...baseSeg,
          lineage: explicit ? "explicit_inherited" : "default_inherited",
          // 继承内容不是差异：diff_status 恒为 not_applicable
          diff_status: "not_applicable",
          ...(baseRuleRef ? { base_rule_ref: baseRuleRef } : {}),
        });
        inheritedSegments += 1;
      }
    }

    // 2) 变体自有片段：只有 modified / added 走生成
    // modified 按 base_rule_ref 落章；added 没有基座对照，按与基座相同的章节映射规则落章
    const ownRules = variantOnly.filter((r) =>
      r.change_type === "added"
        ? sectionOfRule(r.id, r.name) === section.section_id
        : section.rule_refs.includes(r.base_rule_ref ?? ""),
    );
    if (ownRules.length > 0) {
      const request = {
        section_id: section.section_id,
        title: section.title,
        rules: ownRules.map((r) => ({ id: r.id, name: r.name, body: r.body })),
        configs: [] as ConfigSummary[],
        prompt_version: "variant-1",
        beats: [...new Set(ownRules.flatMap((r) => beatsOf(r.body)))],
      };
      options.onChapter?.({ section_id: section.section_id, phase: "request", detail: request });
      try {
        const response = await generateChapterOrThrow(generator, request, { maxRetries: options.maxRetries ?? 2 });
        options.onChapter?.({
          section_id: section.section_id,
          phase: "response",
          detail: { retries: response.retries, raw: response.raw },
        });
        const knownRuleIds = new Set(variantRules.map((r) => r.id));
        const issues = validateDraftReferences(response.draft!, { knownRuleIds, knownConfigIds: new Set() }, section.section_id);
        if (issues.length > 0) {
          options.onChapter?.({ section_id: section.section_id, phase: "rejected", detail: issues });
          throw new Error(issues.map((i) => i.message).join("；"));
        }
        const draft: ChapterDraft = response.draft!;
        for (const paragraph of draft.paragraphs) {
          const ruleRefs = [...new Set(paragraph.claims.flatMap((c) => c.rule_refs))];
          // 归属判定：该段引用的变体卡决定 lineage
          const primary = variantRules.find((r) => r.id === ruleRefs[0]);
          const lineage = primary?.change_type === "added" ? "added" : "modified";
          const baseRef = primary?.base_rule_ref ?? undefined;
          const blockerRefs = ruleRefs.flatMap((id) => unresolvedOf(id));
          const segId = nextSegmentId();
          // C4：只有 modified 需要指向被改写的基座片段（继承已共享 segment_id，added 无基座片段）
          const baseSeg = lineage === "modified" && baseRef ? (baseSegmentsByRule.get(baseRef) ?? [])[0] : undefined;
          if (baseSeg) baseSegmentOfModified[segId] = baseSeg.segment_id;
          const text = paragraph.title ? `${paragraph.title}：${paragraph.text}` : paragraph.text;
          segments.push({
            segment_id: segId,
            text,
            // 与基座一致：公式 / 纯数值片段不可编辑（数值只能来自计算器）
            editable: !looksLikeFormula(text) && !numericOnlyPattern.test(text),
            lineage,
            decision_status:
              (ruleRefs.map((id) => ruleById.get(id)?.status).find((s) => s && s !== "confirmed") as Segment["decision_status"]) ??
              "confirmed",
            diff_status: review.rules.has(ruleRefs[0] ?? "") ? "confirmed" : "candidate",
            release_blocker_refs: [...new Set(blockerRefs)],
            references: {
              requirement_refs: [],
              rule_refs: ruleRefs,
              config_refs: [...new Set(paragraph.claims.flatMap((c) => c.config_refs))],
              source_evidence_refs: [...new Set(ruleRefs.flatMap((id) => ruleById.get(id)?.evidence ?? []))],
            },
            ...(lineage === "added" ? {} : { base_rule_ref: baseRef }),
            ...(baseSeg ? { base_segment_ref: baseSeg.segment_id } : {}),
          });
          generatedSegments += 1;
        }
        options.onChapter?.({ section_id: section.section_id, phase: "accepted" });
      } catch (e) {
        failures.push({ section_id: section.section_id, error: (e as Error).message });
      }
    }

    if (segments.length === 0) continue;
    blockSeq += 1;
    blocks.push({
      block_id: `DOC-${code}-${pad(blockSeq, 6)}`,
      logical_block_id: `LBL-${section.section_id.toUpperCase()}-01`,
      section_id: section.section_id,
      type: "paragraph",
      document_version: options.documentVersion ?? 0,
      content: segments,
      references: {
        requirement_refs: [],
        rule_refs: [...new Set(segments.flatMap((s) => s.references.rule_refs))],
        config_refs: [...new Set(segments.flatMap((s) => s.references.config_refs))],
        source_evidence_refs: [...new Set(segments.flatMap((s) => s.references.source_evidence_refs))],
      },
    });
  }

  const document = documentSchema.parse({
    ruleset_id: ruleset.rulesetId,
    target_variant: options.variant,
    template_version: options.templateVersion,
    ruleset_version: ruleset.version,
    document_version: options.documentVersion ?? 0,
    blocks,
    segment_lineage: [],
    base_binding: options.baseBinding,
  });

  return { document, failures, inheritedSegments, generatedSegments, baseSegmentOfModified };
}

/**
 * W2-5：继承一致性断言。
 * 因为继承片段是复用而非重写，这里校验的是「复用有没有被破坏」（如后续处理误改了 text）。
 */
export function checkInheritedIntegrity(base: Document, variant: Document): string[] {
  const baseById = new Map<string, Segment>();
  for (const block of base.blocks) for (const seg of block.content) baseById.set(seg.segment_id, seg);

  const problems: string[] = [];
  for (const block of variant.blocks) {
    for (const seg of block.content) {
      if (seg.lineage !== "default_inherited" && seg.lineage !== "explicit_inherited") {
        // C4：base_segment_ref 只属于 modified；added 带它就是身份表达重复
        if (seg.lineage === "added" && seg.base_segment_ref) {
          problems.push(`added 片段 ${seg.segment_id} 不得带 base_segment_ref`);
        }
        continue;
      }
      const baseSeg = baseById.get(seg.segment_id);
      if (!baseSeg) {
        problems.push(`继承片段 ${seg.segment_id} 在基座文档中不存在（身份未复用）`);
        continue;
      }
      if (baseSeg.text !== seg.text) {
        problems.push(`继承片段 ${seg.segment_id} 正文与基座不一致`);
      }
    }
  }
  return problems;
}
