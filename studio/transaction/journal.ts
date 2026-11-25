// 事务日志与状态机契约（K0-3）
// 两种状态机严格分离：Proposal（审批生命周期）与 Transaction（写入生命周期）。
import { z } from "zod";
import { proposalStatusValues, transactionStatusValues, sha256Schema } from "../contracts/common.ts";

export const txStateValues = transactionStatusValues;
export type TxState = (typeof txStateValues)[number];

/** 合法的状态迁移；其余一律拒绝（不做容错猜测） */
export const txTransitions: Record<TxState, readonly TxState[]> = {
  preparing: ["prepared", "rolled_back"],
  prepared: ["writing", "rolled_back"],
  writing: ["committed", "rolled_back", "recovery_failed"],
  committed: [],
  rolled_back: [],
  recovery_failed: [],
};

export class TxStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TxStateError";
  }
}

export function assertTxTransition(from: TxState, to: TxState): void {
  if (!txTransitions[from].includes(to)) {
    throw new TxStateError(`非法事务状态迁移：${from} → ${to}`);
  }
}

/** Proposal 状态迁移（人工修改通道；Stage 生成不进入本状态机） */
export const proposalTransitions: Record<(typeof proposalStatusValues)[number], readonly (typeof proposalStatusValues)[number][]> = {
  draft: ["ready", "rejected"],
  ready: ["approved", "stale", "rejected"],
  approved: ["applied", "failed", "stale"],
  applied: [],
  rejected: [],
  stale: [],
  failed: [],
};

export type ProposalStatus = (typeof proposalStatusValues)[number];

export function assertProposalTransition(from: ProposalStatus, to: ProposalStatus): void {
  if (!proposalTransitions[from].includes(to)) {
    throw new TxStateError(`非法提案状态迁移：${from} → ${to}`);
  }
}

/** 事务清单中的单条文件记录 */
export const txFileEntrySchema = z
  .object({
    /** 知识库相对路径，必须已通过 registry 规范化 */
    path: z.string().min(1),
    /** 事务开始前该文件是否存在；新建文件为 false */
    existed_before: z.boolean(),
    /** 事务开始前内容的 sha256；新建文件为 null */
    original_sha256: sha256Schema.nullish(),
    /** 事务写入后内容的 sha256 */
    new_sha256: sha256Schema,
  })
  .strict()
  .superRefine((entry, ctx) => {
    if (entry.existed_before && !entry.original_sha256) {
      ctx.addIssue({ code: "custom", path: ["original_sha256"], message: "已存在文件必须有 original_sha256" });
    }
    if (!entry.existed_before && entry.original_sha256) {
      ctx.addIssue({ code: "custom", path: ["original_sha256"], message: "新建文件不得有 original_sha256" });
    }
  });
export type TxFileEntry = z.infer<typeof txFileEntrySchema>;

/** 事务日志（manifest.json） */
export const txJournalSchema = z
  .object({
    transaction_id: z.string().regex(/^TX-\d{3}$/),
    proposal_id: z.string().regex(/^(DOC-P|PR)-\d{3}$/),
    state: z.enum(txStateValues),
    /** 提案依赖的文档版本基线 */
    base_document_version: z.number().int().nonnegative(),
    entries: z.array(txFileEntrySchema).min(1),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    /** 失败原因，仅在人可读层面使用 */
    error: z.string().nullish(),
  })
  .strict()
  .superRefine((j, ctx) => {
    const paths = j.entries.map((e) => e.path);
    if (paths.length !== new Set(paths).size) {
      ctx.addIssue({ code: "custom", path: ["entries"], message: "事务清单不得包含重复路径" });
    }
  });
export type TxJournal = z.infer<typeof txJournalSchema>;
