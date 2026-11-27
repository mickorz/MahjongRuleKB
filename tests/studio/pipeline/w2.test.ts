// W2：差异检查、继承复用、继承一致性、三视图
import { afterEach, beforeAll, beforeEach, describe, it, expect } from "vitest";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { checkR1, checkR2, checkR3, checkVariantDiffs, jaccard, charTrigrams, type CardView } from "../../../studio/pipeline/diff-checks.ts";
import {
  checkInheritedIntegrity,
  generateVariantWithProvider,
  type VariantRule,
} from "../../../studio/pipeline/generate-variant-ai.ts";
import { renderComparisonView, renderDiffView } from "../../../studio/pipeline/render.ts";
import { runW2 } from "../../../studio/pipeline/run-w2.ts";
import { generateDocumentWithProvider } from "../../../studio/pipeline/generate-ai.ts";
import { DeterministicGenerator, parseChapterDraft, type ChapterRequest, type ChapterResponse, type Generator } from "../../../studio/generate/provider.ts";
import { buildHangzhouOutline } from "../../../studio/pipeline/outline-hangzhou.ts";
import { readBaseRuleSet } from "../../../studio/pipeline/read-ruleset.ts";
import { documentSchema } from "../../../studio/contracts/document.ts";

const ruleset = readBaseRuleSet();
const outline = buildHangzhouOutline(ruleset);

class EchoGenerator implements Generator {
  readonly name = "fake-echo";
  readonly version = "1.0.0";
  readonly capabilities = { structured_output: "native" as const };
  async generateChapter(request: ChapterRequest): Promise<ChapterResponse> {
    const draft = {
      section_id: request.section_id,
      paragraphs: request.rules.map((r) => ({
        title: r.name,
        text: `${r.name}在萧山的做法，含触发条件与结果，长度足够避免空壳判定。`,
        claims: [{ text: r.name, rule_refs: [r.id], config_refs: [] }],
      })),
    };
    const raw = request.rules.length === 0 ? JSON.stringify({ section_id: request.section_id, paragraphs: [] }) : JSON.stringify(draft);
    const parsed = parseChapterDraft(raw);
    return { section_id: request.section_id, raw, ...parsed, retries: 0 };
  }
}

const card = (over: Partial<CardView> & { id: string }): CardView => ({
  name: over.id,
  body: "- **触发**：x\n- **结果**：y",
  origin: "variant",
  ...over,
});

describe("W2-3 R1 槽位差集", () => {
  const base = card({
    id: "HJ-R-A",
    origin: "base",
    body: "- **触发**：a\n- **条件**：b\n- **结果**：c",
  });

  it("缺槽位报警并点名缺哪些", () => {
    const variant = card({ id: "XS-R-A", change_type: "modified", base_rule_ref: "HJ-R-A", body: "- **触发**：a\n- **结果**：c" });
    const findings = checkR1(variant, base);
    expect(findings.length).toBe(1);
    expect(findings[0].message).toContain("条件");
  });

  it("声明 not_applicable_slots 后不再报警", () => {
    const variant = card({
      id: "XS-R-A",
      change_type: "modified",
      base_rule_ref: "HJ-R-A",
      body: "- **触发**：a\n- **结果**：c",
      not_applicable_slots: [{ slot: "条件", reason: "本玩法无此前提" }],
    });
    expect(checkR1(variant, base)).toEqual([]);
  });

  it("inherited / added 不参与 R1", () => {
    expect(checkR1(card({ id: "XS-R-B", change_type: "inherited", base_rule_ref: "HJ-R-A", body: "- **触发**：a" }), base)).toEqual([]);
    expect(checkR1(card({ id: "XS-R-C", change_type: "added", body: "- **触发**：a" }), base)).toEqual([]);
  });
});

