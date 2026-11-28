// Rule Copilot 查询层：跨玩法比较（第三批 3/3）
//
// 三条硬约束（评审确认）：
// 1) 基座与变体只能通过 base_rule_ref 配对，绝不按同名 ID / 同名称猜；
// 2) 比较范围必须显式：ids{side} / keyword / all_changes，空参数不等于全量；
// 3) 配置比较直接复用 effectiveConfigs()，不重复实现合并逻辑。
//
// 以及：差异 / 杭麻 这类对照槽位不参与规则差异判定；争议与阻塞项必须原样带出，
// 无法确定的情况标 uncertain，不允许当成"相同"。
import { z } from "zod";

import { changeTypes, ruleTypes } from "../../schemas/rule.ts";
import { configIdPattern } from "../../schemas/config.ts";
import { effectiveConfigs } from "./configs.ts";
import { buildSnapshot, type QueryOptions, type RuleRecord, type RuleSetSnapshot } from "./rules.ts";
import { unresolvedIdsForCard } from "./unresolved.ts";
import { invalidParams, type Citation, type ToolResult } from "./types.ts";

/* ---------------- 参数 ---------------- */

export const compareScopeSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("ids"),
      /** variant：从变体卡出发；base：从基座卡出发（反查它被哪些变体卡改写） */
      side: z.enum(["variant", "base"]),
      ids: z.array(z.string().min(1)).min(1).max(20),
    })
    .strict(),
  z.object({ kind: z.literal("keyword"), query: z.string().trim().min(1).max(60) }).strict(),
  z.object({ kind: z.literal("all_changes") }).strict(),
]);

export type CompareScope = z.infer<typeof compareScopeSchema>;

export const compareRulesInputSchema = z
  .object({
    base: z.string(),
    variant: z.string(),
    scope: compareScopeSchema,
    max_rows: z.number().int().min(1).max(40).default(20),
  })
  .strict();

export type CompareRulesInput = z.infer<typeof compareRulesInputSchema>;

/* ---------------- 输出 ---------------- */

export const compareRowKinds = ["inherited", "modified", "added", "base_only", "uncertain"] as const;
export type CompareRowKind = (typeof compareRowKinds)[number];

export interface SlotDiff {
  slot: string;
  base?: string;
  variant?: string;
}

export interface CompareRuleRow {
  kind: CompareRowKind;
  /** 变体卡 ID（base_only 时缺省） */
  variant_id?: string;
  /** 基座卡 ID（added 时缺省） */
  base_id?: string;
  variant_name?: string;
  base_name?: string;
  /** 变体侧声明的 change_type（base_only 时缺省） */
  change_type?: (typeof changeTypes)[number];
  /** 基座存在但变体没有覆盖时为 true */
  base_only: boolean;
  slot_diff: SlotDiff[];
  variant_status?: string;
  base_status?: string;
  unresolved_refs: string[];
  /** 无法自动判定的原因（例如 base_rule_ref 指向不存在的基座卡） */
  uncertain_reason?: string;
}

export interface CompareConfigRow {
  canonical_id: string;
  id: string;
  name: string;
  change_type?: (typeof changeTypes)[number];
  base_value?: unknown;
  variant_value?: unknown;
  changed: boolean;
  status: string;
  release_blocker: boolean;
  candidates?: unknown[];
  unresolved_refs: string[];
}

export interface CompareOutput {
  scope: CompareScope;
  matched: number;
  truncated: boolean;
  summary: {
    inherited: number;
    modified: number;
    added: number;
    base_only: number;
    uncertain: number;
    config_changed: number;
  };
  rows: CompareRuleRow[];
  config_rows: CompareConfigRow[];
  caveats: string[];
}

/* ---------------- 槽位比较 ---------------- */

/** 对照信息槽，不作为规则差异判定 */
const NON_SEMANTIC_SLOTS = new Set(["差异", "杭麻", "另见", "参考", "来源"]);

