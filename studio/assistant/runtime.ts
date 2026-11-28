// Assistant Runtime：工具调用循环 + 预算 + 审计 + grounding + 预检索降级
//
// 边界（评审 v1.1 §4.3/§4.4）：
// - 预算全局：单次请求工具调用 ≤6；单工具上限见 ToolSpec；Runtime ≤4 轮；单次工具 5s 超时；
// - 工具白名单：只跑注册表里的工具，未知工具回错误消息给模型；
// - 审计：每次调用写一条 JSONL（工具 / 参数 / 结果状态 / 耗时 / 引用）；
// - grounding：模型必须输出 claims JSON，逐条校验 ref 是否来自本次注入；
// - 无 tool_calls 能力时走服务端预检索（preRetrieval），不静默降级成纯聊天。
import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

import { collectIds, groundAnswer, type CheckedClaim } from "./grounding.ts";
import { findTool, toolDefinitionsForModel, type ToolSpec } from "./tools.ts";
import type { ToolResult } from "../query/types.ts";

export const DEFAULT_MAX_TOOL_CALLS = 8;
export const DEFAULT_MAX_ROUNDS = 5;
export const DEFAULT_TOOL_TIMEOUT_MS = 5000;

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content?: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
}

export interface ToolCall {
  id: string;
  type?: "function";
  function: { name: string; arguments: string };
}

export interface ChatResponse {
  content?: string;
  tool_calls?: ToolCall[];
}

export interface ChatClient {
  chat(input: { messages: ChatMessage[]; tools?: unknown[] }): Promise<ChatResponse>;
}

export interface AuditEntry {
  ts: string;
  tool: string;
  args: unknown;
  ok: boolean;
  code?: string;
  ms: number;
  citations: string[];
}

export interface RuntimeOptions {
  client: ChatClient;
  /** 默认注册表；测试可注入子集 */
  tools?: ReadonlyArray<ToolSpec>;
  maxToolCalls?: number;
  maxRounds?: number;
  toolTimeoutMs?: number;
  /** 审计落点：给 root 就写到 .rule-studio/assistant/<session>/tool-calls.jsonl */
  audit?: { root: string; sessionId: string };
  /** 自定义审计回调（测试用） */
  onAudit?: (entry: AuditEntry) => void;
  system?: string;
  /** 文档上下文，拼进 system */
  context?: { title?: string; excerpt?: string };
  /** 无 tool_calls 能力的降级：服务端先检索，把结果注入再答 */
  preRetrieval?: (question: string) => Promise<Array<{ tool: string; result: ToolResult<unknown> }>>;
  /** 强制走预检索（不支持 tool_calls 的模型） */
  forcePreRetrieval?: boolean;
}

export interface RuntimeToolCallLog {
  name: string;
  args: unknown;
  ok: boolean;
  code?: string;
  ms: number;
}

export interface RuntimeResult {
  text: string;
  claims: CheckedClaim[];
  grounded: boolean;
  mode: "tool_calls" | "pre_retrieval";
  rounds: number;
  toolCalls: RuntimeToolCallLog[];
  injectedIds: string[];
  budgetExceeded: boolean;
  /** 模型名（由 client 回填，可选） */
  model?: string;
}

const DEFAULT_SYSTEM = [
  "你是 MahjongRuleKB 的规则策划助手。",
  "回答必须基于工具返回的真实规则/配置/证据；文档里没有的信息明确说「知识库未覆盖」，不要编造数值。",
  "需要查规则时调用工具，不要凭空猜测规则 ID。争议与未决项要如实标注，不得自行裁决。",
  '回答末尾附一个 ```json 代码块：{"claims":[{"text":"结论","refs":["规则或配置ID"],"kind":"rule|config"}]}，每条结论都要给 refs。',
].join("\n");

const UNSUPPORTED_HINT = /tool|function.?call/i;

