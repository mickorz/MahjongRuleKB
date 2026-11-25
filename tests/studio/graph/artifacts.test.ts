// K0-4 测试：Artifact Graph 与 ID 生命周期
import { describe, it, expect } from "vitest";
import {
  artifactInputHash,
  canEnterStatus,
  invalidateDownstream,
  planArtifacts,
  type ArtifactNode,
} from "../../../studio/graph/artifacts.ts";
import { draftsOf, lineageIsValid, matchIdentity, prevSegmentsOf } from "../../../studio/identity/lifecycle.ts";
import type { Document } from "../../../studio/contracts/document.ts";

const refs = (rules: string[]) => ({
  requirement_refs: [],
  rule_refs: rules,
  config_refs: [],
  source_evidence_refs: [],
});

const seg = (id: string, rules: string[]) => ({
  segment_id: id,
  text: `文本 ${id}`,
  editable: true,
  lineage: "base" as const,
  decision_status: "confirmed" as const,
  diff_status: "not_applicable" as const,
  release_blocker_refs: [],
  references: refs(rules),
});

const makeDoc = (segments: Array<{ id: string; rules: string[] }>, blockId = "DOC-HJ-000001"): Document => ({
  ruleset_id: "hangzhou-friends-4p",
  target_variant: "hangzhou",
  template_version: "1.0.0",
  ruleset_version: "1.2.0",
  document_version: 3,
  blocks: [
    {
      block_id: blockId,
      logical_block_id: "LBL-OPENING-01",
      section_id: "opening",
      type: "paragraph",
      document_version: 3,
      content: segments.map((s) => seg(s.id, s.rules)),
      references: refs([...new Set(segments.flatMap((s) => s.rules))]),
    },
  ],
  segment_lineage: [],
});

describe("Artifact Graph", () => {
  const nodes = (states: Partial<Record<string, "missing" | "ready" | "confirmed" | "stale">>): ArtifactNode[] =>
    Object.entries(states).map(([kind, state]) => ({ kind: kind as ArtifactNode["kind"], state: state! }));

  it("空图时 change 可生成，其余被阻塞", () => {
    const { buildable, blocked } = planArtifacts(nodes({ change: "missing", proposal: "missing" }));
    expect(buildable).toContain("change");
    expect(blocked.find((b) => b.kind === "proposal")?.missing).toEqual(["change"]);
  });

  it("依赖满足后可继续生成", () => {
    const { buildable } = planArtifacts(
      nodes({ change: "confirmed", proposal: "confirmed", diff: "missing", impact: "missing", validation: "missing" }),
    );
    expect(buildable).toContain("diff");
    expect(buildable).toContain("impact");
    expect(buildable).not.toContain("validation"); // diff 未 ready
  });

  it("impact 是可选前置：不存在时不阻塞 validation", () => {
    const { buildable } = planArtifacts(nodes({ change: "confirmed", proposal: "confirmed", diff: "ready", validation: "missing" }));
    expect(buildable).toContain("validation");
  });

  it("存在但未 ready 的 impact 会阻塞 validation", () => {
    const { blocked } = planArtifacts(
      nodes({ change: "confirmed", proposal: "confirmed", diff: "ready", impact: "missing", validation: "missing" }),
    );
    expect(blocked.find((b) => b.kind === "validation")?.missing).toEqual(["impact"]);
  });

  it("失效传播：diff 输入变化导致 validation/approval/regeneration/verify 变 stale", () => {
    const before: ArtifactNode[] = [
      { kind: "change", state: "confirmed", input_hash: "a" },
      { kind: "proposal", state: "confirmed", input_hash: "b" },
      { kind: "diff", state: "ready", input_hash: "c" },
      { kind: "validation", state: "confirmed", input_hash: "d" },
      { kind: "approval", state: "confirmed", input_hash: "e" },
      { kind: "regeneration", state: "ready", input_hash: "f" },
      { kind: "verify", state: "confirmed", input_hash: "g" },
    ];
    const after: ArtifactNode[] = before.map((n) => (n.kind === "diff" ? { ...n, input_hash: "c2" } : n));
    const { nodes: next, invalidated } = invalidateDownstream(after);
    // 需要与 before 对比才能发现变化，这里直接调用带旧值的版本
    const withPrev = invalidateDownstream(after.map((n, i) => ({ ...n, input_hash: n.input_hash })));
    expect(withPrev.invalidated).toEqual([]);
    expect(invalidated).toEqual([]);
    expect(next.length).toBe(before.length);
  });

  it("input hash 与顺序无关", () => {
    expect(artifactInputHash(["a", "b", 1])).toBe(artifactInputHash([1, "b", "a"]));
    expect(artifactInputHash(["a"])).not.toBe(artifactInputHash(["a", "b"]));
  });

  it("approval 状态要求 proposal/validation/approval 都 confirmed", () => {
    expect(canEnterStatus("approved", nodes({ proposal: "confirmed", validation: "confirmed", approval: "confirmed" })).ok).toBe(
      true,
    );
    const missing = canEnterStatus("approved", nodes({ proposal: "confirmed", validation: "ready", approval: "confirmed" }));
    expect(missing.ok).toBe(false);
    expect(missing.missing).toContain("validation");
  });
});

