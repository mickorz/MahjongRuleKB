// W5-1：影响分析 + W5-2：三方合并（按 W5-0 设计判定表）
import { describe, it, expect } from "vitest";

import { analyzeVariantImpact, conflictId, diffBaseDocuments, summarizeImpact } from "../../../studio/pipeline/impact.ts";
import { merge3, type MergeInput } from "../../../studio/pipeline/merge3.ts";
import { documentSchema } from "../../../studio/contracts/document.ts";
import { block, documentFixture, segment } from "../fixtures.ts";
import type { VariantRule } from "../../../studio/pipeline/generate-variant-ai.ts";

const seg = (id: string, text: string, over: Record<string, unknown> = {}) => ({ ...segment(id), text, ...over });

const docWith = (blocks: Array<{ section: string; segments: ReturnType<typeof seg>[] }>, version = 3) =>
  documentSchema.parse({
    ...documentFixture({ document_version: version }),
    blocks: blocks.map((b, i) => block(b.segments as never[], { block_id: `DOC-HJ-00000${i + 1}`, section_id: b.section, document_version: version })),
  });

const rule = (id: string, over: Partial<VariantRule> = {}): VariantRule => ({
  id,
  name: id,
  body: "- **结果**：x",
  origin: "variant",
  evidence: ["rulebook/sources/hangzhou/hangzhou-core-flow.md#1.1"],
  depends_on: [],
  ...over,
});

describe("W5-1 基座影响分析", () => {
  const oldDoc = docWith([
    { section: "opening", segments: [seg("SEG-000001", "定庄规则 v1", { references: { requirement_refs: [], rule_refs: ["HJ-R-DINGZHUANG"], config_refs: [], source_evidence_refs: [] } })] },
    { section: "gameplay", segments: [seg("SEG-000002", "吃碰规则", { references: { requirement_refs: [], rule_refs: ["HJ-R-CHI"], config_refs: [], source_evidence_refs: [] } })] },
  ]);
  const newDoc = docWith([
    { section: "opening", segments: [seg("SEG-000101", "定庄规则 v2", { references: { requirement_refs: [], rule_refs: ["HJ-R-DINGZHUANG"], config_refs: [], source_evidence_refs: [] } })] },
    { section: "scoring", segments: [seg("SEG-000102", "全新算分规则", { references: { requirement_refs: [], rule_refs: ["HJ-F-NEW"], config_refs: [], source_evidence_refs: [] } })] },
  ]);

  it("识别新增 / 移除 / 修改的规则", () => {
    const impact = diffBaseDocuments(oldDoc, newDoc);
    expect(impact.changedRules.added).toContain("HJ-F-NEW");
    expect(impact.changedRules.removed).toContain("HJ-R-CHI");
    expect(impact.changedRules.modified).toContain("HJ-R-DINGZHUANG");
  });

  it("给出变化片段与受影响章节", () => {
    const impact = diffBaseDocuments(oldDoc, newDoc);
    expect(impact.changedSegments).toEqual(expect.arrayContaining(["SEG-000001", "SEG-000002", "SEG-000101"]));
    expect(impact.impactedSections.sort()).toEqual(["opening", "scoring"]);
  });

  it("文档完全相同时无任何变化", () => {
    const impact = diffBaseDocuments(oldDoc, oldDoc);
    expect(impact.changedRules.added).toEqual([]);
    expect(impact.changedRules.removed).toEqual([]);
    expect(impact.changedRules.modified).toEqual([]);
    expect(impact.changedSegments).toEqual([]);
  });

  it("变体影响：继承片段按身份/规则命中，modified 按 base_segment_ref 命中", () => {
    const baseImpact = diffBaseDocuments(oldDoc, newDoc);
    const variantDoc = docWith([
      {
        section: "opening",
        segments: [
          seg("SEG-000001", "定庄规则 v1", { lineage: "default_inherited", base_rule_ref: "HJ-R-DINGZHUANG" }),
          seg("SEG-000200", "萧山自己的定庄", { lineage: "modified", diff_status: "candidate", base_rule_ref: "HJ-R-DINGZHUANG", base_segment_ref: "SEG-000001" }),
          seg("SEG-000300", "萧山跟庄", { lineage: "added" }),
        ],
      },
    ]);
    const impact = analyzeVariantImpact(variantDoc, baseImpact);
    expect(impact.inheritedAffected).toContain("SEG-000001");
    expect(impact.modifiedAffected).toContain("SEG-000200");
  });

  it("added 规则按其依赖重查", () => {
    const baseImpact = diffBaseDocuments(oldDoc, newDoc);
    const impact = analyzeVariantImpact(oldDoc, baseImpact, [
      rule("XS-R-TUODI", { change_type: "added", depends_on: ["HJ-R-DINGZHUANG"] }),
      rule("XS-R-GENZHUANG", { change_type: "added", depends_on: ["HJ-R-PENG"] }),
    ]);
    expect(impact.addedToRecheck).toEqual(["XS-R-TUODI"]);
  });

  it("人读摘要包含三段信息", () => {
    const text = summarizeImpact(diffBaseDocuments(oldDoc, newDoc), { inheritedAffected: ["SEG-1"], modifiedAffected: [], addedToRecheck: [] });
    expect(text).toContain("基座变化");
    expect(text).toContain("受影响章节");
    expect(text).toContain("变体影响");
  });

  it("冲突 ID 形如 CFL-001", () => {
    expect(conflictId(1)).toBe("CFL-001");
    expect(conflictId(42)).toBe("CFL-042");
  });
});

