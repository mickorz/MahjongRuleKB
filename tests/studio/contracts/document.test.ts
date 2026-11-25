// 文档契约测试：Document / DocumentBlock / Segment 的合法与非法样本
import { describe, it, expect } from "vitest";
import { documentBlockSchema, documentSchema, segmentSchema, unionReferences } from "../../../studio/contracts/document.ts";

const refs = {
  requirement_refs: [],
  rule_refs: ["HJ-R-LUNZHUANG"],
  config_refs: [],
  source_evidence_refs: ["rulebook/sources/hangzhou/hangzhou-core-flow.md#2.3.2.4"],
};

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

/** 当前文档只包含给定片段 ID（用于构造真实的拆分/合并后状态） */
const docWithSegments = (ids: string[]) => ({
  ...doc,
  blocks: [{ ...block, content: ids.map((id) => ({ ...segment, segment_id: id })) }],
});

const okDoc = (v: unknown) => documentSchema.safeParse(v).success;

describe("Document / Block / Segment 契约", () => {
  it("合法文档通过校验", () => {
    const r = documentSchema.safeParse(doc);
    expect(r.success, r.success ? "" : JSON.stringify(r.error.issues)).toBe(true);
  });

  it("顶层 document_version 是必需字段", () => {
    const { document_version, ...rest } = doc;
    expect(okDoc(rest)).toBe(false);
  });

  it("块版本快照不得高于文档版本", () => {
    expect(okDoc({ ...doc, blocks: [{ ...block, document_version: 9 }] })).toBe(false);
  });

  it("block_id / segment_id 不得重复", () => {
    expect(okDoc({ ...doc, blocks: [block, block] })).toBe(false);
    expect(okDoc({ ...doc, blocks: [{ ...block, content: [segment, segment] }] })).toBe(false);
  });

  it("块级聚合引用必须等于片段并集（不多不少）", () => {
    expect(documentBlockSchema.safeParse({ ...block, references: { ...refs, rule_refs: [] } }).success).toBe(false);
    expect(
      documentBlockSchema.safeParse({ ...block, references: { ...refs, rule_refs: [...refs.rule_refs, "HJ-R-CHI"] } })
        .success,
    ).toBe(false);
  });

  it("单独使用 documentBlockSchema 也校验引用并集（已下沉）", () => {
    expect(documentBlockSchema.safeParse({ ...block, references: { ...refs, config_refs: ["HJ-C-DIFEN"] } }).success).toBe(
      false,
    );
  });

  it("unionReferences 与块聚合一致", () => {
    expect(unionReferences([segment as never])).toEqual({
      requirement_refs: [],
      rule_refs: ["HJ-R-LUNZHUANG"],
      config_refs: [],
      source_evidence_refs: ["rulebook/sources/hangzhou/hangzhou-core-flow.md#2.3.2.4"],
    });
  });

  it("纯数值片段不得 editable", () => {
    expect(segmentSchema.safeParse({ ...segment, text: "24", editable: true }).success).toBe(false);
  });

  it("公式类片段不得 editable", () => {
    for (const text of ["底分 × 庄家倍率 × 牢数", "a + b", "底分 1 × 8 = 8", "12 ÷ 3"]) {
      expect(segmentSchema.safeParse({ ...segment, text, editable: true }).success, text).toBe(false);
    }
  });

  it("公式判定不误伤普通文本（日期 / 连字符 / 斜杠）", () => {
    for (const text of [
      "庄家-闲家之间的结算关系",
      "A/B 两种处理方式",
      "2026-11-24 起生效",
      "流局-连庄的判断",
    ]) {
      expect(segmentSchema.safeParse({ ...segment, text, editable: true }).success, text).toBe(true);
    }
  });

  it("formula 块内所有片段必须 editable=false", () => {
    const formulaBlock = { ...block, type: "formula" };
    expect(documentBlockSchema.safeParse(formulaBlock).success).toBe(false);
    expect(
      documentBlockSchema.safeParse({
        ...formulaBlock,
        content: [{ ...segment, text: "底分 × 庄家倍率", editable: false }],
      }).success,
    ).toBe(true);
  });

  it("base 片段不得给 base_rule_ref", () => {
    expect(segmentSchema.safeParse({ ...segment, base_rule_ref: "HJ-R-CHI" }).success).toBe(false);
  });

  it("added 片段不需要 base_rule_ref，且允许 diff_status=confirmed", () => {
    const added = {
      ...segment,
      lineage: "added",
      diff_status: "confirmed",
      references: { ...refs, rule_refs: ["XS-R-NEW-RULE"] },
    };
    expect(segmentSchema.safeParse(added).success).toBe(true);
    expect(segmentSchema.safeParse({ ...added, base_rule_ref: "HJ-R-CHI" }).success).toBe(false);
  });

  it("inherited / modified 片段必须给 base_rule_ref", () => {
    for (const lineage of ["explicit_inherited", "default_inherited", "modified"]) {
      const bad = { ...segment, lineage, diff_status: "candidate" };
      expect(segmentSchema.safeParse(bad).success, lineage).toBe(false);
      expect(segmentSchema.safeParse({ ...bad, base_rule_ref: "HJ-R-LUNZHUANG" }).success, lineage).toBe(true);
    }
  });

  it("base_rule_ref 只接受规则或配置 ID，拒绝未决项与非法类型", () => {
    const inherited = { ...segment, lineage: "modified", diff_status: "candidate" };
    expect(segmentSchema.safeParse({ ...inherited, base_rule_ref: "HJ-C-DIFEN" }).success).toBe(true);
    expect(segmentSchema.safeParse({ ...inherited, base_rule_ref: "HJ-U-001" }).success).toBe(false);
    expect(segmentSchema.safeParse({ ...inherited, base_rule_ref: "HJ-D-INVALID" }).success).toBe(false);
  });

  it("基座片段 diff_status 只能 not_applicable", () => {
    expect(segmentSchema.safeParse({ ...segment, diff_status: "candidate" }).success).toBe(false);
  });

  it("真实拆分：历史片段已不在当前文档，仍应通过", () => {
    // V4 只有新片段；SEG-000001 是历史（V3）片段
    const d = docWithSegments(["SEG-000002", "SEG-000003"]);
    const split = {
      ...d,
      segment_lineage: [{ type: "split", from_segment_ids: ["SEG-000001"], to_segment_ids: ["SEG-000002", "SEG-000003"] }],
    };
    const r = documentSchema.safeParse(split);
    expect(r.success, r.success ? "" : JSON.stringify(r.error.issues)).toBe(true);
  });

  it("真实合并：多个历史片段 → 当前一个新片段", () => {
    const d = docWithSegments(["SEG-000003"]);
    const merge = {
      ...d,
      segment_lineage: [{ type: "merge", from_segment_ids: ["SEG-000001", "SEG-000002"], to_segment_ids: ["SEG-000003"] }],
    };
    expect(okDoc(merge)).toBe(true);
  });

  it("split：必须一个旧片段 → 至少两个新片段", () => {
    const d = docWithSegments(["SEG-000002", "SEG-000003"]);
    expect(
      okDoc({ ...d, segment_lineage: [{ type: "split", from_segment_ids: ["SEG-000001", "SEG-000009"], to_segment_ids: ["SEG-000002", "SEG-000003"] }] }),
    ).toBe(false);
    expect(
      okDoc({ ...d, segment_lineage: [{ type: "split", from_segment_ids: ["SEG-000001"], to_segment_ids: ["SEG-000002"] }] }),
    ).toBe(false);
  });

  it("merge：必须至少两个旧片段 → 一个新片段", () => {
    const d = docWithSegments(["SEG-000003"]);
    expect(
      okDoc({ ...d, segment_lineage: [{ type: "merge", from_segment_ids: ["SEG-000001"], to_segment_ids: ["SEG-000003"] }] }),
    ).toBe(false);
    expect(
      okDoc({
        ...d,
        segment_lineage: [{ type: "merge", from_segment_ids: ["SEG-000001", "SEG-000002"], to_segment_ids: ["SEG-000003", "SEG-000004"] }],
      }),
    ).toBe(false);
  });

  it("to_segment_ids 必须存在于当前文档", () => {
    const d = docWithSegments(["SEG-000002"]);
    expect(
      okDoc({ ...d, segment_lineage: [{ type: "split", from_segment_ids: ["SEG-000001"], to_segment_ids: ["SEG-000002", "SEG-000099"] }] }),
    ).toBe(false);
  });

  it("新旧片段 ID 不得重叠", () => {
    const d = docWithSegments(["SEG-000001", "SEG-000002"]);
    expect(
      okDoc({ ...d, segment_lineage: [{ type: "split", from_segment_ids: ["SEG-000001"], to_segment_ids: ["SEG-000001", "SEG-000002"] }] }),
    ).toBe(false);
  });

  it("未知字段被拒绝（顶层与嵌套）", () => {
    expect(okDoc({ ...doc, extra_field: true })).toBe(false);
    expect(okDoc({ ...doc, blocks: [{ ...block, extra: 1 }] })).toBe(false);
    expect(documentBlockSchema.safeParse({ ...block, references: { ...refs, unexpected: true } }).success).toBe(false);
    expect(segmentSchema.safeParse({ ...segment, references: { ...refs, unexpected: true } }).success).toBe(false);
  });

  it("非法 lineage / decision_status / diff_status 被拒绝", () => {
    expect(segmentSchema.safeParse({ ...segment, lineage: "copied" }).success).toBe(false);
    expect(segmentSchema.safeParse({ ...segment, decision_status: "pending" }).success).toBe(false);
    expect(segmentSchema.safeParse({ ...segment, diff_status: "unknown" }).success).toBe(false);
  });
});
