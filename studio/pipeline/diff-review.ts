// P1/P2：差异审核输入（人工确认「修改 / 新增」差异是否成立）
// 这是人工写入的权威输入，不是生成产物；生成器只读取，用于把 diff_status 从
// candidate 提升为 confirmed。没有这个输入时，modified / added 一律 candidate。
import { existsSync, readFileSync } from "node:fs";
import { parse } from "yaml";
import { z } from "zod";

export const diffReviewSchema = z
  .object({
    /** 已确认差异成立的规则卡 ID（该卡所有片段一起确认） */
    confirmed_rules: z.array(z.string().min(1)).default([]),
    /** 已确认差异成立的片段 ID（只确认单个片段） */
    confirmed_segments: z.array(z.string().min(1)).default([]),
    /** 备注：谁在什么情况下确认的，可选 */
    note: z.string().optional(),
  })
  .strict();
export type DiffReview = z.infer<typeof diffReviewSchema>;

export interface DiffReviewIndex {
  rules: Set<string>;
  segments: Set<string>;
}

export const emptyDiffReview = (): DiffReviewIndex => ({ rules: new Set(), segments: new Set() });

/** 读取审核文件；文件不存在时返回空索引（等价于「一条都没确认」） */
export function loadDiffReview(path: string): DiffReviewIndex {
  if (!existsSync(path)) return emptyDiffReview();
  const parsed = diffReviewSchema.parse(parse(readFileSync(path, "utf8")) ?? {});
  return { rules: new Set(parsed.confirmed_rules), segments: new Set(parsed.confirmed_segments) };
}

export function toDiffReviewIndex(review: DiffReview | undefined): DiffReviewIndex {
  if (!review) return emptyDiffReview();
  return { rules: new Set(review.confirmed_rules), segments: new Set(review.confirmed_segments) };
}

/** 某个片段是否已被人工确认 */
export function isDiffConfirmed(
  review: DiffReviewIndex,
  ruleId: string,
  segmentId: string,
): boolean {
  return review.rules.has(ruleId) || review.segments.has(segmentId);
}