describe("W2-3 R2 疑似重复", () => {
  const baseCards = [
    card({ id: "HJ-K-FANXING-HUCHI", origin: "base", name: "番型倍数表", body: "平胡 1 倍，七对按档位，爆头 2 倍，杠飘查表" }),
  ];

  it("名称高度相似即报警，并给出最相近的基座卡", () => {
    const variant = card({ id: "XS-K-FANXING", change_type: "added", name: "番型倍数表", body: "完全不同的内容" });
    const findings = checkR2(variant, baseCards, { nameThreshold: 0.85 });
    expect(findings.length).toBe(1);
    expect(findings[0].message).toContain("HJ-K-FANXING-HUCHI");
    expect(findings[0].severity).toBe("warning");
  });

  it("正文高度相似也报警", () => {
    const variant = card({ id: "XS-K-NEW", change_type: "added", name: "另一个名字", body: "平胡 1 倍，七对按档位，爆头 2 倍，杠飘查表" });
    expect(checkR2(variant, baseCards, { bodyThreshold: 0.9 }).length).toBe(1);
  });

  it("阈值可调；完全不相似不报警", () => {
    const variant = card({ id: "XS-K-NEW", change_type: "added", name: "跟庄", body: "四家打齐触发跟庄赔付" });
    expect(checkR2(variant, baseCards)).toEqual([]);
  });

  it("Jaccard 边界：空集合为 0，完全相同为 1", () => {
    expect(jaccard(new Set(), charTrigrams("abc"))).toBe(0);
    expect(jaccard(charTrigrams("abcabc"), charTrigrams("abcabc"))).toBe(1);
  });
});

describe("W2-3 R3 归类自洽", () => {
  const baseIds = new Set(["HJ-R-A"]);

  it("modified 缺 base_rule_ref → failed；缺 compares_to → warning", () => {
    const noRef = checkR3(card({ id: "XS-R-B", change_type: "modified" }), baseIds);
    expect(noRef.some((f) => f.severity === "failed" && f.message.includes("base_rule_ref"))).toBe(true);

    const noCompare = checkR3(card({ id: "XS-R-C", change_type: "modified", base_rule_ref: "HJ-R-A" }), baseIds);
    expect(noCompare.length).toBe(1);
    expect(noCompare[0].severity).toBe("warning");
  });

  it("added 带 base_rule_ref 或 compares_to → failed", () => {
    expect(checkR3(card({ id: "XS-R-D", change_type: "added", base_rule_ref: "HJ-R-A" }), baseIds).some((f) => f.severity === "failed")).toBe(true);
    expect(checkR3(card({ id: "XS-R-E", change_type: "added", compares_to: ["HJ-R-A"] }), baseIds).some((f) => f.severity === "failed")).toBe(true);
  });

  it("inherited 缺 base_rule_ref 或指向不存在的卡 → failed", () => {
    expect(checkR3(card({ id: "XS-R-F", change_type: "inherited" }), baseIds).some((f) => f.severity === "failed")).toBe(true);
    expect(checkR3(card({ id: "XS-R-G", change_type: "inherited", base_rule_ref: "HJ-R-NONE" }), baseIds).some((f) => f.severity === "failed")).toBe(true);
  });

  it("汇总按规则卡分组", () => {
    const report = checkVariantDiffs({
      variantCards: [card({ id: "XS-R-B", change_type: "modified" }), card({ id: "XS-R-D", change_type: "added", base_rule_ref: "HJ-R-A" })],
      baseCards: [card({ id: "HJ-R-A", origin: "base" })],
    });
    expect(Object.keys(report.byRule).sort()).toEqual(["XS-R-B", "XS-R-D"]);
  });
});

