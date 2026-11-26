// W0-5：生成输入版本锁定
// 目的：一次生成必须绑定确定的输入。生成途中输入变了，宁可失败也不产出混合版本。
// 边界：只算 Hash 与比较，不写盘（落盘由 Stage 通过 paths 权限矩阵完成）。
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

import { semverSchema } from "../contracts/common.ts";
import type { DocumentOutline } from "../contracts/outline.ts";

const sha256 = z.string().regex(/^[a-f0-9]{64}$/);

/**
 * 输入锁。锁定的是「这一次生成用了什么」：
 * 规则集版本 + 内容 Hash + 配置 Hash + 未决项 Hash + 章节装配版本 + 模型与 Prompt 版本。
 * locked_at 不参与 input_hash 计算——同一批输入重复锁定必须得到同一个 hash。
 */
export const inputLockSchema = z
  .object({
    ruleset_id: z.string().min(1),
    ruleset_version: semverSchema,
    content_hash: sha256,
    config_hash: sha256,
    unresolved_hash: sha256,
    outline_version: semverSchema,
    model: z.string().min(1),
    prompt_version: z.string().min(1),
    locked_at: z.string().datetime(),
    input_hash: sha256,
  })
  .strict();
export type InputLock = z.infer<typeof inputLockSchema>;

/** 参与 Hash 计算的字段（顺序固定、按 key 排序，保证跨进程稳定） */
const hashFields = [
  "ruleset_id",
  "ruleset_version",
  "content_hash",
  "config_hash",
  "unresolved_hash",
  "outline_version",
  "model",
  "prompt_version",
] as const;

export type LockInputs = Pick<InputLock, (typeof hashFields)[number]>;

export function computeInputHash(inputs: LockInputs): string {
  const payload = hashFields.map((k) => `${k}=${inputs[k]}`).join("\n");
  return createHash("sha256").update(payload).digest("hex");
}

/** 文件 Hash；文件不存在时返回「缺失」的稳定标记 hash，避免同一缺失被判成不同输入 */
export function hashFileOrMissing(path: string): string {
  const payload = existsSync(path) ? readFileSync(path) : "MISSING";
  return createHash("sha256").update(payload).digest("hex");
}

/** 章节装配的 Hash：只取与生成的文档结构有关的字段 */
export function hashOutline(outline: DocumentOutline): string {
  const payload = JSON.stringify({
    template_version: outline.template_version,
    sections: outline.sections.map((s) => ({
      id: s.section_id,
      title: s.title,
      rules: [...s.rule_refs].sort(),
      configs: [...s.config_refs].sort(),
    })),
  });
  return createHash("sha256").update(payload).digest("hex");
}

export interface BuildLockInput {
  ruleset_id: string;
  ruleset_version: string;
  content_hash: string;
  /** 规则集目录（用于读 config.yaml / config.ui.yaml / unresolved.yaml） */
  dir: string;
  outline: DocumentOutline;
  model: string;
  prompt_version: string;
  locked_at?: string;
}

/** 从规则集目录 + outline 构建输入锁 */
export function buildInputLock(input: BuildLockInput): InputLock {
  const configHash = createHash("sha256")
    .update(hashFileOrMissing(join(input.dir, "config.yaml")))
    .update(hashFileOrMissing(join(input.dir, "config.ui.yaml")))
    .digest("hex");
  const unresolvedHash = hashFileOrMissing(join(input.dir, "unresolved.yaml"));
  const outlineVersion = input.outline.template_version;
  const outlineDigest = hashOutline(input.outline);
  // outline 内容也参与锁定：同一版本号但章节被改过，必须算不同输入
  const contentHash = createHash("sha256").update(`${input.content_hash}:${outlineDigest}`).digest("hex");

  const inputs: LockInputs = {
    ruleset_id: input.ruleset_id,
    ruleset_version: input.ruleset_version,
    content_hash: contentHash,
    config_hash: configHash,
    unresolved_hash: unresolvedHash,
    outline_version: outlineVersion,
    model: input.model,
    prompt_version: input.prompt_version,
  };
  return inputLockSchema.parse({
    ...inputs,
    locked_at: input.locked_at ?? new Date().toISOString(),
    input_hash: computeInputHash(inputs),
  });
}

export class LockDriftError extends Error {
  readonly changedFields: string[];
  constructor(message: string, changedFields: string[]) {
    super(message);
    this.name = "LockDriftError";
    this.changedFields = changedFields;
  }
}

/**
 * 生成途中的输入漂移检查。
 * 有任何字段变化即抛错并列出字段名——不允许「用旧锁继续跑」。
 */
export function assertLockUnchanged(locked: InputLock, current: InputLock): void {
  const changed = hashFields.filter((k) => locked[k] !== current[k]);
  if (changed.length > 0) {
    throw new LockDriftError(
      `输入已变化，拒绝使用混合版本继续生成：${changed.join(", ")}`,
      changed,
    );
  }
}

/** 读取并校验锁文件 */
export function parseInputLock(raw: string): InputLock {
  const lock = inputLockSchema.parse(JSON.parse(raw));
  // 自洽性：Hash 必须与字段匹配，防止手改字段不改 hash
  const expected = computeInputHash(lock);
  if (expected !== lock.input_hash) {
    throw new LockDriftError("输入锁自洽性校验失败：input_hash 与字段不匹配（文件可能被手改）", ["input_hash"]);
  }
  return lock;
}
