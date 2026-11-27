// W1 真实模型接入：OpenAI 兼容 Chat Completions（直连 base_url + key）
// 配置来源优先级：环境变量 > ~/.pi/agent/models.json 中的 provider 条目
// 边界：只发请求、只解析；引用校验与装配仍由 pipeline 负责。
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { parseChapterDraft } from "./provider.ts";
import type { ChapterRequest, ChapterResponse, Generator, StructuredOutputCapability } from "./provider.ts";

export interface ProviderConfig {
  provider: string;
  baseUrl: string;
  apiKey: string;
  modelIds: string[];
}

export interface ResolveProviderOptions {
  /** models.json 路径；缺省 ~/.pi/agent/models.json */
  modelsFile?: string;
  env?: Record<string, string | undefined>;
}

interface RawModelsFile {
  providers?: Record<string, { baseUrl?: string; api?: string; apiKey?: string; models?: unknown }>;
}

function modelIdsOf(models: unknown): string[] {
  if (!models) return [];
  const list = Array.isArray(models) ? models : Object.values(models);
  return list
    .map((m) => (m && typeof m === "object" ? (m as { id?: string }).id : undefined))
    .filter((id): id is string => typeof id === "string" && id.length > 0);
}

/**
 * 解析 provider 配置。
 * 环境变量可整体覆盖（便于换环境）：
 *   RULE_STUDIO_LLM_BASE_URL / RULE_STUDIO_LLM_API_KEY
 * 缺失即抛错并说明缺什么，不回退到宿主默认。
 */
export function resolveProviderConfig(provider: string, options: ResolveProviderOptions = {}): ProviderConfig {
  const env = options.env ?? process.env;
  const modelsFile = options.modelsFile ?? join(homedir(), ".pi", "agent", "models.json");
  const file: RawModelsFile = existsSync(modelsFile) ? (JSON.parse(readFileSync(modelsFile, "utf8")) as RawModelsFile) : {};
  const entry = file.providers?.[provider];

  const baseUrl = env.RULE_STUDIO_LLM_BASE_URL ?? entry?.baseUrl;
  const apiKey = env.RULE_STUDIO_LLM_API_KEY ?? entry?.apiKey;
  const modelIds = modelIdsOf(entry?.models);

  const missing: string[] = [];
  if (!baseUrl) missing.push("baseUrl");
  if (!apiKey) missing.push("apiKey");
  if (missing.length > 0) {
    throw new Error(
      `无法解析 provider ${provider} 的 ${missing.join(" / ")}（已查 ${modelsFile} 与环境变量 RULE_STUDIO_LLM_*）`,
    );
  }
  return { provider, baseUrl: baseUrl!, apiKey: apiKey!, modelIds };
}

export interface LlmGeneratorOptions {
  baseUrl: string;
  apiKey: string;
  model: string;
  /** 默认 json_mode：要求服务端返回 JSON 对象；不支持时降级到 text_only */
  structuredOutput?: StructuredOutputCapability;
  maxOutputTokens?: number;
  timeoutMs?: number;
  /** 单张规则卡正文注入上限，避免 prompt 过长 */
  maxRuleBodyChars?: number;
  /** 注入点，便于单测 */
  fetchImpl?: typeof fetch;
}

const SYSTEM_PROMPT = [
  "你是麻将玩法需求文档的撰写者。",
  "任务：把给定的规则卡与配置项，组织成一章连贯的中文需求说明。",
  "硬性要求：",
  "1. 只能引用给定清单里的 rule_refs / config_refs，禁止编造任何 ID。",
  "2. 数值只能来自给定规则卡正文或配置值；不得自行推算或补全。",
  "3. 不要写「本节说明……」这类空话；每段都要有可核对的事实。",
  "4. 输出必须是 JSON 对象，形如：",
  '{"section_id":"<给定章节>","paragraphs":[{"title":"可选小标题","text":"正文","claims":[{"text":"该段依据的一句要点","rule_refs":["HJ-..."],"config_refs":[]}]}]}',
  "5. paragraphs 至少 1 段；每段至少 1 条 claim。",
  "6. 给定的每一张规则卡都必须至少被一条 claim 引用，不得遗漏。",
  "7. 引用数值时，必须同时引用含该数值的那张规则卡或配置项。",
  "8. 给定的每一个配置项也必须被引用一次。",
  "9. 规则卡里的「公式」「表」「入账时点」「结果」等槽位内容，必须把具体数值、条件和分支写进正文，不能概括为「按规则结算」。",
].join("\n");

