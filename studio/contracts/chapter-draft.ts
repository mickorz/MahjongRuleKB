// W1-2：章节草稿结构化输出契约（对应评审 P0-4）
// 为什么必须结构化：装配 Segment 需要段落边界、规则归属、配置归属与来源；
// 只给一段字符串，服务端无法判断哪句话由哪张卡支撑。
// 约束：模型只能在 claims 里引用，不得自创 ID；引用由服务端校验后才落地。
import { z } from "zod";

import { sectionIdSchema } from "./common.ts";

export const chapterClaimSchema = z
  .object({
    /** 该断言对应的原文片段（用于溯源核对，不要求与段落文本逐字一致） */
    text: z.string().min(1),
    rule_refs: z.array(z.string().min(1)).default([]),
    config_refs: z.array(z.string().min(1)).default([]),
  })
  .strict()
  .superRefine((claim, ctx) => {
    if (claim.rule_refs.length === 0 && claim.config_refs.length === 0) {
      ctx.addIssue({ code: "custom", path: ["text"], message: "每条 claim 至少引用一条规则或配置，否则无法溯源" });
    }
    if (claim.text.trim().length === 0) {
      ctx.addIssue({ code: "custom", path: ["text"], message: "claim.text 不能为空白" });
    }
  });
export type ChapterClaim = z.infer<typeof chapterClaimSchema>;

export const chapterParagraphSchema = z
  .object({
    title: z.string().min(1).optional(),
    text: z.string().min(1),
    claims: z.array(chapterClaimSchema).min(1),
  })
  .strict()
  .superRefine((p, ctx) => {
    // 按 trim 后长度判定：空白段落比空字符串更常见（模型常返回空行）
    if (p.text.trim().length === 0) {
      ctx.addIssue({ code: "custom", path: ["text"], message: "段落文本不能为空白" });
    }
  });
export type ChapterParagraph = z.infer<typeof chapterParagraphSchema>;

export const chapterDraftSchema = z
  .object({
    section_id: sectionIdSchema,
    paragraphs: z.array(chapterParagraphSchema).min(1),
  })
  .strict();
export type ChapterDraft = z.infer<typeof chapterDraftSchema>;

export interface ValidateReferencesContext {
  knownRuleIds: ReadonlySet<string>;
  knownConfigIds: ReadonlySet<string>;
}

export interface DraftIssue {
  code:
    | "draft.unknown-rule-ref"
    | "draft.unknown-config-ref"
    | "draft.empty-paragraph"
    | "draft.section-mismatch"
    | "draft.no-paragraphs";
  message: string;
  paragraph_index?: number;
  refs?: string[];
}

/**
 * 服务端引用校验：模型自报的引用一律要在这里对齐有效规则集。
 * 返回空数组表示可以装配；非空表示必须拒绝该章（不允许「丢掉坏引用继续装配」）。
 */
export function validateDraftReferences(
  draft: ChapterDraft,
  ctx: ValidateReferencesContext,
  expectedSectionId?: string,
): DraftIssue[] {
  const issues: DraftIssue[] = [];
  if (expectedSectionId && draft.section_id !== expectedSectionId) {
    issues.push({
      code: "draft.section-mismatch",
      message: `章节不符：期望 ${expectedSectionId}，实际 ${draft.section_id}`,
    });
  }
  if (draft.paragraphs.length === 0) {
    issues.push({ code: "draft.no-paragraphs", message: "章节没有任何段落" });
  }
  draft.paragraphs.forEach((p, i) => {
    if (p.text.trim().length === 0) {
      issues.push({ code: "draft.empty-paragraph", message: "空段落", paragraph_index: i });
    }
    const unknownRules = p.claims.flatMap((c) => c.rule_refs).filter((r) => !ctx.knownRuleIds.has(r));
    const unknownConfigs = p.claims.flatMap((c) => c.config_refs).filter((c) => !ctx.knownConfigIds.has(c));
    if (unknownRules.length > 0) {
      issues.push({
        code: "draft.unknown-rule-ref",
        message: `段落 ${i} 引用了不存在的规则：${[...new Set(unknownRules)].join(", ")}`,
        paragraph_index: i,
        refs: [...new Set(unknownRules)],
      });
    }
    if (unknownConfigs.length > 0) {
      issues.push({
        code: "draft.unknown-config-ref",
        message: `段落 ${i} 引用了不存在的配置：${[...new Set(unknownConfigs)].join(", ")}`,
        paragraph_index: i,
        refs: [...new Set(unknownConfigs)],
      });
    }
  });
  return issues;
}

/** 校验通过后的一章可用引用集合（供装配 Segment 使用） */
export function refsOfDraft(draft: ChapterDraft): { rule_refs: string[]; config_refs: string[] } {
  return {
    rule_refs: [...new Set(draft.paragraphs.flatMap((p) => p.claims.flatMap((c) => c.rule_refs)))],
    config_refs: [...new Set(draft.paragraphs.flatMap((p) => p.claims.flatMap((c) => c.config_refs)))],
  };
}
