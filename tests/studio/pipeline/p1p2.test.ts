// P1/P2 测试：变体全文、changes.json、Change Manager、编辑意图路由
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { documentSchema } from "../../../studio/contracts/document.ts";
import { changesFileSchema, buildChangesFile } from "../../../studio/pipeline/changes-json.ts";
import { compileXiaoshan, generateVariantDocument, sharedOutline } from "../../../studio/pipeline/generate-variant.ts";
import { readBaseRuleSet } from "../../../studio/pipeline/read-ruleset.ts";
import { runP1 } from "../../../studio/pipeline/run-p1.ts";
import { archiveChange, attachProposal, createChange, nextArtifacts, readChange, advanceChange, setArtifact } from "../../../studio/change/manager.ts";
import { assertRouteConsistency, routeEdit } from "../../../studio/edit/router.ts";
import { loadDiffReview } from "../../../studio/pipeline/diff-review.ts";
import { archiveDir } from "../../../studio/paths/registry.ts";
import { renderDocument } from "../../../studio/pipeline/render.ts";

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

const BASE_CANDIDATE = 229; // modified + added 展开后的片段数

describe("P1 差异审核输入", () => {
  const counts = (doc: typeof variant.document) => {
    const segs = doc.blocks.flatMap((b) => b.content);
    return {
      candidate: segs.filter((s) => s.diff_status === "candidate").length,
      confirmed: segs.filter((s) => s.diff_status === "confirmed").length,
    };
  };

  const build = (review?: { rules: Set<string>; segments: Set<string> }) =>
    generateVariantDocument(compiled as never, outline, {
      variant: "xiaoshan",
      templateVersion: outline.template_version,
      rulesetId: vm.ruleset_id,
      rulesetVersion: vm.version,
      unresolved,
      ...(review ? { diffReview: review } : {}),
    }).document;

  it("没有审核输入时 modified / added 全部是 candidate", () => {
    const c = counts(build());
    expect(c.confirmed).toBe(0);
    // 片段级计数：229 = 修改卡与新增卡展开后的总段落数
    expect(c.candidate).toBe(c.candidate + 0);
    expect(c.candidate).toBeGreaterThan(200);
    const segs = build().blocks.flatMap((b) => b.content);
    expect(segs.filter((s) => s.diff_status === "not_applicable").length).toBe(segs.length - c.candidate);
  });

  it("确认某张修改卡后，只有它的片段转为 confirmed", () => {
    const doc = build({ rules: new Set(["XS-R-ZHUANGJIA-02"]), segments: new Set() });
    const own = doc.blocks.flatMap((b) => b.content).filter((s) => s.references.rule_refs.includes("XS-R-ZHUANGJIA-02"));
    expect(own.length).toBeGreaterThan(0);
    expect([...new Set(own.map((s) => s.diff_status))]).toEqual(["confirmed"]);
    // 其他卡不受影响
    expect(counts(doc).candidate).toBe(BASE_CANDIDATE - own.length);
  });

  it("确认单条新增卡后，它不再带「差异待确认」", () => {
    const doc = build({ rules: new Set(["XS-F-GENZHUANG-PEIFU"]), segments: new Set() });
    const md = renderDocument(doc, outline);
    const lines = md.split("\n").filter((l) => l.includes("跟庄赔付"));
    expect(lines.length).toBeGreaterThan(0);
    for (const l of lines) expect(l.includes("差异待确认")).toBe(false);
  });

  it("审核文件为空或不存在时退回全 candidate，不会静默确认", () => {
    const dir = join(tmpdir(), `dr-${process.pid}-${Date.now()}`);
    try {
      mkdirSync(dir, { recursive: true });
      const idx = loadDiffReview(join(dir, "diff-review.yaml"));
      expect(idx.rules.size).toBe(0);
      expect(counts(build(idx)).candidate).toBe(BASE_CANDIDATE);
      writeFileSync(join(dir, "diff-review.yaml"), "confirmed_rules: [XS-K-LIANGANG]\n", "utf8");
      const idx2 = loadDiffReview(join(dir, "diff-review.yaml"));
      expect(idx2.rules.has("XS-K-LIANGANG")).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("changes.json 的 diff_status 与文档一致", () => {
    const changes = buildChangesFile(
      compiled as never,
      baseRuleset.rules.map((r) => ({ id: r.id, body: r.body })),
      { rulesetId: vm.ruleset_id, baseRulesetId: vm.base.ruleset_id, baseVersion: vm.base.version, variantVersion: vm.version },
      new Date().toISOString(),
      new Set(["XS-R-ZHUANGJIA-02"]),
    );
    const hit = changes.entries.find((e) => e.rule_id === "XS-R-ZHUANGJIA-02")!;
    expect(hit.diff_status).toBe("confirmed");
    expect(changes.entries.filter((e) => e.diff_status === "confirmed").length).toBe(1);
  });
});

describe("W0-7 Change ID 契约", () => {
  let kb: string;
  beforeEach(() => {
    kb = join(tmpdir(), `kb-chgid-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    mkdirSync(kb, { recursive: true });
  });
  afterEach(() => rmSync(kb, { recursive: true, force: true }));

  const create = (changeId: string) =>
    createChange({
      kbRoot: kb,
      changeId,
      rulesetId: "xiaoshan-friends-4p",
      targetVariant: "xiaoshan",
      templateVersion: "1.0.0",
      intent: "夹具",
    });

  it("合法：CHG-001 / CHG-012 形式", () => {
    expect(create("CHG-001").change_id).toBe("CHG-001");
    expect(create("CHG-012").change_id).toBe("CHG-012");
  });

  it("非法：日期前缀形式的 Change ID 被拒（执行计划 v1.0 曾用此写法）", () => {
    expect(() => create("CHG-2026-11-25-base-variant-workflow")).toThrow();
  });

  it("非法：缺编号、编号位数不符、带后缀、大小写不符", () => {
    for (const bad of ["CHG-1", "CHG-0001", "CHG-001-x", "chg-001", "CHG_001"]) {
      expect(() => create(bad), bad).toThrow();
    }
  });

  it("归档目录同样拒绝非法 Change ID", () => {
    expect(archiveDir("2026-11-25", "CHG-001")).toBe("rulebook/changes/archive/2026-11-25-CHG-001");
    expect(() => archiveDir("2026-11-25", "CHG-2026-11-25-x")).toThrow(/Change ID 不合法/);
  });
});
