// P0-A 单章节链路测试：读规则集 → 章节装配 → Document Block → 覆盖门禁 → 渲染
import { describe, it, expect } from "vitest";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { documentSchema, looksLikeFormula, numericOnlyPattern } from "../../../studio/contracts/document.ts";
import { documentOutlineSchema } from "../../../studio/contracts/outline.ts";
import { checkCoverage, renderDocument } from "../../../studio/pipeline/gates.ts";
import { generateDocument } from "../../../studio/pipeline/generate.ts";
import { readBaseRuleSet, slotText } from "../../../studio/pipeline/read-ruleset.ts";
import { runP0A } from "../../../studio/pipeline/run-p0a.ts";

const outline = documentOutlineSchema.parse({
  template_version: "1.0.0",
  sections: [
    {
      section_id: "contract",
      title: "三摊承包",
      rule_refs: ["HJ-R-CHENGBAO", "HJ-P-CHENGBAO-RUZHANG"],
      config_refs: ["HJ-C-SANTAN-CHENGBAO"],
      cross_reference_sections: [],
    },
    {
      section_id: "scoring",
      title: "算分规则",
      rule_refs: ["HJ-F-YUANYING-PEIFEN", "HJ-F-ZHUANGXIAN-BEILV", "HJ-P-ZIMO-RUZHANG"],
      config_refs: ["HJ-C-DIFEN"],
      cross_reference_sections: ["contract"],
    },
  ],
});

describe("Stage 1 读取规则集", () => {
  it("读取到杭州规则集与配置，版本来自 manifest", () => {
    const rs = readBaseRuleSet();
    expect(rs.rulesetId).toBe("hangzhou-friends-4p");
    expect(rs.rules.length).toBe(61);
    expect(rs.configs.length).toBe(25);
    expect(rs.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("规则卡带原文证据，且指向 rulebook/sources", () => {
    const rs = readBaseRuleSet();
    const rule = rs.rules.find((r) => r.id === "HJ-R-LUNZHUANG")!;
    expect(rule.evidence.length).toBeGreaterThan(0);
    for (const e of rule.evidence) expect(e.startsWith("rulebook/sources/")).toBe(true);
  });

  it("槽位提取可用", () => {
    const rs = readBaseRuleSet();
    const rule = rs.rules.find((r) => r.id === "HJ-F-ZHUANGXIAN-BEILV")!;
    const text = slotText(rule.body, "公式");
    expect(text).toBeTruthy();
  });
});

describe("Stage 3 生成 Document Block", () => {
  const rs = readBaseRuleSet();
  const { document, unassigned } = generateDocument(rs, outline, {
    templateVersion: "1.0.0",
    variant: "hangzhou",
  });

  it("生成的文档通过 documentSchema", () => {
    const r = documentSchema.safeParse(document);
    expect(r.success, r.success ? "" : JSON.stringify(r.error.issues)).toBe(true);
  });

  it("每个章节一个块，块 ID 稳定格式、section 对应", () => {
    expect(document.blocks.map((b) => b.section_id)).toEqual(["contract", "scoring"]);
    for (const b of document.blocks) expect(b.block_id).toMatch(/^DOC-HA-\d{6}$/);
    // 片段 ID 全局不重复
    const ids = document.blocks.flatMap((b) => b.content.map((s) => s.segment_id));
    expect(ids.length).toBe(new Set(ids).size);
  });

  it("基座文档：lineage 全 base、diff_status 全 not_applicable", () => {
    for (const b of document.blocks) {
      for (const s of b.content) {
        expect(s.lineage).toBe("base");
        expect(s.diff_status).toBe("not_applicable");
      }
    }
  });

  it("算分章节含确定性算例，数值来自计算器且不可编辑", () => {
    const scoring = document.blocks.find((b) => b.section_id === "scoring")!;
    const numeric = scoring.content.filter((s) => /庄闲倍率：\d+/.test(s.text));
    expect(numeric.length).toBe(1);
    expect(numeric[0].editable).toBe(false);
    expect(numeric[0].text).toContain("8"); // 杭州笃三老庄固定 8 倍
  });

  it("公式/数值类片段不可编辑，普通说明可编辑", () => {
    for (const b of document.blocks) {
      for (const s of b.content) {
        if (looksLikeFormula(s.text) || numericOnlyPattern.test(s.text)) {
          expect(s.editable, s.text).toBe(false);
        }
      }
    }
  });

  it("未在本阶段范围内的规则被如实报告（不是静默丢弃）", () => {
    expect(unassigned.rules.length).toBeGreaterThan(0);
    expect(unassigned.rules).not.toContain("HJ-F-ZHUANGXIAN-BEILV");
  });
});

describe("Stage 5 覆盖门禁", () => {
  const rs = readBaseRuleSet();
  const { document } = generateDocument(rs, outline, { templateVersion: "1.0.0", variant: "hangzhou" });

  it("本阶段声明的规则与配置全部落位", () => {
    const report = checkCoverage(rs, outline, document);
    expect(report.rules.missing).toEqual([]);
    expect(report.configs.missing).toEqual([]);
    expect(report.ok).toBe(true);
    expect(report.outOfScope.rules).toBeGreaterThan(0);
  });

  it("缺章节时门禁失败并指出问题", () => {
    const shrunk = documentSchema.parse({ ...document, blocks: document.blocks.filter((b) => b.section_id !== "contract") });
    const report = checkCoverage(rs, outline, shrunk);
    expect(report.ok).toBe(false);
    expect(report.rules.missing).toContain("HJ-R-CHENGBAO");
    expect(report.problems.some((p) => p.includes("contract"))).toBe(true);
  });
});

describe("Stage 6 渲染", () => {
  const rs = readBaseRuleSet();
  const { document } = generateDocument(rs, outline, { templateVersion: "1.0.0", variant: "hangzhou" });
  const md = renderDocument(document, outline);

  it("含标题、版本信息与来源行", () => {
    expect(md).toContain("# hangzhou-friends-4p 需求全文");
    expect(md).toContain("文档版本：0");
    expect(md).toContain("## 三摊承包");
    expect(md).toContain("## 算分规则");
    expect(md).toContain("来源：");
  });

  it("渲染不是事实源：明确声明", () => {
    expect(md).toContain("是产出物而非事实源");
  });
});

describe("runP0A 端到端", () => {
  it("写出 document.json 与 需求全文.md，且文档合法", () => {
    const out = mkdtempSync(join(tmpdir(), "p0a-"));
    try {
      const result = runP0A(out);
      expect(result.report.ok).toBe(true);
      const doc = JSON.parse(readFileSync(join(out, "document.json"), "utf8"));
      expect(documentSchema.safeParse(doc).success).toBe(true);
      const md = readFileSync(join(out, "需求全文.md"), "utf8");
      expect(md).toContain("## 算分规则");
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  });
});
