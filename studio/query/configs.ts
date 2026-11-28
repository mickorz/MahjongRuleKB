// Rule Copilot 查询层：配置查询（第二批）
//
// 数据源同 rules.ts：compiler/validator.ts 的 loadRuleset()（rulebook/specs/**）。
// 关键语义：
// - 变体配置项 change_type=inherited 时不填 value，生效值取基座对应项（base_rule_ref）；
// - 变体未覆盖的基座配置在变体视图里同样可见（继承），并标 inherited_from；
// - 配置项自身带 status / release_blocker / candidates，不能只看 value；
// - 配置的 source 常是「1.1 配置表」这类标签而不是路径，必须拆成 source_ref / source_label。
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { z } from "zod";

import { configIdPattern } from "../../schemas/config.ts";
import { changeTypes, ruleStatuses } from "../../schemas/rule.ts";
import { PATHS } from "../../compiler/paths.ts";
import { buildSnapshot, type ConfigRecord, type QueryOptions, type RuleSetSnapshot } from "./rules.ts";
import {
  invalidParams,
  type Citation,
  type ConfigItemView,
  type QueryContext,
  type ToolResult,
} from "./types.ts";

/* ---------------- 参数 ---------------- */

export const getConfigInputSchema = z
  .object({
    variant: z.string(),
    /** 精确配置 ID（基座 ID 或变体 ID 都可以，内部按 canonical_id 归并） */
    id: z.string().regex(configIdPattern).optional(),
    /** 名称 / 描述 / ID 关键词 */
    query: z.string().trim().min(1).max(60).optional(),
    /**
     * 是否包含「只有基座定义、变体没有对应配置记录」的基座回退项，默认包含。
     * 注意：变体自己声明为 inherited 的条目（如 XS-C-CAISHEN）不算回退项，
     * 它带有变体侧的 disputed / release_blocker / candidates，任何情况下都保留。
     */
    include_base_fallback: z.boolean().default(true),
  })
  .strict()
  .refine((v) => Boolean(v.id || v.query), {
    message: "id 与 query 至少提供一个",
  });

export type GetConfigInput = z.infer<typeof getConfigInputSchema>;

export interface GetConfigOutput {
  total: number;
  items: ConfigItemView[];
}

/* ---------------- 值呈现 ---------------- */

export function displayValue(value: unknown): string {
  if (value === undefined) return "—";
  if (typeof value === "boolean") return value ? "已启用" : "已关闭";
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map((v) => String(v)).join(" / ");
  return String(value);
}

/* ---------------- 来源 ---------------- */

interface SourceView {
  source_ref?: { file: string; line: number };
  source_label: string;
  source_resolvable: boolean;
}

/**
 * 配置来源两种形态：
 * 1) 仓库相对路径（rulebook/sources/...）→ 可定位
 * 2) 展示标签（「1.1 配置表」「推导」）→ 不可定位，原样展示
 */
export function classifyConfigSource(source: string | undefined, root: string): SourceView {
  if (!source) return { source_label: "（未标注来源）", source_resolvable: false };
  const text = String(source).trim();
  const isRepoPath = text.startsWith(`${PATHS.sourcesDir}/`);
  if (!isRepoPath) return { source_label: text, source_resolvable: false };

  const abs = join(root, text);
  if (!existsSync(abs)) return { source_label: text, source_resolvable: false };
  // 配置不指向具体小节，给第 1 行作为可点击定位起点
  const line = readFileSync(abs, "utf8").split(/\r?\n/).findIndex((l) => l.trim().length > 0) + 1;
  return {
    source_ref: { file: text, line: line > 0 ? line : 1 },
    source_label: text.split("/").pop() ?? text,
    source_resolvable: true,
  };
}

/* ---------------- 合并视图 ---------------- */

function canonicalIdOf(record: ConfigRecord): string {
  return (record.base_rule_ref ?? record.id).toUpperCase();
}

function unresolvedOf(snapshot: RuleSetSnapshot, ids: ReadonlyArray<string>): string[] {
  const out = new Set<string>();
  for (const id of ids) {
    for (const entry of snapshot.unresolvedByCard.get(id.toUpperCase()) ?? []) out.add(entry.id);
  }
  return [...out].sort();
}

/**
 * 构建某规则集的"生效配置"视图。
 * - 基座视图：基座配置原样
 * - 变体视图：基座全部条目 + 变体覆盖（inherited 取基座值，modified/added 取自身值）
 */
