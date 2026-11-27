// W5-2：三方合并（按 W5-0 判定表）
// 三方：old（上次生成）、currentOverride（人工表达层）、new（重新生成）
// 硬规则：两边都变必须报冲突，禁止自动取任一边；人工修改不得被静默覆盖或删除。
import { conflictId } from "./impact.ts";

export type ConflictKind = "override-vs-regeneration" | "override-vs-removal" | "orphan-override";

export interface MergeInput {
  segment_id: string;
  section_id: string;
  base_rule_ref?: string;
  /** 上次生成的文本；undefined 表示该片段当时不存在 */
  old?: { kind: "generated"; oldText: string; newText: string } | undefined;
  /** 人工表达修改；undefined 表示没有改过 */
  currentOverride?: string | undefined;
  /** 重新生成的文本；undefined 表示新版本里已没有该片段 */
  new?: string | undefined;
}

export interface MergeConflict {
  conflict_id: string;
  kind: ConflictKind;
  segment_id: string;
  section_id: string;
  base_rule_ref?: string;
  old_text?: string;
  new_text?: string;
  override_text?: string;
  suggested: "keep-override" | "take-regeneration" | "manual";
}

export interface MergeResult {
  autoAdopted: Array<{ segment_id: string; text: string; reason: "regenerated" | "new-segment" }>;
  keptOverrides: Array<{ segment_id: string; text: string }>;
  removed: string[];
  conflicts: MergeConflict[];
}

/**
 * 单片段判定（对应 W5-0 第三节判定表）。
 * 注意 old 为 undefined 且 new 也为 undefined 时，若存在 override 则是孤儿引用。
 */
export function merge3(inputs: ReadonlyArray<MergeInput>): MergeResult {
  const result: MergeResult = { autoAdopted: [], keptOverrides: [], removed: [], conflicts: [] };
  let seq = 0;
  const nextConflict = () => {
    seq += 1;
    return conflictId(seq);
  };

  for (const input of inputs) {
    const hadOld = input.old !== undefined;
    const hasOverride = input.currentOverride !== undefined && input.currentOverride !== null;
    const hasNew = input.new !== undefined;
    const oldText = input.old?.oldText;
    const newText = input.new;
    const generatedChanged = !hadOld ? hasNew : hasNew && newText !== oldText;

    // 1) 孤儿 override：原片段与新生成都已不存在，人工内容无处安放
    if (!hadOld && !hasNew) {
      if (hasOverride) {
        result.conflicts.push({
          conflict_id: nextConflict(),
          kind: "orphan-override",
          segment_id: input.segment_id,
          section_id: input.section_id,
          ...(input.base_rule_ref ? { base_rule_ref: input.base_rule_ref } : {}),
          override_text: input.currentOverride,
          suggested: "manual",
        });
      }
      continue;
    }

    // 2) 新片段（原来没有）
    if (!hadOld && hasNew) {
      if (hasOverride) {
        // override 指向一个本次才出现的片段：保守处理为冲突，避免覆盖人工意图
        result.conflicts.push({
          conflict_id: nextConflict(),
          kind: "override-vs-regeneration",
          segment_id: input.segment_id,
          section_id: input.section_id,
          ...(input.base_rule_ref ? { base_rule_ref: input.base_rule_ref } : {}),
          new_text: newText,
          override_text: input.currentOverride,
          suggested: "keep-override",
        });
      } else {
        result.autoAdopted.push({ segment_id: input.segment_id, text: newText!, reason: "new-segment" });
      }
      continue;
    }

    // 3) 新生成删除了该片段
    if (hadOld && !hasNew) {
      if (hasOverride) {
        result.conflicts.push({
          conflict_id: nextConflict(),
          kind: "override-vs-removal",
          segment_id: input.segment_id,
          section_id: input.section_id,
          ...(input.base_rule_ref ? { base_rule_ref: input.base_rule_ref } : {}),
          old_text: oldText,
          override_text: input.currentOverride,
          suggested: "keep-override",
        });
      } else {
        result.removed.push(input.segment_id);
      }
      continue;
    }

    // 4) 片段仍在
    if (!generatedChanged) {
      if (hasOverride) result.keptOverrides.push({ segment_id: input.segment_id, text: input.currentOverride as string });
      continue;
    }
    if (!hasOverride) {
      result.autoAdopted.push({ segment_id: input.segment_id, text: newText!, reason: "regenerated" });
      continue;
    }
    // 两边都变：冲突，禁止自动取边
    result.conflicts.push({
      conflict_id: nextConflict(),
      kind: "override-vs-regeneration",
      segment_id: input.segment_id,
      section_id: input.section_id,
      ...(input.base_rule_ref ? { base_rule_ref: input.base_rule_ref } : {}),
      old_text: oldText,
      new_text: newText,
      override_text: input.currentOverride,
      suggested: "keep-override",
    });
  }

  return result;
}

/** 合并是否可以自动落盘：有冲突就必须人工处理 */
export const isMergeClean = (result: MergeResult): boolean => result.conflicts.length === 0;

export function summarizeMerge(result: MergeResult): string {
  return [
    `自动采用 ${result.autoAdopted.length} 条，保留人工 ${result.keptOverrides.length} 条，移除 ${result.removed.length} 条，冲突 ${result.conflicts.length} 条`,
    ...result.conflicts.map((c) => `- ${c.conflict_id} ${c.kind}｜${c.segment_id}（${c.section_id}）建议：${c.suggested}`),
  ].join("\n");
}
