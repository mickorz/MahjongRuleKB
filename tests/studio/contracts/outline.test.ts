// 章节装配契约测试：DocumentOutline
import { describe, it, expect } from "vitest";
import { documentOutlineSchema } from "../../../studio/contracts/outline.ts";

const outline = {
  template_version: "1.0.0",
  sections: [
    { section_id: "opening", title: "开局与发牌", rule_refs: ["HJ-R-DINGZHUANG", "HJ-R-LUNZHUANG"], config_refs: [], cross_reference_sections: [] },
    { section_id: "scoring", title: "算分规则", rule_refs: ["HJ-F-ZHUANGXIAN-BEILV"], config_refs: ["HJ-C-DIFEN"], cross_reference_sections: ["opening"] },
  ],
};

describe("DocumentOutline 契约", () => {
  it("合法装配通过", () => {
    const r = documentOutlineSchema.safeParse(outline);
    expect(r.success, r.success ? "" : JSON.stringify(r.error.issues)).toBe(true);
  });

  it("必须能表达配置项归属（config_refs）", () => {
    const parsed = documentOutlineSchema.parse(outline);
    expect(parsed.sections[1].config_refs).toEqual(["HJ-C-DIFEN"]);
  });

  it("同一规则不得在两个章节同时展开", () => {
    const bad = {
      ...outline,
      sections: [outline.sections[0], { ...outline.sections[1], rule_refs: ["HJ-R-LUNZHUANG"] }],
    };
    expect(documentOutlineSchema.safeParse(bad).success).toBe(false);
  });

  it("交叉引用必须指向存在的章节", () => {
    const bad = {
      ...outline,
      sections: [{ ...outline.sections[0], cross_reference_sections: ["nonexistent"] }],
    };
    expect(documentOutlineSchema.safeParse(bad).success).toBe(false);
  });

  it("章节不得交叉引用自身", () => {
    const bad = { ...outline, sections: [{ ...outline.sections[0], cross_reference_sections: ["opening"] }] };
    expect(documentOutlineSchema.safeParse(bad).success).toBe(false);
  });

  it("section_id 必须是 kebab-case", () => {
    const bad = { ...outline, sections: [{ ...outline.sections[0], section_id: "Opening" }] };
    expect(documentOutlineSchema.safeParse(bad).success).toBe(false);
  });
});
