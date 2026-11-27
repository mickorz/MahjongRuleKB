// W3-3 / W4-1：统一变更层与编辑会话测试
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  checkMutation,
  computeBaseRevision,
  mutationToProposalInput,
  mutationsFromMarkdown,
  mutationSchema,
  type Mutation,
} from "../../../studio/edit/mutation.ts";
import { addMutation, createSession, discardSession, listSessions, readSession, sessionDrift } from "../../../studio/edit/session.ts";
import { PathPolicyError } from "../../../studio/paths/registry.ts";
import { block, documentFixture } from "../fixtures.ts";
import { documentSchema } from "../../../studio/contracts/document.ts";

const variantDoc = documentFixture();

const replaceSeg = (segmentId: string, text = "改写后的内容"): Mutation =>
  mutationSchema.parse({ target: { segment_id: segmentId }, op: "replace-text", text, source: "richtext", rationale: "润色" });

describe("W3-3 Mutation 契约", () => {
  it("replace-text 必须给 segment_id 与 text", () => {
    expect(() => mutationSchema.parse({ target: {}, op: "replace-text", text: "x", source: "richtext", rationale: "r" })).toThrow();
    expect(() => mutationSchema.parse({ target: { segment_id: "SEG-000001" }, op: "replace-text", source: "richtext", rationale: "r" })).toThrow();
  });

  it("move-block 必须给 block_id", () => {
    expect(() => mutationSchema.parse({ target: {}, op: "move-block", source: "richtext", rationale: "r" })).toThrow();
  });

  it("不接受客户端携带 base_revision 等字段（strict）", () => {
    expect(() =>
      mutationSchema.parse({
        target: { segment_id: "SEG-000001" },
        op: "replace-text",
        text: "x",
        source: "richtext",
        rationale: "r",
        base_revision: { document_version: 1, files: [] },
      }),
    ).toThrow();
  });
});

describe("W3-3 服务端权限复验", () => {
  it("基座文档一律拒绝", () => {
    const r = checkMutation(replaceSeg("SEG-000001"), { document: variantDoc, targetVariant: "hangzhou", isBaseDocument: true });
    expect(r.ok).toBe(false);
    expect(r.reasons[0]).toMatch(/基座/);
  });

  it("继承片段拒绝，并说明原因", () => {
    const doc = documentSchema.parse({
      ...variantDoc,
      blocks: [block([{ ...variantDoc.blocks[0].content[0], lineage: "default_inherited", base_rule_ref: "HJ-R-DINGZHUANG" }])],
    });
    const r = checkMutation(replaceSeg("SEG-000001"), { document: doc, targetVariant: "xiaoshan", isBaseDocument: false });
    expect(r.ok).toBe(false);
    expect(r.reasons[0]).toMatch(/继承/);
  });

  it("变体自有片段放行，并回带改动前文本（用于 Diff）", () => {
    const doc = documentSchema.parse({
      ...variantDoc,
      blocks: [
        block([
          {
            ...variantDoc.blocks[0].content[0],
            lineage: "modified",
            diff_status: "candidate",
            base_rule_ref: "HJ-R-DINGZHUANG",
          },
        ]),
      ],
    });
    const r = checkMutation(replaceSeg("SEG-000001"), { document: doc, targetVariant: "xiaoshan", isBaseDocument: false });
    expect(r.ok).toBe(true);
    expect(r.segment?.before.length).toBeGreaterThan(0);
  });

  it("不存在的片段被拒", () => {
    const r = checkMutation(replaceSeg("SEG-999999"), { document: variantDoc, targetVariant: "xiaoshan", isBaseDocument: false });
    expect(r.ok).toBe(false);
    expect(r.reasons[0]).toMatch(/不存在/);
  });
});

describe("W3-3 转换到既有 Proposal", () => {
  it("replace-text → DocumentProposalInput，且不带 base_revision", () => {
    const input = mutationToProposalInput({
      mutation: replaceSeg("SEG-000001"),
      document: variantDoc,
      rulesetId: "xiaoshan-friends-4p",
      targetVariant: "xiaoshan",
    });
    expect(input.op).toBe("replace-text");
    expect(input.target.segment_id).toBe("SEG-000001");
    expect(input.after_text).toBe("改写后的内容");
    expect("base_revision" in input).toBe(false);
  });

  it("hide 不允许携带 after_text", () => {
    const m: Mutation = mutationSchema.parse({ target: { block_id: "DOC-HJ-000001" }, op: "hide", source: "richtext", rationale: "隐藏" });
    const input = mutationToProposalInput({ mutation: m, document: variantDoc, rulesetId: "xiaoshan-friends-4p", targetVariant: "xiaoshan" });
    expect(input.op).toBe("hide");
    expect(input.after_text).toBeUndefined();
  });

  it("move-block 带 after_outline，且只含块与章节", () => {
    const m: Mutation = mutationSchema.parse({ target: { block_id: "DOC-HJ-000001" }, op: "move-block", source: "markdown", rationale: "调整顺序" });
    const input = mutationToProposalInput({ mutation: m, document: variantDoc, rulesetId: "xiaoshan-friends-4p", targetVariant: "xiaoshan" });
    expect(typeof input.after_outline).toBe("string");
    expect(input.after_outline).toContain("block_id: DOC-HJ-000001");
    expect(input.after_outline).toContain("section_id:");
  });
});

