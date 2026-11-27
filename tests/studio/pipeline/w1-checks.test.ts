// W1-3 章节规划 / W1-5 数值分级 / W1-6 连贯性检查
import { describe, it, expect } from "vitest";

import { documentSchema, segmentSchema } from "../../../studio/contracts/document.ts";
import { assertPlanCoverage, planChapters } from "../../../studio/pipeline/plan.ts";
import { classifyNumericToken, extractNumericTokens, checkNumericTraceability, summarizeNumeric } from "../../../studio/pipeline/numeric-guard.ts";
import { applyMachineStatus, checkCoherence, checkFacts, checkStructure } from "../../../studio/pipeline/coherence.ts";
import { buildHangzhouOutline } from "../../../studio/pipeline/outline-hangzhou.ts";
import { readBaseRuleSet } from "../../../studio/pipeline/read-ruleset.ts";
import { block, documentFixture, segment } from "../fixtures.ts";

const ruleset = readBaseRuleSet();
const outline = buildHangzhouOutline(ruleset);

describe("W1-3 章节规划", () => {
  const plans = planChapters(ruleset, outline);

  it("每个章节一份计划，规则与配置全覆盖", () => {
    expect(plans.length).toBe(outline.sections.length);
    expect(assertPlanCoverage(ruleset, plans)).toEqual([]);
  });

  it("beats 只取该章规则实际拥有的槽位", () => {
    const opening = plans.find((p) => p.section_id === "opening")!;
    expect(opening.beats).toContain("触发");
    const overview = plans.find((p) => p.section_id === "overview")!;
    expect(overview.beats.length).toBe(0); // 概述章只有配置，没有规则槽位
  });

  it("跨章引用取自 depends_on，不空造", () => {
    for (const p of plans) {
      for (const ref of p.cross_section_refs) {
        expect(ref).not.toBe(p.section_id);
        expect(outline.sections.map((s) => s.section_id)).toContain(ref);
      }
    }
  });

  it("target_paragraphs 与规则+配置数一致，为空时至少 1", () => {
    for (const p of plans) expect(p.target_paragraphs).toBe(Math.max(1, p.rule_ids.length + p.config_ids.length));
  });
});

describe("W1-5 数值分级", () => {
  const ctx = {
    ruleBodies: new Map([["HJ-F-ZHUANGXIAN-BEILV", "赢家与赔付者之间有一方是庄家时，这一笔 × 8；双方都是闲家时，这一笔 × 1。"]]),
    configValues: new Map([["HJ-C-JUSHU", "8"]]),
    calculatorValues: ["24"],
  };

  it("提取数值 token 并去重保序", () => {
    expect(extractNumericTokens("底分 1，倍率 8 倍，再 8 倍")).toEqual(["1", "8 倍"]);
    expect(extractNumericTokens("无数字的一段话")).toEqual([]);
  });

  it("规则卡既有数值 → rule", () => {
    const v = classifyNumericToken("8", { ruleRefs: ["HJ-F-ZHUANGXIAN-BEILV"], configRefs: [] }, ctx);
    expect(v.origin).toBe("rule");
  });

  it("配置值 → config", () => {
    const v = classifyNumericToken("8", { ruleRefs: [], configRefs: ["HJ-C-JUSHU"] }, ctx);
    expect(v.origin).toBe("config");
  });

  it("计算器值优先于规则卡（更强来源）", () => {
    const v = classifyNumericToken("24", { ruleRefs: [], configRefs: [] }, ctx);
    expect(v.origin).toBe("calculator");
  });

  it("无来源即 inferred，且产生 failed finding", () => {
    const v = classifyNumericToken("999", { ruleRefs: ["HJ-F-ZHUANGXIAN-BEILV"], configRefs: [] }, ctx);
    expect(v.origin).toBe("inferred");
    const findings = checkNumericTraceability("这一笔 × 999", { ruleRefs: ["HJ-F-ZHUANGXIAN-BEILV"], configRefs: [] }, ctx);
    expect(findings.length).toBe(1);
    expect(findings[0].code).toBe("fact.untraceable-number");
    expect(findings[0].severity).toBe("failed");
    expect(findings[0].message).toContain("999");
  });

  it("空白差异不影响判定（「8 倍」与「8倍」等价）", () => {
    const withSpace = classifyNumericToken("8 倍", { ruleRefs: [], configRefs: ["HJ-C-JUSHU"] }, { ...ctx, configValues: new Map([["HJ-C-JUSHU", "8倍"]]) });
    expect(withSpace.origin).toBe("config");
  });

  it("summarizeNumeric 计数正确", () => {
    const verdicts = [
      classifyNumericToken("24", { ruleRefs: [], configRefs: [] }, ctx),
      classifyNumericToken("8", { ruleRefs: ["HJ-F-ZHUANGXIAN-BEILV"], configRefs: [] }, ctx),
      classifyNumericToken("999", { ruleRefs: [], configRefs: [] }, ctx),
    ];
    expect(summarizeNumeric(verdicts)).toEqual({ calculator: 1, rule: 1, config: 0, inferred: 1 });
  });
});

