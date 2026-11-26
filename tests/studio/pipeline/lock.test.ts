// W0-5：输入版本锁定测试
// 重点：同一批输入必须得到同一个 input_hash；任一输入变化必须被拦下并指名。
import { afterAll, beforeAll, describe, it, expect } from "vitest";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  assertLockUnchanged,
  buildInputLock,
  computeInputHash,
  hashOutline,
  LockDriftError,
  parseInputLock,
} from "../../../studio/pipeline/lock.ts";
import { buildHangzhouOutline } from "../../../studio/pipeline/outline-hangzhou.ts";
import { readBaseRuleSet } from "../../../studio/pipeline/read-ruleset.ts";

const HASH = "b".repeat(64);
const outline = buildHangzhouOutline(readBaseRuleSet());

const baseInput = {
  ruleset_id: "hangzhou-friends-4p",
  ruleset_version: "1.2.0",
  content_hash: HASH,
  dir: "rulebook/specs/base/hangzhou",
  outline,
  model: "stub-1",
  prompt_version: "p1",
};

describe("W0-5 输入锁定", () => {
  let kb: string;
  beforeAll(() => {
    kb = join(tmpdir(), `kb-lock-${process.pid}-${Date.now()}`);
    mkdirSync(kb, { recursive: true });
    writeFileSync(join(kb, "config.yaml"), "a: 1\n", "utf8");
    writeFileSync(join(kb, "config.ui.yaml"), "b: 2\n", "utf8");
  });
  afterAll(() => rmSync(kb, { recursive: true, force: true }));

  it("同一批输入得到同一个 input_hash（locked_at 不参与计算）", () => {
    const l1 = buildInputLock({ ...baseInput, dir: kb, locked_at: "2026-11-25T01:00:00.000Z" });
    const l2 = buildInputLock({ ...baseInput, dir: kb, locked_at: "2026-11-25T09:00:00.000Z" });
    expect(l1.input_hash).toBe(l2.input_hash);
    expect(l1.locked_at).not.toBe(l2.locked_at);
  });

  it("任一输入变化都会改变 input_hash", () => {
    const base = buildInputLock({ ...baseInput, dir: kb });
    const changed = buildInputLock({ ...baseInput, dir: kb, prompt_version: "p2" });
    expect(changed.input_hash).not.toBe(base.input_hash);
  });

  it("outline 内容变化也算输入变化（同版本号但章节被改）", () => {
    const trimmed = { ...outline, sections: outline.sections.slice(0, 3) };
    const l1 = buildInputLock({ ...baseInput, dir: kb });
    const l2 = buildInputLock({ ...baseInput, dir: kb, outline: trimmed });
    expect(hashOutline(outline)).not.toBe(hashOutline(trimmed));
    expect(l1.input_hash).not.toBe(l2.input_hash);
  });

  it("配置文件变化即漂移，且错误指名具体字段", () => {
    const locked = buildInputLock({ ...baseInput, dir: kb });
    writeFileSync(join(kb, "config.yaml"), "a: 99\n", "utf8");
    const current = buildInputLock({ ...baseInput, dir: kb });
    let err: LockDriftError | undefined;
    try {
      assertLockUnchanged(locked, current);
    } catch (e) {
      err = e as LockDriftError;
    }
    expect(err).toBeInstanceOf(LockDriftError);
    expect(err!.changedFields).toContain("config_hash");
    // 恢复现场，避免影响后续用例
    writeFileSync(join(kb, "config.yaml"), "a: 1\n", "utf8");
  });

  it("未决项文件变化即漂移", () => {
    const locked = buildInputLock({ ...baseInput, dir: kb });
    writeFileSync(join(kb, "unresolved.yaml"), "- id: XS-U-001\n", "utf8");
    const current = buildInputLock({ ...baseInput, dir: kb });
    expect(() => assertLockUnchanged(locked, current)).toThrow(/unresolved_hash/);
    rmSync(join(kb, "unresolved.yaml"));
  });

  it("输入完全一致时不抛错", () => {
    const a = buildInputLock({ ...baseInput, dir: kb });
    const b = buildInputLock({ ...baseInput, dir: kb });
    expect(() => assertLockUnchanged(a, b)).not.toThrow();
  });

  it("锁文件可序列化并回读，手改字段会被自洽性检查发现", () => {
    const lock = buildInputLock({ ...baseInput, dir: kb });
    expect(parseInputLock(JSON.stringify(lock)).input_hash).toBe(lock.input_hash);

    const tampered = { ...lock, prompt_version: "p999" };
    expect(() => parseInputLock(JSON.stringify(tampered))).toThrow(/自洽性/);
  });

  it("字段缺失或格式错误被 Schema 拒绝", () => {
    const lock = buildInputLock({ ...baseInput, dir: kb });
    expect(() => parseInputLock(JSON.stringify({ ...lock, ruleset_version: "1.2" }))).toThrow();
    expect(() => parseInputLock(JSON.stringify({ ...lock, content_hash: "XYZ" }))).toThrow();
  });

  it("杭州与萧山使用不同规则集时 input_hash 不同", () => {
    const hz = buildInputLock({ ...baseInput, dir: "rulebook/specs/base/hangzhou" });
    const xs = buildInputLock({
      ...baseInput,
      ruleset_id: "xiaoshan-friends-4p",
      ruleset_version: "0.3.0",
      dir: "rulebook/specs/variants/xiaoshan",
    });
    expect(hz.input_hash).not.toBe(xs.input_hash);
    expect(hz.config_hash).not.toBe(xs.config_hash);
  });

  it("computeInputHash 与字段顺序无关（稳定）", () => {
    const a = computeInputHash({
      ruleset_id: "x",
      ruleset_version: "1.0.0",
      content_hash: HASH,
      config_hash: HASH,
      unresolved_hash: HASH,
      outline_version: "1.0.0",
      model: "m",
      prompt_version: "p",
    });
    const b = computeInputHash({
      prompt_version: "p",
      model: "m",
      outline_version: "1.0.0",
      unresolved_hash: HASH,
      config_hash: HASH,
      content_hash: HASH,
      ruleset_version: "1.0.0",
      ruleset_id: "x",
    } as never);
    expect(a).toBe(b);
  });
});
