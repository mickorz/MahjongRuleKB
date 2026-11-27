// W3-3：统一变更层
// 职责：把三种编辑器（富文本 / Markdown / AI 对话）的编辑意图统一成 Mutation，
// 由服务端转成既有 DocumentProposalInput，再交给 Transaction 落盘。
// 明确不做：Mutation 不携带 base_revision / diff / transaction_id（这些必须服务端产出）。
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

import { canEdit } from "../policy/edit-scope.ts";
import type { Document } from "../contracts/document.ts";
import { documentProposalInputSchema, type DocumentProposalInput } from "../contracts/proposal.ts";

export const mutationOpValues = ["append", "replace-text", "hide", "move-block", "edit-outline"] as const;

export const mutationSchema = z
  .object({
    target: z
      .object({
        block_id: z.string().min(1).optional(),
        segment_id: z.string().min(1).optional(),
        section_id: z.string().min(1).optional(),
      })
      .strict(),
    op: z.enum(mutationOpValues),
    /** replace-text / append 必填；hide / move-block / edit-outline 不填 */
    text: z.string().optional(),
    /** 编辑来源：用于审计，不参与权限判定 */
    source: z.enum(["richtext", "markdown", "ai-dialog"]),
    /** 变更理由，进 Proposal 的 rationale */
    rationale: z.string().min(1),
  })
  .strict()
  .superRefine((m, ctx) => {
    if ((m.op === "replace-text" || m.op === "append") && !m.text) {
      ctx.addIssue({ code: "custom", path: ["text"], message: `${m.op} 必须提供 text` });
    }
    if (m.op === "replace-text" && !m.target.segment_id) {
      ctx.addIssue({ code: "custom", path: ["target", "segment_id"], message: "replace-text 必须指定 segment_id" });
    }
    if ((m.op === "hide" || m.op === "move-block") && !m.target.block_id) {
      ctx.addIssue({ code: "custom", path: ["target", "block_id"], message: `${m.op} 必须指定 block_id` });
    }
  });
export type Mutation = z.infer<typeof mutationSchema>;

export interface MutationContext {
  document: Document;
  /** 当前编辑上下文：基座文档只读，变体只能改自己的片段 */
  targetVariant: string;
  isBaseDocument: boolean;
}

export interface MutationCheck {
  ok: boolean;
  reasons: string[];
  /** 命中的片段（用于 UI 展示与 Diff） */
  segment?: { segment_id: string; lineage: string; before: string };
}

/** 服务端权限校验：前端状态一律不可信，这里重新判定 */
export function checkMutation(mutation: Mutation, ctx: MutationContext): MutationCheck {
  const reasons: string[] = [];

  if (ctx.isBaseDocument) {
    return { ok: false, reasons: ["杭州基座文档不允许人工编辑，请走基座重新生成流程"] };
  }

  const segment = mutation.target.segment_id
    ? ctx.document.blocks.flatMap((b) => b.content).find((s) => s.segment_id === mutation.target.segment_id)
    : undefined;

  if (mutation.target.segment_id && !segment) {
    return { ok: false, reasons: [`片段不存在：${mutation.target.segment_id}`] };
  }

  if (segment) {
    const decision = canEdit(segment, { targetVariant: ctx.targetVariant, isBaseDocument: false });
    if (!decision.ok) reasons.push(decision.reason);
  }

  if (mutation.op === "move-block" || mutation.op === "edit-outline") {
    // 结构修改只影响章节装配，不碰片段归属；仍要求在变体上下文内
    if (!ctx.document.blocks.some((b) => b.block_id === mutation.target.block_id) && mutation.op === "move-block") {
      reasons.push(`块不存在：${mutation.target.block_id}`);
    }
  }

  if (reasons.length > 0) return { ok: false, reasons };
  return {
    ok: true,
    reasons: [],
    ...(segment ? { segment: { segment_id: segment.segment_id, lineage: segment.lineage, before: segment.text } } : {}),
  };
}

export interface ProposalBuildInput {
  mutation: Mutation;
  document: Document;
  rulesetId: string;
  targetVariant: string;
}

/**
 * 把 Mutation 转成既有 Proposal 输入。
 * 不在这里计算 base_revision —— 那是服务端读盘后才能算的，由调用方补充。
 */
