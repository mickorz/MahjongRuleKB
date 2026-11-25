// W0-3：审查记录契约测试
// 重点：审查是独立维度；版本变化与编辑会让审查失效，不靠人工记忆。
import { describe, it, expect } from "vitest";

import {
  documentReviewStatus,
  invalidateOnEdit,
  reviewRecordSchema,
  reviewRecordsFileSchema,
  sectionReviewStatus,
  upsertReviewRecord,
  type ReviewRecord,
  type ReviewRecordsFile,
} from "../../../studio/contracts/review.ts";

const at = "2026-11-25T10:00:00.000Z";

const record = (over: Partial<ReviewRecord> = {}): ReviewRecord =>
  reviewRecordSchema.parse({
    review_id: "RVW-0001",
    target: { type: "section", id: "scoring" },
    status: "reviewed",
    document_version: 3,
    reviewer: "策划A",
    at,
    ...over,
  });

const file = (records: ReviewRecord[]): ReviewRecordsFile =>
  reviewRecordsFileSchema.parse({ ruleset_id: "xiaoshan-friends-4p", target_variant: "xiaoshan", records });

describe("W0-3 审查记录", () => {
  it("review_id 必须形如 RVW-0001", () => {
    expect(() => record({ review_id: "CHG-001" })).toThrow();
    expect(record({ review_id: "RVW-00012" }).review_id).toBe("RVW-00012");
  });

  it("同一目标不允许两条记录（防状态打架）", () => {
    expect(() => file([record(), record({ review_id: "RVW-0002" })])).toThrow(/多条审查记录/);
  });

  it("upsert 覆盖同目标记录，而不是追加", () => {
    const f1 = file([record()]);
    const f2 = upsertReviewRecord(f1, record({ review_id: "RVW-0009", status: "unreviewed" }));
    expect(f2.records.length).toBe(1);
    expect(f2.records[0].review_id).toBe("RVW-0009");
  });

  it("文档级与章节级状态彼此独立", () => {
    const f = file([
      record({ review_id: "RVW-0001", target: { type: "document", id: "xiaoshan-friends-4p" } }),
      record({ review_id: "RVW-0002", target: { type: "section", id: "opening" } }),
    ]);
    expect(documentReviewStatus(f, "xiaoshan-friends-4p", 3)).toBe("reviewed");
    expect(sectionReviewStatus(f, "opening", 3)).toBe("reviewed");
    expect(sectionReviewStatus(f, "scoring", 3)).toBe("unreviewed");
  });

  it("版本不匹配时旧审查记录失效（不自动沿用）", () => {
    const f = file([record()]);
    expect(sectionReviewStatus(f, "scoring", 3)).toBe("reviewed");
    expect(sectionReviewStatus(f, "scoring", 4)).toBe("unreviewed");
    expect(documentReviewStatus(f, "xiaoshan-friends-4p", 4)).toBe("unreviewed");
  });

  it("编辑某章节后，该章节与文档级记录一起退回未审", () => {
    const f = file([
      record({ review_id: "RVW-0001", target: { type: "document", id: "xiaoshan-friends-4p" } }),
      record({ review_id: "RVW-0002", target: { type: "section", id: "scoring" } }),
      record({ review_id: "RVW-0003", target: { type: "section", id: "opening" } }),
    ]);
    const next = invalidateOnEdit(f, { section_id: "scoring" }, 4);
    expect(sectionReviewStatus(next, "scoring", 4)).toBe("unreviewed");
    expect(documentReviewStatus(next, "xiaoshan-friends-4p", 4)).toBe("unreviewed");
    // 未受影响章节保持 reviewed（版本同步到新版本）
    expect(sectionReviewStatus(next, "opening", 4)).toBe("reviewed");
  });

  it("编辑片段只让该片段与其所属章节失效", () => {
    const f = file([
      record({ review_id: "RVW-0001", target: { type: "section", id: "scoring" } }),
      record({ review_id: "RVW-0002", target: { type: "segment", id: "SEG-000001" } }),
      record({ review_id: "RVW-0003", target: { type: "segment", id: "SEG-000002" } }),
    ]);
    const next = invalidateOnEdit(f, { section_id: "scoring", segment_id: "SEG-000001" }, 4);
    expect(next.records.find((r) => r.target.id === "SEG-000001")!.status).toBe("unreviewed");
    expect(next.records.find((r) => r.target.id === "SEG-000002")!.status).toBe("reviewed");
  });

  it("invalidateOnEdit 不修改入参（纯函数）", () => {
    const f = file([record()]);
    const before = JSON.stringify(f);
    invalidateOnEdit(f, { section_id: "scoring" }, 5);
    expect(JSON.stringify(f)).toBe(before);
  });

  it("缺记录文件时一律未审（不猜）", () => {
    expect(documentReviewStatus(undefined, "x", 0)).toBe("unreviewed");
    expect(sectionReviewStatus(undefined, "scoring", 0)).toBe("unreviewed");
  });
});
