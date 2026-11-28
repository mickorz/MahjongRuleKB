// Rule Copilot 查询层：公共契约（类型 + Zod Schema）
//
// 边界（第一批）：
// - 只读。数据源是 LoadedRuleset（rulebook/specs/**），不是 RuleSetView，也不是 compiled/**。
// - 不改 compiler/、不改 studio/pipeline/read-ruleset.ts、不参与文档生成。
//
// 设计要点：
// - RuleCore 抽出来，Summary / Detail 各自扩展，Detail 不继承 matched_by（那是检索产物）。
// - 检索结果必带 status / release_blocker / change_type / base_rule_ref / unresolved_refs，
//   模型不需要逐条 get_rule 才知道"这条有没有争议"。
// - 证据分 resolvable / unresolvable：能定位给 source_ref（含行号），不能定位只给 label。
import { z } from "zod";

import { changeTypes, ruleIdPattern, ruleStatuses, ruleTypes } from "../../schemas/rule.ts";

/* ---------------- 查询上下文 ---------------- */

export const queryContextSchema = z.object({
  /** 规则集目录名：base 为 "hangzhou"，variant 为 variants/ 下的目录名 */
  variant: z.string().regex(/^[a-z][a-z0-9-]*$/),
  kind: z.enum(["base", "variant"]),
  ruleset_id: z.string(),
  version: z.string(),
  /** 仅 variant：基座绑定 */
  base: z.object({ ruleset_id: z.string(), version: z.string() }).optional(),
  /** 仅 base：manifest 里的 content_hash */
  content_hash: z.string().optional(),
  /**
   * 内容指纹：对规则/配置/未决文件的实际内容做确定性哈希。
   * 变体 manifest 没有 content_hash，只能用这个判断"同版本但内容变了"。
   */
  content_fingerprint: z.string(),
});
export type QueryContext = z.infer<typeof queryContextSchema>;

/* ---------------- 证据 ---------------- */

export const evidenceRefSchema = z.object({
  /** 仓库相对路径（未通过前缀校验时为原文，且 resolvable=false） */
  file: z.string(),
  /** 原文 section，原样保留，不做猜测性改写 */
  section: z.string().optional(),
  /** 能在源文件里定位到标题时才给 */
  source_ref: z
    .object({
      kind: z.enum(["anchor", "heading"]),
      value: z.string(),
      line: z.number().int().positive(),
    })
    .optional(),
  /** 永远可展示，例如 "xiaoshan-rules.md · R-BANK-02" */
  source_label: z.string(),
  resolvable: z.boolean(),
});
export type EvidenceRef = z.infer<typeof evidenceRefSchema>;

/* ---------------- 未决项 ---------------- */

export const unresolvedRefSchema = z.object({
  id: z.string().regex(/^(HJ|XS)-U-\d{3}$/),
  card_ref: z.string().regex(ruleIdPattern),
  status: z.enum(ruleStatuses),
  release_blocker: z.boolean(),
  description: z.string(),
  resolution: z.string().nullable().optional(),
});
export type UnresolvedRef = z.infer<typeof unresolvedRefSchema>;

/* ---------------- 规则核心（Summar y 与 Detail 共用） ---------------- */

export const ruleCoreSchema = z.object({
  id: z.string().regex(ruleIdPattern),
  name: z.string(),
  type: z.enum(ruleTypes),
  /** 基座卡 "base"，差异卡 "variant" */
  origin: z.enum(["base", "variant"]),
  /** 仅差异卡有；基座卡为 undefined */
  change_type: z.enum(changeTypes).optional(),
  status: z.enum(ruleStatuses),
  release_blocker: z.boolean(),
  /** 仅 modified / inherited 有；added 与基座卡为 undefined */
  base_rule_ref: z.string().regex(ruleIdPattern).optional(),
});
export type RuleCore = z.infer<typeof ruleCoreSchema>;

/* ---------------- 检索命中原因 ---------------- */

export const matchReasons = ["id", "name", "body", "filter"] as const;
export type MatchReason = (typeof matchReasons)[number];

/* ---------------- 摘要 ---------------- */

export const ruleSummarySchema = ruleCoreSchema.extend({
  /** 取有规则语义的槽位（优先 结果 / 表 / 公式），截 80 字 */
  summary: z.string(),
  depends_on: z.string().array(),
  /** 命中该卡的未决项 ID（含非 blocker，是否阻塞看 release_blocker） */
  unresolved_refs: z.string().array(),
  /** 本次命中原因，可能是多个；只靠过滤命中时为 ["filter"] */
  matched_by: z.enum(matchReasons).array(),
});
export type RuleSummary = z.infer<typeof ruleSummarySchema>;

/* ---------------- 详情 ---------------- */

export const ruleSlotSchema = z.object({ slot: z.string(), text: z.string() });

