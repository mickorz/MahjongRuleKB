// 提案契约：严格区分 Agent 输入（不可信）与服务端持久化记录（可信基线）
// 依据：主需求 10.2.1 + AD-38；设计 v1.8 第八节
// 安全边界：baseRevision、目标文件路径与 Hash 一律由服务端产生，Agent 不得提交。
import { z } from "zod";
import {
  blockIdSchema,
  rulesetIdPattern,
  segmentIdSchema,
  sha256Schema,
  variantPattern,
  proposalStatusValues,
} from "./common.ts";

/** 文档修改操作 */
export const documentOpValues = ["append", "replace-text", "hide", "move-block", "edit-outline"] as const;
export type DocumentOp = (typeof documentOpValues)[number];

/** 结构修改类操作（落点为 document-outline.yaml） */
export const outlineOps: ReadonlyArray<DocumentOp> = ["move-block", "edit-outline"];

/**
 * 每种操作的必填 / 禁止字段契约（K0-1 冻结）：
 *
 * op            必填                              禁止
 * append        after_text                        after_outline
 * replace-text  target.segment_id、after_text     after_outline
 * hide          target（block 级）                after_text、after_outline
 * move-block    after_outline                     after_text
 * edit-outline  after_outline                     after_text
 */
export const opContract: Record<
  DocumentOp,
  { requiresAfterText: boolean; requiresAfterOutline: boolean; requiresSegment: boolean; requiresBlockOnly: boolean }
> = {
  append: { requiresAfterText: true, requiresAfterOutline: false, requiresSegment: false, requiresBlockOnly: false },
  "replace-text": {
    requiresAfterText: true,
    requiresAfterOutline: false,
    requiresSegment: true,
    requiresBlockOnly: false,
  },
  hide: { requiresAfterText: false, requiresAfterOutline: false, requiresSegment: false, requiresBlockOnly: true },
  "move-block": { requiresAfterText: false, requiresAfterOutline: true, requiresSegment: false, requiresBlockOnly: false },
  "edit-outline": {
    requiresAfterText: false,
    requiresAfterOutline: true,
    requiresSegment: false,
    requiresBlockOnly: false,
  },
};

const nonEmptyText = z.string().min(1, "内容不得为空字符串");

/**
 * Agent 可提交的文档提案输入（不可信）。
 * 只含业务意图与要修改的内容；不含任何路径、版本基线或 Hash。
 */
export const documentProposalInputSchema = z
  .object({
    /** 提案类型；K0 只定义文档提案输入，规则提案沿用既有提案结构 */
    type: z.literal("document"),
    ruleset_id: z.string().regex(rulesetIdPattern),
    /** 目标变体由服务端从工作区上下文校验；Agent 可声明意图 */
    target_variant: z.string().regex(variantPattern),
    op: z.enum(documentOpValues),
    target: z
      .object({
        block_id: blockIdSchema,
        segment_id: segmentIdSchema.nullish(),
      })
      .strict(),
    rationale: z.string().min(1),
    evidence: z.array(z.string().min(1)).default([]),
    /** 修改后的文本；结构类操作为 null 或缺省 */
    after_text: nonEmptyText.nullish(),
    /** 结构类操作的装配内容；文本类操作为 null 或缺省 */
    after_outline: nonEmptyText.nullish(),
  })
  .strict()
  .superRefine((input, ctx) => {
    const rule = opContract[input.op];
    const hasText = input.after_text !== undefined && input.after_text !== null;
    const hasOutline = input.after_outline !== undefined && input.after_outline !== null;

    // 必填：缺失（undefined）与 null 一视同仁
    if (rule.requiresAfterText && !hasText) {
      ctx.addIssue({ code: "custom", path: ["after_text"], message: `${input.op} 必须提供非空 after_text` });
    }
    if (rule.requiresAfterOutline && !hasOutline) {
      ctx.addIssue({ code: "custom", path: ["after_outline"], message: `${input.op} 必须提供非空 after_outline` });
    }
    // 禁止：两个方向都算违规
    if (!rule.requiresAfterText && hasText) {
      ctx.addIssue({ code: "custom", path: ["after_text"], message: `${input.op} 不得提交 after_text` });
    }
    if (!rule.requiresAfterOutline && hasOutline) {
      ctx.addIssue({ code: "custom", path: ["after_outline"], message: `${input.op} 不得提交 after_outline` });
    }
    // 片段粒度要求
    const hasSegment = input.target.segment_id !== undefined && input.target.segment_id !== null;
    if (rule.requiresSegment && !hasSegment) {
      ctx.addIssue({ code: "custom", path: ["target", "segment_id"], message: `${input.op} 必须指定 segment_id` });
    }
    if (rule.requiresBlockOnly && hasSegment) {
      ctx.addIssue({ code: "custom", path: ["target", "segment_id"], message: `${input.op} 只允许块级目标` });
    }
  });
