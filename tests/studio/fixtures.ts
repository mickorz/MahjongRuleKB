// K0 共享测试夹具：让各层测试用同一份合法样本，避免各处重复构造漂移
import { documentSchema, type Document, type DocumentBlock, type Segment } from "../../studio/contracts/document.ts";
import { documentProposalRecordSchema, type DocumentProposalRecord } from "../../studio/contracts/proposal.ts";

export const HASH = "a".repeat(64);

export const refs = (
  rules: string[] = ["HJ-R-LUNZHUANG"],
  configs: string[] = [],
): Segment["references"] => ({
  requirement_refs: [],
  rule_refs: rules,
  config_refs: configs,
  source_evidence_refs: ["rulebook/sources/hangzhou/hangzhou-core-flow.md#2.3.2.4"],
});

export const segment = (id: string, overrides: Partial<Segment> = {}): Segment => ({
  segment_id: id,
  text: `规则文本 ${id}`,
  editable: true,
  lineage: "base",
  decision_status: "confirmed",
  diff_status: "not_applicable",
  release_blocker_refs: [],
  references: refs(),
  ...overrides,
});

export const block = (segments: Segment[], overrides: Partial<DocumentBlock> = {}): DocumentBlock => {
  const union = {
    requirement_refs: [...new Set(segments.flatMap((s) => s.references.requirement_refs))],
    rule_refs: [...new Set(segments.flatMap((s) => s.references.rule_refs))],
    config_refs: [...new Set(segments.flatMap((s) => s.references.config_refs))],
    source_evidence_refs: [...new Set(segments.flatMap((s) => s.references.source_evidence_refs))],
  };
  return {
    block_id: "DOC-HJ-000001",
    logical_block_id: "LBL-OPENING-01",
    section_id: "opening",
    type: "paragraph",
    document_version: 3,
    content: segments,
    references: union,
    ...overrides,
  };
};

/** 一份通过 documentSchema 的合法文档（杭州基座） */
export const documentFixture = (overrides: Partial<Document> = {}): Document =>
  documentSchema.parse({
    ruleset_id: "hangzhou-friends-4p",
    target_variant: "hangzhou",
    template_version: "1.0.0",
    ruleset_version: "1.2.0",
    document_version: 3,
    blocks: [block([segment("SEG-000001")])],
    segment_lineage: [],
    ...overrides,
  });

/** 服务端文档提案记录（表达层替换文本） */
export const proposalRecordFixture = (overrides: Partial<DocumentProposalRecord> = {}): DocumentProposalRecord =>
  documentProposalRecordSchema.parse({
    id: "DOC-P-001",
    type: "document",
    change_id: "CHG-001",
    ruleset_id: "hangzhou-friends-4p",
    target_variant: "hangzhou",
    op: "replace-text",
    target: {
      block_id: "DOC-HJ-000001",
      segment_id: "SEG-000001",
      file: "documents/hangzhou/editorial-overrides.yaml",
    },
    base_revision: {
      document_version: 3,
      files: [
        { path: "documents/hangzhou/document.json", sha256: HASH },
        { path: "documents/hangzhou/editorial-overrides.yaml", sha256: HASH },
      ],
    },
    before: { text: "旧", sha256: HASH },
    after: { text: "新", sha256: HASH },
    rationale: "夹具",
    evidence: [],
    status: "ready",
    ...overrides,
  });
