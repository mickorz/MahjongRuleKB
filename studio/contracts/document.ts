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
import {
  referencesSchema,
  ruleRefsSchema,
  configRefsSchema,
  sourceEvidenceRefsSchema,
  requirementRefsSchema,
  unresolvedRefPattern,
} from "./references.ts";

/** 需要基座对照卡的来源关系：主动继承、默认继承、替换 */
export const lineagesRequiringBaseRef: ReadonlyArray<(typeof lineageValues)[number]> = [
  "explicit_inherited",
  "default_inherited",
  "modified",
];

/** 纯数值文本：只允许数字、千分位、小数与常见单位 */
const numericOnlyPattern = /^\s*-?[\d.,]+\s*(倍|分|%|张|番|毫秒|秒)?\s*$/;
/** 公式特征：显式算术符号或「底分 × 倍率」这类乘算式 */
const formulaLikePattern = /[×÷+\-*/=]|\b(底分|倍率|牢数|番型)\b/;

/**
 * 片段间身份关系：
 * - split：一个旧片段 → 多个新片段（from 1 个，to ≥ 2 个）
 * - merge：多个旧片段 → 一个新片段（from ≥ 2 个，to 1 个）
 * from 指被拆分/合并的旧片段，to 指产生的新片段。
 */
export const segmentLineageEntrySchema = z
  .object({
    type: z.enum(["split", "merge"]),
    from_segment_ids: z.array(segmentIdSchema).min(1),
    to_segment_ids: z.array(segmentIdSchema).min(1),
  })
  .strict()
  .superRefine((entry, ctx) => {
    const from = entry.from_segment_ids;
    const to = entry.to_segment_ids;
    const dupFrom = from.length !== new Set(from).size;
    const dupTo = to.length !== new Set(to).size;
    if (dupFrom) ctx.addIssue({ code: "custom", path: ["from_segment_ids"], message: "from_segment_ids 不得重复" });
    if (dupTo) ctx.addIssue({ code: "custom", path: ["to_segment_ids"], message: "to_segment_ids 不得重复" });
    const overlap = from.filter((id) => to.includes(id));
    if (overlap.length) {
      ctx.addIssue({ code: "custom", path: ["to_segment_ids"], message: `新旧片段 ID 不得相同：${overlap.join(", ")}` });
    }
    if (entry.type === "split") {
      if (from.length !== 1) {
        ctx.addIssue({ code: "custom", path: ["from_segment_ids"], message: "split 必须由且仅由一个旧片段产生" });
      }
      if (to.length < 2) {
        ctx.addIssue({ code: "custom", path: ["to_segment_ids"], message: "split 必须产生至少两个新片段" });
      }
    }
    if (entry.type === "merge") {
      if (from.length < 2) {
        ctx.addIssue({ code: "custom", path: ["from_segment_ids"], message: "merge 必须合并至少两个旧片段" });
      }
      if (to.length !== 1) {
        ctx.addIssue({ code: "custom", path: ["to_segment_ids"], message: "merge 必须只产生一个新片段" });
      }
    }
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
    release_blocker_refs: z.array(z.string().regex(unresolvedRefPattern, "未决 ID 形如 XS-U-001")).default([]),
    references: referencesSchema,
    /** 变体相对基座的对照卡；是否需要由 lineage 决定（见下方校验） */
    base_rule_ref: z.string().regex(/^[A-Z]{2}-[A-Z](-[A-Z0-9]+)+$/).nullish(),
  })
  .strict()
  .superRefine((seg, ctx) => {
    // 纯数值片段不得可编辑（AD-19 / I-40）
    if (seg.editable && numericOnlyPattern.test(seg.text)) {
      ctx.addIssue({ code: "custom", path: ["editable"], message: "纯数值片段不得标记 editable=true" });
    }
    // 含公式特征的片段不得可编辑
    if (seg.editable && formulaLikePattern.test(seg.text)) {
      ctx.addIssue({ code: "custom", path: ["editable"], message: "公式类片段不得标记 editable=true，须由计算器渲染" });
    }
    // base_rule_ref 与 lineage 的对应关系：继承/替换必须有，base 与 added 不得有
    const needsBase = lineagesRequiringBaseRef.includes(seg.lineage);
    if (needsBase && !seg.base_rule_ref) {
      ctx.addIssue({
        code: "custom",
        path: ["base_rule_ref"],
        message: `${seg.lineage} 片段必须给出 base_rule_ref`,
      });
    }
    if (!needsBase && seg.base_rule_ref) {
      ctx.addIssue({
        code: "custom",
        path: ["base_rule_ref"],
        message: `${seg.lineage} 片段不得给出 base_rule_ref（无基座对应）`,
      });
    }
    // 差异审核与来源关系是独立维度：非 not_applicable 必须有实际差异对象
    if (seg.diff_status !== "not_applicable" && seg.lineage === "base") {
      ctx.addIssue({
        code: "custom",
        path: ["diff_status"],
        message: "基座片段（lineage=base）的 diff_status 只能是 not_applicable",
      });
    }
  });
