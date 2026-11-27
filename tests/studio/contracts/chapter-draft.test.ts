// W1-2：ChapterDraft 契约测试
// 重点：模型不得自创 ID；引用不合法的草稿必须被拒，而不是「丢掉坏引用继续装配」。
import { describe, it, expect } from "vitest";

import {
  chapterDraftSchema,
  refsOfDraft,
  validateDraftReferences,
  type ChapterDraft,
} from "../../../studio/contracts/chapter-draft.ts";

const known = {
  knownRuleIds: new Set(["HJ-R-DINGZHUANG", "HJ-R-LUNZHUANG"]),
  knownConfigIds: new Set(["HJ-C-RENSHU"]),
};

const draft = (over: Partial<ChapterDraft> = {}): ChapterDraft =>
  chapterDraftSchema.parse({
    section_id: "opening",
    paragraphs: [
      {
        title: "定庄",
        text: "首局从四名参战玩家中随机确定庄家，第二小局起按轮庄规则。",
        claims: [{ text: "首局随机定庄", rule_refs: ["HJ-R-DINGZHUANG"], config_refs: [] }],
      },
    ],
    ...over,
  });

describe("W1-2 ChapterDraft 契约", () => {
  it("每段至少一条 claim，claim 至少引用一条规则或配置", () => {
    expect(() =>
      chapterDraftSchema.parse({
        section_id: "opening",
        paragraphs: [{ text: "无引用的一段", claims: [] }],
      }),
    ).toThrow();
    expect(() =>
      chapterDraftSchema.parse({
        section_id: "opening",
        paragraphs: [{ text: "无引用的一段", claims: [{ text: "x", rule_refs: [], config_refs: [] }] }],
      }),
    ).toThrow(/至少引用/);
  });

  it("段落文本不能为空，章节不能没有段落", () => {
    expect(() =>
      chapterDraftSchema.parse({
        section_id: "opening",
        paragraphs: [{ text: "  ", claims: [{ text: "x", rule_refs: ["HJ-R-DINGZHUANG"], config_refs: [] }] }],
      }),
    ).toThrow();
    expect(() => chapterDraftSchema.parse({ section_id: "opening", paragraphs: [] })).toThrow();
  });

  it("section_id 必须是合法章节标识", () => {
    expect(() => chapterDraftSchema.parse({ ...draft(), section_id: "第三章" })).toThrow();
  });

  it("合法草稿无 issue", () => {
    expect(validateDraftReferences(draft(), known, "opening")).toEqual([]);
  });

  it("模型自创规则 ID 被拒，且错误里点名具体 ID", () => {
    const bad = draft({
      paragraphs: [
        {
          text: "编造的规则",
          claims: [{ text: "x", rule_refs: ["HJ-R-NOT-EXIST"], config_refs: [] }],
        },
      ],
    });
    const issues = validateDraftReferences(bad, known, "opening");
    expect(issues.length).toBe(1);
    expect(issues[0].code).toBe("draft.unknown-rule-ref");
    expect(issues[0].message).toContain("HJ-R-NOT-EXIST");
  });

  it("自创配置 ID 同样被拒", () => {
    const bad = draft({
      paragraphs: [
        { text: "编造的配置", claims: [{ text: "x", rule_refs: [], config_refs: ["HJ-C-FAKE"] }] },
      ],
    });
    expect(validateDraftReferences(bad, known, "opening")[0].code).toBe("draft.unknown-config-ref");
  });

  it("章节不符被发现（模型写错章）", () => {
    const issues = validateDraftReferences(draft({ section_id: "scoring" }), known, "opening");
    expect(issues.some((i) => i.code === "draft.section-mismatch")).toBe(true);
  });

  it("多段中的坏引用逐段报出，不因一段合法而放过另一段", () => {
    const mixed = draft({
      paragraphs: [
        { text: "合法段", claims: [{ text: "a", rule_refs: ["HJ-R-DINGZHUANG"], config_refs: [] }] },
        { text: "非法段", claims: [{ text: "b", rule_refs: ["HJ-R-BAD"], config_refs: [] }] },
      ],
    });
    const issues = validateDraftReferences(mixed, known, "opening");
    expect(issues.length).toBe(1);
    expect(issues[0].paragraph_index).toBe(1);
  });

  it("refsOfDraft 去重汇总引用", () => {
    const d = draft({
      paragraphs: [
        { text: "a", claims: [{ text: "a", rule_refs: ["HJ-R-DINGZHUANG"], config_refs: ["HJ-C-RENSHU"] }] },
        { text: "b", claims: [{ text: "b", rule_refs: ["HJ-R-DINGZHUANG", "HJ-R-LUNZHUANG"], config_refs: [] }] },
      ],
    });
    expect(refsOfDraft(d)).toEqual({
      rule_refs: ["HJ-R-DINGZHUANG", "HJ-R-LUNZHUANG"],
      config_refs: ["HJ-C-RENSHU"],
    });
  });
});