const normalizeSlotText = (text: string): string =>
  text
    .replace(/\s+/g, " ")
    .replace(/[`*]/g, "")
    .trim();

export function diffSlots(base: RuleRecord | undefined, variant: RuleRecord | undefined): SlotDiff[] {
  const toMap = (record?: RuleRecord) => {
    const map = new Map<string, string>();
    for (const slot of record?.slots ?? []) {
      if (NON_SEMANTIC_SLOTS.has(slot.slot)) continue;
      map.set(slot.slot, normalizeSlotText(slot.text));
    }
    return map;
  };
  const baseMap = toMap(base);
  const variantMap = toMap(variant);
  const slots = new Set([...baseMap.keys(), ...variantMap.keys()]);

  const diffs: SlotDiff[] = [];
  for (const slot of [...slots].sort()) {
    const b = baseMap.get(slot);
    const v = variantMap.get(slot);
    if (b === v) continue;
    diffs.push({ slot, ...(b !== undefined ? { base: b } : {}), ...(v !== undefined ? { variant: v } : {}) });
  }
  return diffs;
}

/* ---------------- 配对 ---------------- */

interface Pair {
  variant?: RuleRecord;
  base?: RuleRecord;
  kind: CompareRowKind;
  uncertain_reason?: string;
}

function baseRuleOf(base: RuleSetSnapshot, variantRecord: RuleRecord): RuleRecord | undefined {
  const meta = variantRecord.meta as { base_rule_ref?: string };
  if (!meta.base_rule_ref) return undefined;
  return base.rules.get(meta.base_rule_ref.toUpperCase());
}

function pairByVariantId(base: RuleSetSnapshot, variantRecord: RuleRecord): Pair {
  const meta = variantRecord.meta as { change_type?: string; base_rule_ref?: string };
  if (meta.change_type === "added") return { variant: variantRecord, kind: "added" };
  const baseRecord = baseRuleOf(base, variantRecord);
  if (!baseRecord) {
    return {
      variant: variantRecord,
      kind: "uncertain",
      uncertain_reason: meta.base_rule_ref
        ? `base_rule_ref ${meta.base_rule_ref} 在基座里不存在`
        : "变体卡声明为 modified/inherited 但没有 base_rule_ref",
    };
  }
  return {
    variant: variantRecord,
    base: baseRecord,
    kind: meta.change_type === "inherited" ? "inherited" : "modified",
  };
}

/* ---------------- 主函数 ---------------- */

export function compareRules(
  rawInput: unknown,
  options: QueryOptions = {},
): ToolResult<CompareOutput> {
  const parsed = compareRulesInputSchema.safeParse(rawInput);
  if (!parsed.success) return invalidParams(parsed.error);
  const input = parsed.data;
  const root = options.root ?? process.cwd();

  if (input.base === input.variant) {
    return {
      ok: false,
      error: {
        code: "invalid_params",
        message: "base 与 variant 不能是同一个规则集",
        hint: "跨玩法比较需要两个不同规则集，例如 base=hangzhou、variant=xiaoshan",
      },
    };
  }

  const baseResult = buildSnapshot(input.base, options);
  if (!baseResult.ok) return baseResult;
  const base = baseResult.data;
  if (base.context.kind !== "base") {
    return {
      ok: false,
      error: { code: "invalid_params", message: `${input.base} 不是基座规则集` },
      context: base.context,
    };
  }

  const variantResult = buildSnapshot(input.variant, options);
  if (!variantResult.ok) return variantResult;
  const variant = variantResult.data;
  if (variant.context.kind !== "variant") {
    return {
      ok: false,
      error: { code: "invalid_params", message: `${input.variant} 不是变体规则集` },
      context: variant.context,
    };
  }

  const caveats: string[] = [];
  const pairs: Pair[] = [];
  const configTargets = new Set<string>();
  let matched = 0;

  const idList = input.scope.kind === "ids" ? input.scope.ids : [];
  const wantedSide = input.scope.kind === "ids" ? input.scope.side : undefined;

  if (input.scope.kind === "ids") {
    for (const rawId of idList) {
      const id = rawId.trim().toUpperCase();
      const isConfig = new RegExp(configIdPattern.source.replace("^", "").replace("$", "")).test(id);

      if (isConfig) {
        if (wantedSide === "base" && !id.startsWith("HJ-")) {
          return badSide("config", wantedSide, id, "HJ-C-*");
        }
        if (wantedSide === "variant" && !id.startsWith("XS-")) {
          return badSide("config", wantedSide, id, "XS-C-*");
        }
        const canonical = resolveConfigCanonical(variant, id, root);
        if (!canonical) {
          return notFound(id, input.variant, "配置 ID 在两个规则集里都找不到");
        }
        configTargets.add(canonical);
        matched += 1;
        continue;
      }

      if (wantedSide === "base") {
        if (!id.startsWith("HJ-")) return badSide("rule", "base", id, "HJ-R-* / HJ-K-* …");
        const baseRecord = base.rules.get(id);
        if (!baseRecord) return notFound(id, input.base, "基座里没有这张卡");
        const variantIds = variant.variantsByBase.get(id) ?? [];
        if (variantIds.length === 0) {
          pairs.push({ base: baseRecord, kind: "base_only" });
        } else {
          for (const vid of variantIds) {
            const vRecord = variant.rules.get(vid.toUpperCase());
            if (!vRecord) continue;
            pairs.push(pairByVariantId(base, vRecord));
          }
        }
        matched += 1;
        continue;
      }

      // side = variant
      if (!id.startsWith("XS-")) return badSide("rule", "variant", id, "XS-R-* / XS-K-* …");
      const vRecord = variant.rules.get(id);
      if (!vRecord) return notFound(id, input.variant, "变体里没有这张卡");
      pairs.push(pairByVariantId(base, vRecord));
      matched += 1;
    }
  } else if (input.scope.kind === "keyword") {
    const q = input.scope.query.toLowerCase();
    const variantHits = [...variant.rules.values()].filter(
      (r) => r.meta.name.toLowerCase().includes(q) || r.body.toLowerCase().includes(q),
    );
    for (const vRecord of variantHits) pairs.push(pairByVariantId(base, vRecord));

    // 关键词命中的基座卡：若变体没有对应卡，标 base_only
    for (const baseRecord of base.rules.values()) {
      const hit = baseRecord.meta.name.toLowerCase().includes(q) || baseRecord.body.toLowerCase().includes(q);
      if (!hit) continue;
      const variantIds = variant.variantsByBase.get(baseRecord.meta.id.toUpperCase()) ?? [];
      if (variantIds.length === 0) pairs.push({ base: baseRecord, kind: "base_only" });
    }

    // 配置同关键词一起比
    const configView = effectiveConfigs(variant, root);
    for (const item of configView.values()) {
      if (!item.name.toLowerCase().includes(q) && !item.canonical_id.toLowerCase().includes(q)) continue;
      configTargets.add(item.canonical_id);
    }
    matched = pairs.length + configTargets.size;
  } else {
    for (const vRecord of variant.rules.values()) pairs.push(pairByVariantId(base, vRecord));
    matched = pairs.length;
  }

  /* ---- 规则行 ---- */

  const rows: CompareRuleRow[] = pairs.map((pair) => {
    const variantId = pair.variant?.meta.id;
    const baseId = pair.base?.meta.id;
    const unresolved = new Set<string>();
    if (variantId) for (const id of unresolvedIdsForCard(variant, variantId)) unresolved.add(id);
    if (baseId) for (const id of unresolvedIdsForCard(base, baseId)) unresolved.add(id);

    const meta = pair.variant?.meta as { change_type?: (typeof changeTypes)[number] } | undefined;
    return {
      kind: pair.kind,
      ...(variantId ? { variant_id: variantId } : {}),
      ...(baseId ? { base_id: baseId } : {}),
      ...(pair.variant ? { variant_name: pair.variant.meta.name } : {}),
      ...(pair.base ? { base_name: pair.base.meta.name } : {}),
      ...(meta?.change_type ? { change_type: meta.change_type } : {}),
      base_only: pair.kind === "base_only",
      slot_diff: diffSlots(pair.base, pair.variant),
      ...(pair.variant ? { variant_status: pair.variant.meta.status } : {}),
      ...(pair.base ? { base_status: pair.base.meta.status } : {}),
      unresolved_refs: [...unresolved].sort(),
      ...(pair.uncertain_reason ? { uncertain_reason: pair.uncertain_reason } : {}),
    };
  });

  rows.sort((a, b) => (a.variant_id ?? a.base_id ?? "").localeCompare(b.variant_id ?? b.base_id ?? ""));

  /* ---- 配置行（复用 effectiveConfigs，不重写合并） ---- */

  const configView = effectiveConfigs(variant, root);
  const configRows: CompareConfigRow[] = [];
  for (const canonical of configTargets) {
    const item = configView.get(canonical.toUpperCase());
    if (!item) continue;
    const baseEntry = effectiveConfigs(base, root).get(canonical.toUpperCase());
    const baseValue = baseEntry?.value;
    configRows.push({
      canonical_id: item.canonical_id,
      id: item.id,
      name: item.name,
      ...(item.change_type ? { change_type: item.change_type } : {}),
      ...(baseValue !== undefined ? { base_value: baseValue } : {}),
      ...(item.value !== undefined ? { variant_value: item.value } : {}),
      changed: item.origin === "variant" && String(item.value) !== String(baseValue),
      status: item.status,
      release_blocker: item.release_blocker,
      ...(item.candidates ? { candidates: item.candidates } : {}),
      unresolved_refs: item.unresolved_refs,
    });
  }
  configRows.sort((a, b) => a.canonical_id.localeCompare(b.canonical_id));

  /* ---- 规模与提示 ---- */

  const limit = input.scope.kind === "all_changes" ? Math.min(input.max_rows, 20) : input.max_rows;
  const truncated = rows.length > limit || configRows.length > limit;
  const rowsOut = rows.slice(0, limit);
  const configOut = configRows.slice(0, limit);
  if (truncated) {
    caveats.push(
      `结果超过上限 ${limit}：规则 ${rows.length} 组、配置 ${configRows.length} 组，请缩小范围（ids / 更具体的关键词）`,
    );
  }

  const summary = {
    inherited: rowsOut.filter((r) => r.kind === "inherited").length,
    modified: rowsOut.filter((r) => r.kind === "modified").length,
    added: rowsOut.filter((r) => r.kind === "added").length,
    base_only: rowsOut.filter((r) => r.kind === "base_only").length,
    uncertain: rowsOut.filter((r) => r.kind === "uncertain").length,
    config_changed: configOut.filter((r) => r.changed).length,
  };

  if (summary.uncertain > 0) caveats.push(`${summary.uncertain} 组无法自动判定（见 uncertain_reason），不要当成一致`);
  // 未决提示按「全部命中结果」统计：截断不能把风险提示一起裁掉
  const unresolvedInRows = new Set([
    ...rows.flatMap((r) => r.unresolved_refs),
    ...configRows.flatMap((r) => r.unresolved_refs),
  ]);
  if (unresolvedInRows.size > 0) {
    const blockers = [...unresolvedInRows].filter((id) => {
      const entry = [...variant.unresolved, ...base.unresolved].find((u) => u.id === id);
      return entry?.release_blocker === true;
    });
    caveats.push(
      `涉及未决项 ${[...unresolvedInRows].sort().join("、")}` +
        (blockers.length ? `，其中阻塞发布：${blockers.join("、")}` : "（均非阻塞）") +
        "；AI 不裁决冲突，由规则方裁定",
    );
  }
  const sameNamePairs = rows.filter((r) => r.base_name && r.variant_name && r.base_name === r.variant_name);
  if (sameNamePairs.length > 0) {
    caveats.push(`${sameNamePairs.length} 组两侧同名，配对依据仍是 base_rule_ref，不是名称`);
  }

  const citations: Citation[] = [
    ...rowsOut.flatMap((r) => [
      ...(r.variant_id ? [{ kind: "rule" as const, id: r.variant_id }] : []),
      ...(r.base_id ? [{ kind: "rule" as const, id: r.base_id }] : []),
    ]),
    ...configOut.map((c) => ({ kind: "config" as const, id: c.id })),
    ...[...unresolvedInRows].map((id) => ({ kind: "unresolved" as const, id })),
  ];

  return {
    ok: true,
    data: { scope: input.scope, matched, truncated, summary, rows: rowsOut, config_rows: configOut, caveats },
    context: variant.context,
    citations,
  };

  /* ---- 内部小工具（闭包，避免污染导出） ---- */

  function badSide(kind: "rule" | "config", side: "variant" | "base", id: string, expected: string) {
    const error = {
      ok: false as const,
      error: {
        code: "invalid_params" as const,
        message: `side=${side} 不接受 ${kind} ID ${id}`,
        hint: `${kind === "rule" ? "规则" : "配置"}在 ${side} 侧应形如 ${expected}`,
      },
      context: variant.context,
    };
    return error;
  }

  function notFound(id: string, where: string, message: string) {
    return {
      ok: false as const,
      error: {
        code: "not_found" as const,
        message: `${where} 中不存在 ${id}：${message}`,
        hint: "先用 search_rules / get_config 确认 ID",
      },
      context: variant.context,
    };
  }
}

/** 配置在两侧的统一身份：变体侧有 base_rule_ref 取基座 ID，否则取自身 */
function resolveConfigCanonical(
  variant: RuleSetSnapshot,
  id: string,
  root: string,
): string | undefined {
  const view = effectiveConfigs(variant, root);
  for (const item of view.values()) {
    if (item.id.toUpperCase() === id || item.canonical_id.toUpperCase() === id) return item.canonical_id;
  }
  return undefined;
}

/** compare 里用到的规则类型白名单（保持与 schemas 同步；仅用于文案提示） */
export const compareRuleTypes = ruleTypes;
