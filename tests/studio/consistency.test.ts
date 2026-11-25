// K0 跨层契约一致性：各层实现对同一份数据必须给出相容结论
// 目的：防止 Schema、路径、事务、身份四层各自漂移
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { documentSchema, segmentLineageEntrySchema } from "../../studio/contracts/document.ts";
import { documentProposalInputSchema, documentProposalRecordSchema } from "../../studio/contracts/proposal.ts";
import { documentPath } from "../../studio/paths/registry.ts";
import { applyDocumentProposal, bumpDocumentVersion } from "../../studio/transaction/apply.ts";
import { draftsOf, matchIdentity, materializeLineage, prevSegmentsOf } from "../../studio/identity/lifecycle.ts";
import { block, documentFixture, HASH, proposalRecordFixture, segment } from "./fixtures.ts";

let root: string;

beforeEach(() => {
  root = join(tmpdir(), `kb-consistency-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  mkdirSync(join(root, "documents/hangzhou"), { recursive: true });
  mkdirSync(join(root, ".rule-studio/transactions"), { recursive: true });
  writeFileSync(join(root, "documents/hangzhou/document.json"), `${JSON.stringify(documentFixture(), null, 2)}\n`);
  writeFileSync(join(root, "documents/hangzhou/editorial-overrides.yaml"), "[]\n");
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("Schema ↔ 事务：写出的文档仍然合法", () => {
  it("applyDocumentProposal 后 document.json 仍通过 documentSchema，版本 +1", () => {
    applyDocumentProposal({
      kbRoot: root,
      transactionId: "TX-001",
      proposalId: "DOC-P-001",
      intent: "apply-expression",
      baseDocumentVersion: 3,
      targetPath: documentPath("hangzhou", "editorial-overrides.yaml"),
      targetContent: "- block_id: DOC-HJ-000001\n  segment_id: SEG-000001\n  text: 新说明\n",
    });
    const written = JSON.parse(readFileSync(join(root, "documents/hangzhou/document.json"), "utf8"));
    const parsed = documentSchema.safeParse(written);
    expect(parsed.success, parsed.success ? "" : JSON.stringify(parsed.error.issues)).toBe(true);
    expect(written.document_version).toBe(4);
    // 块上的版本快照仍是生成时值，不随事务上涨（顶层才是事实源）
    expect(written.blocks[0].document_version).toBeLessThanOrEqual(written.document_version);
  });

  it("bumpDocumentVersion 不破坏合法性", () => {
    const doc = documentFixture();
    const bumped = JSON.parse(bumpDocumentVersion(`${JSON.stringify(doc, null, 2)}\n`));
    expect(documentSchema.safeParse(bumped).success).toBe(true);
    expect(bumped.document_version).toBe(doc.document_version + 1);
  });
});

describe("Schema ↔ 路径：提案目标文件由 registry 推导", () => {
  it("表达层提案的 target.file 等于 registry 推导结果", () => {
    const record = proposalRecordFixture();
    expect(record.target.file).toBe(documentPath("hangzhou", "editorial-overrides.yaml"));
  });

  it("结构层提案的目标文件同样由 registry 推导", () => {
    const record = proposalRecordFixture({
      op: "move-block",
      target: {
        block_id: "DOC-HJ-000001",
        file: documentPath("hangzhou", "document-outline.yaml"),
      },
      base_revision: {
        document_version: 3,
        files: [
          { path: documentPath("hangzhou", "document.json"), sha256: HASH },
          { path: documentPath("hangzhou", "document-outline.yaml"), sha256: HASH },
        ],
      },
    });
    expect(documentProposalRecordSchema.safeParse(record).success).toBe(true);
    expect(record.target.file).toBe("documents/hangzhou/document-outline.yaml");
  });
});

describe("输入 ↔ 记录：Agent 输入可补全为合法记录", () => {
  it("从 Agent 输入 + 服务端基线构造的记录通过 Schema", () => {
    const input = documentProposalInputSchema.parse({
      type: "document",
      ruleset_id: "hangzhou-friends-4p",
      target_variant: "hangzhou",
      op: "replace-text",
      target: { block_id: "DOC-HJ-000001", segment_id: "SEG-000001" },
      rationale: "夹具",
      evidence: [],
      after_text: "改写后的说明",
    });
    const record = documentProposalRecordSchema.parse({
      id: "DOC-P-002",
      type: "document",
      ruleset_id: input.ruleset_id,
      target_variant: input.target_variant,
      op: input.op,
      target: {
        block_id: input.target.block_id,
        segment_id: input.target.segment_id,
        file: documentPath(input.target_variant, "editorial-overrides.yaml"),
      },
      base_revision: {
        document_version: 3,
        files: [
          { path: documentPath(input.target_variant, "document.json"), sha256: HASH },
          { path: documentPath(input.target_variant, "editorial-overrides.yaml"), sha256: HASH },
        ],
      },
      before: { text: "原说明", sha256: HASH },
      after: { text: input.after_text!, sha256: HASH },
      rationale: input.rationale,
      evidence: input.evidence,
      status: "ready",
    });
    expect(record.target.file).toBe(documentPath("hangzhou", "editorial-overrides.yaml"));
  });
});

describe("身份 ↔ Schema：匹配结果产出的 lineage 合法", () => {
  it("split 结果经 materialize 后通过 segmentLineageEntrySchema", () => {
    const prev = documentFixture();
    const prevView = prevSegmentsOf(prev);
    const drafts = [
      { logical_block_id: "LBL-OPENING-01", section_id: "opening", anchor: "HJ-R-A", ordinal: 0 },
      { logical_block_id: "LBL-OPENING-01", section_id: "opening", anchor: "HJ-R-B", ordinal: 1 },
    ];
    const result = matchIdentity(prevView, drafts);
    const ids = new Map(result.assign_new.map((i, n) => [i, `SEG-00010${n}`] as const));
    const lineage = materializeLineage(result.lineage, ids);
    for (const entry of lineage) {
      const parsed = segmentLineageEntrySchema.safeParse(entry);
      expect(parsed.success, parsed.success ? "" : JSON.stringify(parsed.error.issues)).toBe(true);
    }
  });

  it("沿用匹配不产生新 lineage，且保留原 segment_id", () => {
    const prev = documentFixture();
    const result = matchIdentity(prevSegmentsOf(prev), draftsOf(prev.blocks));
    expect(result.lineage).toEqual([]);
    expect(result.retained.map((r) => r.segment_id)).toEqual(["SEG-000001"]);
  });
});

describe("多层联合：改动后仍可再次提交", () => {
  it("同一文档连续两次事务提交，版本递进且始终合法", () => {
    const target = documentPath("hangzhou", "editorial-overrides.yaml");
    applyDocumentProposal({
      kbRoot: root,
      transactionId: "TX-010",
      proposalId: "DOC-P-010",
      intent: "apply-expression",
      baseDocumentVersion: 3,
      targetPath: target,
      targetContent: "[]\n# first\n",
    });
    applyDocumentProposal({
      kbRoot: root,
      transactionId: "TX-011",
      proposalId: "DOC-P-011",
      intent: "apply-expression",
      baseDocumentVersion: 4,
      targetPath: target,
      targetContent: "[]\n# second\n",
    });
    const doc = JSON.parse(readFileSync(join(root, "documents/hangzhou/document.json"), "utf8"));
    expect(doc.document_version).toBe(5);
    expect(documentSchema.safeParse(doc).success).toBe(true);
    expect(readFileSync(join(root, target), "utf8")).toContain("second");
  });

  it("夹具本身合法：documentFixture 与 proposalRecordFixture 都能被 Schema 接受", () => {
    expect(documentSchema.safeParse(documentFixture()).success).toBe(true);
    expect(documentProposalRecordSchema.safeParse(proposalRecordFixture()).success).toBe(true);
    // 夹具 block 的聚合引用与片段并集一致
    const b = block([segment("SEG-000001")]);
    expect(b.references.rule_refs).toEqual(["HJ-R-LUNZHUANG"]);
  });
});
