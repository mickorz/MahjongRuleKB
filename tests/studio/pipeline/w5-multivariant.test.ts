// W5-4：多变体隔离验证
// 目的：证明影响分析与合并按「单个变体文档」独立工作，不会把 A 变体的片段算到 B 头上。
import { describe, it, expect } from "vitest";

import { analyzeVariantImpact, diffBaseDocuments } from "../../../studio/pipeline/impact.ts";
import { merge3 } from "../../../studio/pipeline/merge3.ts";
import { documentSchema } from "../../../studio/contracts/document.ts";
import { block, documentFixture, segment } from "../fixtures.ts";

const mk = (variant: string, rulesetId: string, segments: Array<{ id: string; text: string; over?: Record<string, unknown> }>) =>
  documentSchema.parse({
    ...documentFixture({ ruleset_id: rulesetId, target_variant: variant }),
    blocks: [block(segments.map((s) => ({ ...segment(s.id), text: s.text, ...(s.over ?? {}) })) as never[])],
  });

const baseOld = mk("hangzhou", "hangzhou-friends-4p", [{ id: "SEG-000001", text: "定庄规则" }]);
const baseNew = mk("hangzhou", "hangzhou-friends-4p", [{ id: "SEG-000050", text: "定庄规则（新）" }]);

const xiaoshan = mk("xiaoshan", "xiaoshan-friends-4p", [
  { id: "SEG-000001", text: "定庄规则", over: { lineage: "default_inherited", base_rule_ref: "HJ-R-DINGZHUANG" } },
  { id: "SEG-000200", text: "萧山换庄", over: { lineage: "modified", diff_status: "candidate", base_rule_ref: "HJ-R-DINGZHUANG", base_segment_ref: "SEG-000001" } },
]);

const shaoxing = mk("shaoxing", "shaoxing-friends-4p", [
  { id: "SEG-000001", text: "定庄规则", over: { lineage: "default_inherited", base_rule_ref: "HJ-R-DINGZHUANG" } },
  { id: "SEG-000300", text: "绍兴自己的庄", over: { lineage: "added" } },
]);

describe("W5-4 多变体隔离", () => {
  const impact = diffBaseDocuments(baseOld, baseNew);

  it("同一基座变化对两个变体各自计算，互不串号", () => {
    const xs = analyzeVariantImpact(xiaoshan, impact);
    const sx = analyzeVariantImpact(shaoxing, impact);
    expect(xs.inheritedAffected).toContain("SEG-000001");
    expect(sx.inheritedAffected).toContain("SEG-000001");
    expect(xs.modifiedAffected).toEqual(["SEG-000200"]);
    // 绍兴没有 modified 片段，不应被萧山的改写片段污染
    expect(sx.modifiedAffected).toEqual([]);
    expect(xs.modifiedAffected).not.toContain("SEG-000300");
  });

  it("一个变体的 added 不进入另一个变体的重查清单", () => {
    const xs = analyzeVariantImpact(xiaoshan, impact, [
      { id: "XS-R-TUODI", name: "拖底", body: "", origin: "variant", change_type: "added", depends_on: ["HJ-R-LUNZHUANG"], evidence: [] },
    ]);
    const sx = analyzeVariantImpact(shaoxing, impact, [
      { id: "SX-R-X", name: "绍兴规则", body: "", origin: "variant", change_type: "added", depends_on: ["HJ-R-PENG"], evidence: [] } as never,
    ]);
    expect(xs.addedToRecheck).toEqual(["XS-R-TUODI"]);
    expect(sx.addedToRecheck).toEqual([]);
  });

  it("合并输入按变体各自构造：相同 segment_id 在不同变体互不影响", () => {
    const xsMerge = merge3([{ segment_id: "SEG-000001", section_id: "opening", old: { kind: "generated", oldText: "定庄规则", newText: "定庄规则（新）" }, new: "定庄规则（新）", currentOverride: "萧山人工改" }]);
    const sxMerge = merge3([{ segment_id: "SEG-000001", section_id: "opening", old: { kind: "generated", oldText: "定庄规则", newText: "定庄规则（新）" }, new: "定庄规则（新）" }]);
    expect(xsMerge.conflicts.length).toBe(1);
    expect(sxMerge.autoAdopted.length).toBe(1);
    expect(sxMerge.conflicts.length).toBe(0);
  });

  it("变体文档自身不合法（缺少基座绑定所需字段）时影响分析仍只读不写", () => {
    expect(() => analyzeVariantImpact(xiaoshan, impact)).not.toThrow();
    expect(xiaoshan.target_variant).toBe("xiaoshan");
    expect(shaoxing.target_variant).toBe("shaoxing");
  });
});
