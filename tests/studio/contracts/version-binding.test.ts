// W0-4：文档版本绑定与生成溯源字段（可选，向后兼容）
// 目的：证明新增字段是增量——没有它们的旧产物仍然合法。
import { describe, it, expect } from "vitest";

import { documentSchema } from "../../../studio/contracts/document.ts";
import { documentFixture } from "../fixtures.ts";

const HASH = "a".repeat(64);

describe("W0-4 向后兼容", () => {
  it("没有 base_binding / generation 的旧文档仍然合法", () => {
    const doc = documentFixture();
    expect(doc.base_binding).toBeUndefined();
    expect(doc.generation).toBeUndefined();
    expect(documentSchema.safeParse(doc).success).toBe(true);
  });

  it("带完整 base_binding 的变体文档合法", () => {
    const doc = documentFixture({
      base_binding: { ruleset_version: "1.2.0", content_hash: HASH, document_version: 7 },
    } as never);
    expect(documentSchema.safeParse(doc).success).toBe(true);
  });

  it("content_hash 必须是 64 位小写 hex", () => {
    const bad = { ...documentFixture(), base_binding: { ruleset_version: "1.2.0", content_hash: "XYZ", document_version: 1 } };
    expect(documentSchema.safeParse(bad).success).toBe(false);
  });

  it("ruleset_version 必须是 semver", () => {
    const bad = { ...documentFixture(), base_binding: { ruleset_version: "1.2", content_hash: HASH, document_version: 1 } };
    expect(documentSchema.safeParse(bad).success).toBe(false);
  });

  it("generation 记录模型与 Prompt 版本，缺一项即非法", () => {
    const ok = documentFixture({
      generation: { model: "stub-1", prompt_version: "p1", locked_at: "2026-11-25T10:00:00.000Z", input_hash: HASH },
    } as never);
    expect(documentSchema.safeParse(ok).success).toBe(true);

    const bad = { ...documentFixture(), generation: { model: "stub-1", input_hash: HASH } };
    expect(documentSchema.safeParse(bad).success).toBe(false);
  });

  it("locked_at 必须是 ISO 时间", () => {
    const bad = {
      ...documentFixture(),
      generation: { model: "m", prompt_version: "p", locked_at: "昨天", input_hash: HASH },
    };
    expect(documentSchema.safeParse(bad).success).toBe(false);
  });

  it("未知字段仍然被拒绝（strict 未被打开缺口）", () => {
    const bad = { ...documentFixture(), 随便加的字段: 1 };
    expect(documentSchema.safeParse(bad).success).toBe(false);
  });

  it("C4：base_segment_ref 只允许出现在 modified 片段", () => {
    const doc = documentFixture();
    const seg = doc.blocks[0].content[0];
    const added = { ...seg, lineage: "added", base_rule_ref: null, base_segment_ref: seg.segment_id };
    const withAdded = { ...doc, blocks: [{ ...doc.blocks[0], content: [added] }] };
    expect(documentSchema.safeParse(withAdded).success).toBe(false);

    const modified = {
      ...seg,
      lineage: "modified",
      diff_status: "candidate",
      base_rule_ref: "HJ-R-DINGZHUANG",
      base_segment_ref: "SEG-000001",
    };
    const withModified = { ...doc, blocks: [{ ...doc.blocks[0], content: [modified] }] };
    expect(documentSchema.safeParse(withModified).success).toBe(true);
  });
});
