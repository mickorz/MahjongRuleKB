// W0-3：审查记录契约（独立于 Segment，对应评审 P0-3）
// 为什么独立：一张 Segment 无法同时表达「本章已审」「整篇已审」；
// 且产品要求审查粒度可配置，塞进 Segment 会让粒度变化变成 Schema 变更。
// 本记录与 diff_status（人工确认差异）、machine_check_status（机器检查）互不替代。
import { z } from "zod";

export const reviewTargetTypeValues = ["document", "section", "segment"] as const;
export type ReviewTargetType = (typeof reviewTargetTypeValues)[number];

export const reviewStatusValues = ["unreviewed", "reviewed"] as const;
export type ReviewStatus = (typeof reviewStatusValues)[number];

export const reviewRecordSchema = z
  .object({
    review_id: z.string().regex(/^RVW-\d{4,}$/, "review_id 形如 RVW-0001"),
    target: z
      .object({
        type: z.enum(reviewTargetTypeValues),
        /** document 级用 ruleset_id；section 级用 section_id；segment 级用 segment_id */
        id: z.string().min(1),
      })
      .strict(),
    status: z.enum(reviewStatusValues),
    /** 审查针对的文档版本：版本变化后旧记录不自动沿用 */
    document_version: z.number().int().nonnegative(),
    reviewer: z.string().min(1),
    at: z.string().datetime(),
    note: z.string().optional(),
  })
  .strict();
export type ReviewRecord = z.infer<typeof reviewRecordSchema>;

/** 审查记录文件（documents/<variant>/review-records.json） */
export const reviewRecordsFileSchema = z
  .object({
    ruleset_id: z.string().min(1),
    target_variant: z.string().min(1),
    records: z.array(reviewRecordSchema),
  })
  .strict()
  .superRefine((file, ctx) => {
    const seen = new Set<string>();
    for (const r of file.records) {
      const key = `${r.target.type}:${r.target.id}`;
      if (seen.has(key)) {
        ctx.addIssue({ code: "custom", path: ["records"], message: `同一目标存在多条审查记录：${key}` });
      }
      seen.add(key);
    }
  });
export type ReviewRecordsFile = z.infer<typeof reviewRecordsFileSchema>;

/** 文档级审查状态：只认「对当前文档版本」的记录 */
export function documentReviewStatus(file: ReviewRecordsFile | undefined, rulesetId: string, documentVersion: number): ReviewStatus {
  if (!file) return "unreviewed";
  const hit = file.records.find(
    (r) => r.target.type === "document" && r.target.id === rulesetId && r.document_version === documentVersion && r.status === "reviewed",
  );
  return hit ? "reviewed" : "unreviewed";
}

/** 章节级审查状态 */
export function sectionReviewStatus(
  file: ReviewRecordsFile | undefined,
  sectionId: string,
  documentVersion: number,
): ReviewStatus {
  if (!file) return "unreviewed";
  const hit = file.records.find(
    (r) => r.target.type === "section" && r.target.id === sectionId && r.document_version === documentVersion && r.status === "reviewed",
  );
  return hit ? "reviewed" : "unreviewed";
}

/**
 * 编辑后失效：被编辑的目标及其上级记录退回 unreviewed。
 * 返回新文件（不改入参）。上级失效而非仅自身，是因为「章节已审」在章节内容变化后不再成立。
 */
export function invalidateOnEdit(
  file: ReviewRecordsFile,
  edited: { section_id?: string; segment_id?: string },
  nextDocumentVersion: number,
): ReviewRecordsFile {
  // 所有记录随文档版本前进；只有被编辑目标及其上级退回 unreviewed。
  // 这样「编辑第 3 章」不会把第 5 章的审查结论误判为失效。
  const records = file.records.map((r) => {
    const hitSegment = edited.segment_id !== undefined && r.target.type === "segment" && r.target.id === edited.segment_id;
    const hitSection = edited.section_id !== undefined && r.target.type === "section" && r.target.id === edited.section_id;
    const hitDocument = r.target.type === "document";
    const status: ReviewStatus = hitSegment || hitSection || hitDocument ? "unreviewed" : r.status;
    return { ...r, status, document_version: nextDocumentVersion };
  });
  return reviewRecordsFileSchema.parse({ ...file, records });
}

/** 新增一条审查记录；同一目标已存在则替换（保持单目标单记录） */
export function upsertReviewRecord(file: ReviewRecordsFile, record: ReviewRecord): ReviewRecordsFile {
  const rest = file.records.filter((r) => !(r.target.type === record.target.type && r.target.id === record.target.id));
  return reviewRecordsFileSchema.parse({ ...file, records: [...rest, record] });
}
