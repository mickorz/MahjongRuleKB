// W4-2：批量应用 —— 一次编辑会话的所有改动作为一批，一次事务提交
// 语义：全部通过校验才写；任一被拒则整批不落盘（不是「跳过坏的写好的」）。
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { documentSchema, type Document } from "../contracts/document.ts";
import { applyDocumentProposal } from "../transaction/apply.ts";
import { documentPath } from "../paths/registry.ts";
import { checkMutation, computeBaseRevision, mutationToProposalInput } from "./mutation.ts";
import { readSession } from "./session.ts";

export interface ApplySessionOptions {
  kbRoot: string;
  variant: string;
  sessionId: string;
  /** 事务 intent：表达层修改固定 apply-expression */
  intent?: "apply-expression" | "apply-structure";
  transactionId?: string;
  proposalId?: string;
  now?: string;
}

export interface ApplySessionResult {
  ok: boolean;
  applied: number;
  rejected: Array<{ segment_id?: string; reasons: string[] }>;
  transactionId?: string;
  targetPath?: string;
  documentVersionBefore: number;
  documentVersionAfter?: number;
}

/** 把一批 mutation 串行化成 editorial-overrides.yaml 内容（表达层唯一权威输入） */
export function overridesYaml(mutations: ReadonlyArray<{ segment_id: string; block_id: string; text: string }>): string {
  const lines: string[] = [
    "# 由 Rule Studio 编辑会话生成：只保存人工表达修改，不承载规则事实",
    "- overrides:",
  ];
  for (const m of mutations) {
    lines.push(`    - block_id: ${m.block_id}`);
    lines.push(`      segment_id: ${m.segment_id}`);
    lines.push(`      text: ${JSON.stringify(m.text)}`);
  }
  return `${lines.join("\n")}\n`;
}

/** 序号型 ID（契约：TX-001 / DOC-P-001）。进程内自增，跨进程由调用方显式传入 */
let idSeq = 0;
function nextId(prefix: "TX" | "DOC-P"): string {
  idSeq += 1;
  return `${prefix}-${String((Date.now() % 900 + idSeq) % 1000).padStart(3, "0")}`;
}

export function applySession(options: ApplySessionOptions): ApplySessionResult {
  const { kbRoot, variant, sessionId } = options;
  const docFile = join(kbRoot, documentPath(variant, "document.json"));
  if (!existsSync(docFile)) throw new Error(`缺少文档：${documentPath(variant, "document.json")}`);
  const document = documentSchema.parse(JSON.parse(readFileSync(docFile, "utf8"))) as Document;
  const session = readSession(kbRoot, variant, sessionId);

  // 草稿基线必须与当前文档版本一致：不一致说明期间有人改过，必须重新确认而不是硬套
  if (session.based_on_document_version !== document.document_version) {
    throw new Error(
      `文档版本已变化：草稿基于 ${session.based_on_document_version}，当前 ${document.document_version}，请重新确认改动`,
    );
  }

  const rejected: ApplySessionResult["rejected"] = [];
  const accepted: Array<{ segment_id: string; block_id: string; text: string }> = [];

  for (const mutation of session.mutations) {
    const check = checkMutation(mutation, { document, targetVariant: variant, isBaseDocument: variant === "hangzhou" });
    if (!check.ok) {
      rejected.push({ ...(mutation.target.segment_id ? { segment_id: mutation.target.segment_id } : {}), reasons: check.reasons });
      continue;
    }
    if (mutation.op !== "replace-text" && mutation.op !== "append") {
      rejected.push({ reasons: [`批量表达层应用暂只支持 replace-text / append，收到 ${mutation.op}`] });
      continue;
    }
    // 走一次契约校验，保证与单条路径一致
    const input = mutationToProposalInput({ mutation, document, rulesetId: session.ruleset_id, targetVariant: variant });
    accepted.push({
      segment_id: input.target.segment_id as string,
      block_id: input.target.block_id,
      text: input.after_text as string,
    });
  }

  const base = { documentVersionBefore: document.document_version };
  // 全或无：任何拒绝都不落盘
  if (rejected.length > 0) return { ok: false, applied: 0, rejected, ...base };
  if (accepted.length === 0) return { ok: false, applied: 0, rejected: [{ reasons: ["会话里没有可应用的改动"] }], ...base };

  const targetPath = documentPath(variant, "editorial-overrides.yaml");
  const revision = computeBaseRevision(kbRoot, variant, [targetPath]);

  const result = applyDocumentProposal({
    kbRoot,
    transactionId: options.transactionId ?? nextId("TX"),
    proposalId: options.proposalId ?? nextId("DOC-P"),
    intent: options.intent ?? "apply-expression",
    baseDocumentVersion: revision.document_version,
    targetPath,
    targetContent: overridesYaml(accepted),
  });

  // 版本以落盘后的 document.json 为准（事务已 +1）
  const versionAfter = (JSON.parse(readFileSync(docFile, "utf8")) as { document_version: number }).document_version;

  return {
    ok: true,
    applied: accepted.length,
    rejected: [],
    transactionId: result.transactionId,
    targetPath,
    documentVersionBefore: revision.document_version,
    documentVersionAfter: versionAfter,
  };
}



function writeJson(file: string, value: unknown): void {
  const { writeFileSync } = require("node:fs") as typeof import("node:fs");
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
