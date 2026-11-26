// 文档提案的原子提交与崩溃恢复（K0-3）
// 契约要点：
// 1. 先取写入锁，再做版本与 Hash 双校验（顺序反了会留出外部编辑的竞争窗口）
// 2. 全部备份完成并核对 Hash 后才进入 writing；写入前逐文件复查原始 Hash
// 3. 任一失败即回滚：已存在文件恢复原内容，新建文件删除
// 4. 崩溃后按状态恢复：preparing/prepared 直接丢弃；writing 回滚；恢复失败标记 recovery_failed
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { assertRealPathWithin, isWithin } from "../paths/fs-guard.ts";
import { assertWritable, documentPath, transactionDir } from "../paths/registry.ts";
import { assertProposalTransition, assertTxTransition, txJournalSchema, type TxJournal, type TxState } from "./journal.ts";

export type ApplyErrorCode =
  | "proposal_not_ready"
  | "document_version_mismatch"
  | "file_hash_mismatch"
  | "file_changed_before_write"
  | "write_failed"
  | "recovery_failed"
  | "lock_busy";

export class ApplyError extends Error {
  readonly code: ApplyErrorCode;

  constructor(message: string, code: ApplyErrorCode) {
    super(message);
    this.code = code;
    this.name = "ApplyError";
  }
}

const sha256 = (data: string | Buffer) => createHash("sha256").update(data).digest("hex");
const abs = (root: string, rel: string) => join(root, rel);
const now = () => new Date().toISOString();

/**
 * 进程内单写者保护：本实现是同步的，同一时刻不可能真正并发；
 * 保留标记是为了在将来引入异步写时立刻暴露重入（届时替换为文件锁，见遗留）。
 */
const busyRoots = new Set<string>();

function withWriteLock<T>(root: string, fn: () => T): T {
  if (busyRoots.has(root)) throw new ApplyError(`同一知识库已有事务在写入：${root}`, "lock_busy");
  busyRoots.add(root);
  try {
    return fn();
  } finally {
    busyRoots.delete(root);
  }
}

function writeJournal(root: string, journal: TxJournal): void {
  const dir = abs(root, transactionDir(journal.transaction_id));
  mkdirSync(dir, { recursive: true });
  const target = join(dir, "manifest.json");
  const tmp = `${target}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(journal, null, 2)}\n`, "utf8");
  renameSync(tmp, target); // 原子替换
}

function transition(root: string, journal: TxJournal, to: TxState, patch: Partial<TxJournal> = {}): TxJournal {
  assertTxTransition(journal.state, to);
  const next: TxJournal = { ...journal, ...patch, state: to, updated_at: now() };
  writeJournal(root, next);
  return next;
}

export interface ApplyDocumentProposalInput {
  /** 知识库根目录（绝对或相对均可） */
  kbRoot: string;
  transactionId: string;
  proposalId: string;
  /** 提案要求的文档版本基线 */
  baseDocumentVersion: number;
  /** 写入 intent：由调用方按提案 op 声明，用于与目标路径做一致性校验 */
  intent: "apply-expression" | "apply-structure";
  /** 提案声明的目标文件相对路径（必须已经由 registry 推导） */
  targetPath: string;
  /** 写入目标文件的完整内容 */
  targetContent: string;
  /** 提交后 document.json 的新内容（版本 +1 由调用方构造，或由本函数生成） */
  nextDocumentContent?: string;
  /** 测试注入：在第 n 个文件写入后抛错，模拟中途崩溃 */
  failAfterWrites?: number;
}

export interface ApplyResult {
  transactionId: string;
  state: TxState;
  writtenPaths: string[];
}

function docVersionOf(content: string): number {
  const parsed = JSON.parse(content) as { document_version?: unknown };
  if (typeof parsed.document_version !== "number") {
    throw new ApplyError("document.json 缺少顶层 document_version", "document_version_mismatch");
  }
  return parsed.document_version;
}

