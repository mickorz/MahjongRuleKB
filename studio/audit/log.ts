// P3：审计日志（追加式 + 哈希链）
// 目的：任何一次生成 / 提案应用 / 归档 / 门禁运行都留下不可篡改痕迹。
// 位置：<kb>/.rule-studio/workflow/audit.jsonl（运行时数据，不入库）
import { createHash } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

// 审计只写这一个运行时常量路径，不需要走完整权限矩阵（且 registry 含 TS 参数属性，
// 会破坏 node 直接运行 .ts 的 strip-only 模式）。路径本身仍受前缀校验。
const ROOT_RUNTIME = ".rule-studio";

export type AuditAction =
  | "document.generate"
  | "document.render"
  | "gate.run"
  | "proposal.apply"
  | "change.archive"
  | "override.apply";

export interface AuditEntry {
  seq: number;
  at: string;
  actor: "stage" | "transaction" | "archive" | "compiler" | "human";
  action: AuditAction;
  subject: string;
  /** 受影响文件的相对路径 */
  targets: string[];
  /** 关键输入摘要（如 ruleset 版本、input hash） */
  inputs: Record<string, string | number | boolean>;
  prev_hash: string;
  hash: string;
}

export const AUDIT_PATH = `${ROOT_RUNTIME}/workflow/audit.jsonl`;
const GENESIS = "0".repeat(64);

export function auditFile(kbRoot: string): string {
  return join(kbRoot, AUDIT_PATH);
}

function computeHash(entry: Omit<AuditEntry, "hash">): string {
  const payload = JSON.stringify({
    seq: entry.seq,
    at: entry.at,
    actor: entry.actor,
    action: entry.action,
    subject: entry.subject,
    targets: [...entry.targets].sort(),
    inputs: Object.entries(entry.inputs).sort(([a], [b]) => a.localeCompare(b)),
    prev_hash: entry.prev_hash,
  });
  return createHash("sha256").update(payload).digest("hex");
}

export function readAudit(kbRoot: string): AuditEntry[] {
  const file = auditFile(kbRoot);
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf8")
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as AuditEntry);
}

export function appendAudit(
  kbRoot: string,
  record: {
    actor: AuditEntry["actor"];
    action: AuditAction;
    subject: string;
    targets?: string[];
    inputs?: Record<string, string | number | boolean>;
    at?: string;
  },
): AuditEntry {
  const entries = readAudit(kbRoot);
  const prev = entries.at(-1);
  const draft: Omit<AuditEntry, "hash"> = {
    seq: (prev?.seq ?? 0) + 1,
    at: record.at ?? new Date().toISOString(),
    actor: record.actor,
    action: record.action,
    subject: record.subject,
    targets: record.targets ?? [],
    inputs: record.inputs ?? {},
    prev_hash: prev?.hash ?? GENESIS,
  };
  const entry: AuditEntry = { ...draft, hash: computeHash(draft) };
  const file = auditFile(kbRoot);
  mkdirSync(dirname(file), { recursive: true });
  appendFileSync(file, `${JSON.stringify(entry)}\n`, "utf8");
  return entry;
}

export interface AuditVerifyResult {
  ok: boolean;
  /** 链断裂处 seq（1 基） */
  brokenAt: number | null;
  entries: number;
  problems: string[];
}

/** 校验哈希链：序号连续、prev_hash 衔接、内容未被改写 */
export function verifyAudit(kbRoot: string): AuditVerifyResult {
  const entries = readAudit(kbRoot);
  const problems: string[] = [];
  let brokenAt: number | null = null;
  let expectedPrev = GENESIS;
  for (const [i, entry] of entries.entries()) {
    if (entry.seq !== i + 1) {
      problems.push(`第 ${i + 1} 条序号为 ${entry.seq}，应为 ${i + 1}`);
      brokenAt ??= i + 1;
    }
    if (entry.prev_hash !== expectedPrev) {
      problems.push(`第 ${i + 1} 条 prev_hash 与上一条 hash 不衔接`);
      brokenAt ??= i + 1;
    }
    const { hash, ...rest } = entry;
    if (computeHash(rest) !== hash) {
      problems.push(`第 ${i + 1} 条内容被改写（hash 不匹配）`);
      brokenAt ??= i + 1;
    }
    expectedPrev = hash;
  }
  return { ok: problems.length === 0, brokenAt, entries: entries.length, problems };
}