describe("W2-2 继承复用", () => {
  let baseDoc: Awaited<ReturnType<typeof generateDocumentWithProvider>>["document"];

  beforeAll(async () => {
    const res = await generateDocumentWithProvider(ruleset, outline, new DeterministicGenerator(), {
      templateVersion: outline.template_version,
      variant: "hangzhou",
    });
    baseDoc = res.document;
  });

  const variantRules: VariantRule[] = [
    { id: "XS-R-ZHUANGJIA-02", name: "连庄与换庄", body: "- **触发**：连庄时\n- **结果**：牢数+1", origin: "variant", change_type: "modified", base_rule_ref: "HJ-R-LUNZHUANG", evidence: ["rulebook/sources/hangzhou/hangzhou-core-flow.md#1.1"], depends_on: [] },
    { id: "XS-R-TUODI", name: "拖底", body: "- **触发**：大结算\n- **结果**：净分按 200 计", origin: "variant", change_type: "added", evidence: ["rulebook/sources/hangzhou/hangzhou-core-flow.md#1.1"], depends_on: [] },
  ];

  const baseBinding = { ruleset_version: "1.2.0", content_hash: "a".repeat(64), document_version: 0 };

  it("继承片段逐字复用基座片段并保留 segment_id", async () => {
    const res = await generateVariantWithProvider(
      baseDoc,
      { rulesetId: "xiaoshan-friends-4p", version: "0.3.0", rules: [], configs: [] },
      variantRules,
      outline,
      new EchoGenerator(),
      { templateVersion: outline.template_version, variant: "xiaoshan", baseBinding },
    );
    const inherited = res.document.blocks.flatMap((b) => b.content).filter((s) => s.lineage.endsWith("inherited"));
    expect(inherited.length).toBeGreaterThan(0);
    const baseById = new Map(baseDoc.blocks.flatMap((b) => b.content).map((s) => [s.segment_id, s]));
    for (const seg of inherited) {
      expect(baseById.has(seg.segment_id), seg.segment_id).toBe(true);
      expect(baseById.get(seg.segment_id)!.text).toBe(seg.text);
    }
    expect(res.inheritedSegments).toBe(inherited.length);
  });

  it("变体片段：modified 带 base_segment_ref，added 不带", async () => {
    const res = await generateVariantWithProvider(
      baseDoc,
      { rulesetId: "xiaoshan-friends-4p", version: "0.3.0", rules: [], configs: [] },
      variantRules,
      outline,
      new EchoGenerator(),
      { templateVersion: outline.template_version, variant: "xiaoshan", baseBinding },
    );
    const segments = res.document.blocks.flatMap((b) => b.content);
    const modified = segments.filter((s) => s.lineage === "modified");
    const added = segments.filter((s) => s.lineage === "added");
    expect(modified.length).toBeGreaterThan(0);
    expect(added.length).toBeGreaterThan(0);
    for (const s of added) expect(s.base_segment_ref).toBeUndefined();
    expect(modified.every((s) => typeof s.base_segment_ref === "string")).toBe(true);
  });

  it("继承片段 diff_status 恒为 not_applicable（继承不是差异）", async () => {
    const res = await generateVariantWithProvider(
      baseDoc,
      { rulesetId: "xiaoshan-friends-4p", version: "0.3.0", rules: [], configs: [] },
      variantRules,
      outline,
      new EchoGenerator(),
      { templateVersion: outline.template_version, variant: "xiaoshan", baseBinding },
    );
    for (const s of res.document.blocks.flatMap((b) => b.content).filter((x) => x.lineage.endsWith("inherited"))) {
      expect(s.diff_status).toBe("not_applicable");
    }
  });

  it("绑定基座基线写入 document.base_binding", async () => {
    const res = await generateVariantWithProvider(
      baseDoc,
      { rulesetId: "xiaoshan-friends-4p", version: "0.3.0", rules: [], configs: [] },
      variantRules,
      outline,
      new EchoGenerator(),
      { templateVersion: outline.template_version, variant: "xiaoshan", baseBinding },
    );
    expect(res.document.base_binding).toEqual(baseBinding);
    expect(documentSchema.safeParse(res.document).success).toBe(true);
  });

  it("checkInheritedIntegrity：篡改继承正文会被发现", async () => {
    const res = await generateVariantWithProvider(
      baseDoc,
      { rulesetId: "xiaoshan-friends-4p", version: "0.3.0", rules: [], configs: [] },
      variantRules,
      outline,
      new EchoGenerator(),
      { templateVersion: outline.template_version, variant: "xiaoshan", baseBinding },
    );
    expect(checkInheritedIntegrity(baseDoc, res.document)).toEqual([]);

    const tampered = {
      ...res.document,
      blocks: res.document.blocks.map((b) => ({
        ...b,
        content: b.content.map((s) =>
          s.lineage.endsWith("inherited") ? { ...s, text: `${s.text}（被人改过）` } : s,
        ),
      })),
    };
    expect(checkInheritedIntegrity(baseDoc, tampered).length).toBeGreaterThan(0);
  });

  it("继承片段身份缺失也会被发现", async () => {
    const res = await generateVariantWithProvider(
      baseDoc,
      { rulesetId: "xiaoshan-friends-4p", version: "0.3.0", rules: [], configs: [] },
      variantRules,
      outline,
      new EchoGenerator(),
      { templateVersion: outline.template_version, variant: "xiaoshan", baseBinding },
    );
    const broken = {
      ...res.document,
      blocks: res.document.blocks.map((b) => ({
        ...b,
        content: b.content.map((s) => (s.lineage.endsWith("inherited") ? { ...s, segment_id: "SEG-999999" } : s)),
      })),
    };
    expect(checkInheritedIntegrity(baseDoc, broken).some((p) => p.includes("身份未复用"))).toBe(true);
  });
});

