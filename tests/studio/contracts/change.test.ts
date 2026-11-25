// 变更契约测试：Change Package 与 Artifact（只校验数据形状，不涉及调度）
import { describe, it, expect } from "vitest";
import { changeSchema } from "../../../studio/contracts/change.ts";

const H = "b".repeat(64);

const change = {
  change_id: "CHG-001",
  status: "ready",
  ruleset_id: "hangzhou-friends-4p",
  target_variant: "hangzhou",
  template_version: "1.0.0",
  intent: "补充连庄条件说明",
  scope: ["documents/hangzhou"],
  proposal_ids: ["DOC-P-001"],
  artifacts: [
    { artifact_id: "ART-DIFF-01", kind: "diff", status: "ready", input_hash: H, path: "artifacts/diff.json" },
    { artifact_id: "ART-VALIDATION-01", kind: "validation", status: "candidate" },
  ],
  created_at: "2026-11-24T10:00:00.000Z",
  updated_at: "2026-11-24T10:05:00.000Z",
};

describe("Change 契约", () => {
  it("合法 Change 通过", () => {
    const r = changeSchema.safeParse(change);
    expect(r.success, r.success ? "" : JSON.stringify(r.error.issues)).toBe(true);
  });

  it("status 只允许生命周期枚举", () => {
    expect(changeSchema.safeParse({ ...change, status: "preparing" }).success).toBe(false);
    expect(changeSchema.safeParse({ ...change, status: "writing" }).success).toBe(false);
    expect(changeSchema.safeParse({ ...change, status: "verified" }).success).toBe(true);
  });

  it("ready / confirmed 的产物必须有 input_hash", () => {
    const bad = { ...change, artifacts: [{ artifact_id: "ART-DIFF-01", kind: "diff", status: "ready" }] };
    expect(changeSchema.safeParse(bad).success).toBe(false);
  });

  it("artifact_id 不得重复", () => {
    const bad = {
      ...change,
      artifacts: [
        { artifact_id: "ART-DIFF-01", kind: "diff", status: "ready", input_hash: H },
        { artifact_id: "ART-DIFF-01", kind: "diff", status: "candidate" },
      ],
    };
    expect(changeSchema.safeParse(bad).success).toBe(false);
  });

  it("archived 必须有 archive_path，非 archived 不得有", () => {
    expect(changeSchema.safeParse({ ...change, status: "archived" }).success).toBe(false);
    expect(
      changeSchema.safeParse({ ...change, status: "archived", archive_path: "rulebook/changes/archive/2026-11-24-CHG-001" })
        .success,
    ).toBe(true);
    expect(changeSchema.safeParse({ ...change, archive_path: "x" }).success).toBe(false);
  });

  it("updated_at 不得早于 created_at", () => {
    expect(changeSchema.safeParse({ ...change, updated_at: "2026-11-24T09:00:00.000Z" }).success).toBe(false);
  });

  it("未知字段被拒绝", () => {
    expect(changeSchema.safeParse({ ...change, graph: {} }).success).toBe(false);
  });
});
