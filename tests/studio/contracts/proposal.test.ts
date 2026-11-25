// 提案契约测试：Agent 输入（不可信）与服务端记录（可信）必须分离
import { describe, it, expect } from "vitest";
import { documentProposalInputSchema, documentProposalRecordSchema } from "../../../studio/contracts/proposal.ts";

const input = {
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

describe("Proposal 契约：输入与记录分离", () => {
  it("合法 Agent 输入通过", () => {
    const r = documentProposalInputSchema.safeParse(input);
    expect(r.success, r.success ? "" : JSON.stringify(r.error.issues)).toBe(true);
  });

  it("Agent 输入不得包含路径 / 版本基线 / Hash（strict 拒绝）", () => {
    for (const forbidden of [
      { base_revision: { document_version: 3, files: [] } },
      { target: { ...input.target, file: "documents/hangzhou/editorial-overrides.yaml" } },
      { before: { text: "x", sha256: H } },
      { status: "ready" },
      { id: "DOC-P-001" },
    ]) {
      expect(documentProposalInputSchema.safeParse({ ...input, ...forbidden }).success).toBe(false);
    }
  });

  it("replace-text 必须指定 segment_id", () => {
    const bad = { ...input, target: { block_id: "DOC-HJ-000001" } };
    expect(documentProposalInputSchema.safeParse(bad).success).toBe(false);
  });

  it("结构修改必须给 after_outline 且不得给 after_text", () => {
    const moveOp = { ...input, op: "move-block", after_text: null, after_outline: "sections: []" };
    expect(documentProposalInputSchema.safeParse(moveOp).success).toBe(true);
    expect(documentProposalInputSchema.safeParse({ ...moveOp, after_text: "x" }).success).toBe(false);
    expect(documentProposalInputSchema.safeParse({ ...moveOp, after_outline: null }).success).toBe(false);
  });

  it("合法服务端记录通过", () => {
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

  it("落点文件必须与 op 匹配（表达层 vs 结构层）", () => {
    expect(
      documentProposalRecordSchema.safeParse({
        ...record,
        op: "move-block",
        target: { ...record.target, file: "documents/hangzhou/document-outline.yaml" },
        base_revision: {
          document_version: 3,
          files: [
            { path: "documents/hangzhou/document.json", sha256: H },
            { path: "documents/hangzhou/document-outline.yaml", sha256: H },
          ],
        },
      }).success,
    ).toBe(true);

    // replace-text 指向 outline 文件应被拒绝
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
});