describe("W2-6 三视图", () => {
  let baseDoc: Awaited<ReturnType<typeof generateDocumentWithProvider>>["document"];
  beforeAll(async () => {
    const res = await generateDocumentWithProvider(ruleset, outline, new DeterministicGenerator(), {
      templateVersion: outline.template_version,
      variant: "hangzhou",
    });
    baseDoc = res.document;
  });

  it("差异视图只列 modified / added，且带基座原文", async () => {
    const variantRules: VariantRule[] = [
      { id: "XS-R-ZHUANGJIA-02", name: "连庄与换庄", body: "- **触发**：连庄\n- **结果**：牢数+1", origin: "variant", change_type: "modified", base_rule_ref: "HJ-R-LUNZHUANG", evidence: ["rulebook/sources/hangzhou/hangzhou-core-flow.md#1.1"], depends_on: [] },
    ];
    const res = await generateVariantWithProvider(
      baseDoc,
      { rulesetId: "xiaoshan-friends-4p", version: "0.3.0", rules: [], configs: [] },
      variantRules,
      outline,
      new EchoGenerator(),
      { templateVersion: outline.template_version, variant: "xiaoshan", baseBinding: { ruleset_version: "1.2.0", content_hash: "a".repeat(64), document_version: 0 } },
    );
    const md = renderDiffView(baseDoc, res.document, res.baseSegmentOfModified);
    expect(md).toContain("差异视图");
    expect(md).toContain("[修改]");
    expect(md).toContain("基座原文");
  });

  it("对照视图给出每章继承/修改/新增计数与并排表", async () => {
    const res = await generateVariantWithProvider(
      baseDoc,
      { rulesetId: "xiaoshan-friends-4p", version: "0.3.0", rules: [], configs: [] },
      [{ id: "XS-R-TUODI", name: "拖底", body: "- **触发**：大结算\n- **结果**：净分按 200 计", origin: "variant", change_type: "added", evidence: ["rulebook/sources/hangzhou/hangzhou-core-flow.md#1.1"], depends_on: [] }],
      outline,
      new EchoGenerator(),
      { templateVersion: outline.template_version, variant: "xiaoshan", baseBinding: { ruleset_version: "1.2.0", content_hash: "a".repeat(64), document_version: 0 } },
    );
    const md = renderComparisonView(baseDoc, res.document);
    expect(md).toContain("| 基座 | 变体 |");
    expect(md).toMatch(/继承 \d+ 段/);
  });
});

describe("runW2 端到端", () => {
  let kb: string;
  beforeEach(() => {
    kb = join(tmpdir(), `kb-w2-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    mkdirSync(join(kb, "documents/hangzhou"), { recursive: true });
  });
  afterEach(() => rmSync(kb, { recursive: true, force: true }));

  it("缺基座文档时直接报错（变体必须绑定基座）", async () => {
    await expect(runW2({ kbRoot: kb, outDir: join(kb, "documents/xiaoshan"), taskId: "t1", generator: new EchoGenerator() })).rejects.toThrow(/缺少基座文档/);
  });

  it("有基座时产出五件产物，且不算降级时可通过", async () => {
    const base = await generateDocumentWithProvider(ruleset, outline, new DeterministicGenerator(), {
      templateVersion: outline.template_version,
      variant: "hangzhou",
    });
    writeFileSync(join(kb, "documents/hangzhou/document.json"), JSON.stringify(base.document, null, 2), "utf8");
    const res = await runW2({ kbRoot: kb, outDir: join(kb, "documents/xiaoshan"), taskId: "t2", generator: new EchoGenerator() });
    for (const p of [res.documentPath, res.markdownPath, res.diffViewPath, res.compareViewPath, res.changesPath]) {
      expect(readFileSync(p, "utf8").length).toBeGreaterThan(0);
    }
    expect(res.baseBinding.ruleset_version).toBe("1.2.0");
    expect(res.baseBinding.content_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(res.inheritedSegments).toBeGreaterThan(0);
    // 变体也必须产出机器检查结论（此前缺失，导致工作台状态栏显示「—」）
    const report = JSON.parse(readFileSync(join(kb, "documents/xiaoshan/quality-report.json"), "utf8")) as {
      status: string;
      summary: { failed: number; warning: number };
    };
    expect(["passed", "warning", "failed"]).toContain(report.status);
    expect(report.summary.failed + report.summary.warning).toBeGreaterThanOrEqual(0);
    expect(res.qualityStatus).toBe(report.status);
    expect(res.ok, res.reasons.join("；")).toBe(true);
  });
});