function rollback(root: string, journal: TxJournal): TxJournal {
  const dir = abs(root, transactionDir(journal.transaction_id));
  for (const [i, entry] of journal.entries.entries()) {
    const target = abs(root, entry.path);
    try {
      if (entry.existed_before) {
        const backup = join(dir, "originals", `${i}-${entry.new_sha256}.bak`);
        if (!existsSync(backup)) throw new ApplyError(`备份缺失：${backup}`, "recovery_failed");
        const content = readFileSync(backup);
        if (sha256(content) !== entry.original_sha256) {
          throw new ApplyError(`备份 Hash 不符：${entry.path}`, "recovery_failed");
        }
        writeFileSync(target, content);
        if (sha256(readFileSync(target)) !== entry.original_sha256) {
          throw new ApplyError(`恢复后 Hash 不符：${entry.path}`, "recovery_failed");
        }
      } else if (existsSync(target)) {
        rmSync(target);
      }
    } catch (err) {
      const failed = { ...journal, state: "recovery_failed" as TxState, updated_at: now(), error: String(err) };
      writeJournal(root, failed);
      throw err instanceof ApplyError ? err : new ApplyError(String(err), "recovery_failed");
    }
  }
  // 清理因此产生的空目录
  for (const entry of journal.entries) {
    let dirName = dirname(abs(root, entry.path));
    const stop = abs(root, "documents");
    while (isWithin(stop, dirName) && existsSync(dirName) && readdirSync(dirName).length === 0 && dirName !== stop) {
      rmSync(dirName, { recursive: false });
      dirName = dirname(dirName);
    }
  }
  return transition(root, journal, "rolled_back");
}

/** 应用一个已批准的文档提案 */
export function applyDocumentProposal(input: ApplyDocumentProposalInput): ApplyResult {
  const root = input.kbRoot;
  return withWriteLock(root, () => {
    // 1) 目标路径必须由 registry 授权；document.json 永远在清单里
    // intent 由调用方按 op 声明；与路径不匹配时由权限矩阵拒绝（op × 文件一致性）
    const target = assertWritable("transaction", input.intent, input.targetPath);
    const variant = target.split("/")[1];
    const docRel = documentPath(variant, "document.json");
    const docAbs = abs(root, docRel);
    if (!existsSync(docAbs)) throw new ApplyError(`缺少 document.json：${docRel}`, "document_version_mismatch");

    // 2) 双校验：文档版本 + 每个目标文件 Hash
    const docContent = readFileSync(docAbs, "utf8");
    const currentVersion = docVersionOf(docContent);
    if (currentVersion !== input.baseDocumentVersion) {
      throw new ApplyError(
        `文档版本已变化：基线 ${input.baseDocumentVersion}，当前 ${currentVersion}`,
        "document_version_mismatch",
      );
    }
    const targetAbs = abs(root, target);
    const targetExisted = existsSync(targetAbs);
    const originalTargetHash = targetExisted ? sha256(readFileSync(targetAbs)) : null;
    const originalDocHash = sha256(docContent);

    // 3) 生成事务清单
    const nextDocContent = input.nextDocumentContent ?? bumpDocumentVersion(docContent);
    const entries = [
      { path: docRel, existed_before: true, original_sha256: originalDocHash, new_sha256: sha256(nextDocContent) },
      {
        path: target,
        existed_before: targetExisted,
        original_sha256: originalTargetHash,
        new_sha256: sha256(input.targetContent),
      },
    ];

    let journal = txJournalSchema.parse({
      transaction_id: input.transactionId,
      proposal_id: input.proposalId,
      state: "preparing",
      base_document_version: input.baseDocumentVersion,
      entries,
      created_at: now(),
      updated_at: now(),
    });
    writeJournal(root, journal);

    // 4) 备份并核对
    const dir = abs(root, transactionDir(input.transactionId));
    mkdirSync(join(dir, "originals"), { recursive: true });
    for (const [i, entry] of entries.entries()) {
      if (!entry.existed_before) continue;
      const fileAbs = abs(root, entry.path);
      assertRealPathWithin(root, entry.path);
      const backup = join(dir, "originals", `${i}-${entry.new_sha256}.bak`);
      writeFileSync(backup, readFileSync(fileAbs));
      if (sha256(readFileSync(backup)) !== entry.original_sha256) {
        throw new ApplyError(`备份 Hash 不符：${entry.path}`, "write_failed");
      }
    }
    journal = transition(root, journal, "prepared");

    // 5) 写入：每个文件写入前复查原始 Hash
    journal = transition(root, journal, "writing");
    const contents = new Map([
      [docRel, nextDocContent],
      [target, input.targetContent],
    ]);
    let written = 0;
    try {
      for (const entry of entries) {
        if (input.failAfterWrites !== undefined && written >= input.failAfterWrites) {
          throw new ApplyError("模拟写入中断", "write_failed");
        }
        const fileAbs = abs(root, entry.path);
        if (entry.existed_before) {
          const current = sha256(readFileSync(fileAbs));
          if (current !== entry.original_sha256) {
            throw new ApplyError(`写入前发现外部修改：${entry.path}`, "file_changed_before_write");
          }
        }
        mkdirSync(dirname(fileAbs), { recursive: true });
        const tmp = `${fileAbs}.tx-${input.transactionId}.tmp`;
        writeFileSync(tmp, contents.get(entry.path)!, "utf8");
        renameSync(tmp, fileAbs);
        written++;
        if (sha256(readFileSync(fileAbs)) !== entry.new_sha256) {
          throw new ApplyError(`写入后 Hash 不符：${entry.path}`, "write_failed");
        }
      }
    } catch (err) {
      rollback(root, journal);
      throw err;
    }

    journal = transition(root, journal, "committed");
    return { transactionId: journal.transaction_id, state: journal.state, writtenPaths: entries.map((e) => e.path) };
  });
}

