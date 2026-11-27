// W4-3 服务端：审查记录读写（actor = server, intent = apply-review）
// 位置：documents/<variant>/review-records.json（产物注册表已登记为 server 专属写入）
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  documentReviewStatus,
  reviewRecordsFileSchema,
  sectionReviewStatus,
  upsertReviewRecord,
  type ReviewRecord,
  type ReviewRecordsFile,
  type ReviewStatus,
} from "../contracts/review.ts";
import { assertWritable } from "../paths/registry.ts";

export const reviewRecordsPath = (variant: string) => `documents/${variant}/review-records.json`;

export function emptyReviewFile(rulesetId: string, variant: string): ReviewRecordsFile {
  return reviewRecordsFileSchema.parse({ ruleset_id: rulesetId, target_variant: variant, records: [] });
}

export function readReviewFile(kbRoot: string, variant: string, rulesetId: string): ReviewRecordsFile {
  const rel = assertWritable("server", "apply-review", reviewRecordsPath(variant));
  const file = join(kbRoot, rel);
  if (!existsSync(file)) return emptyReviewFile(rulesetId, variant);
  const parsed = reviewRecordsFileSchema.safeParse(JSON.parse(readFileSync(file, "utf8")));
  return parsed.success ? parsed.data : emptyReviewFile(rulesetId, variant);
}

export interface MarkReviewedInput {
  kbRoot: string;
  variant: string;
  rulesetId: string;
  target: { type: "document" | "section" | "segment"; id: string };
  status: ReviewStatus;
  documentVersion: number;
  reviewer: string;
  now?: string;
  note?: string;
}

/** 写入/更新一条审查记录；返回更新后的整份文件 */
export function markReviewed(input: MarkReviewedInput): ReviewRecordsFile {
  const rel = assertWritable("server", "apply-review", reviewRecordsPath(input.variant));
  const file = join(input.kbRoot, rel);
  const current = readReviewFile(input.kbRoot, input.variant, input.rulesetId);
  const nextId = `RVW-${String(current.records.length + 1).padStart(4, "0")}`;
  const record: ReviewRecord = {
    review_id: current.records.some((r) => r.target.type === input.target.type && r.target.id === input.target.id)
      ? (current.records.find((r) => r.target.type === input.target.type && r.target.id === input.target.id)!.review_id)
      : nextId,
    target: input.target,
    status: input.status,
    document_version: input.documentVersion,
    reviewer: input.reviewer,
    at: input.now ?? new Date().toISOString(),
    ...(input.note ? { note: input.note } : {}),
  };
  const next = upsertReviewRecord(current, record);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return next;
}

/** 汇总：文档级 + 各章节审查状态（供 GET /api/reviews） */
export function reviewSummary(
  file: ReviewRecordsFile,
  rulesetId: string,
  documentVersion: number,
  sectionIds: ReadonlyArray<string>,
): { document: ReviewStatus; sections: Record<string, ReviewStatus> } {
  const sections: Record<string, ReviewStatus> = {};
  for (const id of sectionIds) sections[id] = sectionReviewStatus(file, id, documentVersion);
  return { document: documentReviewStatus(file, rulesetId, documentVersion), sections };
}
