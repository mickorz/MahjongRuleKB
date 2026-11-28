// 创作助手：本地代理到已配置的模型（复用 studio/generate 的 provider 解析）
// 只做对话转发，不给模型任何写权限；上下文由前端挑选后随请求带上。
import { resolveProviderConfig } from "../studio/generate/llm-generator.ts";
import { resolveTierModel } from "../studio/generate/model-tiers.ts";

export interface AssistantTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantRequest {
  messages: AssistantTurn[];
  /** 文档上下文：标题 + 选中文档摘要，直接拼进系统提示 */
  context?: { title?: string; excerpt?: string };
}

export interface AssistantReply {
  ok: true;
  text: string;
  model: string;
}

export class AssistantUnavailable extends Error {}

const SYSTEM = [
  "你是麻将规则知识库的编辑助手，服务对象是策划。",
  "回答必须基于给出的规则文档内容；文档里没有的信息要明确说「文档未覆盖」，不要编造数值。",
  "语气简洁，先给结论再给依据；引用规则时写规则的中文名。",
].join("\n");

/** 取一个可用的对话模型；未配置时抛 AssistantUnavailable */
function resolveModel(): { baseUrl: string; apiKey: string; model: string } {
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
      // 该档位没有可用 provider，继续下一档
    }
  }
  throw new AssistantUnavailable(
    warnings[0] ?? "未配置可用模型（RULE_STUDIO_LLM_* 或 ~/.pi/agent/models.json）",
  );
}

/** 调 OpenAI 兼容的 chat completions；返回纯文本 */
export async function askAssistant(
  request: AssistantRequest,
  fetchImpl: typeof fetch = fetch,
): Promise<AssistantReply> {
  const { baseUrl, apiKey, model } = resolveModel();
  const contextLines: string[] = [];
  if (request.context?.title) contextLines.push(`文档：${request.context.title}`);
  if (request.context?.excerpt) contextLines.push(`文档内容节选：\n${request.context.excerpt}`);

  const body = {
    model,
    temperature: 0.2,
    messages: [
      { role: "system", content: [SYSTEM, ...contextLines].join("\n\n") },
      ...request.messages.map((m) => ({ role: m.role, content: m.content })),
    ],
  };

  const res = await fetchImpl(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`模型返回 ${res.status}：${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("模型没有返回内容");
  return { ok: true, text, model };
}
