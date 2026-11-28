// 真实模型的 ChatClient 实现（OpenAI 兼容 /chat/completions）
//
// 只做协议适配：把 Runtime 的 ChatMessage / tools 转成请求体，
// 把响应里的 tool_calls / content 转回来。业务判断全部留在 Runtime。
import { resolveProviderConfig } from "../generate/llm-generator.ts";
import { resolveTierModel } from "../generate/model-tiers.ts";
import type { ChatClient, ChatMessage, ChatResponse, ToolCall } from "./runtime.ts";

export interface ChatModelConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export class ChatModelUnavailable extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatModelUnavailable";
  }
}

/** 依次尝试 fast → big → ultra，取第一个能解析出 provider 的模型 */
export function resolveChatModel(): ChatModelConfig {
  const warnings: string[] = [];
  for (const tier of ["fast", "big", "ultra"] as const) {
    const resolved = resolveTierModel(tier);
    if (resolved.warning) warnings.push(resolved.warning);
    const modelString = resolved.model;
    if (!modelString) continue;
    const idx = modelString.indexOf("/");
    if (idx <= 0) continue;
    try {
      const config = resolveProviderConfig(modelString.slice(0, idx));
      if (config.baseUrl && config.apiKey) {
        return { baseUrl: config.baseUrl, apiKey: config.apiKey, model: modelString.slice(idx + 1) };
      }
    } catch {
      // 换下一档
    }
  }
  throw new ChatModelUnavailable(warnings[0] ?? "未配置可用模型（RULE_STUDIO_LLM_* 或 ~/.pi/agent/models.json）");
}

interface RawResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
      tool_calls?: Array<{ id?: string; type?: string; function?: { name?: string; arguments?: string } }>;
    };
  }>;
}

/** 把响应规整成 Runtime 需要的形状 */
export function toChatResponse(raw: RawResponse): ChatResponse {
  const message = raw.choices?.[0]?.message;
  const toolCalls: ToolCall[] = (message?.tool_calls ?? [])
    .map((call, index) => ({
      id: call.id ?? `call_${index}`,
      type: "function" as const,
      function: {
        name: call.function?.name ?? "",
        arguments: call.function?.arguments ?? "{}",
      },
    }))
    .filter((call) => call.function.name.length > 0);

  const content = message?.content ?? undefined;
  return toolCalls.length > 0 ? { ...(content ? { content } : {}), tool_calls: toolCalls } : { ...(content ? { content } : {}) };
}

export function createChatClient(
  config: ChatModelConfig = resolveChatModel(),
  fetchImpl: typeof fetch = fetch,
): ChatClient & { model: string } {
  return {
    model: config.model,
    async chat({ messages, tools }) {
      const body: Record<string, unknown> = {
        model: config.model,
        temperature: 0.2,
        messages: messages.map(toWireMessage),
      };
      if (tools && tools.length > 0) {
        body.tools = tools;
        body.tool_choice = "auto";
      }

      const res = await fetchImpl(`${config.baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${config.apiKey}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`模型返回 ${res.status}：${text.slice(0, 300)}`);
      }
      const raw = (await res.json()) as RawResponse;
      return toChatResponse(raw);
    },
  };
}

function toWireMessage(message: ChatMessage): Record<string, unknown> {
  if (message.role === "tool") {
    return { role: "tool", tool_call_id: message.tool_call_id, name: message.name, content: message.content ?? "" };
  }
  if (message.role === "assistant" && message.tool_calls?.length) {
    return {
      role: "assistant",
      ...(message.content ? { content: message.content } : {}),
      tool_calls: message.tool_calls.map((call) => ({
        id: call.id,
        type: "function",
        function: { name: call.function.name, arguments: call.function.arguments },
      })),
    };
  }
  return { role: message.role, content: message.content ?? "" };
}