export const ruleDetailSchema = ruleCoreSchema.extend({
  scope: z.string(),
  /** 完整 Markdown 正文（含「差异 / 杭麻」槽，比较时由调用方决定是否排除） */
  body: z.string(),
  /** cardSlots(body) 原样结果 */
  slots: ruleSlotSchema.array(),
  depends_on: z.string().array(),
  /** 基座卡为空数组 */
  compares_to: z.string().array(),
  not_applicable_slots: z
    .object({ slot: z.string(), reason: z.string(), source: z.string().optional() })
    .array(),
  evidence: evidenceRefSchema.array(),
  /** 引用了这张卡的文档段落（documents/<variant>/document.json） */
  document_segments: z.string().array(),
  unresolved_refs: z.string().array(),
  /** 规则卡文件相对路径，仅供展示，不参与权限判定 */
  file: z.string(),
});
export type RuleDetail = z.infer<typeof ruleDetailSchema>;

/* ---------------- 配置项 ---------------- */

/**
 * 配置视图（合并了基座继承关系）。
 * 变体未覆盖的配置沿用基座值；继承项不填 value，值来自基座。
 */
export const configItemSchema = z.object({
  /** 变体自有条目用变体 ID（XS-C-*），基座条目用基座 ID（HJ-C-*） */
  id: z.string(),
  /** 统一身份键：有 base_rule_ref 时取基座 ID，否则取自身 ID */
  canonical_id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  /** 生效值（继承项取自基座） */
  value: z.unknown().optional(),
  /** 便于阅读的呈现：布尔 → 已启用/已关闭 */
  value_display: z.string(),
  unit: z.string().optional(),
  status: z.enum(ruleStatuses),
  release_blocker: z.boolean(),
  origin: z.enum(["base", "variant"]),
  change_type: z.enum(changeTypes).optional(),
  /** 变体条目指向的基座配置 */
  base_rule_ref: z.string().optional(),
  /** 继承来源（变体视图里所有沿用基座的条目都带） */
  inherited_from: z.object({ ruleset_id: z.string(), version: z.string() }).optional(),
  /** 基座侧的原值，仅变体改写时给出，便于对照 */
  base_value: z.unknown().optional(),
  /** 同一配置的候选值（争议项） */
  candidates: z.unknown().array().optional(),
  resolution: z.string().optional(),
  /** 来源可定位 → source_ref；否则只给 label（配置的 source 常是「1.1 配置表」这类标签） */
  source_ref: z.object({ file: z.string(), line: z.number().int().positive() }).optional(),
  source_label: z.string(),
  source_resolvable: z.boolean(),
  unresolved_refs: z.string().array(),
});
export type ConfigItemView = z.infer<typeof configItemSchema>;

/* ---------------- 统一返回壳 ---------------- */

export const queryErrorCodes = [
  "invalid_params", // 参数不合法（Zod 失败 / 互斥参数）
  "unknown_variant", // 不在白名单
  "not_found", // ID 不存在 / 跨规则集误用
  "ambiguous", // 关键词命中多条但无法唯一确定
  "too_many_matches", // 超出上限且不允许截断
  "io_error", // 读取失败
  // 以下两个由 Assistant Runtime 产生（共用同一个返回壳，避免 Runtime 再造一套）
  "tool_budget_exceeded", // 工具调用超预算 / 单工具超次数
  "tool_timeout", // 工具执行超时
] as const;
export type QueryErrorCode = (typeof queryErrorCodes)[number];

export const queryErrorSchema = z.object({
  code: z.enum(queryErrorCodes),
  message: z.string(),
  /** 给模型的可执行提示，例如「改用 ids 精确指定」 */
  hint: z.string().optional(),
  details: z.record(z.unknown()).optional(),
});
export type QueryError = z.infer<typeof queryErrorSchema>;

export const citationSchema = z.object({
  kind: z.enum(["rule", "config", "source", "unresolved", "segment"]),
  id: z.string(),
  /** 可点击定位的锚点，例如 "rulebook/sources/xiaoshan/xiaoshan-rules.md#L68" */
  locator: z.string().optional(),
});
export type Citation = z.infer<typeof citationSchema>;

export type ToolResult<T> =
  | { ok: true; data: T; context: QueryContext; citations: Citation[] }
  | { ok: false; error: QueryError; context?: QueryContext };

/* ---------------- 参数校验错误 → ToolResult ---------------- */

/** 把 Zod 失败统一转成 invalid_params，避免每个工具各写一份 */
export function invalidParams(error: z.ZodError, hint?: string): ToolResult<never> {
  return {
    ok: false,
    error: {
      code: "invalid_params",
      message: error.issues.map((i) => `${i.path.join(".") || "(root)"} ${i.message}`).join("；"),
      ...(hint ? { hint } : {}),
    },
  };
}
