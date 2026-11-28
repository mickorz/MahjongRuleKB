// Rule Copilot 查询层：跨玩法比较（第三批 3/3，第四批前修订）
//
// 三条硬约束（评审确认）：
// 1) 基座与变体只通过 base_rule_ref 配对，不按同名 ID / 同名称猜；
// 2) 比较范围必须显式：ids{side} / keyword / all_changes，空参数不等于全量；
// 3) 配置比较直接复用 effectiveConfigs()，不重复实现合并逻辑。
//
// 第四批前修订（评审 P1）：
// - 新增 include: both | rules | configs（默认 both），三种 scope 都支持；
// - keyword 改为真正的双侧命中并集：基座命中要把它对应的变体卡也拉进来；
// - max_rows 统一为「本次返回的条目总预算」（规则 + 配置合计），不再各给 20；
// - all_changes 在 include 含 configs 时纳入变体侧配置变更。
import { z } from "zod";

import { changeTypes } from "../../schemas/rule.ts";
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

export const compareIncludes = ["both", "rules", "configs"] as const;
export type CompareInclude = (typeof compareIncludes)[number];

export const compareRulesInputSchema = z
  .object({
    base: z.string(),
    variant: z.string(),
    scope: compareScopeSchema,
    /** 比较对象：规则 / 配置 / 两者（默认 both） */
    include: z.enum(compareIncludes).default("both"),
    /** 本次返回的条目总预算（规则 + 配置合计），不是各自上限 */
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
  variant_id?: string;
  base_id?: string;
  variant_name?: string;
  base_name?: string;
  change_type?: (typeof changeTypes)[number];
  base_only: boolean;
  slot_diff: SlotDiff[];
  variant_status?: string;
  base_status?: string;
  unresolved_refs: string[];
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
  include: CompareInclude;
  /** 命中总数（未受预算限制） */
  matched: { rules: number; configs: number };
  /** 本次实际返回条数（合计 ≤ max_rows） */
  returned: { rules: number; configs: number };
  budget: number;
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

const isConfigId = (id: string): boolean => {
  const rest = id.replace(/^-/, "").replace(/-$/, "");
  return new RegExp(configIdPattern.source.replace("^", "").replace("$", "")).test(rest);
};

/* ---------------- 主函数 ---------------- */

export function compareRules(
  rawInput: unknown,
  options: QueryOptions = {},
): ToolResult<CompareOutput> {
  const parsed = compareRulesInputSchema.safeParse(rawInput);
  if (!parsed.success) return invalidParams(parsed.error);
  const input = parsed.data;
  const root = options.root ?? process.cwd();
  const include = input.include;

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

  const fail = (code: "invalid_params" | "not_found", message: string, hint?: string) => ({
    ok: false as const,
    error: { code, message, ...(hint ? { hint } : {}) },
    context: variant.context,
  });

  /* ---- 规则配对 ---- */

  if (input.scope.kind === "ids") {
    if (include === "configs") {
      // 只比配置时，规则 ID 是越界的
      for (const rawId of input.scope.ids) {
        const id = rawId.trim().toUpperCase();
        if (!isConfigId(id)) {
          return fail("invalid_params", `include=configs 时不能传规则 ID：${id}`, "规则请用 include=both/rules");
        }
      }
    }
    for (const rawId of input.scope.ids) {
      const id = rawId.trim().toUpperCase();
      const configLike = isConfigId(id);

      if (configLike) {
        if (include === "rules") {
          return fail("invalid_params", `include=rules 时不能传配置 ID：${id}`, "配置请用 include=both/configs");
        }
        if (input.scope.side === "base" && !id.startsWith("HJ-")) {
          return fail("invalid_params", `side=base 不接受配置 ID ${id}`, "基座配置形如 HJ-C-*");
        }
        if (input.scope.side === "variant" && !id.startsWith("XS-")) {
          return fail("invalid_params", `side=variant 不接受配置 ID ${id}`, "变体配置形如 XS-C-*");
        }
        const canonical = resolveConfigCanonical(variant, id, root);
        if (!canonical) return fail("not_found", `配置 ${id} 在两个规则集里都找不到`, "先用 get_config 确认");
        configTargets.add(canonical);
        continue;
      }

      if (include === "configs") {
        return fail("invalid_params", `include=configs 时不能传规则 ID：${id}`, "规则请用 include=both/rules");
      }

      if (input.scope.side === "base") {
        if (!id.startsWith("HJ-")) return fail("invalid_params", `side=base 不接受 ${id}`, "基座规则形如 HJ-R-*");
        const baseRecord = base.rules.get(id);
        if (!baseRecord) return fail("not_found", `${input.base} 中不存在 ${id}`, "先用 search_rules 确认 ID");
        const variantIds = variant.variantsByBase.get(id) ?? [];
        if (variantIds.length === 0) {
          pairs.push({ base: baseRecord, kind: "base_only" });
        } else {
          for (const vid of variantIds) {
            const vRecord = variant.rules.get(vid.toUpperCase());
            if (vRecord) pairs.push(pairByVariantId(base, vRecord));
          }
        }
        continue;
      }

      if (!id.startsWith("XS-")) return fail("invalid_params", `side=variant 不接受 ${id}`, "变体规则形如 XS-R-*");
      const vRecord = variant.rules.get(id);
      if (!vRecord) return fail("not_found", `${input.variant} 中不存在 ${id}`, "先用 search_rules 确认 ID");
      pairs.push(pairByVariantId(base, vRecord));
    }
  } else if (input.scope.kind === "keyword") {
    if (include !== "configs") {
      // 真正的双侧并集：变体命中 ∪ 基座命中（基座命中要把对应变体卡拉进来）
      const q = input.scope.query.toLowerCase();
      const variantHitIds = new Set<string>();
      const baseOnly: RuleRecord[] = [];

      for (const vRecord of variant.rules.values()) {
        if (vRecord.meta.name.toLowerCase().includes(q) || vRecord.body.toLowerCase().includes(q)) {
          variantHitIds.add(vRecord.meta.id);
        }
      }
      for (const baseRecord of base.rules.values()) {
        const hit = baseRecord.meta.name.toLowerCase().includes(q) || baseRecord.body.toLowerCase().includes(q);
        if (!hit) continue;
        const variantIds = variant.variantsByBase.get(baseRecord.meta.id.toUpperCase()) ?? [];
        if (variantIds.length === 0) {
          baseOnly.push(baseRecord);
          continue;
        }
        for (const vid of variantIds) variantHitIds.add(vid);
      }

      for (const vid of [...variantHitIds].sort()) {
        const vRecord = variant.rules.get(vid.toUpperCase());
        if (vRecord) pairs.push(pairByVariantId(base, vRecord));
      }
      for (const baseRecord of baseOnly) pairs.push({ base: baseRecord, kind: "base_only" });
    }

    if (include !== "rules") {
      const q = input.scope.query.toLowerCase();
      for (const item of effectiveConfigs(variant, root).values()) {
        if (!item.name.toLowerCase().includes(q) && !item.canonical_id.toLowerCase().includes(q)) continue;
        configTargets.add(item.canonical_id);
      }
    }
  } else {
    // all_changes：规则取全部变体卡；配置取变体侧有记录的条目
    if (include !== "configs") {
      for (const vRecord of variant.rules.values()) pairs.push(pairByVariantId(base, vRecord));
    }
    if (include !== "rules") {
      for (const item of effectiveConfigs(variant, root).values()) {
        if (item.origin === "variant") configTargets.add(item.canonical_id);
      }
    }
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

  /* ---- 配置行（复用 effectiveConfigs） ---- */

  const configView = effectiveConfigs(variant, root);
  const baseConfigView = include === "rules" ? new Map() : effectiveConfigs(base, root);
  const configRows: CompareConfigRow[] = [];
  for (const canonical of configTargets) {
    const item = configView.get(canonical.toUpperCase());
    if (!item) continue;
    const baseValue = baseConfigView.get(canonical.toUpperCase())?.value;
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

  /* ---- 统一预算：规则先占，配置吃剩余 ---- */

  const budget = input.scope.kind === "all_changes" ? Math.min(input.max_rows, 20) : input.max_rows;
  const rulesTake = include === "configs" ? 0 : Math.min(rows.length, budget);
  const configTake = include === "rules" ? 0 : Math.min(configRows.length, Math.max(0, budget - rulesTake));
  const rowsOut = rows.slice(0, rulesTake);
  const configOut = configRows.slice(0, configTake);

  const truncated = rulesTake < rows.length || configTake < configRows.length;
  if (truncated) {
    caveats.push(
      `返回受预算限制：本次上限 ${budget} 条（规则 ${rulesTake}/${rows.length}、配置 ${configTake}/${configRows.length}），` +
        "请缩小范围（ids / 更具体的关键词）或提高 max_rows",
    );
  }
  if (include === "both" && rows.length >= budget && configRows.length > 0) {
    caveats.push(`规则已占满预算，配置未返回；如只看配置可设 include=configs（共 ${configRows.length} 条配置差异）`);
  }

  const summary = {
    inherited: rowsOut.filter((r) => r.kind === "inherited").length,
    modified: rowsOut.filter((r) => r.kind === "modified").length,
    added: rowsOut.filter((r) => r.kind === "added").length,
    base_only: rowsOut.filter((r) => r.kind === "base_only").length,
    uncertain: rowsOut.filter((r) => r.kind === "uncertain").length,
    config_changed: configOut.filter((r) => r.changed).length,
  };

  // 风险提示按「全量命中」统计，截断不能把提示一起裁掉
  const unresolvedInRows = new Set([
    ...rows.flatMap((r) => r.unresolved_refs),
    ...configRows.flatMap((r) => r.unresolved_refs),
  ]);
  if (summary.uncertain > 0) caveats.push(`${summary.uncertain} 组无法自动判定（见 uncertain_reason），不要当成一致`);
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
    data: {
      scope: input.scope,
      include,
      matched: { rules: rows.length, configs: configRows.length },
      returned: { rules: rowsOut.length, configs: configOut.length },
      budget,
      truncated,
      summary,
      rows: rowsOut,
      config_rows: configOut,
      caveats,
    },
    context: variant.context,
    citations,
  };
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
