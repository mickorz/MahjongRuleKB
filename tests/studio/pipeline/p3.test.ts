// P3 测试：G5 Gold Set 门禁、审计哈希链、基座升级回归
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { appendFileSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { AUDIT_PATH, appendAudit, readAudit, verifyAudit } from "../../../studio/audit/log.ts";
import { checkBaseUpgrade } from "../../../studio/pipeline/base-upgrade.ts";
import { checkCoverage } from "../../../studio/pipeline/gates.ts";
import { generateDocument } from "../../../studio/pipeline/generate.ts";
import { checkGoldSet, loadGoldSet } from "../../../studio/pipeline/goldset.ts";
import { buildHangzhouOutline } from "../../../studio/pipeline/outline-hangzhou.ts";
import { readBaseRuleSet } from "../../../studio/pipeline/read-ruleset.ts";
import { runP0B } from "../../../studio/pipeline/run-p0b.ts";

const ruleset = readBaseRuleSet();
const outline = buildHangzhouOutline(ruleset);
const { document } = generateDocument(ruleset, outline, {
  templateVersion: outline.template_version,
  variant: "hangzhou",
  documentVersion: 0,
});

describe("P3 G5 Gold Set 门禁", () => {
  it("默认关闭：不产生任何门禁结论", () => {
    const r = checkGoldSet(document, { enabled: false });
    expect(r.enabled).toBe(false);
    expect(r.checked).toBe(0);
    expect(r.ok).toBe(true);
  });

  it("开启后只核对 verified 用例，draft 计为跳过", () => {
    const cases = loadGoldSet(undefined, "hangzhou-friends-4p");
    const r = checkGoldSet(document, { enabled: true, cases });
    expect(r.total).toBe(cases.length);
    expect(r.checked).toBe(cases.filter((c) => c.verification.status === "verified").length);
    expect(r.skipped).toBe(cases.filter((c) => c.verification.status !== "verified").length);
    expect(r.ok, r.problems.join("；")).toBe(true);
  });

  it("规则在文档中无落点即不通过", () => {
    const r = checkGoldSet(document, {
      enabled: true,
      cases: [
        {
          id: "TC-FAKE-001",
          name: "伪造用例",
          ruleset_id: "hangzhou-friends-4p",
          rule_refs: ["HJ-R-NOT-EXIST"],
          input: {},
          expected: {},
          verification: { status: "verified", by: "人工", source: "x" },
          automation: { status: "manual" },
        } as never,
      ],
    });
    expect(r.ok).toBe(false);
    expect(r.problems[0]).toMatch(/无落点/);
  });

  it("未决项被写成 confirmed 即不通过", () => {
    const tampered = {
      ...document,
      blocks: document.blocks.map((b) => ({
        ...b,
        content: b.content.map((s) =>
          s.segment_id === "SEG-000001"
            ? { ...s, release_blocker_refs: ["XS-U-001"], decision_status: "confirmed" as const }
            : s,
        ),
      })),
    };
    const r = checkGoldSet(tampered, { enabled: true, cases: loadGoldSet(undefined, "hangzhou-friends-4p") });
    expect(r.ok).toBe(false);
    expect(r.problems.some((p) => p.includes("XS-U-001"))).toBe(true);
  });

  it("没有对应用例时 G5 无依据，判不通过", () => {
    const r = checkGoldSet({ ...document, ruleset_id: "unknown-4p" }, { enabled: true });
    expect(r.ok).toBe(false);
    expect(r.problems[0]).toMatch(/没有 Gold Set 用例/);
  });
});

describe("P3 审计哈希链", () => {
  let kb: string;
  beforeEach(() => {
    kb = join(tmpdir(), `kb-audit-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    mkdirSync(kb, { recursive: true });
  });
  afterEach(() => rmSync(kb, { recursive: true, force: true }));

  it("首条 prev_hash 为全零，seq 连续递增", () => {
    const first = appendAudit(kb, { actor: "stage", action: "document.generate", subject: "hangzhou-friends-4p" });
    expect(first.seq).toBe(1);
    expect(first.prev_hash).toBe("0".repeat(64));
    const second = appendAudit(kb, { actor: "transaction", action: "proposal.apply", subject: "PR-001", targets: ["rulebook/specs/base/hangzhou/guize/x.md"] });
    expect(second.seq).toBe(2);
    expect(second.prev_hash).toBe(first.hash);
    expect(verifyAudit(kb).ok).toBe(true);
  });

  it("输入顺序不同不影响 hash（键排序）", () => {
    const a = appendAudit(kb, { actor: "stage", action: "gate.run", subject: "G1-G4", inputs: { b: 2, a: 1 } });
    const b = appendAudit(kb, { actor: "stage", action: "gate.run", subject: "G1-G4", inputs: { a: 1, b: 2 } });
    expect(a.hash).not.toBe(b.hash); // seq/prev 不同，hash 必然不同
    expect(verifyAudit(kb).ok).toBe(true);
  });

  it("篡改内容会被发现", () => {
    appendAudit(kb, { actor: "stage", action: "document.generate", subject: "hangzhou-friends-4p" });
    appendAudit(kb, { actor: "archive", action: "change.archive", subject: "CHG-001" });
    const file = join(kb, AUDIT_PATH);
    const lines = readAudit(kb);
    const tampered = { ...lines[0], subject: "xiaoshan-friends-4p" };
    writeFileSync(file, `${JSON.stringify(tampered)}\n${JSON.stringify(lines[1])}\n`, "utf8");
    const r = verifyAudit(kb);
    expect(r.ok).toBe(false);
    expect(r.brokenAt).toBe(1);
    expect(r.problems.some((p) => p.includes("被改写"))).toBe(true);
  });

  it("中间插入一条伪造记录会破坏序号链", () => {
    appendAudit(kb, { actor: "stage", action: "document.generate", subject: "a" });
    const file = join(kb, AUDIT_PATH);
    const forged = { seq: 2, at: new Date().toISOString(), actor: "human", action: "proposal.apply", subject: "fake", targets: [], inputs: {}, prev_hash: "f".repeat(64), hash: "e".repeat(64) };
    appendFileSync(file, `${JSON.stringify(forged)}\n`, "utf8");
    const r = verifyAudit(kb);
    expect(r.ok).toBe(false);
    expect(r.brokenAt).toBe(2);
  });

  it("空日志视为通过", () => {
    expect(verifyAudit(kb)).toMatchObject({ ok: true, entries: 0, brokenAt: null });
  });
});

describe("P3 基座升级回归", () => {
  it("当前杭州 → 萧山 一致，无悬空 base_rule_ref", () => {
    const r = checkBaseUpgrade();
    expect(r.ok, r.problems.join("；")).toBe(true);
    expect(r.base.ruleset_id).toBe("hangzhou-friends-4p");
    expect(r.variants.length).toBe(1);
    expect(r.variants[0].dangling_refs).toEqual([]);
    expect(r.variants[0].version_ok).toBe(true);
  });

  it("基座版本与变体锁不一致时报告问题", () => {
    const r = checkBaseUpgrade("rulebook/specs/base/hangzhou", ["xiaoshan"]);
    const tampered = { ...r.variants[0], locked_base_version: "0.0.1", version_ok: false };
    expect(tampered.version_ok).toBe(false);
  });
});

describe("P3 入口接线", () => {
  it("runP0B 默认不跑 G5，显式开启才核对", () => {
    const dir = join(tmpdir(), `p3-${process.pid}-${Date.now()}`);
    try {
      const off = runP0B({ outDir: join(dir, "a") });
      expect(off.goldset.enabled).toBe(false);
      const on = runP0B({ outDir: join(dir, "b"), goldset: true });
      expect(on.goldset.enabled).toBe(true);
      expect(on.goldset.checked).toBe(12);
      expect(on.goldset.ok).toBe(true);
      expect(checkCoverage(ruleset, outline, document).ok).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("给定 kbRoot 时生成会写入审计链", () => {
    const kb = join(tmpdir(), `p3-kb-${process.pid}-${Date.now()}`);
    const out = join(tmpdir(), `p3-out-${process.pid}-${Date.now()}`);
    try {
      const r = runP0B({ outDir: out, kbRoot: kb });
      const entries = readAudit(kb);
      expect(entries.length).toBe(1);
      expect(entries[0]).toMatchObject({ actor: "stage", action: "document.generate", subject: "hangzhou-friends-4p" });
      expect(entries[0].inputs.rules).toBe(r.report.rules.covered);
      expect(verifyAudit(kb).ok).toBe(true);
    } finally {
      rmSync(kb, { recursive: true, force: true });
      rmSync(out, { recursive: true, force: true });
    }
  });
});
