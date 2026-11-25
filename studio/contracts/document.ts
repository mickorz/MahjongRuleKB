// 文档领域契约：Document / DocumentBlock / Segment
// 依据：设计 v1.8 第六节（Document Block）与第十二节（数据产物）
// 约定：document_version 只在 Document 顶层是事实源；Block 上的同名字段只是生成时快照。
import { z } from "zod";
import {
  blockIdSchema,
  blockTypeValues,
  decisionStatusValues,
  diffStatusValues,
  lineageValues,
  logicalBlockIdSchema,
  rulesetIdPattern,
  sectionIdSchema,
  segmentIdSchema,
  semverSchema,
  variantPattern,
} from "./common.ts";
import { referencesSchema } from "./references.ts";

/** 片段间身份关系：拆分 / 合并 */
export const segmentLineageEntrySchema = z.object({
  type: z.enum(["split", "merge"]),
  /** 产生方片段（新） */
  from_segment_ids: z.array(segmentIdSchema).min(1),
  /** 结果方片段（旧关系指向的新片段；merge 时通常 1 个） */
  to_segment_ids: z.array(segmentIdSchema).min(1),
});
export type SegmentLineageEntry = z.infer<typeof segmentLineageEntrySchema>;

/** 文档片段：段落内的最小可编辑与可追溯单元 */
export const segmentSchema = z
  .object({
    segment_id: segmentIdSchema,
    text: z.string(),
    /** 片段级可编辑性：数值 / 公式片段必须为 false */
    editable: z.boolean(),
    lineage: z.enum(lineageValues),
    decision_status: z.enum(decisionStatusValues),
    diff_status: z.enum(diffStatusValues),
    /** 发布阻塞来源，例如 ["XS-U-001"]；为空数组表示无阻塞 */
    release_blocker_refs: z.array(z.string().regex(/^[A-Z]{2}-U-\d{3}$/, "未决 ID 形如 XS-U-001")).default([]),
    references: referencesSchema,
    /** 变体相对基座的对照卡（仅 modified / inherited 片段需要） */
    base_rule_ref: z.string().regex(/^[A-Z]{2}-[A-Z](-[A-Z0-9]+)+$/).nullish(),
  })
  .strict()
  .superRefine((seg, ctx) => {
    // 数值片段不得可编辑（AD-19 / I-40）
    if (seg.editable && /^\s*[\d.,]+\s*(倍|分|%|张)?\s*$/.test(seg.text)) {
      ctx.addIssue({ code: "custom", path: ["editable"], message: "纯数值片段不得标记 editable=true" });
    }
    // candidate/confirmed 的差异必须有对照卡
    if (seg.diff_status !== "not_applicable" && !seg.base_rule_ref) {
      ctx.addIssue({ code: "custom", path: ["base_rule_ref"], message: "非 not_applicable 的差异片段必须给出 base_rule_ref" });
    }
  });
export type Segment = z.infer<typeof segmentSchema>;

/** 文档块：稳定身份 + 章节 + 片段集合 + 四类引用聚合 */
export const documentBlockSchema = z.object({
  block_id: blockIdSchema,
  logical_block_id: logicalBlockIdSchema,
  section_id: sectionIdSchema,
  type: z.enum(blockTypeValues),
  /** 生成时的文档版本快照；不是事实源 */
  document_version: z.number().int().nonnegative(),
  content: z.array(segmentSchema).min(1),
  /** 四类引用的聚合值，必须等于片段引用并集（校验见 superRefine） */
  references: referencesSchema,
}).strict();
export type DocumentBlock = z.infer<typeof documentBlockSchema>;

/** 文档：顶层 document_version 是唯一版本事实源 */
export const documentSchema = z
  .object({
    ruleset_id: z.string().regex(rulesetIdPattern, "ruleset_id 形如 hangzhou-friends-4p"),
    target_variant: z.string().regex(variantPattern),
    template_version: semverSchema,
    ruleset_version: semverSchema,
    document_version: z.number().int().nonnegative(),
    blocks: z.array(documentBlockSchema).min(1),
    segment_lineage: z.array(segmentLineageEntrySchema).default([]),
  })
  .strict()
  .superRefine((doc, ctx) => {
    const blocks = doc.blocks;
    const seenBlock = new Set<string>();
    const seenSegment = new Set<string>();
    for (const b of blocks) {
      if (seenBlock.has(b.block_id)) {
        ctx.addIssue({ code: "custom", path: ["blocks"], message: `block_id 重复：${b.block_id}` });
      }
      seenBlock.add(b.block_id);
      if (b.document_version > doc.document_version) {
        ctx.addIssue({
          code: "custom",
          path: ["blocks"],
          message: `块 ${b.block_id} 的版本快照(${b.document_version}) 不能高于文档版本(${doc.document_version})`,
        });
      }
      // 聚合引用必须等于片段并集
      const union = {
        requirement_refs: new Set<string>(),
        rule_refs: new Set<string>(),
        config_refs: new Set<string>(),
        source_evidence_refs: new Set<string>(),
      };
      for (const seg of b.content) {
        for (const key of Object.keys(union) as Array<keyof typeof union>) {
          for (const v of seg.references[key]) union[key].add(v);
        }
        if (seenSegment.has(seg.segment_id)) {
          ctx.addIssue({ code: "custom", path: ["blocks"], message: `segment_id 重复：${seg.segment_id}` });
        }
        seenSegment.add(seg.segment_id);
      }
      for (const key of Object.keys(union) as Array<keyof typeof union>) {
        const declared = new Set(b.references[key]);
        const missing = [...union[key]].filter((v) => !declared.has(v));
        const extra = [...declared].filter((v) => !union[key].has(v));
        if (missing.length || extra.length) {
          ctx.addIssue({
            code: "custom",
            path: ["blocks"],
            message: `块 ${b.block_id} 的 ${key} 聚合与片段不一致（缺 ${missing.length} / 多 ${extra.length}）`,
          });
        }
      }
    }
  });
export type Document = z.infer<typeof documentSchema>;