describe("W1-6 结构检查（A 类）", () => {
  it("缺章节 → failed", () => {
    const doc = documentFixture({ blocks: [documentFixture().blocks[0]] });
    const findings = checkStructure(doc, { ...outline, sections: [outline.sections[0], { ...outline.sections[1], section_id: "scoring" }] }, { ruleset });
    expect(findings.some((f) => f.code === "structure.missing-section" && f.severity === "failed")).toBe(true);
  });

  it("空壳段落（短且无引用）→ warning；有引用则不算空壳", () => {
    const empty = segment("SEG-000001", { text: "发牌", references: { requirement_refs: [], rule_refs: [], config_refs: [], source_evidence_refs: [] } });
    const withRef = segment("SEG-000002", { text: "发牌", references: { requirement_refs: [], rule_refs: ["HJ-T-FAIPAI"], config_refs: [], source_evidence_refs: [] } });
    const doc = documentFixture({ blocks: [block([empty, withRef])] });
    const findings = checkStructure(doc, { template_version: "1.0.0", sections: [outline.sections[0]] }, { ruleset });
    const empties = findings.filter((f) => f.code === "structure.empty-segment");
    expect(empties.length).toBe(1);
    expect(empties[0].segment_ids).toEqual(["SEG-000001"]);
  });

  it("章节顺序颠倒 → failed", () => {
    const doc = documentFixture();
    const b1 = { ...doc.blocks[0], block_id: "DOC-HJ-000001", section_id: "settlement" };
    const b2 = { ...doc.blocks[0], block_id: "DOC-HJ-000002", section_id: "opening" };
    const findings = checkStructure({ ...doc, blocks: [b1, b2] }, { template_version: "1.0.0", sections: [] }, { ruleset });
    expect(findings.some((f) => f.code === "structure.section-order" && f.severity === "failed")).toBe(true);
  });

  it("跨章引用指向不存在章节 → warning", () => {
    const seg = segment("SEG-000001", { text: "详见 section:nonexistent 的说明" });
    const doc = documentFixture({ blocks: [block([seg])] });
    const findings = checkStructure(doc, { template_version: "1.0.0", sections: [outline.sections[0]] }, { ruleset });
    expect(findings.some((f) => f.code === "structure.dangling-cross-reference")).toBe(true);
  });
});

describe("W1-6 事实检查（B 类）", () => {
  it("引用不存在的规则 → failed", () => {
    const seg = segment("SEG-000001", {
      text: "一段足够长的说明文字用于避免空壳判定",
      references: { requirement_refs: [], rule_refs: ["HJ-R-NOT-EXIST"], config_refs: [], source_evidence_refs: [] },
    });
    const doc = documentFixture({ blocks: [block([seg])] });
    const findings = checkFacts(doc, { ruleset });
    expect(findings.some((f) => f.code === "fact.unknown-rule-ref" && f.severity === "failed")).toBe(true);
  });

  it("未决项写成 confirmed → failed", () => {
    const seg = segment("SEG-000001", {
      text: "一段足够长的说明文字用于避免空壳判定",
      release_blocker_refs: ["XS-U-001"],
      decision_status: "confirmed",
    });
    const doc = documentFixture({ blocks: [block([seg])] });
    expect(checkFacts(doc, { ruleset }).some((f) => f.code === "fact.blocker-marked-confirmed")).toBe(true);
  });

  it("不可编辑片段（计算器产物）不参与数值追溯", () => {
    const seg = segment("SEG-000001", { text: "庄家自摸时每笔庄闲倍率：24", editable: false });
    const doc = documentFixture({ blocks: [block([seg])] });
    const findings = checkFacts(doc, { ruleset, calculatorValues: ["24"] });
    expect(findings.some((f) => f.code === "fact.untraceable-number")).toBe(false);
  });

  it("可编辑片段里的无来源数值 → failed", () => {
    const seg = segment("SEG-000001", { text: "庄家倍率固定为 999 倍" });
    const doc = documentFixture({ blocks: [block([seg])] });
    expect(checkFacts(doc, { ruleset }).some((f) => f.code === "fact.untraceable-number")).toBe(true);
  });

  it("checkCoherence 汇总状态：有 failed 即 failed，只有 warning 即 warning", () => {
    const okSeg = segment("SEG-000001", {
      text: "首局从四名参战玩家中随机确定庄家，掷骰开始前庄家已确定。",
      references: { requirement_refs: [], rule_refs: ["HJ-R-DINGZHUANG"], config_refs: [], source_evidence_refs: [] },
    });
    const okDoc = documentFixture({ blocks: [block([okSeg], { section_id: outline.sections[0].section_id })] });
    const okReport = checkCoherence(okDoc, { template_version: "1.0.0", sections: [outline.sections[0]] }, { ruleset });
    expect(okReport.status).toBe("passed");

    const badSeg = segment("SEG-000002", { text: "庄家倍率固定为 999 倍" });
    const badDoc = documentFixture({ blocks: [block([okSeg, badSeg])] });
    expect(checkCoherence(badDoc, { template_version: "1.0.0", sections: [outline.sections[0]] }, { ruleset }).status).toBe("failed");
  });

  it("applyMachineStatus 只改 machine_check_status，不动 diff_status", () => {
    const seg = segment("SEG-000001", { text: "庄家倍率固定为 999 倍", diff_status: "candidate", lineage: "modified", base_rule_ref: "HJ-R-DINGZHUANG" });
    const doc = documentFixture({ blocks: [block([seg])] });
    const findings = checkFacts(doc, { ruleset });
    const next = applyMachineStatus(doc, findings);
    const after = next.blocks[0].content[0];
    expect(after.machine_check_status).toBe("failed");
    expect(after.diff_status).toBe("candidate");
    expect(documentSchema.safeParse(next).success).toBe(true);
  });

  it("片段 Schema 接受 machine_check_status=passed", () => {
    expect(segmentSchema.parse({ ...segment("SEG-000001"), machine_check_status: "passed" }).machine_check_status).toBe("passed");
  });
});
