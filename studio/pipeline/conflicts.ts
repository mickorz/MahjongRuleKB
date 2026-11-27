// W5-3：冲突报告与人工解决
// 边界：合并器只产冲突，不替人做决定；解决结论由人给出并落盘为可审计的 decisions。
import { z } from "zod";

import type { MergeConflict, MergeResult } from "./merge3.ts";

export const conflictReportSchema = z
  .object({
    generated_at: z.string().datetime(),
    base_old_document_version: z.number().int().nonnegative(),
    base_new_document_version: z.number().int().nonnegative(),
    conflicts: z.array(
      z
        .object({
          conflict_id: z.string().regex(/^CFL-\d{3}$/),
          kind: z.enum(["override-vs-regeneration", "override-vs-removal", "orphan-override"]),
          segment_id: z.string().min(1),
          section_id: z.string().min(1),
          base_rule_ref: z.string().min(1).optional(),
          old_text: z.string().optional(),
          new_text: z.string().optional(),
          override_text: z.string().optional(),
          suggested: z.enum(["keep-override", "take-regeneration", "manual"]),
        })
        .strict(),
    ),
    /** 自动采用与保留人工的摘要，便于核对合并结果 */
    summary: z
      .object({
        auto_adopted: z.number().int().nonnegative(),
        kept_overrides: z.number().int().nonnegative(),
        removed: z.number().int().nonnegative(),
        conflicts: z.number().int().nonnegative(),
      })
      .strict(),
  })
  .strict();
export type ConflictReport = z.infer<typeof conflictReportSchema>;

export function buildConflictReport(
  merge: MergeResult,
  versions: { baseOld: number; baseNew: number },
  now = new Date().toISOString(),
): ConflictReport {
  return conflictReportSchema.parse({
    generated_at: now,
    base_old_document_version: versions.baseOld,
    base_new_document_version: versions.baseNew,
    conflicts: merge.conflicts.map((c) => ({
      conflict_id: c.conflict_id,
      kind: c.kind,
      segment_id: c.segment_id,
      section_id: c.section_id,
      ...(c.base_rule_ref ? { base_rule_ref: c.base_rule_ref } : {}),
      ...(c.old_text !== undefined ? { old_text: c.old_text } : {}),
      ...(c.new_text !== undefined ? { new_text: c.new_text } : {}),
      ...(c.override_text !== undefined ? { override_text: c.override_text } : {}),
      suggested: c.suggested,
    })),
    summary: {
      auto_adopted: merge.autoAdopted.length,
      kept_overrides: merge.keptOverrides.length,
      removed: merge.removed.length,
      conflicts: merge.conflicts.length,
    },
  });
}

export const conflictDecisionSchema = z
  .object({
    conflict_id: z.string().regex(/^CFL-\d{3}$/),
    decision: z.enum(["keep-override", "take-regeneration", "manual"]),
    /** manual 时必须给出最终文本；其余情况不得提供（避免歧义） */
    text: z.string().min(1).optional(),
    by: z.string().min(1),
    at: z.string().datetime(),
    note: z.string().optional(),
  })
  .strict()
  .superRefine((d, ctx) => {
    if (d.decision === "manual" && !d.text) {
      ctx.addIssue({ code: "custom", path: ["text"], message: "manual 决定必须给出最终文本" });
    }
    if (d.decision !== "manual" && d.text) {
      ctx.addIssue({ code: "custom", path: ["text"], message: `${d.decision} 不应携带文本` });
    }
  });
export type ConflictDecision = z.infer<typeof conflictDecisionSchema>;

export interface Resolution {
  segment_id: string;
  /** 最终文本；undefined 表示该片段被移除 */
  text?: string;
  source: "override" | "regeneration" | "manual" | "removed";
}

export class UnresolvedConflictError extends Error {
  readonly conflictIds: string[];
  constructor(ids: string[]) {
    super(`仍有 ${ids.length} 条冲突未裁决：${ids.join("、")}`);
    this.name = "UnresolvedConflictError";
    this.conflictIds = ids;
  }
}

/**
 * 按人给的裁决生成最终内容。
 * 未裁决的冲突直接抛错——不允许「剩下几条用默认值糊过去」。
 */
export function resolveConflicts(conflicts: ReadonlyArray<MergeConflict>, decisions: ReadonlyArray<ConflictDecision>): Resolution[] {
  const byId = new Map(decisions.map((d) => [d.conflict_id, d]));
  const missing = conflicts.filter((c) => !byId.has(c.conflict_id)).map((c) => c.conflict_id);
  if (missing.length > 0) throw new UnresolvedConflictError(missing);

  return conflicts.map((conflict) => {
    const decision = byId.get(conflict.conflict_id)!;
    if (decision.decision === "keep-override") {
      if (conflict.override_text === undefined) {
        throw new Error(`${conflict.conflict_id} 选择保留人工，但报告里没有 override_text`);
      }
      return { segment_id: conflict.segment_id, text: conflict.override_text, source: "override" as const };
    }
    if (decision.decision === "take-regeneration") {
      if (conflict.new_text === undefined) {
        // 新生成已删除该片段：选择取新生成等于确认删除
        return { segment_id: conflict.segment_id, source: "removed" as const };
      }
      return { segment_id: conflict.segment_id, text: conflict.new_text, source: "regeneration" as const };
    }
    return { segment_id: conflict.segment_id, text: decision.text!, source: "manual" as const };
  });
}

/** 人读摘要：贴 PR 或进度文档用 */
export function summarizeConflictReport(report: ConflictReport): string {
  const lines = [
    `冲突报告（基座 v${report.base_old_document_version} → v${report.base_new_document_version}）`,
    `自动采用 ${report.summary.auto_adopted}｜保留人工 ${report.summary.kept_overrides}｜移除 ${report.summary.removed}｜冲突 ${report.summary.conflicts}`,
  ];
  for (const c of report.conflicts) {
    lines.push(`- ${c.conflict_id} ${c.kind}：${c.segment_id}（${c.section_id}）建议 ${c.suggested}`);
  }
  return `${lines.join("\n")}\n`;
}