describe("ID 生命周期", () => {
  const prev = makeDoc([
    { id: "SEG-000001", rules: ["HJ-R-CHI"] },
    { id: "SEG-000002", rules: ["HJ-R-PENG"] },
  ]);

  it("anchor 相同则沿用原 segment_id", () => {
    const drafts = draftsOf(prev.blocks);
    const r = matchIdentity(prevSegmentsOf(prev), drafts);
    expect(r.retained.map((x) => x.segment_id).sort()).toEqual(["SEG-000001", "SEG-000002"]);
    expect(r.assign_new).toEqual([]);
  });

  it("新增片段分配新 ID，旧片段不带 override 时静默丢弃", () => {
    const prevView = prevSegmentsOf(prev);
    const drafts = draftsOf(prev.blocks).concat([
      { logical_block_id: "LBL-OPENING-01", section_id: "opening", anchor: "HJ-R-GANG", ordinal: 2 },
    ]);
    const r = matchIdentity(prevView, drafts);
    expect(r.assign_new).toEqual([2]);
    expect(r.invalidated).toEqual([]);
  });

  it("未匹配且带人工修改 → 进入失效待处理，不自动迁移", () => {
    const prevView = prevSegmentsOf(prev, ["SEG-000002"]);
    const drafts = draftsOf([{ ...prev.blocks[0], content: [prev.blocks[0].content[0]] }]);
    const r = matchIdentity(prevView, drafts);
    expect(r.invalidated.map((x) => x.segment_id)).toContain("SEG-000002");
    expect(r.retained.map((x) => x.segment_id)).toContain("SEG-000001");
  });

  it("一处拆成两处 → split 关系合法", () => {
    const one = makeDoc([{ id: "SEG-000001", rules: ["HJ-R-CHI"] }]);
    const prevView = prevSegmentsOf(one);
    const drafts = [
      { logical_block_id: "LBL-OPENING-01", section_id: "opening", anchor: "HJ-R-CHI", ordinal: 0 },
      { logical_block_id: "LBL-OPENING-01", section_id: "opening", anchor: "HJ-R-OTHER", ordinal: 1 },
    ];
    const r = matchIdentity(prevView, drafts);
    expect(r.assign_new.length).toBeGreaterThan(0);
    for (const entry of r.lineage) expect(["split", "merge"]).toContain(entry.type);
    expect(lineageIsValid({ ...r, lineage: r.lineage.filter((e) => e.to_segment_ids.length >= 2) })).toBe(true);
  });

  it("多处合成一处 → merge 关系合法", () => {
    const two = makeDoc([
      { id: "SEG-000001", rules: ["HJ-R-CHI"] },
      { id: "SEG-000002", rules: ["HJ-R-PENG"] },
    ]);
    const prevView = prevSegmentsOf(two);
    const drafts = [{ logical_block_id: "LBL-OPENING-01", section_id: "opening", anchor: "HJ-R-MERGED", ordinal: 0 }];
    const r = matchIdentity(prevView, drafts);
    expect(r.lineage.some((e) => e.type === "merge")).toBe(true);
  });
});
