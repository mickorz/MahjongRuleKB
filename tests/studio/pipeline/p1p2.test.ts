// P1/P2 测试：变体全文、changes.json、Change Manager、编辑意图路由
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { documentSchema } from "../../../studio/contracts/document.ts";
import { changesFileSchema, buildChangesFile } from "../../../studio/pipeline/changes-json.ts";
import { compileXiaoshan, generateVariantDocument, sharedOutline } from "../../../studio/pipeline/generate-variant.ts";
import { readBaseRuleSet } from "../../../studio/pipeline/read-ruleset.ts";
import { runP1 } from "../../../studio/pipeline/run-p1.ts";
import { archiveChange, attachProposal, createChange, nextArtifacts, readChange, advanceChange, setArtifact } from "../../../studio/change/manager.ts";
import { assertRouteConsistency, routeEdit } from "../../../studio/edit/router.ts";

const baseRuleset = readBaseRuleSet();
const outline = sharedOutline(baseRuleset);
const { compiled, variant: variantRuleset } = compileXiaoshan();
const vm = compiled.manifest as { ruleset_id: string; version: string; base: { ruleset_id: string; version: string } };
const unresolved = (variantRuleset.unresolved as never[]) ?? [];

const variant = generateVariantDocument(compiled as never, outline, {
  variant: "xiaoshan",
  templateVersion: outline.template_version,
  rulesetId: vm.ruleset_id,
  rulesetVersion: vm.version,
  unresolved,
});