export type DocumentProposalInput = z.infer<typeof documentProposalInputSchema>;

/** 服务端计算的可信基线：文档版本 + 每个目标文件 Hash */
export const baseRevisionSchema = z
  .object({
    /** 必须读自 document.json 顶层 document_version */
    document_version: z.number().int().nonnegative(),
    /** 必须包含 document.json 自身与所有将被修改的文件 */
    files: z
      .array(
        z
          .object({
            path: z.string().min(1),
            sha256: sha256Schema,
          })
          .strict(),
      )
      .min(1),
  })
  .strict()
  .superRefine((rev, ctx) => {
    const paths = rev.files.map((f) => f.path);
    if (paths.length !== new Set(paths).size) {
      ctx.addIssue({ code: "custom", path: ["files"], message: "base_revision.files 不得包含重复路径" });
    }
  });
export type BaseRevision = z.infer<typeof baseRevisionSchema>;

const textDigestSchema = z
  .object({
    text: z.string(),
    sha256: sha256Schema,
  })
  .strict();

/** 文档提案持久化记录（服务端生成，可信） */
export const documentProposalRecordSchema = z
  .object({
    id: z.string().regex(/^DOC-P-\d{3}$/, "提案 ID 形如 DOC-P-001"),
    type: z.literal("document"),
    change_id: z.string().regex(/^CHG-\d{3}$/).nullish(),
    ruleset_id: z.string().regex(rulesetIdPattern),
    target_variant: z.string().regex(variantPattern),
    op: z.enum(documentOpValues),
    target: z
      .object({
        block_id: blockIdSchema,
        segment_id: segmentIdSchema.nullish(),
        /** 落点文件由服务端按 op 推导，不接受 Agent 指定 */
        file: z.string().min(1),
      })
      .strict(),
    base_revision: baseRevisionSchema,
    before: textDigestSchema,
    after: textDigestSchema,
    rationale: z.string().min(1),
    evidence: z.array(z.string().min(1)).default([]),
    status: z.enum(proposalStatusValues),
    /** 事务 ID；approved 后由 Transaction 执行时写入 */
    transaction_id: z.string().min(1).nullish(),
  })
  .strict()
  .superRefine((rec, ctx) => {
    const rule = opContract[rec.op];
    // 落点必须与 op 匹配（K0-1 只校验文件名；完整路径推导与逃逸校验属 K0-2）
    const expected = rule.requiresAfterOutline ? "document-outline.yaml" : "editorial-overrides.yaml";
    if (!rec.target.file.endsWith(expected)) {
      ctx.addIssue({
        code: "custom",
        path: ["target", "file"],
        message: `${rec.op} 的落点必须是 ${expected}，实际为 ${rec.target.file}`,
      });
    }
    // 结构类操作必须给 segment_id 时的一致性
    const hasSegment = rec.target.segment_id !== undefined && rec.target.segment_id !== null;
    if (rule.requiresSegment && !hasSegment) {
      ctx.addIssue({ code: "custom", path: ["target", "segment_id"], message: `${rec.op} 必须指定 segment_id` });
    }
    if (rule.requiresBlockOnly && hasSegment) {
      ctx.addIssue({ code: "custom", path: ["target", "segment_id"], message: `${rec.op} 只允许块级目标` });
    }
    // baseRevision 必须包含 document.json
    if (!rec.base_revision.files.some((f) => f.path.endsWith("document.json"))) {
      ctx.addIssue({
        code: "custom",
        path: ["base_revision", "files"],
        message: "base_revision.files 必须包含 document.json（版本事实源）",
      });
    }
    // baseRevision 必须包含目标文件
    if (!rec.base_revision.files.some((f) => f.path === rec.target.file)) {
      ctx.addIssue({
        code: "custom",
        path: ["base_revision", "files"],
        message: "base_revision.files 必须包含 target.file",
      });
    }
    if (rec.status === "applied" && !rec.transaction_id) {
      ctx.addIssue({ code: "custom", path: ["transaction_id"], message: "applied 提案必须有 transaction_id" });
    }
  });
export type DocumentProposalRecord = z.infer<typeof documentProposalRecordSchema>;
