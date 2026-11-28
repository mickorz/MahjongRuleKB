// 创作助手：本地代理到已配置的模型（复用 studio/generate 的 provider 解析）
// 只做对话转发，不给模型任何写权限；上下文由前端挑选后随请求带上。
import { ChatModelUnavailable, resolveChatModel } from "../studio/assistant/llm-client.ts";

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

/** 兼容旧命名：模型不可用（原 AssistantUnavailable） */
export class AssistantUnavailable extends ChatModelUnavailable {}

const SYSTEM = [
  "你是麻将规则知识库的编辑助手，服务对象是策划。",
  "回答必须基于给出的规则文档内容；文档里没有的信息要明确说「文档未覆盖」，不要编造数值。",
  "语气简洁，先给结论再给依据；引用规则时写规则的中文名。",
].join("\n");

/** 取一个可用的对话模型；未配置时抛 AssistantUnavailable */
function resolveModel(): { baseUrl: string; apiKey: string; model: string } {
  try {
    return resolveChatModel();
  } catch (error) {
    throw new AssistantUnavailable((error as Error).message);
  }
}

/* ---------------- 改稿提案（Action） ---------------- */

export interface EditCandidate {
  segment_id: string;
  /** 段首若干字，供模型识别；不下发全文避免上下文过长 */
  preview: string;
}

export interface EditProposal {
  segment_id: string;
  reason: string;
}

export class EditProposalError extends Error {}

const EDIT_SYSTEM = [
  "你在为麻将规则文档挑选需要修改的段落，并给出改写后的整段文字。",
  "只能从给定的段落清单里选一个 segment_id，不得虚构。",
  "改写必须保持原意与全部数值不变；只改表达。",
  "after_text 必须是完整段落，逐字覆盖原段全部内容，不得省略、不得截断、不得只写开头。",
  '只输出 JSON：{"segment_id":"...","after_text":"...","reason":"..."}，不要任何其它文字。',
].join("\n");

/** 从模型输出里抠出 JSON（容忍 ```json 包裹与前后闲话） */
export function extractJson(text: string): unknown {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(text);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) throw new EditProposalError("模型没有返回 JSON 对象");
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch (e) {
    throw new EditProposalError(`模型返回的不是合法 JSON：${(e as Error).message}`);
  }
}

/** 校验模型给的 segment_id 必须在候选里，after_text 非空 */
export function validateProposal(
  value: unknown,
  candidateIds: ReadonlyArray<string>,
): { segment_id: string; after_text: string; reason: string } {
  if (typeof value !== "object" || value === null) throw new EditProposalError("提案不是对象");
  const v = value as Record<string, unknown>;
  const id = typeof v.segment_id === "string" ? v.segment_id.trim() : "";
  const after = typeof v.after_text === "string" ? v.after_text.trim() : "";
  const reason = typeof v.reason === "string" ? v.reason.trim() : "";
  if (!candidateIds.includes(id)) throw new EditProposalError(`提案里的段落不在可编辑清单内：${id || "(空)"}`);
  if (!after) throw new EditProposalError("提案没有给出改写后的文字");
  return { segment_id: id, after_text: after, reason };
}

/** 让模型挑一段并给出改写；返回已校验的提案 */
export async function proposeEdit(
  input: { instruction: string; candidates: ReadonlyArray<EditCandidate> },
  fetchImpl: typeof fetch = fetch,
): Promise<{ proposal: { segment_id: string; after_text: string; reason: string }; model: string }> {
  if (input.candidates.length === 0) throw new EditProposalError("没有可编辑的段落（基座内容与数值段不可改）");
  const { baseUrl, apiKey, model } = resolveModel();

  const list = input.candidates
    .map((c) => `- ${c.segment_id}｜${c.preview}`)
    .join("\n");
  const body = {
    model,
    temperature: 0.1,
    max_tokens: 2000,
    messages: [
      { role: "system", content: EDIT_SYSTEM },
      {
        role: "user",
        content: `可编辑段落清单：\n${list}\n\n修改要求：${input.instruction}`,
      },
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
  const content = data.choices?.[0]?.message?.content ?? "";
  const parsed = validateProposal(extractJson(content), input.candidates.map((c) => c.segment_id));
  return { proposal: parsed, model };
}
