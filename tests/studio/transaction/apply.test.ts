// K0-3 测试：双校验、原子提交、回滚与崩溃恢复
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { applyDocumentProposal, bumpDocumentVersion, ApplyError, recoverPendingTransactions } from "../../../studio/transaction/apply.ts";
import { assertProposalTransition, assertTxTransition, TxStateError } from "../../../studio/transaction/journal.ts";

const sha = (s: string) => createHash("sha256").update(s).digest("hex");

let root: string;
const doc = (v: number) => `${JSON.stringify({ ruleset_id: "xiaoshan-friends-4p", document_version: v, blocks: [] }, null, 2)}\n`;

beforeEach(() => {
  root = join(tmpdir(), `kb-tx-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  mkdirSync(join(root, "documents/xiaoshan"), { recursive: true });
  mkdirSync(join(root, ".rule-studio/transactions"), { recursive: true });
  writeFileSync(join(root, "documents/xiaoshan/document.json"), doc(3));
  writeFileSync(join(root, "documents/xiaoshan/editorial-overrides.yaml"), "[]\n");
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

const overridePath = "documents/xiaoshan/editorial-overrides.yaml";

describe("状态机", () => {
  it("事务状态迁移只允许合法方向", () => {
    expect(() => assertTxTransition("preparing", "prepared")).not.toThrow();
    expect(() => assertTxTransition("prepared", "writing")).not.toThrow();
    expect(() => assertTxTransition("writing", "committed")).not.toThrow();
    expect(() => assertTxTransition("preparing", "writing")).toThrow(TxStateError);
    expect(() => assertTxTransition("committed", "rolled_back")).toThrow(TxStateError);
  });

  it("提案状态迁移只允许合法方向", () => {
    expect(() => assertProposalTransition("ready", "approved")).not.toThrow();
    expect(() => assertProposalTransition("approved", "applied")).not.toThrow();
    expect(() => assertProposalTransition("applied", "ready")).toThrow(TxStateError);
    expect(() => assertProposalTransition("draft", "applied")).toThrow(TxStateError);
  });
});

describe("applyDocumentProposal", () => {
  it("正常提交：目标文件与 document.json 同时更新，版本 +1", () => {
    const result = applyDocumentProposal({
      kbRoot: root,
      transactionId: "TX-001",
      proposalId: "DOC-P-001",
      baseDocumentVersion: 3,
      intent: "apply-expression",
      targetPath: overridePath,
      targetContent: "- block_id: DOC-HJ-000001\n  text: 新说明\n",
    });
    expect(result.state).toBe("committed");
    expect(readFileSync(join(root, overridePath), "utf8")).toContain("新说明");
    expect(JSON.parse(readFileSync(join(root, "documents/xiaoshan/document.json"), "utf8")).document_version).toBe(4);
  });

  it("文档版本基线不符 → 拒绝，且不写任何文件", () => {
    expect(() =>
      applyDocumentProposal({
        kbRoot: root,
        transactionId: "TX-002",
        proposalId: "DOC-P-002",
        baseDocumentVersion: 2,
        intent: "apply-expression",
      targetPath: overridePath,
        targetContent: "x",
      }),
    ).toThrow(ApplyError);
    expect(readFileSync(join(root, overridePath), "utf8")).toBe("[]\n");
  });

  it("写入前外部修改 → 中止并回滚", () => {
    // 先用 failAfterWrites 模拟：写完 document.json 后中断，回滚应恢复
    expect(() =>
      applyDocumentProposal({
        kbRoot: root,
        transactionId: "TX-003",
        proposalId: "DOC-P-003",
        baseDocumentVersion: 3,
        intent: "apply-expression",
      targetPath: overridePath,
        targetContent: "broken",
        failAfterWrites: 1,
      }),
    ).toThrow(ApplyError);
    // 回滚后 document.json 版本仍为 3，override 内容未变
    expect(JSON.parse(readFileSync(join(root, "documents/xiaoshan/document.json"), "utf8")).document_version).toBe(3);
    expect(readFileSync(join(root, overridePath), "utf8")).toBe("[]\n");
  });

  it("新建文件在回滚时被删除", () => {
    const outline = "documents/xiaoshan/document-outline.yaml";
    expect(() =>
      applyDocumentProposal({
        kbRoot: root,
        transactionId: "TX-004",
        proposalId: "DOC-P-004",
        baseDocumentVersion: 3,
        intent: "apply-structure",
      targetPath: outline,
        targetContent: "sections: []\n",
        failAfterWrites: 1,
      }),
    ).toThrow(ApplyError);
    expect(existsSync(join(root, outline))).toBe(false);
  });

  it("目标路径越权（表达层写 outline）→ 权限拒绝", () => {
    expect(() =>
      applyDocumentProposal({
        kbRoot: root,
        transactionId: "TX-005",
        proposalId: "DOC-P-005",
        baseDocumentVersion: 3,
        intent: "apply-expression",
      targetPath: "documents/xiaoshan/document-outline.yaml",
        targetContent: "x",
      }),
    ).toThrow();
  });
});

describe("崩溃恢复", () => {
  const writeJournal = (state: string, txId: string) => {
    const dir = join(root, ".rule-studio/transactions", txId);
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "manifest.json"),
      JSON.stringify(
        {
          transaction_id: txId,
          proposal_id: "DOC-P-009",
          state,
          base_document_version: 3,
          entries: [
            {
              path: "documents/xiaoshan/document.json",
              existed_before: true,
              original_sha256: sha(readFileSync(join(root, "documents/xiaoshan/document.json"), "utf8")),
              new_sha256: "b".repeat(64),
            },
          ],
          created_at: "2026-11-24T10:00:00.000Z",
          updated_at: "2026-11-24T10:00:00.000Z",
        },
        null,
        2,
      ),
    );
    return dir;
  };

  it("preparing / prepared：尚未写入，直接丢弃", () => {
    writeJournal("preparing", "TX-101");
    writeJournal("prepared", "TX-102");
    const out = recoverPendingTransactions(root);
    expect(out.map((o) => o.to)).toEqual(["rolled_back", "rolled_back"]);
    expect(existsSync(join(root, ".rule-studio/transactions/TX-101"))).toBe(false);
  });

  it("writing 但备份缺失 → recovery_failed 并保留现场", () => {
    const dir = writeJournal("writing", "TX-103");
    expect(() => recoverPendingTransactions(root)).toThrow();
    const journal = JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8"));
    expect(journal.state).toBe("recovery_failed");
    expect(existsSync(dir)).toBe(true);
  });

  it("committed / rolled_back / recovery_failed 不动", () => {
    writeJournal("committed", "TX-104");
    writeJournal("rolled_back", "TX-105");
    expect(recoverPendingTransactions(root)).toEqual([]);
  });
});
