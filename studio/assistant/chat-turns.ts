// 契约适配层：把我们 Runtime 的结果映射成参考项目聊天框需要的 Turn / ThreadItem
//
// 目标：让预构建的聊天组件（vendor/xc-chat 产出 server/chat-widget/chat-lib.js）
// 能直接渲染我们的会话历史，而不用改它的组件。
//
// 边界：纯函数、无 React 依赖、不碰磁盘；类型是我们自己的（结构对齐即可）。
import { z } from "zod";

/* ---------------- 我们这边的输入 ---------------- */

export const assistantStepSchema = z.object({
  name: z.string(),
  ok: z.boolean(),
  code: z.string().optional(),
  ms: z.number().optional(),
  args: z.unknown().optional(),
});
export type AssistantStep = z.infer<typeof assistantStepSchema>;

export const assistantClaimSchema = z.object({
  text: z.string(),
  refs: z.string().array(),
  status: z.enum(["ok", "invalid_ref", "unverified"]),
  invalid_refs: z.string().array().optional(),
});
export type AssistantClaim = z.infer<typeof assistantClaimSchema>;

export const assistantUiMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  /** 助手消息附带：本次执行过的工具步骤 */
  steps: assistantStepSchema.array().optional(),
  /** 助手消息附带：逐条结论的 grounding 结果 */
  claims: assistantClaimSchema.array().optional(),
  grounded: z.boolean().optional(),
  /** 内部：这条消息的时间戳，用于生成稳定的 item id */
  at: z.string().optional(),
});
export type AssistantUiMessage = z.infer<typeof assistantUiMessageSchema>;

/* ---------------- 参考项目契约（结构子集，避免引入它的类型文件） ---------------- */

export interface ChatItemBase {
  id: string;
  turnId: string;
  type: string;
}

export interface ChatTurn {
  id: string;
  conversationId: string;
  status: "inProgress" | "completed" | "failed" | "cancelled";
  items: ChatItemBase[];
}

/* ---------------- 工具分类（人话摘要用） ---------------- */

/** 六个只读工具 → 中文动作词，和参考项目的 toolGroupSummary 同一思路 */
export const STEP_LABELS: Record<string, string> = {
  search_rules: "检索规则",
  get_rule: "读取规则",
  get_config: "查询配置",
  list_unresolved: "查未决项",
  read_evidence: "读证据",
  compare_rules: "对比玩法",
};

export function stepLabel(name: string): string {
  return STEP_LABELS[name] ?? name;
}

/* ---------------- 映射 ---------------- */

function itemId(turnId: string, kind: string, index: number): string {
  return `${turnId}-${kind}-${index}`;
}

/** 把一条我们的消息映射成参考项目的 ThreadItem[] */
export function itemsForMessage(
  message: AssistantUiMessage,
  turnId: string,
  turnIndex: number,
): ChatItemBase[] {
  const items: ChatItemBase[] = [];

  const stamp = Date.now();

  if (message.role === "user") {
    items.push({
      id: itemId(turnId, "user", turnIndex),
      turnId,
      type: "userMessage",
      text: message.content,
      timestamp: stamp,
    } as ChatItemBase);
    return items;
  }

  // 工具步骤 → dynamicToolCall（成功 / 失败分别映射 status 与 output）
  const steps = message.steps ?? [];
  steps.forEach((step, index) => {
    items.push({
      id: itemId(turnId, "tool", index),
      turnId,
      type: "dynamicToolCall",
      toolCallId: itemId(turnId, "call", index),
      tool: step.name,
      status: step.ok ? "completed" : "failed",
      arguments: step.args ?? {},
      timestamp: stamp,
      output: step.ok
        ? step.ms === undefined
          ? "ok"
          : `ok · ${step.ms}ms`
        : `${step.code ?? "error"}`,
    } as ChatItemBase);
  });

  // 未验证的结论单独成一条 thinking 项，让"没有依据"在时间线上可见
  const badClaims = (message.claims ?? []).filter((claim) => claim.status !== "ok");
  if (badClaims.length > 0) {
    items.push({
      id: itemId(turnId, "notice", 0),
      turnId,
      type: "reasoning",
      status: "completed",
      timestamp: stamp,
      text: `有 ${badClaims.length} 条结论缺少可追溯依据：${badClaims.map((c) => c.text.slice(0, 24)).join("；")}`,
    } as ChatItemBase);
  }

  // 正文
  if (message.content.trim()) {
    items.push({
      id: itemId(turnId, "answer", 0),
      turnId,
      type: "agentMessage",
      status: "completed",
      // phase=final_answer：参考项目靠这个字段区分"最终回答"与"过程消息"
      phase: "final_answer",
      text: message.content,
      timestamp: stamp,
    } as ChatItemBase);
  }

  return items;
}

/**
 * 会话历史 → turns。
 * 约定：一条 assistant 消息 = 一个 turn（user 消息与其后的 assistant 消息合并进同一 turn，
 * 这样工具步骤与它服务的那次提问在时间线上属于同一段）。
 */
export function toChatTurns(
  messages: ReadonlyArray<AssistantUiMessage>,
  conversationId = "conv-rule-studio",
): ChatTurn[] {
  const turns: ChatTurn[] = [];
  let current: { turnId: string; items: ChatItemBase[] } | null = null;
  let seq = 0;

  for (const message of messages) {
    if (!current || message.role === "user") {
      seq += 1;
      const turnId = `turn-${seq}`;
      current = { turnId, items: [] };
      turns.push({ id: turnId, conversationId, status: "completed", items: current.items });
    }
    const turnId = current.turnId;
    current.items.push(...itemsForMessage(message, turnId, seq));
  }

  // 最后一条 assistant 还在等结果时，前端可自行把 status 改成 inProgress
  return turns;
}

/** 人话摘要：连续工具调用 → "检索规则 2 次、查询配置 1 次（1 次失败）" */
export function summarizeSteps(steps: ReadonlyArray<AssistantStep>): string {
  if (steps.length === 0) return "";
  const ok = steps.filter((step) => step.ok);
  const failed = steps.length - ok.length;

  const buckets = new Map<string, number>();
  for (const step of ok) {
    const label = stepLabel(step.name);
    buckets.set(label, (buckets.get(label) ?? 0) + 1);
  }
  const parts = [...buckets.entries()].map(([label, count]) => `${label} ${count} 次`);
  if (parts.length === 0) parts.push(failed === 1 ? "1 次调用失败" : `${failed} 次调用失败`);
  else if (failed > 0) parts.push(`${failed} 次失败`);
  return parts.join("、");
}
