// W4-2：批量应用
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { applySession, overridesYaml } from "../../../studio/edit/apply-batch.ts";
import { addMutation, createSession } from "../../../studio/edit/session.ts";
import { mutationSchema } from "../../../studio/edit/mutation.ts";
import { documentSchema } from "../../../studio/contracts/document.ts";
import { block, documentFixture, segment } from "../fixtures.ts";

const variantDoc = (version = 3) =>
  documentSchema.parse({
    ...documentFixture({ document_version: version }),
    blocks: [
      block([
        { ...segment("SEG-000001"), lineage: "modified", diff_status: "candidate", base_rule_ref: "HJ-R-DINGZHUANG" },
        { ...segment("SEG-000002"), lineage: "added" },
        // 继承片段：不可编辑，用来验证「全或无」
        { ...segment("SEG-000003"), lineage: "default_inherited", base_rule_ref: "HJ-R-LUNZHUANG" },
      ]),
    ],
  });

const replace = (segmentId: string, text: string) =>
  mutationSchema.parse({ target: { segment_id: segmentId }, op: "replace-text", text, source: "richtext", rationale: "润色" });

describe("W4-2 批量应用", () => {
  let kb: string;
  beforeEach(() => {
    kb = join(tmpdir(), `kb-apply-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    mkdirSync(join(kb, "documents/xiaoshan"), { recursive: true });
    mkdirSync(join(kb, ".rule-studio/transactions"), { recursive: true });
    writeFileSync(join(kb, "documents/xiaoshan/document.json"), JSON.stringify(variantDoc(), null, 2), "utf8");
    writeFileSync(join(kb, "documents/xiaoshan/editorial-overrides.yaml"), "- overrides: []\n", "utf8");
  });
  afterEach(() => rmSync(kb, { recursive: true, force: true }));

  const newSession = () =>
    createSession({ kbRoot: kb, sessionId: "SES-0001", rulesetId: "xiaoshan-friends-4p", targetVariant: "xiaoshan", documentVersion: 3 });

  it("多条可编辑改动一次提交，文档版本 +1", () => {
    newSession();
    addMutation(kb, "xiaoshan", "SES-0001", replace("SEG-000001", "第一条改写"));
    addMutation(kb, "xiaoshan", "SES-0001", replace("SEG-000002", "第二条改写"));
    const res = applySession({ kbRoot: kb, variant: "xiaoshan", sessionId: "SES-0001", transactionId: "TX-001", proposalId: "DOC-P-001" });
    expect(res.ok, JSON.stringify(res.rejected)).toBe(true);
    expect(res.applied).toBe(2);
    expect(res.documentVersionAfter).toBe(4);
    const overrides = readFileSync(join(kb, "documents/xiaoshan/editorial-overrides.yaml"), "utf8");
    expect(overrides).toContain("第一条改写");
    expect(overrides).toContain("第二条改写");
  });

  it("任一条不可编辑 → 整批不落盘（不是跳过坏的写好的）", () => {
    newSession();
    addMutation(kb, "xiaoshan", "SES-0001", replace("SEG-000001", "合法改写"));
    addMutation(kb, "xiaoshan", "SES-0001", replace("SEG-000003", "想改继承片段"));
    const before = readFileSync(join(kb, "documents/xiaoshan/document.json"), "utf8");
    const res = applySession({ kbRoot: kb, variant: "xiaoshan", sessionId: "SES-0001", transactionId: "TX-002", proposalId: "DOC-P-002" });
    expect(res.ok).toBe(false);
    expect(res.rejected.length).toBe(1);
    expect(res.rejected[0].reasons[0]).toMatch(/继承/);
    expect(readFileSync(join(kb, "documents/xiaoshan/document.json"), "utf8")).toBe(before);
    expect(readFileSync(join(kb, "documents/xiaoshan/editorial-overrides.yaml"), "utf8")).toBe("- overrides: []\n");
  });

  it("空会话不产生写入", () => {
    newSession();
    const res = applySession({ kbRoot: kb, variant: "xiaoshan", sessionId: "SES-0001" });
    expect(res.ok).toBe(false);
    expect(res.rejected[0].reasons[0]).toMatch(/没有可应用/);
  });

  it("文档版本已被外部改动时，事务拒绝（不会覆盖）", () => {
    newSession();
    addMutation(kb, "xiaoshan", "SES-0001", replace("SEG-000001", "改写"));
    // 模拟并发：外部把版本推进（直接改字段，不重建文档）
    const file = join(kb, "documents/xiaoshan/document.json");
    const raw = JSON.parse(readFileSync(file, "utf8")) as { document_version: number };
    raw.document_version = 7;
    writeFileSync(file, JSON.stringify(raw), "utf8");
    expect(() =>
      applySession({ kbRoot: kb, variant: "xiaoshan", sessionId: "SES-0001", transactionId: "TX-005", proposalId: "DOC-P-005" }),
    ).toThrow(/文档版本已变化/);
  });

  it("overrides YAML 形状稳定（JSON 转义文本）", () => {
    const yaml = overridesYaml([{ segment_id: "SEG-000001", block_id: "DOC-HJ-000001", text: '含引号"与\n换行' }]);
    expect(yaml).toContain("- overrides:");
    expect(yaml).toContain("segment_id: SEG-000001");
    expect(yaml).toContain("\\n");
  });
});