describe("P1 变体全文", () => {
  it("通过 Schema，且与杭州共用同一套 section_id", () => {
    expect(documentSchema.safeParse(variant.document).success).toBe(true);
    const variantSections = variant.document.blocks.map((b) => b.section_id);
    for (const s of variantSections) expect(outline.sections.map((x) => x.section_id)).toContain(s);
  });

  it("三维标记：inherited / modified / added 分别落到正确 lineage", () => {
    const segs = variant.document.blocks.flatMap((b) => b.content);
    const lineages = new Set(segs.map((s) => s.lineage));
    expect(lineages.has("default_inherited")).toBe(true);
    expect(lineages.has("modified")).toBe(true);
    expect(lineages.has("added")).toBe(true);
  });

  it("modified / added 片段 diff_status=candidate，继承片段为 not_applicable", () => {
    for (const seg of variant.document.blocks.flatMap((b) => b.content)) {
      if (seg.lineage === "modified" || seg.lineage === "added") expect(seg.diff_status).toBe("candidate");
      else expect(seg.diff_status).toBe("not_applicable");
    }
  });

  it("release_blocker 卡被映射到 unresolved.yaml 的未决 ID", () => {
    expect(variant.blockers.length).toBe(2);
    const refs = variant.blockers.flatMap((b) => b.unresolved_refs);
    expect(refs).toContain("XS-U-002");
    expect(refs).toContain("XS-U-003");
    // 未决引用必须真的出现在片段上，否则渲染层看不到
    const segRefs = variant.document.blocks.flatMap((b) => b.content).flatMap((s) => s.release_blocker_refs);
    expect(new Set(segRefs)).toEqual(new Set(refs));
  });

  it("对照槽（杭麻 / 差异）不进变体正文，只进 changes.json", () => {
    for (const seg of variant.document.blocks.flatMap((b) => b.content)) {
      expect(seg.text.includes("·杭麻：")).toBe(false);
      expect(seg.text.includes("·差异：")).toBe(false);
    }
  });

  it("每段都来自卡的已填写槽位，不出现只剩规则名的空壳", () => {
    const shells = variant.document.blocks
      .flatMap((b) => b.content)
      .filter((s) => !s.text.includes("·"));
    expect(shells.map((s) => s.text)).toEqual([]);
  });

  it("changes.json 只含 modified / added，且 replace 必须有 before", () => {
    const changes = buildChangesFile(
      compiled as never,
      baseRuleset.rules.map((r) => ({ id: r.id, body: r.body })),
      {
        rulesetId: vm.ruleset_id,
        baseRulesetId: vm.base.ruleset_id,
        baseVersion: vm.base.version,
        variantVersion: vm.version,
      },
    );
    expect(changesFileSchema.safeParse(changes).success).toBe(true);
    expect(changes.entries.length).toBe(43);
    for (const e of changes.entries) {
      expect(["replace", "add"]).toContain(e.type);
      if (e.type === "replace") {
        expect(e.base_rule_ref).toBeTruthy();
        expect(e.before).toBeTruthy();
      }
      expect(e.diff_status).toBe("candidate"); // 未经人工确认
    }
  });

  it("runP1 端到端写出三个产物", () => {
    const out = join(tmpdir(), `p1-${process.pid}-${Date.now()}`);
    try {
      const r = runP1(out);
      expect(existsSync(r.documentPath)).toBe(true);
      expect(existsSync(r.markdownPath)).toBe(true);
      expect(existsSync(r.changesPath)).toBe(true);
      expect(JSON.parse(readFileSync(r.changesPath, "utf8")).entries.length).toBe(43);
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  });
});

describe("P2 Change Manager", () => {
  let kb: string;
  beforeEach(() => {
    kb = join(tmpdir(), `kb-chg-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    mkdirSync(kb, { recursive: true });
  });
  afterEach(() => rmSync(kb, { recursive: true, force: true }));

  it("创建 Change 并挂载多个 Proposal（文档 + 规则）", () => {
    const c = createChange({
      kbRoot: kb,
      changeId: "CHG-001",
      rulesetId: "hangzhou-friends-4p",
      targetVariant: "hangzhou",
      templateVersion: "1.0.0",
      intent: "补充连庄说明",
    });
    expect(c.status).toBe("draft");
    attachProposal(kb, "CHG-001", "DOC-P-001");
    const withRule = attachProposal(kb, "CHG-001", "PR-001");
    expect(withRule.proposal_ids).toEqual(["DOC-P-001", "PR-001"]);
    expect(readChange(kb, "CHG-001").proposal_ids.length).toBe(2);
  });

  it("产物未 ready 时 nextArtifacts 给出被阻塞项", () => {
    createChange({
      kbRoot: kb,
      changeId: "CHG-002",
      rulesetId: "hangzhou-friends-4p",
      targetVariant: "hangzhou",
      templateVersion: "1.0.0",
      intent: "x",
    });
    setArtifact(kb, "CHG-002", { artifact_id: "ART-CHANGE-01", kind: "change", status: "confirmed", input_parts: ["v1"] });
    setArtifact(kb, "CHG-002", { artifact_id: "ART-PROPOSAL-01", kind: "proposal", status: "ready", input_parts: ["p1"] });
    const plan = nextArtifacts(readChange(kb, "CHG-002"));
    expect(plan.buildable).toContain("diff");
    expect(plan.blocked.find((b) => b.kind === "approval")?.missing).toContain("validation");
  });

  it("产物不齐禁止推进状态", () => {
    createChange({
      kbRoot: kb,
      changeId: "CHG-003",
      rulesetId: "hangzhou-friends-4p",
      targetVariant: "hangzhou",
      templateVersion: "1.0.0",
      intent: "x",
    });
    expect(() => advanceChange(kb, "CHG-003", "approved")).toThrow(/必须 confirmed/);
  });

  it("Verify 通过后归档到 rulebook/changes/archive 并清理活动目录", () => {
    createChange({
      kbRoot: kb,
      changeId: "CHG-004",
      rulesetId: "hangzhou-friends-4p",
      targetVariant: "hangzhou",
      templateVersion: "1.0.0",
      intent: "x",
    });
    for (const [id, kind] of [
      ["ART-CHANGE-01", "change"],
      ["ART-PROPOSAL-01", "proposal"],
      ["ART-DIFF-01", "diff"],
      ["ART-VALIDATION-01", "validation"],
      ["ART-APPROVAL-01", "approval"],
      ["ART-REGEN-01", "regeneration"],
      ["ART-VERIFY-01", "verify"],
    ] as const) {
      setArtifact(kb, "CHG-004", { artifact_id: id, kind, status: "confirmed", input_parts: [id] });
    }
    advanceChange(kb, "CHG-004", "verifying");
    advanceChange(kb, "CHG-004", "verified");
    const path = archiveChange(kb, "CHG-004", "2026-11-24");
    expect(path).toBe("rulebook/changes/archive/2026-11-24-CHG-004/change.json");
    expect(existsSync(join(kb, "rulebook/changes/archive/2026-11-24-CHG-004/change.json"))).toBe(true);
    expect(existsSync(join(kb, ".rule-studio/changes/active/CHG-004"))).toBe(false);
  });

  it("未 verified 的 Change 不能归档", () => {
    createChange({
      kbRoot: kb,
      changeId: "CHG-005",
      rulesetId: "hangzhou-friends-4p",
      targetVariant: "hangzhou",
      templateVersion: "1.0.0",
      intent: "x",
    });
    expect(() => archiveChange(kb, "CHG-005")).toThrow(/只有 verified/);
  });
});

describe("P2 编辑意图路由", () => {
  it("表达调整走文档表达层", () => {
    const r = routeEdit({ utterance: "这段改得更容易理解一点", hasBlockTarget: true });
    expect(r).toMatchObject({ behavior: "expression", channel: "document-override", op: "replace-text", directWrite: false });
    expect(() => assertRouteConsistency(r)).not.toThrow();
  });

  it("规则修改走规则提案，且必须给规则卡 ID", () => {
    const noRef = routeEdit({ utterance: "把连庄条件改成流局也连庄", hasBlockTarget: true });
    expect(noRef.channel).toBe("rule-proposal");
    expect(noRef.needConfirm).toMatch(/规则卡 ID/);
    const withRef = routeEdit({ utterance: "改条件", hasBlockTarget: true, ruleRef: "HJ-R-LUNZHUANG" });
    expect(withRef.behavior).toBe("rule");
  });

  it("无原文依据的内容补充只能进表达层", () => {
    const r = routeEdit({ utterance: "增加一个案例说明三牢连庄怎么算", hasBlockTarget: true });
    expect(r.behavior).toBe("content");
    expect(r.channel).toBe("document-override");
    expect(r.needConfirm).toMatch(/没有原文依据/);
  });

  it("结构调整走章节装配", () => {
    const r = routeEdit({ utterance: "把这段移动到结算章节", hasBlockTarget: true });
    expect(r).toMatchObject({ behavior: "structure", channel: "document-outline", op: "move-block" });
  });

  it("无法归类必须抛错，不猜", () => {
    expect(() => routeEdit({ utterance: "随便看看", hasBlockTarget: true })).toThrow(/无法归类/);
  });

  it("禁止任何直接写入组合", () => {
    expect(() => assertRouteConsistency({ behavior: "expression", channel: "rule-proposal", directWrite: false })).toThrow();
    expect(() =>
      assertRouteConsistency({ behavior: "expression", channel: "document-override", op: "move-block", directWrite: false }),
    ).toThrow();
  });
});
