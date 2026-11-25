// 提案契约测试：Agent 输入（不可信）与服务端记录（可信）必须分离；操作与字段强绑定
import { describe, it, expect } from "vitest";
import { documentProposalInputSchema, documentProposalRecordSchema } from "../../../studio/contracts/proposal.ts";

const baseInput = {
  type: "document",
  ruleset_id: "hangzhou-friends-4p",
  target_variant: "hangzhou",
  op: "replace-text",
  target: { block_id: "DOC-HJ-000001", segment_id: "SEG-000001" },
  rationale: "把连庄条件写清楚",
  evidence: ["rulebook/sources/hangzhou/hangzhou-core-flow.md#2.3.2.4"],
  after_text: "胡牌者担任下一小局庄家；流局由原庄连庄。",
};

const H = "a".repeat(64);
const record = {
  id: "DOC-P-001",
  type: "document",
  change_id: "CHG-001",
  ruleset_id: "hangzhou-friends-4p",
  target_variant: "hangzhou",
  op: "replace-text",
  target: { block_id: "DOC-HJ-000001", segment_id: "SEG-000001", file: "documents/hangzhou/editorial-overrides.yaml" },
  base_revision: {
    document_version: 3,
    files: [
      { path: "documents/hangzhou/document.json", sha256: H },
      { path: "documents/hangzhou/editorial-overrides.yaml", sha256: H },
    ],
  },
  before: { text: "旧文本", sha256: H },
  after: { text: "新文本", sha256: H },
  rationale: "把连庄条件写清楚",
  evidence: [],
  status: "ready",
};

const ok = (input: unknown) => documentProposalInputSchema.safeParse(input).success;

describe("ProposalInput：操作与字段契约", () => {
  it("replace-text 合法输入通过", () => {
    const r = documentProposalInputSchema.safeParse(baseInput);
    expect(r.success, r.success ? "" : JSON.stringify(r.error.issues)).toBe(true);
  });

  it("缺少必填 after_text 必须拒绝（undefined 与 null 同等对待）", () => {
    const { after_text, ...withoutText } = baseInput;
    expect(ok(withoutText)).toBe(false);
    expect(ok({ ...baseInput, after_text: null })).toBe(false);
  });

  it("append 必须给 after_text，且不得给 after_outline", () => {
    const append = { ...baseInput, op: "append", target: { block_id: "DOC-HJ-000001" } };
    expect(ok(append)).toBe(true);
    expect(ok({ ...append, after_text: null })).toBe(false);
    expect(ok({ ...append, after_outline: "sections: []" })).toBe(false);
  });

  it("replace-text 必须给 segment_id", () => {
    expect(ok({ ...baseInput, target: { block_id: "DOC-HJ-000001" } })).toBe(false);
  });

  it("hide 不需要 after_text / after_outline，且不得给片段目标", () => {
    const hide = { ...baseInput, op: "hide", target: { block_id: "DOC-HJ-000001" }, after_text: null };
    expect(ok(hide)).toBe(true);
    expect(ok({ ...hide, after_text: "x" })).toBe(false);
    expect(ok({ ...hide, after_outline: "sections: []" })).toBe(false);
    expect(ok({ ...hide, target: { block_id: "DOC-HJ-000001", segment_id: "SEG-000001" } })).toBe(false);
  });

  it("move-block 必须是块级目标，不得带 segment_id", () => {
    const move = { ...baseInput, op: "move-block", after_text: null, after_outline: "sections: []" };
    expect(ok({ ...move, target: { block_id: "DOC-HJ-000001" } })).toBe(true);
    expect(ok({ ...move, target: { block_id: "DOC-HJ-000001", segment_id: "SEG-000001" } })).toBe(false);
  });

  it("move-block / edit-outline 必须给 after_outline，且不得给 after_text", () => {
    for (const op of ["move-block", "edit-outline"]) {
      const base = op === "move-block" ? { ...baseInput, target: { block_id: "DOC-HJ-000001" } } : baseInput;
      const good = { ...base, op, after_text: null, after_outline: "sections: []" };
      expect(ok(good), op).toBe(true);
      expect(ok({ ...good, after_outline: null }), op).toBe(false);
      expect(ok({ ...good, after_text: "x" }), op).toBe(false);
    }
  });

  it("空字符串视为未提供", () => {
    expect(ok({ ...baseInput, after_text: "" })).toBe(false);
    expect(ok({ ...baseInput, op: "move-block", after_text: null, after_outline: "" })).toBe(false);
  });

  it("Agent 输入不得包含可信字段（strict）", () => {
    for (const forbidden of [
      { id: "DOC-P-001" },
      { status: "ready" },
      { base_revision: { document_version: 3, files: [] } },
      { before: { text: "x", sha256: H } },
      { target: { ...baseInput.target, file: "documents/hangzhou/editorial-overrides.yaml" } },
      { change_id: "CHG-001" },
    ]) {
      expect(ok({ ...baseInput, ...forbidden })).toBe(false);
    }
  });
});

describe("ProposalRecord：服务端可信记录", () => {
  it("合法记录通过", () => {
    const r = documentProposalRecordSchema.safeParse(record);
    expect(r.success, r.success ? "" : JSON.stringify(r.error.issues)).toBe(true);
  });

  it("base_revision.files 必须包含 document.json", () => {
    const bad = {
      ...record,
      base_revision: { document_version: 3, files: [{ path: "documents/hangzhou/editorial-overrides.yaml", sha256: H }] },
    };
    expect(documentProposalRecordSchema.safeParse(bad).success).toBe(false);
  });

  it("base_revision.files 必须包含目标文件", () => {
    const bad = {
      ...record,
      base_revision: { document_version: 3, files: [{ path: "documents/hangzhou/document.json", sha256: H }] },
    };
    expect(documentProposalRecordSchema.safeParse(bad).success).toBe(false);
  });

  it("base_revision.files 不得重复路径", () => {
    const bad = {
      ...record,
      base_revision: {
        document_version: 3,
        files: [
          { path: "documents/hangzhou/document.json", sha256: H },
          { path: "documents/hangzhou/document.json", sha256: H },
        ],
      },
    };
    expect(documentProposalRecordSchema.safeParse(bad).success).toBe(false);
  });

  it("落点文件必须与 op 匹配（表达层 vs 结构层）", () => {
    expect(
      documentProposalRecordSchema.safeParse({
        ...record,
        op: "move-block",
        target: { block_id: "DOC-HJ-000001", file: "documents/hangzhou/document-outline.yaml" },
        base_revision: {
          document_version: 3,
          files: [
            { path: "documents/hangzhou/document.json", sha256: H },
            { path: "documents/hangzhou/document-outline.yaml", sha256: H },
          ],
        },
      }).success,
    ).toBe(true);

    expect(
      documentProposalRecordSchema.safeParse({
        ...record,
        target: { ...record.target, file: "documents/hangzhou/document-outline.yaml" },
      }).success,
    ).toBe(false);
  });

  it("applied 提案必须有 transaction_id", () => {
    expect(documentProposalRecordSchema.safeParse({ ...record, status: "applied" }).success).toBe(false);
    expect(
      documentProposalRecordSchema.safeParse({ ...record, status: "applied", transaction_id: "TX-001" }).success,
    ).toBe(true);
  });

  it("嵌套 before / after 拒绝未知字段", () => {
    expect(
      documentProposalRecordSchema.safeParse({ ...record, before: { text: "x", sha256: H, extra: 1 } }).success,
    ).toBe(false);
  });
});
