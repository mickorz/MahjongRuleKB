// W1-1：生成 provider 抽象（对应评审 P0-4 的能力分级）
// 边界：provider 只产文本 / 结构化草稿，不写盘、不决定身份、不校验引用（那是 pipeline 的事）。
// 失败策略：JSON 不合法允许有限重试；重试耗尽必须整体失败，不允许产出残缺章节。
import { chapterDraftSchema, type ChapterDraft } from "../contracts/chapter-draft.ts";
import { cardSlots, type ConfigSummary, type RuleSummary } from "../pipeline/read-ruleset.ts";

export type StructuredOutputCapability = "native" | "json_mode" | "text_only";

export interface GenerationCapabilities {
  /** 模型是否支持原生 JSON Schema 输出；不支持时由解析层兜底 */
  structured_output: StructuredOutputCapability;
  max_output_tokens?: number;
}

export interface ChapterRequest {
  section_id: string;
  title: string;
  /** 本章需要覆盖的规则与配置（已由章节装配决定） */
  rules: ReadonlyArray<Pick<RuleSummary, "id" | "name" | "body">>;
  configs: ReadonlyArray<ConfigSummary>;
  prompt_version: string;
  /** 本章必须交代的要素（来自章节规划的 beats），生成时逐项落实 */
  beats?: string[];
  /** 上一章结尾摘要，供跨章衔接；可为空 */
  previous_summary?: string;
}

export interface ChapterResponse {
  section_id: string;
  /** 原始输出，必须保留用于排查 */
  raw: string;
  draft?: ChapterDraft;
  /** 解析或校验失败时的原因；有值即表示本次失败 */
  error?: string;
  retries: number;
}

export interface Generator {
  readonly name: string;
  readonly version: string;
  readonly capabilities: GenerationCapabilities;
  generateChapter(request: ChapterRequest): Promise<ChapterResponse>;
}

export class GenerationFailedError extends Error {
  readonly sectionId: string;
  readonly attempts: number;
  readonly lastRaw: string;

  constructor(sectionId: string, attempts: number, lastRaw: string, cause: string) {
    super(`章节 ${sectionId} 生成失败（尝试 ${attempts} 次）：${cause}`);
    this.name = "GenerationFailedError";
    this.sectionId = sectionId;
    this.attempts = attempts;
    this.lastRaw = lastRaw;
  }
}

/**
 * 从模型原始输出里取出结构化草稿。
 * 三种能力都要能处理：
 * - native / json_mode：直接是 JSON
 * - text_only：可能带 ```json 围栏或前后废话，需要提取第一个 JSON 对象
 * 解析不到即返回 error，由调用方决定重试。
 */
export function parseChapterDraft(raw: string): { draft?: ChapterDraft; error?: string } {
  const text = raw.trim();
  if (text.length === 0) return { error: "模型返回空内容" };

  const candidates: string[] = [];
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  if (fenced) candidates.push(fenced[1].trim());
  candidates.push(text);
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) candidates.push(text.slice(firstBrace, lastBrace + 1));

  let lastError = "未找到 JSON 对象";
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      const result = chapterDraftSchema.safeParse(parsed);
      if (result.success) return { draft: result.data };
      lastError = `结构校验失败：${result.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`;
    } catch (e) {
      lastError = `JSON 解析失败：${(e as Error).message}`;
    }
  }
  return { error: lastError };
}

export interface RunChapterOptions {
  /** JSON 不合法时的最大重试次数（不含首次） */
  maxRetries?: number;
  /** 每次重试前的回调，用于记录日志 */
  onRetry?: (attempt: number, error: string) => void;
}

/**
 * 生成一章并保证失败必须冒泡：
 * 重试只针对「解析/结构不合法」；重试耗尽抛 GenerationFailedError，
 * 绝不返回半成品（那会让上层误以为成功）。
 */
export async function generateChapterOrThrow(
  generator: Generator,
  request: ChapterRequest,
  options: RunChapterOptions = {},
): Promise<ChapterResponse> {
  const maxRetries = options.maxRetries ?? 2;
  let lastRaw = "";
  let lastError = "";

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const response = await generator.generateChapter(request);
    lastRaw = response.raw;
    if (response.draft) return { ...response, retries: attempt };
    lastError = response.error ?? "未知错误";
    if (response.error && attempt < maxRetries) options.onRetry?.(attempt + 1, response.error);
  }
  throw new GenerationFailedError(request.section_id, maxRetries + 1, lastRaw, lastError);
}

/**
 * 确定性生成器：把规则卡槽位展开成 ChapterDraft。
 * 用途有两个：
 * 1. 无模型环境下的降级路径（产物必须标 degraded）
 * 2. 单测里的对照基线
 */
export class DeterministicGenerator implements Generator {
  readonly name = "deterministic";
  readonly version = "1.0.0";
  readonly capabilities: GenerationCapabilities = { structured_output: "text_only" };

  async generateChapter(request: ChapterRequest): Promise<ChapterResponse> {
    const paragraphs = request.rules.map((rule) => {
      const slots = cardSlots(rule.body);
      const text =
        slots.length === 0
          ? rule.name
          : slots
              .map((s) => `${s.slot}：${s.text}`)
              .join("；")
              .slice(0, 4000);
      return {
        title: rule.name,
        text,
        claims: [{ text: rule.name, rule_refs: [rule.id], config_refs: [] as string[] }],
      };
    });

    for (const config of request.configs) {
      paragraphs.push({
        title: config.name,
        text: `${config.name}：${String(config.value)}`,
        claims: [{ text: config.name, rule_refs: [] as string[], config_refs: [config.id] }],
      });
    }

    const draft: ChapterDraft = {
      section_id: request.section_id,
      paragraphs: paragraphs.length > 0 ? paragraphs : [{ text: "本章无内容", claims: [{ text: "无", rule_refs: [], config_refs: [] }] }],
    };
    const parsed = chapterDraftSchema.safeParse(draft);
    if (!parsed.success) {
      return {
        section_id: request.section_id,
        raw: JSON.stringify(draft),
        error: `确定性生成结果不合法：${parsed.error.issues.map((i) => i.message).join("; ")}`,
        retries: 0,
      };
    }
    return { section_id: request.section_id, raw: JSON.stringify(parsed.data), draft: parsed.data, retries: 0 };
  }
}