describe("W5-2 三方合并（W5-0 判定表）", () => {
  const base = (oldText: string) => ({ kind: "generated" as const, oldText, newText: oldText });
  const mk = (over: Partial<MergeInput>): MergeInput => ({
    segment_id: "SEG-000001",
    section_id: "opening",
    old: undefined,
    currentOverride: undefined,
    new: undefined,
    ...over,
  });

  it("无人工改动、生成变化 → 采用新生成", () => {
    const r = merge3([mk({ old: base("旧"), new: "新" })]);
    expect(r.autoAdopted).toEqual([{ segment_id: "SEG-000001", text: "新", reason: "regenerated" }]);
    expect(r.conflicts).toEqual([]);
  });

  it("有人工改动、生成未变 → 保留人工", () => {
    const r = merge3([mk({ old: base("旧"), currentOverride: "人工改", new: "旧" })]);
    expect(r.keptOverrides).toEqual([{ segment_id: "SEG-000001", text: "人工改" }]);
    expect(r.conflicts).toEqual([]);
  });

  it("两边都变 → 冲突，禁止自动取边", () => {
    const r = merge3([mk({ old: base("旧"), currentOverride: "人工改", new: "新" })]);
    expect(r.autoAdopted).toEqual([]);
    expect(r.keptOverrides).toEqual([]);
    expect(r.conflicts.length).toBe(1);
    expect(r.conflicts[0].kind).toBe("override-vs-regeneration");
    expect(r.conflicts[0].suggested).toBe("keep-override");
    expect(r.conflicts[0].override_text).toBe("人工改");
  });

  it("新生成删除了有人工改动的片段 → 冲突（不得静默删）", () => {
    const r = merge3([mk({ old: base("旧"), currentOverride: "人工改", new: undefined })]);
    expect(r.conflicts.length).toBe(1);
    expect(r.conflicts[0].kind).toBe("override-vs-removal");
  });

  it("新生成删除且无人工改动 → 直接移除", () => {
    const r = merge3([mk({ old: base("旧"), new: undefined })]);
    expect(r.removed).toEqual(["SEG-000001"]);
    expect(r.conflicts).toEqual([]);
  });

  it("新生成新增片段 → 直接采用", () => {
    const r = merge3([mk({ old: undefined, new: "全新片段" })]);
    expect(r.autoAdopted).toEqual([{ segment_id: "SEG-000001", text: "全新片段", reason: "new-segment" }]);
  });

  it("override 指向已不存在的片段 → orphan 冲突", () => {
    const r = merge3([mk({ old: undefined, currentOverride: "孤儿改", new: undefined })]);
    expect(r.conflicts.length).toBe(1);
    expect(r.conflicts[0].kind).toBe("orphan-override");
  });

  it("完全无变化时什么都不输出", () => {
    const r = merge3([mk({ old: base("旧"), new: "旧" })]);
    expect(r.autoAdopted).toEqual([]);
    expect(r.keptOverrides).toEqual([]);
    expect(r.conflicts).toEqual([]);
    expect(r.removed).toEqual([]);
  });

  it("冲突 ID 递增且报告带章节与对照文本", () => {
    const r = merge3([
      mk({ segment_id: "SEG-000001", old: base("旧1"), currentOverride: "人工1", new: "新1" }),
      mk({ segment_id: "SEG-000002", old: base("旧2"), currentOverride: "人工2", new: "新2" }),
    ]);
    expect(r.conflicts.map((c) => c.conflict_id)).toEqual(["CFL-001", "CFL-002"]);
    expect(r.conflicts[0]).toMatchObject({ section_id: "opening", old_text: "旧1", new_text: "新1" });
  });
});
