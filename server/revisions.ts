// 文档修订版本：从事务日志（.rule-studio/transactions）还原可查看的历史
// 只读：不改动任何文件；恢复走 applyDocumentProposal（见 POST /api/restore）
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

export interface RevisionEntry {
  id: string;
  version: number;
  source: string;
  time: string;
  note: string;
  /** 该版本对应的 document.json 备份文件（current 为 null） */
  backup?: string;
}

interface TxManifest {
  transaction_id: string;
  state: string;
  base_document_version?: number;
  created_at?: string;
  entries?: Array<{ path: string; existed_before?: boolean; new_sha256?: string }>;
}

const docRel = (variant: string) => `documents/${variant}/document.json`;
const txRoot = (kbRoot: string) => join(kbRoot, ".rule-studio", "transactions");

function readTx(kbRoot: string, id: string): TxManifest | null {
  const file = join(txRoot(kbRoot), id, "manifest.json");
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8")) as TxManifest;
  } catch {
    return null;
  }
}

/** 该事务写过的 document.json 备份路径（回滚用的原始内容） */
function backupOf(kbRoot: string, tx: TxManifest, variant: string): string | null {
  const idx = (tx.entries ?? []).findIndex((e) => e.path === docRel(variant));
  if (idx < 0) return null;
  const sha = (tx.entries ?? [])[idx]?.new_sha256;
  if (!sha) return null;
  const file = join(txRoot(kbRoot), tx.transaction_id, "originals", `${idx}-${sha}.bak`);
  return existsSync(file) ? file : null;
}

/** 某版本里 editorial-overrides.yaml 的原始内容（表达层恢复用）；没有则 null */
export function revisionOverridesBackup(
  kbRoot: string,
  variant: string,
  revisionId: string,
): { existedBefore: boolean; content: string | null } | null {
  if (revisionId === "current") return null;
  const tx = readTx(kbRoot, revisionId);
  if (!tx) return null;
  const rel = `documents/${variant}/editorial-overrides.yaml`;
  const idx = (tx.entries ?? []).findIndex((e) => e.path === rel);
  if (idx < 0) return null;
  const entry = (tx.entries ?? [])[idx];
  if (!entry?.existed_before) return { existedBefore: false, content: null };
  const sha = entry.new_sha256;
  if (!sha) return null;
  const file = join(txRoot(kbRoot), tx.transaction_id, "originals", `${idx}-${sha}.bak`);
  return { existedBefore: true, content: existsSync(file) ? readFileSync(file, "utf8") : null };
}

/** 某版本的原始备份路径（对外不暴露路径，恢复接口内部用） */
export function revisionBackupPath(kbRoot: string, variant: string, revisionId: string): string | null {
  if (revisionId === "current") return null;
  const tx = readTx(kbRoot, revisionId);
  return tx ? backupOf(kbRoot, tx, variant) : null;
}

export function listRevisions(kbRoot: string, variant: string): RevisionEntry[] {
  const docFile = join(kbRoot, docRel(variant));
  if (!existsSync(docFile)) return [];
  const doc = JSON.parse(readFileSync(docFile, "utf8")) as { document_version?: number };

  const dir = txRoot(kbRoot);
  const ids = existsSync(dir) ? readdirSync(dir) : [];
  const txs: TxManifest[] = [];
  for (const id of ids) {
    const tx = readTx(kbRoot, id);
    if (!tx) continue;
    if (tx.state !== "committed") continue;
    if (!(tx.entries ?? []).some((e) => e.path === docRel(variant))) continue;
    txs.push(tx);
  }
  txs.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));

  const revisions: RevisionEntry[] = [];
  // 当前版本：文件 mtime 作为时间（事务之外的重新生成也会改 mtime）
  revisions.push({
    id: "current",
    version: typeof doc.document_version === "number" ? doc.document_version : 0,
    source: txs.length > 0 ? "手工编辑" : "AI 生成",
    time: statSync(docFile).mtime.toISOString(),
    note: "当前已发布到本地的版本",
  });

  for (const tx of txs) {
    const backup = backupOf(kbRoot, tx, variant);
    const base = typeof tx.base_document_version === "number" ? tx.base_document_version : 0;
    revisions.push({
      id: tx.transaction_id,
      version: base,
      source: "手工编辑",
      time: String(tx.created_at ?? ""),
      note: backup ? "可查看这一版原文" : "原始备份缺失，只能查看版本信息",
    });
  }
  return revisions;
}

export interface RevisionDiffRow {
  section_title: string;
  segment_id: string;
  before: string;
  after: string;
}

/** 某版本 vs 当前版本的逐段差异（限 60 条，避免超大响应） */
export function revisionDiff(kbRoot: string, variant: string, revisionId: string): { version: number; rows: RevisionDiffRow[] } {
  const docFile = join(kbRoot, docRel(variant));
  const current = JSON.parse(readFileSync(docFile, "utf8")) as Doc;
  const revisions = listRevisions(kbRoot, variant);
  const rev = revisions.find((r) => r.id === revisionId);
  if (!rev) throw new Error(`找不到版本：${revisionId}`);
  if (!rev.backup) return { version: rev.version, rows: [] };


  const before = JSON.parse(readFileSync(rev.backup, "utf8")) as Doc;
  const beforeText = new Map<string, { title: string; text: string }>();
  for (const block of before.blocks ?? []) {
    for (const seg of block.segments ?? []) beforeText.set(seg.segment_id, { title: block.title, text: seg.text });
  }

  const rows: RevisionDiffRow[] = [];
  for (const block of current.blocks ?? []) {
    for (const seg of block.segments ?? []) {
      const old = beforeText.get(seg.segment_id);
      if (!old) {
        rows.push({ section_title: block.title, segment_id: seg.segment_id, before: "（此版本还没有该段）", after: seg.text });
      } else if (old.text !== seg.text) {
        rows.push({ section_title: block.title, segment_id: seg.segment_id, before: old.text, after: seg.text });
      }
      if (rows.length >= 60) return { version: rev.version, rows };
    }
  }
  return { version: rev.version, rows };
}

interface Doc {
  document_version?: number;
  blocks?: Array<{ title: string; segments?: Array<{ segment_id: string; text: string }> }>;
}