describe("W3-3 baseRevision 由服务端计算", () => {
  let kb: string;
  beforeEach(() => {
    kb = join(tmpdir(), `kb-rev-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    mkdirSync(join(kb, "documents/xiaoshan"), { recursive: true });
    writeFileSync(join(kb, "documents/xiaoshan/document.json"), JSON.stringify(variantDoc), "utf8");
  });
  afterEach(() => rmSync(kb, { recursive: true, force: true }));

  it("读取当前版本，并计算目标文件 Hash（含 document.json 自身）", () => {
    const rev = computeBaseRevision(kb, "xiaoshan", ["documents/xiaoshan/editorial-overrides.yaml"]);
    expect(rev.document_version).toBe(variantDoc.document_version);
    expect(rev.files.map((f) => f.path)).toContain("documents/xiaoshan/document.json");
    for (const f of rev.files) expect(f.sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it("文档不存在时抛错", () => {
    expect(() => computeBaseRevision(kb, "hangzhou", [])).toThrow(/文档不存在/);
  });
});

describe("W3-3 Markdown 映射", () => {
  it("按 seg 标注映射回片段身份", () => {
    const md = `<!-- seg:SEG-000001 -->\n新的段落文本\n`;
    const { mutations, rejected } = mutationsFromMarkdown(md, variantDoc);
    expect(mutations.length).toBe(1);
    expect(mutations[0].target.segment_id).toBe("SEG-000001");
    expect(rejected.some((r) => r.includes("未出现在编辑内容"))).toBe(false);
  });

  it("未知片段 / 清空内容 / 未改动分别处理", () => {
    const md = `<!-- seg:SEG-999999 -->\n瞎写\n<!-- seg:SEG-000001 -->\n   \n`;
    const { mutations, rejected } = mutationsFromMarkdown(md, variantDoc);
    expect(mutations).toEqual([]);
    expect(rejected.some((r) => r.includes("未知片段"))).toBe(true);
    expect(rejected.some((r) => r.includes("被清空"))).toBe(true);
  });

  it("文本未变化时不产生 mutation", () => {
    const text = variantDoc.blocks[0].content[0].text;
    const md = `<!-- seg:SEG-000001 -->\n${text}\n`;
    expect(mutationsFromMarkdown(md, variantDoc).mutations).toEqual([]);
  });
});

describe("W4-1 编辑会话", () => {
  let kb: string;
  beforeEach(() => {
    kb = join(tmpdir(), `kb-ses-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    mkdirSync(kb, { recursive: true });
  });
  afterEach(() => rmSync(kb, { recursive: true, force: true }));

  it("创建会话写入运行时草稿目录，不碰 documents/", () => {
    const s = createSession({ kbRoot: kb, sessionId: "SES-0001", rulesetId: "xiaoshan-friends-4p", targetVariant: "xiaoshan", documentVersion: 3 });
    expect(s.mutations).toEqual([]);
    expect(listSessions(kb, "xiaoshan")).toEqual(["SES-0001"]);
  });

  it("同一片段同一 op 的重复编辑覆盖，不堆积", () => {
    createSession({ kbRoot: kb, sessionId: "SES-0001", rulesetId: "xiaoshan-friends-4p", targetVariant: "xiaoshan", documentVersion: 3 });
    addMutation(kb, "xiaoshan", "SES-0001", replaceSeg("SEG-000001", "第一版"));
    const after = addMutation(kb, "xiaoshan", "SES-0001", replaceSeg("SEG-000001", "第二版"));
    expect(after.mutations.length).toBe(1);
    expect(after.mutations[0].text).toBe("第二版");
  });

  it("版本漂移会给出提醒（不静默套用旧草稿）", () => {
    const s = createSession({ kbRoot: kb, sessionId: "SES-0001", rulesetId: "xiaoshan-friends-4p", targetVariant: "xiaoshan", documentVersion: 3 });
    expect(sessionDrift(s, 3)).toBeUndefined();
    expect(sessionDrift(s, 4)).toMatch(/重新确认/);
  });

  it("丢弃会话后不再列出", () => {
    createSession({ kbRoot: kb, sessionId: "SES-0001", rulesetId: "xiaoshan-friends-4p", targetVariant: "xiaoshan", documentVersion: 3 });
    discardSession(kb, "xiaoshan", "SES-0001");
    expect(listSessions(kb, "xiaoshan")).toEqual([]);
    expect(() => readSession(kb, "xiaoshan", "SES-0001")).toThrow(/不存在/);
  });

  it("会话 ID 格式受 Schema 约束；草稿路径过权限矩阵", () => {
    expect(() =>
      createSession({ kbRoot: kb, sessionId: "session1", rulesetId: "x-4p", targetVariant: "xiaoshan", documentVersion: 0 }),
    ).toThrow();
    // 变体名非法时矩阵拒绝
    expect(() =>
      createSession({ kbRoot: kb, sessionId: "SES-0002", rulesetId: "x-4p", targetVariant: "../hangzhou", documentVersion: 0 }),
    ).toThrow(PathPolicyError);
  });
});