/** 构造用户提示；规则卡正文按上限截断，保证 prompt 有界 */
export function buildUserPrompt(request: ChapterRequest, maxRuleBodyChars = 1200): string {
  const rules = request.rules
    .map((r) => {
      const body = r.body.trim();
      const clipped = body.length > maxRuleBodyChars ? `${body.slice(0, maxRuleBodyChars)}…（已截断）` : body;
      return `### 规则卡 ${r.id}｜${r.name}\n${clipped}`;
    })
    .join("\n\n");
  const configs = request.configs
    .map((c) => `- 配置 ${c.id}｜${c.name} = ${String(c.value)}${c.description ? `（${c.description}）` : ""}`)
    .join("\n");
  return [
    `章节：${request.section_id}（${request.title}）`,
    request.previous_summary ? `上一章结尾：${request.previous_summary}` : "",
    "",
    "可用规则卡（只能引用这些 ID）：",
    rules || "（本章没有规则卡）",
    "",
    "可用配置项（只能引用这些 ID）：",
    configs || "（本章没有配置项）",
    "",
    request.beats && request.beats.length > 0
      ? `本章必须逐项交代这些要素：${request.beats.join("、")}。每个要素的具体数值、条件、分支都要写进正文，不能只提一句「见某规则卡」。`
      : "",
    `请输出该章节的 JSON。section_id 必须是 "${request.section_id}"。`,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
}

/**
 * 直连 OpenAI 兼容端点。
 * 失败一律通过 ChapterResponse.error 返回（由 generateChapterOrThrow 决定是否重试），
 * 不抛未捕获异常——那会让整章失败失去日志。
 */
export class LlmGenerator implements Generator {
  readonly name: string;
  readonly version = "1.0.0";
  readonly capabilities: Generator["capabilities"];
  private readonly opts: LlmGeneratorOptions;

  constructor(opts: LlmGeneratorOptions) {
    this.opts = opts;
    this.name = `llm:${opts.model}`;
    this.capabilities = {
      structured_output: opts.structuredOutput ?? "json_mode",
      ...(opts.maxOutputTokens ? { max_output_tokens: opts.maxOutputTokens } : {}),
    };
  }

  async generateChapter(request: ChapterRequest): Promise<ChapterResponse> {
    const fetchImpl = this.opts.fetchImpl ?? fetch;
    const url = `${this.opts.baseUrl.replace(/\/$/, "")}/chat/completions`;
    const body: Record<string, unknown> = {
      model: this.opts.model,
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(request, this.opts.maxRuleBodyChars) },
      ],
    };
    if (this.capabilities.structured_output !== "text_only") {
      body.response_format = { type: "json_object" };
    }
    if (this.opts.maxOutputTokens) body.max_tokens = this.opts.maxOutputTokens;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.opts.timeoutMs ?? 120_000);
    let raw = "";
    try {
      const response = await fetchImpl(url, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${this.opts.apiKey}` },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      raw = await response.text();
      if (!response.ok) {
        return {
          section_id: request.section_id,
          raw,
          error: `HTTP ${response.status}：${raw.slice(0, 400)}`,
          retries: 0,
        };
      }
      let content = "";
      try {
        const parsed = JSON.parse(raw) as ChatCompletionResponse;
        content = parsed.choices?.[0]?.message?.content ?? "";
        if (!content && parsed.error?.message) {
          return { section_id: request.section_id, raw, error: `服务端报错：${parsed.error.message}`, retries: 0 };
        }
      } catch {
        return { section_id: request.section_id, raw, error: "响应不是合法 JSON（非 Chat Completions 格式）", retries: 0 };
      }
      if (!content.trim()) {
        return { section_id: request.section_id, raw, error: "模型返回空内容", retries: 0 };
      }
      const draftResult = parseChapterDraft(content);
      return { section_id: request.section_id, raw: content, ...draftResult, retries: 0 };
    } catch (e) {
      const err = e as Error;
      const reason = err.name === "AbortError" ? `请求超时（${this.opts.timeoutMs ?? 120_000}ms）` : `网络错误：${err.message}`;
      return { section_id: request.section_id, raw, error: reason, retries: 0 };
    } finally {
      clearTimeout(timer);
    }
  }
}

/** 由档位字符串（provider/model）构造生成器；模型不在 provider 清单时告警但继续（端点可能支持更多模型） */
export function createLlmGeneratorFromTier(
  modelString: string,
  options: { modelsFile?: string; env?: Record<string, string | undefined>; timeoutMs?: number; maxOutputTokens?: number } = {},
): { generator: LlmGenerator; warning?: string } {
  const idx = modelString.indexOf("/");
  if (idx <= 0 || idx === modelString.length - 1) {
    throw new Error(`模型串必须形如 provider/model，实际为 ${modelString}`);
  }
  const provider = modelString.slice(0, idx);
  const model = modelString.slice(idx + 1);
  const config = resolveProviderConfig(provider, { ...(options.modelsFile ? { modelsFile: options.modelsFile } : {}), ...(options.env ? { env: options.env } : {}) });
  const warning = config.modelIds.length > 0 && !config.modelIds.includes(model) ? `模型 ${model} 不在 provider ${provider} 的 models.json 清单中` : undefined;
  return {
    generator: new LlmGenerator({
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      model,
      ...(options.timeoutMs ? { timeoutMs: options.timeoutMs } : {}),
      ...(options.maxOutputTokens ? { maxOutputTokens: options.maxOutputTokens } : {}),
    }),
    ...(warning ? { warning } : {}),
  };
}
