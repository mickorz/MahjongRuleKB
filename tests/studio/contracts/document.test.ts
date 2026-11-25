// 文档契约测试：Document / DocumentBlock / Segment 的合法与非法样本
import { describe, it, expect } from "vitest";
import { documentSchema, segmentSchema } from "../../../studio/contracts/document.ts";

const refs = { requirement_refs: [], rule_refs: ["HJ-R-LUNZHUANG"], config_refs: [], source_evidence_refs: ["rulebook/sources/hangzhou/hangzhou-core-flow.md#2.3.2.4"] };

const segment = {
  segment_id: "SEG-000001",
  text: "胡牌者担任下一小局庄家。",
  editable: true,
  lineage: "base",
  decision_status: "confirmed",
  diff_status: "not_applicable",
  release_blocker_refs: [],
  references: refs,
};

const block = {
  block_id: "DOC-HJ-000001",
  logical_block_id: "LBL-OPENING-ZHUANG-01",
  section_id: "opening",
  type: "paragraph",
  document_version: 3,
  content: [segment],
  references: refs,
};

const doc = {
  ruleset_id: "hangzhou-friends-4p",
  target_variant: "hangzhou",
  template_version: "1.0.0",
  ruleset_version: "1.2.0",
  document_version: 3,
  blocks: [block],
  segment_lineage: [],
};

describe("Document / Block / Segment 契约", () => {
  it("合法文档通过校验", () => {
    const r = documentSchema.safeParse(doc);
    expect(r.success, r.success ? "" : JSON.stringify(r.error.issues)).toBe(true);
  });

  it("顶层 document_version 是必需字段", () => {
    const { document_version, ...rest } = doc;
    expect(documentSchema.safeParse(rest).success).toBe(false);
  });

  it("块版本快照不得高于文档版本", () => {
    const bad = { ...doc, blocks: [{ ...block, document_version: 9 }] };
    expect(documentSchema.safeParse(bad).success).toBe(false);
  });

  it("block_id / segment_id 不得重复", () => {
    expect(documentSchema.safeParse({ ...doc, blocks: [block, block] }).success).toBe(false);
    const dupSeg = { ...block, content: [segment, segment] };
    expect(documentSchema.safeParse({ ...doc, blocks: [dupSeg] }).success).toBe(false);
  });

  it("块级聚合引用必须等于片段并集", () => {
    const bad = { ...doc, blocks: [{ ...block, references: { ...refs, rule_refs: [] } }] };
    expect(documentSchema.safeParse(bad).success).toBe(false);
  });

  it("纯数值片段不得 editable", () => {
    const bad = { ...segment, text: "24", editable: true };
    expect(segmentSchema.safeParse(bad).success).toBe(false);
  });

  it("非 not_applicable 的差异片段必须给 base_rule_ref", () => {
    const bad = { ...segment, diff_status: "confirmed" };
    expect(segmentSchema.safeParse(bad).success).toBe(false);
    const ok = { ...bad, base_rule_ref: "HJ-R-LUNZHUANG" };
    expect(segmentSchema.safeParse(ok).success).toBe(true);
  });

  it("未知字段被拒绝（strict 边界）", () => {
    const bad = { ...doc, extra_field: true };
    expect(documentSchema.safeParse(bad).success).toBe(false);
  });

  it("非法 lineage / decision_status / diff_status 被拒绝", () => {
    expect(segmentSchema.safeParse({ ...segment, lineage: "copied" }).success).toBe(false);
    expect(segmentSchema.safeParse({ ...segment, decision_status: "pending" }).success).toBe(false);
    expect(segmentSchema.safeParse({ ...segment, diff_status: "unknown" }).success).toBe(false);
  });
});
