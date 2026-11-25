// P0-B 全量测试：杭州 61 卡 + 25 配置完整落位 11 章共享模板
import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { documentSchema } from "../../../studio/contracts/document.ts";
import { documentOutlineSchema } from "../../../studio/contracts/outline.ts";
import { checkCoverage, renderDocument } from "../../../studio/pipeline/gates.ts";
import { generateDocument } from "../../../studio/pipeline/generate.ts";
import { buildHangzhouOutline, sectionOrder } from "../../../studio/pipeline/outline-hangzhou.ts";
import { readBaseRuleSet } from "../../../studio/pipeline/read-ruleset.ts";
import { runP0B } from "../../../studio/pipeline/run-p0b.ts";

const ruleset = readBaseRuleSet();
const outline = buildHangzhouOutline(ruleset);
const { document, unassigned } = generateDocument(ruleset, outline, {
  templateVersion: outline.template_version,
  variant: "hangzhou",
  documentVersion: 0,
});

describe("P0-B 章节映射", () => {
  it("outline 通过 Schema，章节顺序遵循共享模板", () => {
    expect(documentOutlineSchema.safeParse(outline).success).toBe(true);
    const order = outline.sections.map((s) => s.section_id);
    const expected = sectionOrder.filter((id) => order.includes(id));
    expect(order).toEqual(expected);
  });

  it("61 张规则卡与 25 项配置全部归章，无遗漏", () => {
    const rules = outline.sections.flatMap((s) => s.rule_refs);
    const configs = outline.sections.flatMap((s) => s.config_refs);
    expect(rules.length).toBe(61);
    expect(new Set(rules).size).toBe(61);
    expect(configs.length).toBe(25);
    expect(new Set(configs).size).toBe(25);
    expect(unassigned.rules).toEqual([]);
    expect(unassigned.configs).toEqual([]);
  });

  it("同一规则/配置只在唯一主章节展开", () => {
    const all = [...outline.sections.flatMap((s) => s.rule_refs), ...outline.sections.flatMap((s) => s.config_refs)];
    expect(all.length).toBe(new Set(all).size);
  });
});

describe("P0-B 文档生成", () => {
  it("文档通过 Schema，块数与章节数一致", () => {
    const r = documentSchema.safeParse(document);
    expect(r.success, r.success ? "" : JSON.stringify(r.error.issues)).toBe(true);
    expect(document.blocks.length).toBe(outline.sections.length);
    expect(document.blocks.map((b) => b.section_id)).toEqual(outline.sections.map((s) => s.section_id));
  });

  it("全部为基座文档：lineage=base、diff_status=not_applicable", () => {
    for (const b of document.blocks) {
      for (const s of b.content) {
        expect(s.lineage).toBe("base");
        expect(s.diff_status).toBe("not_applicable");
      }
    }
  });

  it("片段 ID 与块 ID 全局唯一且格式稳定", () => {
    const blockIds = document.blocks.map((b) => b.block_id);
    const segIds = document.blocks.flatMap((b) => b.content.map((s) => s.segment_id));
    expect(new Set(blockIds).size).toBe(blockIds.length);
    expect(new Set(segIds).size).toBe(segIds.length);
    for (const id of blockIds) expect(id).toMatch(/^DOC-HA-\d{6}$/);
    for (const id of segIds) expect(id).toMatch(/^SEG-\d{6}$/);
  });

  it("算分章节含来自计算器的确定性算例", () => {
    const scoring = document.blocks.find((b) => b.section_id === "scoring")!;
    const numeric = scoring.content.filter((s) => /庄闲倍率：\d+/.test(s.text));
    expect(numeric.length).toBe(1);
    expect(numeric[0].editable).toBe(false);
  });
});

describe("P0-B 覆盖门禁与渲染", () => {
  it("门禁通过：61/61 与 25/25，无越界项", () => {
    const report = checkCoverage(ruleset, outline, document);
    expect(report.ok, JSON.stringify(report.problems)).toBe(true);
    expect(report.rules).toEqual({ total: 61, covered: 61, missing: [] });
    expect(report.configs).toEqual({ total: 25, covered: 25, missing: [] });
    expect(report.outOfScope).toEqual({ rules: 0, configs: 0 });
  });

  it("渲染含全部章节标题与来源行", () => {
    const md = renderDocument(document, outline);
    for (const sec of outline.sections) expect(md).toContain(`## ${sec.title}`);
    expect(md).toContain("来源：");
    expect(md).toContain("是产出物而非事实源");
  });

  it("端到端写出合法文档与 Markdown", () => {
    const out = mkdtempSync(join(tmpdir(), "p0b-"));
    try {
      const result = runP0B(out);
      expect(result.report.ok).toBe(true);
      const doc = JSON.parse(readFileSync(join(out, "document.json"), "utf8"));
      expect(documentSchema.safeParse(doc).success).toBe(true);
      expect(doc.blocks.length).toBe(outline.sections.length);
      const md = readFileSync(join(out, "需求全文.md"), "utf8");
      expect(md.split("\n## ").length).toBe(outline.sections.length + 1);
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  });
});
