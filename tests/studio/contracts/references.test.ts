// 引用契约测试：规则 / 配置 / 原文证据 / 原子需求四类引用的类型隔离
import { describe, it, expect } from "vitest";
import {
  configRefsSchema,
  referencesSchema,
  requirementRefsSchema,
  ruleRefsSchema,
  sourceEvidenceRefsSchema,
} from "../../../studio/contracts/references.ts";

describe("引用类型隔离", () => {
  it("规则引用接受 10 类规则字母", () => {
    for (const t of ["R", "T", "N", "M", "F", "K", "P", "V", "I", "A"]) {
      expect(ruleRefsSchema.safeParse([`HJ-${t}-X-01`]).success, t).toBe(true);
    }
  });

  it("规则引用拒绝配置项与未决项", () => {
    expect(ruleRefsSchema.safeParse(["HJ-C-DIFEN"]).success).toBe(false);
    expect(ruleRefsSchema.safeParse(["XS-U-001"]).success).toBe(false);
    expect(ruleRefsSchema.safeParse(["HJ-D-INVALID"]).success).toBe(false);
  });

  it("配置引用只接受 C", () => {
    expect(configRefsSchema.safeParse(["HJ-C-DIFEN"]).success).toBe(true);
    expect(configRefsSchema.safeParse(["HJ-R-LUNZHUANG"]).success).toBe(false);
    expect(configRefsSchema.safeParse(["HJ-C-UI-DAOJISHI"]).success).toBe(true);
  });

  it("原文证据必须位于 rulebook/sources 下", () => {
    expect(sourceEvidenceRefsSchema.safeParse(["rulebook/sources/hangzhou/x.md"]).success).toBe(true);
    expect(sourceEvidenceRefsSchema.safeParse(["rulebook/sources/hangzhou/x.md#2.3.3"]).success).toBe(true);
    expect(sourceEvidenceRefsSchema.safeParse(["docs/x.md"]).success).toBe(false);
    expect(sourceEvidenceRefsSchema.safeParse(["../outside.md"]).success).toBe(false);
  });

  it("原子需求引用为预留格式（HZ-F-001）", () => {
    expect(requirementRefsSchema.safeParse(["HZ-F-001"]).success).toBe(true);
    expect(requirementRefsSchema.safeParse(["HZ-001"]).success).toBe(false);
  });

  it("references 结构：requirement_refs 缺省为空数组，其余必填", () => {
    const r = referencesSchema.parse({
      rule_refs: ["HJ-R-CHI"],
      config_refs: [],
      source_evidence_refs: [],
    });
    expect(r.requirement_refs).toEqual([]);
    expect(referencesSchema.safeParse({ rule_refs: ["HJ-R-CHI"], config_refs: [] }).success).toBe(false);
  });

  it("references 拒绝未知字段", () => {
    const bad = {
      rule_refs: [],
      config_refs: [],
      source_evidence_refs: [],
      unexpected: true,
    };
    expect(referencesSchema.safeParse(bad).success).toBe(false);
  });
});
