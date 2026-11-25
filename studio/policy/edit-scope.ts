// W0-1：编辑范围策略（纯函数）
// 唯一职责：判断「某个片段在当前上下文中能不能被人工编辑」，不做 IO、不做 UI。
// 边界：这里只管「人工编辑」，不管生成。Stage 能否生成基座由 paths/registry 决定。
import type { Segment } from "../contracts/document.ts";

export type EditScope = "base" | "inherit" | "variant";

export interface EditContext {
  /** 当前打开的是哪个变体的文档；基座文档传 "hangzhou" */
  targetVariant: string;
  /** 该文档是否是基座文档（杭州） */
  isBaseDocument: boolean;
}

export interface EditDecision {
  ok: boolean;
  scope: EditScope;
  reason: string;
  /** 不可编辑时给用户的两条正确处理方向 */
  escalate?: Array<{ action: "create-modified" | "regenerate-base"; hint: string }>;
}

/** 片段的内容归属：基座 / 继承 / 变体自有 */
export function editScopeOf(segment: Pick<Segment, "lineage">, context: EditContext): EditScope {
  if (segment.lineage === "base") return "base";
  if (segment.lineage === "default_inherited" || segment.lineage === "explicit_inherited") return "inherit";
  // modified / added 只可能出现在变体文档里
  return context.isBaseDocument ? "base" : "variant";
}

/**
 * 能否人工编辑。
 * 规则：
 * 1. 基座文档整体不可人工编辑（要改基座走重新生成流程）
 * 2. 继承片段不可编辑（地方玩法不同 -> 建 modified；基座有错 -> 重新生成基座）
 * 3. 变体自有片段（modified / added）可编辑
 */
export function canEdit(segment: Pick<Segment, "lineage" | "segment_id">, context: EditContext): EditDecision {
  const scope = editScopeOf(segment, context);

  if (context.isBaseDocument) {
    return {
      ok: false,
      scope: "base",
      reason: "当前是杭州基座文档，人工不得直接编辑；基座变更必须重新运行基座生成流程",
      escalate: [
        {
          action: "regenerate-base",
          hint: "修改杭州原始资料或规则卡，然后重新运行基座生成 Pipeline（Stage 有权生成基座）",
        },
      ],
    };
  }

  if (scope === "base") {
    return {
      ok: false,
      scope,
      reason: "该片段属于杭州基座内容（lineage=base），不允许在变体文档中修改",
      escalate: [
        { action: "create-modified", hint: "如果是地方玩法差异，在变体规则集中新建 modified 卡" },
        { action: "regenerate-base", hint: "如果杭州基座本身有误，走基座重新生成流程" },
      ],
    };
  }

  if (scope === "inherit") {
    return {
      ok: false,
      scope,
      reason: `该片段继承自杭州基座（${segment.lineage}），不允许在变体中直接修改`,
      escalate: [
        { action: "create-modified", hint: "如果是地方玩法差异，在变体规则集中新建 modified 卡覆盖该条" },
        { action: "regenerate-base", hint: "如果杭州基座本身有误，走基座重新生成流程" },
      ],
    };
  }

  return {
    ok: true,
    scope,
    reason: `该片段属于变体 ${context.targetVariant} 自有内容（${segment.lineage}），可编辑`,
  };
}

/** 便捷判定：不可编辑时抛错，供服务端在写入口调用 */
export function assertEditable(
  segment: Pick<Segment, "lineage" | "segment_id">,
  context: EditContext,
): EditDecision {
  const decision = canEdit(segment, context);
  if (!decision.ok) throw new Error(`片段 ${segment.segment_id} 不可编辑：${decision.reason}`);
  return decision;
}