export function mutationToProposalInput(input: ProposalBuildInput): DocumentProposalInput {
  const { mutation, document, rulesetId, targetVariant } = input;
  // 契约要求 block_id 必填：片段编辑时从所属块推出，避免让前端传
  const owningBlock =
    mutation.target.block_id ??
    (mutation.target.segment_id
      ? document.blocks.find((b) => b.content.some((s) => s.segment_id === mutation.target.segment_id))?.block_id
      : undefined);
  if (!owningBlock) throw new Error(`无法定位目标块：${mutation.target.segment_id ?? "(未指定)"}`);
  const base = {
    type: "document" as const,
    ruleset_id: rulesetId,
    target_variant: targetVariant,
    op: mutation.op,
    target: {
      block_id: owningBlock,
      ...(mutation.target.segment_id ? { segment_id: mutation.target.segment_id } : {}),
    },
    rationale: mutation.rationale,
    evidence: [],
  };

  if (mutation.op === "replace-text" || mutation.op === "append") {
    const parsed = documentProposalInputSchema.parse({ ...base, after_text: mutation.text });
    return parsed;
  }
  if (mutation.op === "hide") {
    return documentProposalInputSchema.parse(base);
  }
  if (mutation.op === "move-block" || mutation.op === "edit-outline") {
    // 结构类 op 需要 after_outline；这里只做形状校验，内容由服务端从当前章节装配推导
    // after_outline 是 YAML 文本：这里按当前章节装配串行化，保证顺序即顺序
    const afterOutline = document.blocks
      .map((b) => `- block_id: ${b.block_id}\n  section_id: ${b.section_id}`)
      .join("\n");
    return documentProposalInputSchema.parse({ ...base, after_outline: afterOutline });
  }
  throw new Error(`未支持的 op：${mutation.op as string}`);
}

export interface BaseRevision {
  document_version: number;
  files: Array<{ path: string; sha256: string }>;
  /** 服务端计算依据，便于审计 */
  computed_at: string;
}

const sha256 = (data: string | Uint8Array) => createHash("sha256").update(data).digest("hex");

/**
 * 服务端计算 baseRevision：读盘取版本与 Hash。
 * 只允许目标落在 documents/<variant>/ 下，路径由调用方按 registry 推导后传入。
 */
export function computeBaseRevision(kbRoot: string, variant: string, targets: ReadonlyArray<string>): BaseRevision {
  const docFile = join(kbRoot, "documents", variant, "document.json");
  if (!existsSync(docFile)) throw new Error(`文档不存在：documents/${variant}/document.json`);
  const documentVersion = (JSON.parse(readFileSync(docFile, "utf8")) as { document_version: number }).document_version;
  const files = [docFile, ...targets.map((t) => join(kbRoot, t))].map((abs) => ({
    path: abs.replace(/\\/g, "/").split(`${kbRoot.replace(/\\/g, "/")}/`).pop() ?? abs,
    sha256: existsSync(abs) ? sha256(readFileSync(abs)) : sha256(""),
  }));
  return { document_version: documentVersion, files, computed_at: new Date().toISOString() };
}

/**
 * Markdown 编辑映射：把「按段落切分的 Markdown」映射回 segment 身份。
 * 无法映射的文本（新增段落、改标题）一律拒绝——不允许把渲染产物当事实源改。
 */
export function mutationsFromMarkdown(
  markdown: string,
  document: Document,
  options: { source?: Mutation["source"]; rationale?: string } = {},
): { mutations: Mutation[]; rejected: string[] } {
  const mutations: Mutation[] = [];
  const rejected: string[] = [];
  const segments = new Map(document.blocks.flatMap((b) => b.content).map((s) => [s.segment_id, s]));
  const declared = new Set<string>();

  // 约定：编辑后的 Markdown 中，每段以 `<!-- seg:SEG-000001 -->` 标注身份
  const blocks = markdown.split(/<!--\s*seg:([A-Za-z0-9-]+)\s*-->/).slice(1);
  for (let i = 0; i + 1 < blocks.length; i += 2) {
    const segmentId = blocks[i];
    const text = blocks[i + 1].trim();
    const existing = segments.get(segmentId);
    if (!existing) {
      rejected.push(`未知片段：${segmentId}`);
      continue;
    }
    declared.add(segmentId);
    if (text.length === 0) {
      rejected.push(`片段 ${segmentId} 被清空：不允许通过 Markdown 删除内容，请走结构提案`);
      continue;
    }
    if (text === existing.text) continue;
    mutations.push({
      target: { segment_id: segmentId },
      op: "replace-text",
      text,
      source: options.source ?? "markdown",
      rationale: options.rationale ?? "Markdown 编辑",
    });
  }

  // 未被任何标注覆盖的片段视为「未改动」而不是删除；这里只提示，不生成 mutation
  for (const id of segments.keys()) {
    if (!declared.has(id)) rejected.push(`片段 ${id} 未出现在编辑内容中（未改动）`);
  }
  return { mutations, rejected };
}