class ToolTimeoutError extends Error {}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new ToolTimeoutError(`工具执行超过 ${ms}ms`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function auditWriter(options: RuntimeOptions): (entry: AuditEntry) => void {
  if (options.onAudit) return options.onAudit;
  if (!options.audit) return () => {};
  const file = join(options.audit.root, ".rule-studio", "assistant", options.audit.sessionId, "tool-calls.jsonl");
  try {
    mkdirSync(dirname(file), { recursive: true });
  } catch {
    return () => {};
  }
  return (entry) => {
    try {
      appendFileSync(file, `${JSON.stringify(entry)}\n`, "utf8");
    } catch {
      // 审计失败不能打断回答
    }
  };
}

function toolResultToMessage(result: ToolResult<unknown>): string {
  if (result.ok) {
    // 只回数据 + 上下文，不回 citations 全文（体积）
    return JSON.stringify({ ok: true, data: result.data, context: result.context });
  }
  return JSON.stringify({ ok: false, error: result.error });
}

/** 从问题里挑检索关键词：去掉疑问词，取最长的中文/英文片段前 8 个字 */
export function keywordOf(question: string): string {
  const cleaned = question
    .replace(/[?？!！。，,；;：:"'「」（）()]/g, " ")
    .replace(/有什么区别|什么区别|是多少|怎么判|怎么算|有哪些|哪些|介绍一下|解释一下|一下|吗|呢|的|和|与/g, " ")
    .trim();
  const first = cleaned.split(/\s+/).find((w) => w.length >= 2) ?? cleaned;
  return first.slice(0, 8);
}

export async function runAssistant(
  input: { messages: Array<{ role: "user" | "assistant"; content: string }> },
  options: RuntimeOptions,
): Promise<RuntimeResult> {
  const tools = options.tools ?? [];
  const maxToolCalls = options.maxToolCalls ?? DEFAULT_MAX_TOOL_CALLS;
  const maxRounds = options.maxRounds ?? DEFAULT_MAX_ROUNDS;
  const timeoutMs = options.toolTimeoutMs ?? DEFAULT_TOOL_TIMEOUT_MS;
  const audit = auditWriter(options);

  const systemParts = [options.system ?? DEFAULT_SYSTEM];
  if (options.context?.title) systemParts.push(`当前文档：${options.context.title}`);
  if (options.context?.excerpt) systemParts.push(`文档内容节选：\n${options.context.excerpt}`);

  const messages: ChatMessage[] = [
    { role: "system", content: systemParts.join("\n\n") },
    ...input.messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const injected = new Set<string>();
  const toolCalls: RuntimeToolCallLog[] = [];
  const perToolCount = new Map<string, number>();
  let budgetExceeded = false;
  let rounds = 0;
  let mode: RuntimeResult["mode"] = "tool_calls";
  let content = "";

  const question = [...input.messages].reverse().find((m) => m.role === "user")?.content ?? "";

  /** 收口：告知原因后要一轮纯文本回答（不带 tools），空回答再催一次 */
  const requestFinal = async (why: string): Promise<string> => {
    messages.push({
      role: "user",
      content:
        `（系统）${why}。请不要再请求调用工具，直接基于上面已经获得的工具结果作答，` +
        '并按约定在末尾给出 ```json {"claims":[...]}```（每条结论带 refs）；没有依据的结论请明确说明。',
    });
    rounds += 1;
    let closing = await options.client.chat({ messages });
    if (!closing.content || closing.content.trim() === "") {
      messages.push({ role: "user", content: "请直接给出结论文字与 claims JSON，不要再要求调用工具。" });
      closing = await options.client.chat({ messages });
    }
    return closing.content ?? "";
  };

  const runPreRetrieval = async (): Promise<string> => {
    mode = "pre_retrieval";
    const results = options.preRetrieval ? await options.preRetrieval(question) : [];
    for (const item of results) {
      if (item.result.ok) for (const id of collectIds(item.result.data)) injected.add(id);
    }
    const injectedText = results.length
      ? results
          .map((r) => `### 工具 ${r.tool}\n${JSON.stringify(r.result.ok ? r.result.data : r.result.error).slice(0, 4000)}`)
          .join("\n\n")
      : "（没有检索到结果）";
    const followUp: ChatMessage[] = [
      { role: "system", content: systemParts.join("\n\n") },
      { role: "user", content: `基于下面检索到的知识库内容回答问题。\n\n${injectedText}\n\n问题：${question}` },
    ];
    const response = await options.client.chat({ messages: followUp });
    rounds += 1;
    return response.content ?? "";
  };

  if (options.forcePreRetrieval) {
    content = await runPreRetrieval();
  } else {
    while (rounds < maxRounds) {
      rounds += 1;
      let response: ChatResponse;
      try {
        response = await options.client.chat({
          messages,
          tools: tools.length ? toolDefinitionsForModel(tools) : undefined,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        // 模型不支持 tool calls：走预检索降级，不静默变纯聊天
        if (options.preRetrieval && UNSUPPORTED_HINT.test(message)) {
          content = await runPreRetrieval();
          break;
        }
        throw error;
      }

      const calls = response.tool_calls ?? [];
      if (calls.length === 0) {
        content = response.content ?? "";
        break;
      }

      // 记录 assistant 的 tool_calls 消息（协议要求成对出现）
      messages.push({ role: "assistant", content: response.content, tool_calls: calls });

      for (const call of calls) {
        const name = call.function?.name ?? "";
        const rawArgs = call.function?.arguments ?? "{}";

        if (toolCalls.length >= maxToolCalls) {
          budgetExceeded = true;
          const payload = {
            ok: false,
            error: {
              code: "tool_budget_exceeded",
              message: `本次请求的工具调用已达上限 ${maxToolCalls} 次，停止继续调用`,
              hint: "请基于已获得的结果作答；下面 collected_ids 是本次已检索到的 ID",
            },
            // 把已收集到的 ID 回给模型，避免它「什么也没拿到」还要再查
            collected_ids: [...injected].slice(0, 30),
          };
          messages.push({ role: "tool", tool_call_id: call.id, name, content: JSON.stringify(payload) });
          toolCalls.push({ name, args: rawArgs, ok: false, code: "tool_budget_exceeded", ms: 0 });
          audit({ ts: new Date().toISOString(), tool: name, args: rawArgs, ok: false, code: "tool_budget_exceeded", ms: 0, citations: [] });
          continue;
        }

        let args: unknown = {};
        let parseError: string | undefined;
        try {
          args = JSON.parse(rawArgs);
        } catch (error) {
          parseError = (error as Error).message;
        }

        const tool = findTool(name, tools);
        const perTool = (perToolCount.get(name) ?? 0) + 1;
        perToolCount.set(name, perTool);

        const startedAt = Date.now();
        let result: ToolResult<unknown>;
        if (!tool) {
          result = { ok: false, error: { code: "invalid_params", message: `未注册的工具：${name}`, hint: "只能调用白名单工具" } };
        } else if (perTool > tool.maxCallsPerTool) {
          result = {
            ok: false,
            error: {
              code: "tool_budget_exceeded",
              message: `工具 ${name} 单次请求最多调用 ${tool.maxCallsPerTool} 次`,
              hint: "改用其它工具或直接基于已有结果作答",
            },
          };
        } else if (parseError) {
          result = { ok: false, error: { code: "invalid_params", message: `参数不是合法 JSON：${parseError}` } };
        } else {
          try {
            result = await withTimeout(
              Promise.resolve(tool.run(args, options.audit ? { root: options.audit.root } : {})),
              timeoutMs,
            );
          } catch (error) {
            const message =
              error instanceof ToolTimeoutError ? `工具执行超时（>${timeoutMs}ms）` : (error as Error).message;
            result = { ok: false, error: { code: error instanceof ToolTimeoutError ? "tool_timeout" : "io_error", message } };
          }
        }

        const ms = Date.now() - startedAt;
        const citations = result.ok ? [...collectIds(result.data)] : [];
        if (result.ok) for (const id of citations) injected.add(id);

        toolCalls.push({ name, args, ok: result.ok, ...(result.ok ? {} : { code: result.error.code }), ms });
        audit({
          ts: new Date().toISOString(),
          tool: name,
          args,
          ok: result.ok,
          ...(result.ok ? {} : { code: result.error.code }),
          ms,
          citations,
        });

        messages.push({
          role: "tool",
          tool_call_id: call.id,
          name,
          content: toolResultToMessage(result),
        });
      }

      if (budgetExceeded) {
        content = await requestFinal("工具调用预算已用尽");
        break;
      }
    }
  }

  // 轮数上限也可能导致还没拿到正文：显式收口，避免空回答
  if (content.trim() === "") content = await requestFinal("工具调用轮次已用尽");

  const grounding = groundAnswer(content, injected);
  return {
    text: grounding.text || content,
    claims: grounding.claims,
    grounded: grounding.grounded,
    mode,
    rounds,
    toolCalls,
    injectedIds: [...injected].sort(),
    budgetExceeded,
  };
}