/** document_version + 1，其余内容原样保留 */
export function bumpDocumentVersion(docContent: string): string {
  const parsed = JSON.parse(docContent) as Record<string, unknown> & { document_version?: unknown };
  if (typeof parsed.document_version !== "number") {
    throw new ApplyError("document.json 缺少顶层 document_version", "document_version_mismatch");
  }
  return `${JSON.stringify({ ...parsed, document_version: parsed.document_version + 1 }, null, 2)}\n`;
}

/**
 * 启动恢复：按事务日志状态处理。
 * - preparing / prepared：尚未写入任何文件，直接丢弃事务目录
 * - writing：可能已写部分文件，按 originals 回滚
 * - committed / rolled_back / recovery_failed：不动
 */
export function recoverPendingTransactions(kbRoot: string): Array<{ transactionId: string; from: TxState; to: TxState }> {
  const root = kbRoot;
  const txRoot = abs(root, ".rule-studio/transactions");
  if (!existsSync(txRoot)) return [];
  const out: Array<{ transactionId: string; from: TxState; to: TxState }> = [];
  for (const name of readdirSync(txRoot)) {
    const manifest = join(txRoot, name, "manifest.json");
    if (!existsSync(manifest)) continue;
    const journal = txJournalSchema.parse(JSON.parse(readFileSync(manifest, "utf8")));
    if (journal.state === "preparing" || journal.state === "prepared") {
      rmSync(join(txRoot, name), { recursive: true, force: true });
      out.push({ transactionId: journal.transaction_id, from: journal.state, to: "rolled_back" });
      continue;
    }
    if (journal.state === "writing") {
      const rolled = rollback(root, journal);
      out.push({ transactionId: journal.transaction_id, from: "writing", to: rolled.state });
    }
  }
  return out;
}

export { assertProposalTransition, relative };
