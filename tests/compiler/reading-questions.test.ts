// W1-7 阅读验收问题清单的结构校验
// 目的：问题清单本身不能烂。它一旦不可用，W1 就失去可判定的验收依据。
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { parse } from "yaml";

import { readingQuestionListSchema, type ReadingQuestion } from "../../schemas/reading-questions.ts";
import { loadRuleset } from "../../compiler/validator.ts";

const path = "tests/acceptance/reading-questions.yaml";
const list: ReadingQuestion[] = readingQuestionListSchema.parse(parse(readFileSync(path, "utf8")));

describe("W1 阅读验收问题清单", () => {
  it("至少 10 题，ID 唯一", () => {
    expect(list.length).toBeGreaterThanOrEqual(10);
    expect(new Set(list.map((q) => q.id)).size).toBe(list.length);
  });

  it("覆盖开局、行牌、承包、算分、番型、结算、概述七个章节", () => {
    const sections = new Set(list.map((q) => q.section_hint));
    for (const required of ["overview", "opening", "gameplay", "contract", "scoring", "patterns", "settlement"]) {
      expect(sections.has(required as never), `缺少 ${required} 章节的问题`).toBe(true);
    }
  });

  it("每题都有判定要点与支撑规则卡", () => {
    for (const q of list) {
      expect(q.expected_points.length, q.id).toBeGreaterThan(0);
      for (const p of q.expected_points) expect(p.trim().length, q.id).toBeGreaterThan(1);
      expect(q.rule_refs.length, q.id).toBeGreaterThan(0);
    }
  });

  it("rule_refs 必须指向杭州规则集中真实存在的规则或配置", () => {
    const rs = loadRuleset("rulebook/specs/base/hangzhou", "base");
    const known = new Set<string>([
      ...rs.rules.map((r) => r.meta.id),
      ...rs.config.map((c) => c.id),
      ...rs.configUi.map((c) => c.id),
    ]);
    for (const q of list) {
      for (const ref of q.rule_refs) expect(known.has(ref), `${q.id} -> ${ref} 不存在`).toBe(true);
    }
  });

  it("依赖未决项的题必须显式标注（否则会污染通过率）", () => {
    const rs = loadRuleset("rulebook/specs/base/hangzhou", "base");
    const blocked = new Set(rs.rules.filter((r) => r.meta.release_blocker && r.meta.status !== "confirmed").map((r) => r.meta.id));
    for (const q of list) {
      const touchesBlocker = q.rule_refs.some((r) => blocked.has(r));
      if (touchesBlocker) expect(q.depends_on_unresolved, `${q.id} 引用了未决规则却未标注`).toBe(true);
    }
  });

  it("不依赖未决项的题不少于 10 题（保证通过率分母充足）", () => {
    expect(list.filter((q) => !q.depends_on_unresolved).length).toBeGreaterThanOrEqual(10);
  });

  it("题目不能问「未决是什么」，必须问已有确定答案的规则", () => {
    for (const q of list) expect(q.question).not.toMatch(/未决|待确认|还没定/);
  });
});
