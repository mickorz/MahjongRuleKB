// P2：对话编辑意图路由（四种编辑行为分流）
// 依据：设计 v1.8 §7（表达调整 / 规则修改 / 内容补充 / 结构调整）
// 职责：把一次「对话修改请求」判成四种行为之一，并给出落点与所需通道；不写盘。
import type { DocumentOp } from "../contracts/proposal.ts";

export type EditBehavior = "expression" | "rule" | "content" | "structure";

export interface EditRequest {
  /** 用户原话（或 Agent 归纳后的意图） */
  utterance: string;
  /** 目标是否指向具体段落 */
  hasBlockTarget: boolean;
  /** 是否指向规则卡 ID */
  ruleRef?: string;
  /** 内容补充是否带原文依据 */
  hasSourceEvidence?: boolean;
}

export interface EditRoute {
  behavior: EditBehavior;
  /** 哪个通道承接 */
  channel: "document-override" | "rule-proposal" | "document-outline";
  /** 文档类通道对应的 op */
  op?: DocumentOp;
  /** 需要用户补充的信息 */
  needConfirm?: string;
  /** 是否允许直接写入（永远为 false：Agent 只能产生提案） */
  directWrite: false;
}

const structureHints = /移动|挪到|调整章节|换章|章节顺序|拆章|合并章节/;
const expressionHints = /改得|润色|更清楚|通俗|表达|措辞|文案|解释一下|补充说明|举例说明/;
const ruleHints = /条件改成|改为允许|倍率改成|禁止|允许|触发条件|结算改成|规则修改/;
const contentHints = /增加一个案例|补一个例子|补充规则|新增条件|加一条/;

/**
 * 判定编辑行为。优先级：结构调整 > 规则修改 > 内容补充 > 表达调整。
 * 无法判定时抛错要求澄清——不允许猜。
 */
export function routeEdit(request: EditRequest): EditRoute {
  const text = request.utterance;

  if (structureHints.test(text)) {
    if (!request.hasBlockTarget) {
      return {
        behavior: "structure",
        channel: "document-outline",
        needConfirm: "结构修改需要指定要移动的段落",
        directWrite: false,
      };
    }
    return { behavior: "structure", channel: "document-outline", op: "move-block", directWrite: false };
  }

  if (ruleHints.test(text) || request.ruleRef) {
    if (!request.ruleRef) {
      return {
        behavior: "rule",
        channel: "rule-proposal",
        needConfirm: "规则修改需要指定规则卡 ID，避免改错对象",
        directWrite: false,
      };
    }
    return { behavior: "rule", channel: "rule-proposal", directWrite: false };
  }

  if (contentHints.test(text)) {
    // 无原文依据的内容补充不得进入规则事实，只能进表达层
    if (!request.hasSourceEvidence) {
      return {
        behavior: "content",
        channel: "document-override",
        op: "append",
        needConfirm: "补充内容没有原文依据：将只写入文档表达层，不改变规则事实；需要改规则请提供依据",
        directWrite: false,
      };
    }
    return { behavior: "content", channel: "rule-proposal", directWrite: false };
  }

  if (expressionHints.test(text)) {
    if (!request.hasBlockTarget) {
      return {
        behavior: "expression",
        channel: "document-override",
        needConfirm: "表达修改需要选中段落",
        directWrite: false,
      };
    }
    return { behavior: "expression", channel: "document-override", op: "replace-text", directWrite: false };
  }

  throw new Error("无法归类该编辑请求：请明确是改表达、改规则、补内容还是调结构");
}

/** 行为与通道、op 的兼容矩阵：防止调用方自行拼出不合法组合 */
export const allowedCombos: ReadonlyArray<{ behavior: EditBehavior; channel: EditRoute["channel"]; ops: DocumentOp[] }> = [
  { behavior: "expression", channel: "document-override", ops: ["append", "replace-text", "hide"] },
  { behavior: "content", channel: "document-override", ops: ["append"] },
  { behavior: "structure", channel: "document-outline", ops: ["move-block", "edit-outline"] },
  { behavior: "rule", channel: "rule-proposal", ops: [] },
];

export function assertRouteConsistency(route: EditRoute): void {
  const combo = allowedCombos.find((c) => c.behavior === route.behavior && c.channel === route.channel);
  if (!combo) throw new Error(`行为 ${route.behavior} 不能走 ${route.channel} 通道`);
  if (route.op && !combo.ops.includes(route.op)) {
    throw new Error(`行为 ${route.behavior} 不支持 op ${route.op}`);
  }
  if (route.directWrite) throw new Error("Agent 不得直接写入文档或规则");
}