export type Segment = z.infer<typeof segmentSchema>;

/** 引用并集：把片段四类引用合并成块级聚合 */
export function unionReferences(segments: ReadonlyArray<Segment>): {
  requirement_refs: string[];
  rule_refs: string[];
  config_refs: string[];
  source_evidence_refs: string[];
} {
  const acc = {
    requirement_refs: new Set<string>(),
    rule_refs: new Set<string>(),
    config_refs: new Set<string>(),
    source_evidence_refs: new Set<string>(),
  };
  for (const seg of segments) {
    for (const key of Object.keys(acc) as Array<keyof typeof acc>) {
      for (const v of seg.references[key]) acc[key].add(v);
    }
  }
  return {
    requirement_refs: [...acc.requirement_refs],
    rule_refs: [...acc.rule_refs],
    config_refs: [...acc.config_refs],
    source_evidence_refs: [...acc.source_evidence_refs],
  };
}

/** 文档块：稳定身份 + 章节 + 片段集合 + 四类引用聚合（聚合校验在本 Schema 内完成） */
export const documentBlockSchema = z
  .object({
    block_id: blockIdSchema,
    logical_block_id: logicalBlockIdSchema,
    section_id: sectionIdSchema,
    type: z.enum(blockTypeValues),
    /** 生成时的文档版本快照；不是事实源 */
    document_version: z.number().int().nonnegative(),
    content: z.array(segmentSchema).min(1),
    /** 四类引用的聚合值，必须恰好等于片段引用并集 */
    references: referencesSchema,
  })
  .strict()
  .superRefine((block, ctx) => {
    // 块内片段 ID 唯一
    const ids = block.content.map((s) => s.segment_id);
    if (ids.length !== new Set(ids).size) {
      ctx.addIssue({ code: "custom", path: ["content"], message: "同一块内 segment_id 不得重复" });
    }
    // formula 块必须由确定性渲染，禁止可编辑片段
    if (block.type === "formula") {
      const editable = block.content.filter((s) => s.editable).map((s) => s.segment_id);
      if (editable.length) {
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: `formula 块内片段必须 editable=false：${editable.join(", ")}`,
        });
      }
    }
    // 聚合引用严格等于片段并集（不多不少）
    const union = unionReferences(block.content);
    for (const key of Object.keys(union) as Array<keyof typeof union>) {
      const declared = new Set(block.references[key]);
      const missing = union[key].filter((v) => !declared.has(v));
      const extra = [...declared].filter((v) => !union[key].includes(v));
      if (missing.length || extra.length) {
        ctx.addIssue({
          code: "custom",
          path: ["references", key],
          message: `${key} 聚合与片段并集不一致（缺 ${missing.length} / 多 ${extra.length}）`,
        });
      }
    }
  });
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
    const seenBlock = new Set<string>();
    const seenSegment = new Set<string>();
    for (const b of doc.blocks) {
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
      for (const seg of b.content) {
        if (seenSegment.has(seg.segment_id)) {
          ctx.addIssue({ code: "custom", path: ["blocks"], message: `segment_id 跨块重复：${seg.segment_id}` });
        }
        seenSegment.add(seg.segment_id);
      }
    }
    // lineage 关系必须引用文档中真实存在的片段
    for (const entry of doc.segment_lineage) {
      for (const id of entry.from_segment_ids) {
        if (!seenSegment.has(id)) {
          ctx.addIssue({ code: "custom", path: ["segment_lineage"], message: `lineage 引用不存在的片段：${id}` });
        }
      }
      for (const id of entry.to_segment_ids) {
        if (!seenSegment.has(id)) {
          ctx.addIssue({ code: "custom", path: ["segment_lineage"], message: `lineage 引用不存在的片段：${id}` });
        }
      }
    }
  });
export type Document = z.infer<typeof documentSchema>;

/** 供测试与实现复用的引用模式集合 */
export const referencePatterns = {
  rule: ruleRefsSchema,
  config: configRefsSchema,
  sourceEvidence: sourceEvidenceRefsSchema,
  requirement: requirementRefsSchema,
};