export function effectiveConfigs(
  snapshot: RuleSetSnapshot,
  root: string,
): Map<string, ConfigItemView> {
  const out = new Map<string, ConfigItemView>();
  const base = snapshot.context.kind === "variant" ? snapshot.base : snapshot;
  if (!base) return out;

  // 1) 基座条目先铺底
  for (const record of base.configs.values()) {
    const canonical = canonicalIdOf(record);
    const source = classifyConfigSource(record.source, root);
    out.set(canonical, {
      id: record.id,
      canonical_id: canonical,
      name: record.name,
      ...(record.description ? { description: record.description } : {}),
      ...(record.value !== undefined ? { value: record.value } : {}),
      value_display: displayValue(record.value),
      status: record.status as (typeof ruleStatuses)[number],
      release_blocker: record.release_blocker,
      origin: "base",
      ...(record.change_type ? { change_type: record.change_type as (typeof changeTypes)[number] } : {}),
      ...(snapshot.context.kind === "variant"
        ? { inherited_from: { ruleset_id: base.context.ruleset_id, version: base.context.version } }
        : {}),
      ...source,
      unresolved_refs: unresolvedOf(base, [record.id]),
    });
  }

  if (snapshot.context.kind === "base") return out;

  // 2) 变体条目覆盖
  for (const record of snapshot.configs.values()) {
    const canonical = canonicalIdOf(record);
    const baseEntry = out.get(canonical);
    const inherited = record.change_type === "inherited";
    const effectiveValue = inherited ? baseEntry?.value : record.value;
    const source = classifyConfigSource(record.source, root);

    out.set(canonical, {
      id: record.id,
      canonical_id: canonical,
      name: record.name,
      ...(record.description ? { description: record.description } : {}),
      ...(effectiveValue !== undefined ? { value: effectiveValue } : {}),
      value_display: displayValue(effectiveValue),
      status: record.status as (typeof ruleStatuses)[number],
      release_blocker: record.release_blocker,
      origin: "variant",
      ...(record.change_type ? { change_type: record.change_type as (typeof changeTypes)[number] } : {}),
      ...(record.base_rule_ref ? { base_rule_ref: record.base_rule_ref } : {}),
      ...(inherited && baseEntry
        ? { inherited_from: { ruleset_id: base.context.ruleset_id, version: base.context.version } }
        : {}),
      ...(!inherited && baseEntry?.value !== undefined ? { base_value: baseEntry.value } : {}),
      ...(record.candidates ? { candidates: record.candidates } : {}),
      ...(typeof (record as { resolution?: unknown }).resolution === "string"
        ? { resolution: String((record as { resolution?: unknown }).resolution) }
        : {}),
      ...source,
      unresolved_refs: unresolvedOf(snapshot, [record.id, canonical]),
    });
  }

  return out;
}

/* ---------------- get_config ---------------- */

export function getConfig(
  rawInput: unknown,
  options: QueryOptions = {},
): ToolResult<GetConfigOutput> {
  const parsed = getConfigInputSchema.safeParse(rawInput);
  if (!parsed.success) return invalidParams(parsed.error);
  const input = parsed.data;

  const snapshotResult = buildSnapshot(input.variant, options);
  if (!snapshotResult.ok) return snapshotResult;
  const snapshot = snapshotResult.data;
  const root = options.root ?? process.cwd();

  const view = effectiveConfigs(snapshot, root);
  let items = [...view.values()];

  if (!input.include_base_fallback) {
    // 只保留变体侧有记录的条目（含 inherited），丢掉纯基座回退项
    items = items.filter((item) => item.origin === "variant");
  }

  if (input.id !== undefined) {
    const wanted = input.id.toUpperCase();
    const hit = items.find((item) => item.id.toUpperCase() === wanted || item.canonical_id === wanted);
    if (!hit) {
      return {
        ok: false,
        error: {
          code: "not_found",
          message: `规则集 ${input.variant} 中不存在配置 ${input.id}`,
          hint: "配置 ID 形如 HJ-C-DIFEN / XS-C-TUODI-EDU；也可用 query 按名称检索",
        },
        context: snapshot.context,
      };
    }
    items = [hit];
  }

  if (input.query !== undefined) {
    const q = input.query.toLowerCase();
    items = items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.canonical_id.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        (item.description ?? "").toLowerCase().includes(q),
    );
  }

  items.sort((a, b) => a.canonical_id.localeCompare(b.canonical_id));

  const citations: Citation[] = items.map((item) => ({
    kind: "config",
    id: item.id,
    ...(item.source_ref ? { locator: `${item.source_ref.file}#L${item.source_ref.line}` } : {}),
  }));

  return { ok: true, data: { total: items.length, items }, context: snapshot.context, citations };
}

/** 供 compare/后续工具复用：按 canonical_id 取单个配置 */
export function configByCanonical(
  snapshot: RuleSetSnapshot,
  canonicalId: string,
  root: string,
): ConfigItemView | undefined {
  return effectiveConfigs(snapshot, root).get(canonicalId.toUpperCase());
}
