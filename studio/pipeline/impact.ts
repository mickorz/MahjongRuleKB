// W5-1：基座升级影响分析
// 输入两个基座文档（旧/新），输出「哪些规则变了」→「哪些继承片段 / 改写片段 / 新增规则受影响」。
// 边界：只做分析，不改任何文档。
import type { Document, Segment } from "../contracts/document.ts";
import type { VariantRule } from "./generate-variant-ai.ts";

export interface RuleTextIndex {
  /** 规则 ID → 该规则在文档中的全部片段文本（按 segment_id 排序后拼接，便于比较） */
  byRule: Map<string, Array<{ segment_id: string; text: string }>>;
}

export interface BaseImpact {
  changedRules: {
    added: string[];
    removed: string[];
    modified: string[];
  };
  /** 文本发生变化或被移除的基座片段 */
  changedSegments: string[];
  /** 受影响的章节 */
  impactedSections: string[];
}

export interface VariantImpact {
  /** 受影响的继承片段（直接复用基座，需要跟着换） */
  inheritedAffected: string[];
  /** 受影响的 modified 片段（其 base_rule_ref 命中了变化规则） */
  modifiedAffected: string[];
  /** 需要重新检查依赖的 added 规则 */
  addedToRecheck: string[];
}

const pad = (n: number) => String(n).padStart(3, "0");

function indexDocument(document: Document): RuleTextIndex {
  const byRule = new Map<string, Array<{ segment_id: string; text: string }>>();
  for (const block of document.blocks) {
    for (const seg of block.content) {
      for (const ruleId of seg.references.rule_refs) {
        byRule.set(ruleId, [...(byRule.get(ruleId) ?? []), { segment_id: seg.segment_id, text: seg.text }]);
      }
    }
  }
  for (const [ruleId, list] of byRule) byRule.set(ruleId, [...list].sort((a, b) => a.segment_id.localeCompare(b.segment_id)));
  return { byRule };
}

const fingerprint = (list: Array<{ segment_id: string; text: string }> | undefined): string =>
  (list ?? []).map((s) => `${s.segment_id}:${s.text}`).join("\u0000");

export function diffBaseDocuments(oldDoc: Document, newDoc: Document): BaseImpact {
  const oldIdx = indexDocument(oldDoc).byRule;
  const newIdx = indexDocument(newDoc).byRule;

  const added = [...newIdx.keys()].filter((id) => !oldIdx.has(id)).sort();
  const removed = [...oldIdx.keys()].filter((id) => !newIdx.has(id)).sort();
  const modified = [...oldIdx.keys()]
    .filter((id) => newIdx.has(id) && fingerprint(oldIdx.get(id)) !== fingerprint(newIdx.get(id)))
    .sort();

  const changedSegments = new Set<string>();
  for (const ruleId of [...modified, ...removed]) {
    for (const seg of oldIdx.get(ruleId) ?? []) changedSegments.add(seg.segment_id);
  }
  for (const ruleId of [...modified, ...added]) {
    for (const seg of newIdx.get(ruleId) ?? []) changedSegments.add(seg.segment_id);
  }

  const impactedSections = [...new Set(
    newDoc.blocks
      .filter((b) => b.content.some((s) => s.references.rule_refs.some((r) => [...modified, ...added, ...removed].includes(r))))
      .map((b) => b.section_id),
  )].sort();

  return { changedRules: { added, removed, modified }, changedSegments: [...changedSegments].sort(), impactedSections };
}

/**
 * 变体影响：以「基座片段身份」与「规则引用」两条线判断。
 * - 继承片段：segment_id 直接命中 changedSegments
 * - modified 片段：base_segment_ref 命中，或其 base_rule_ref 命中变化规则
 * - added 规则：depends_on 里出现变化规则，或（保守）所在章节受影响
 */
export function analyzeVariantImpact(
  variantDoc: Document,
  baseImpact: BaseImpact,
  variantRules: ReadonlyArray<VariantRule> = [],
): VariantImpact {
  const changed = new Set([...baseImpact.changedRules.added, ...baseImpact.changedRules.removed, ...baseImpact.changedRules.modified]);
  const changedSegments = new Set(baseImpact.changedSegments);
  const impactedSections = new Set(baseImpact.impactedSections);

  const inheritedAffected: string[] = [];
  const modifiedAffected: string[] = [];

  for (const block of variantDoc.blocks) {
    for (const seg of block.content) {
      const isInherited = seg.lineage === "default_inherited" || seg.lineage === "explicit_inherited";
      if (isInherited) {
        if (changedSegments.has(seg.segment_id) || seg.references.rule_refs.some((r) => changed.has(r))) {
          inheritedAffected.push(seg.segment_id);
        }
        continue;
      }
      if (seg.lineage === "modified") {
        const hitBySegment = seg.base_segment_ref ? changedSegments.has(seg.base_segment_ref) : false;
        const hitByRule = seg.references.rule_refs.some((r) => changed.has(r)) || (seg.base_rule_ref ? changed.has(seg.base_rule_ref) : false);
        if (hitBySegment || hitByRule) modifiedAffected.push(seg.segment_id);
      }
    }
  }

  const addedToRecheck = variantRules
    .filter((r) => r.change_type === "added")
    .filter((r) => (r.depends_on ?? []).some((d) => changed.has(d)))
    .map((r) => r.id)
    .sort();

  void impactedSections; // 章节级影响已在 BaseImpact 里给出，这里不重复放大范围
  return {
    inheritedAffected: inheritedAffected.sort(),
    modifiedAffected: modifiedAffected.sort(),
    addedToRecheck,
  };
}

/** 人读报告：便于在进度文档/PR 里贴出影响面 */
export function summarizeImpact(base: BaseImpact, variant?: VariantImpact): string {
  const lines = [
    `基座变化：新增规则 ${base.changedRules.added.length}、移除 ${base.changedRules.removed.length}、修改 ${base.changedRules.modified.length}`,
    `受影响章节：${base.impactedSections.join("、") || "无"}`,
    `受影响基座片段：${base.changedSegments.length} 条`,
  ];
  if (variant) {
    lines.push(
      `变体影响：继承片段 ${variant.inheritedAffected.length} 条、改写片段 ${variant.modifiedAffected.length} 条、需重查的新增规则 ${variant.addedToRecheck.length} 条`,
    );
    if (variant.addedToRecheck.length > 0) lines.push(`需重查：${variant.addedToRecheck.join("、")}`);
  }
  return `${lines.join("\n")}\n`;
}

/** 生成规范的冲突 ID */
export const conflictId = (n: number) => `CFL-${pad(n)}`;

export type { Segment };
