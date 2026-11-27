// W2-3：变体差异检查 R1 / R2 / R3（纯函数，不依赖 AI）
// R1 改写丢槽位：基座卡有、变体卡没有的槽位 → 报警（除非变体卡显式声明 not_applicable_slots）
// R2 新增疑似重复：added 卡与基座卡名称/正文相似度高 → 报警（只报疑似，不判定相同）
// R3 归类自洽：change_type 与 base_rule_ref / compares_to / 正文是否自相矛盾
import {
  machineCheckFindingSchema,
  type MachineCheckFinding,
} from "../contracts/machine-check.ts";
import { cardSlots } from "./read-ruleset.ts";

export interface CardView {
  id: string;
  name: string;
  body: string;
  origin: "base" | "variant";
  change_type?: "inherited" | "modified" | "added" | string;
  base_rule_ref?: string | null;
  compares_to?: string[];
  /** 变体卡声明的「该槽位在本玩法不适用」 */
  not_applicable_slots?: Array<{ slot: string; reason: string; source?: string }>;
}

export interface DiffCheckOptions {
  /** R2 名称相似度阈值（字符 3-gram Jaccard） */
  nameThreshold?: number;
  /** R2 正文相似度阈值 */
  bodyThreshold?: number;
}

const finding = (code: string, severity: "warning" | "failed", message: string, extra: Partial<MachineCheckFinding> = {}) =>
  machineCheckFindingSchema.parse({
    code,
    severity,
    message,
    segment_ids: [],
    rule_refs: [],
    ...extra,
  });

/** 字符 3-gram 集合；中文无空格，用字符级 n-gram 比词级更稳 */
export function charTrigrams(text: string): Set<string> {
  const flat = text.replace(/\s+/g, "");
  const grams = new Set<string>();
  for (let i = 0; i + 3 <= flat.length; i += 1) grams.add(flat.slice(i, i + 3));
  return grams;
}

/** Jaccard 相似度：交集 / 并集 */
export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter += 1;
  return inter / (a.size + b.size - inter);
}

const slotNames = (body: string): Set<string> => new Set(cardSlots(body).map((s) => s.slot));

/**
 * R1：基座卡有、变体卡没有的槽位。
 * 有 not_applicable_slots 声明覆盖的槽位不报警——但要能从告警里看出「已声明豁免」。
 */
export function checkR1(variant: CardView, base: CardView | undefined): MachineCheckFinding[] {
  if (!base || variant.change_type !== "modified") return [];
  const declared = new Set((variant.not_applicable_slots ?? []).map((s) => s.slot));
  const baseSlots = slotNames(base.body);
  const variantSlots = slotNames(variant.body);
  const missing = [...baseSlots].filter((s) => !variantSlots.has(s) && !declared.has(s));
  if (missing.length === 0) return [];
  return [
    finding(
      "diff.missing-base-slot",
      "warning",
      `${variant.id} 相比基座卡 ${base.id} 缺少槽位：${missing.join("、")}`,
      {
        rule_refs: [variant.id, base.id],
        hint: "如果该槽位在本地玩法确实不适用，请在规则卡中加 not_applicable_slots 声明并写明原因",
      },
    ),
  ];
}

/**
 * R2：added 卡疑似是基座规则的重复表达。
 * 只报疑似，附最相近的基座卡 ID —— 判定权在人。
 */
export function checkR2(variant: CardView, baseCards: ReadonlyArray<CardView>, options: DiffCheckOptions = {}): MachineCheckFinding[] {
  if (variant.change_type !== "added") return [];
  const nameThreshold = options.nameThreshold ?? 0.85;
  const bodyThreshold = options.bodyThreshold ?? 0.6;
  const vName = charTrigrams(variant.name);
  const vBody = charTrigrams(variant.body);

  let best: { id: string; nameSim: number; bodySim: number } | undefined;
  for (const base of baseCards) {
    const nameSim = jaccard(vName, charTrigrams(base.name));
    const bodySim = jaccard(vBody, charTrigrams(base.body));
    if (!best || nameSim + bodySim > best.nameSim + best.bodySim) best = { id: base.id, nameSim, bodySim };
  }
  if (!best) return [];
  const hit = best.nameSim >= nameThreshold || best.bodySim >= bodyThreshold;
  if (!hit) return [];
  return [
    finding(
      "diff.suspected-duplicate",
      "warning",
      `${variant.id} 声明为 added，但与基座卡 ${best.id} 相似（名称 ${best.nameSim.toFixed(2)} / 正文 ${best.bodySim.toFixed(2)}）`,
      {
        rule_refs: [variant.id, best.id],
        hint: "确认它确实是新规则；若是改写基座规则，应改为 modified 并给 base_rule_ref",
      },
    ),
  ];
}

/** R3：归类与溯源字段自洽 */
export function checkR3(variant: CardView, baseIds: ReadonlySet<string>): MachineCheckFinding[] {
  const out: MachineCheckFinding[] = [];
  const changeType = variant.change_type;
  if (!changeType) {
    return [finding("diff.change-type-mismatch", "failed", `${variant.id} 缺少 change_type`, { rule_refs: [variant.id] })];
  }

  if (changeType === "inherited") {
    if (!variant.base_rule_ref) {
      out.push(finding("diff.change-type-mismatch", "failed", `${variant.id} 声明 inherited 但没有 base_rule_ref`, { rule_refs: [variant.id] }));
    } else if (!baseIds.has(variant.base_rule_ref)) {
      out.push(finding("diff.change-type-mismatch", "failed", `${variant.id} 的 base_rule_ref ${variant.base_rule_ref} 不存在`, { rule_refs: [variant.id] }));
    }
  }

  if (changeType === "modified") {
    if (!variant.base_rule_ref) {
      out.push(finding("diff.change-type-mismatch", "failed", `${variant.id} 声明 modified 但没有 base_rule_ref`, { rule_refs: [variant.id] }));
    }
    // compares_to 在 Schema 里是可选的（默认 []）：它只影响「对照哪些基座卡」，
    // 不影响归类是否成立。因此空值只提示，不判失败——否则会逼着为过检查而改规则事实。
    if (!variant.compares_to || variant.compares_to.length === 0) {
      out.push(
        finding("diff.change-type-mismatch", "warning", `${variant.id} 声明 modified 但未给 compares_to（对照范围未显式声明）`, {
          rule_refs: [variant.id],
          hint: "建议补 compares_to 指向被对照的基座卡；缺失不影响归类成立",
        }),
      );
    }
  }

  if (changeType === "added") {
    if (variant.base_rule_ref) {
      out.push(
        finding("diff.change-type-mismatch", "failed", `${variant.id} 声明 added 却给了 base_rule_ref（应改为 modified）`, {
          rule_refs: [variant.id],
        }),
      );
    }
    if (variant.compares_to && variant.compares_to.length > 0) {
      out.push(
        finding("diff.change-type-mismatch", "failed", `${variant.id} 声明 added 却给了 compares_to（应改为 modified）`, {
          rule_refs: [variant.id],
        }),
      );
    }
  }
  return out;
}

export interface VariantDiffInput {
  variantCards: ReadonlyArray<CardView>;
  baseCards: ReadonlyArray<CardView>;
  options?: DiffCheckOptions;
}

export interface DiffCheckReport {
  findings: MachineCheckFinding[];
  byRule: Record<string, string[]>;
}

/** 汇总三类检查；输出按规则卡分组，便于 UI 定位 */
export function checkVariantDiffs(input: VariantDiffInput): DiffCheckReport {
  const baseById = new Map(input.baseCards.map((c) => [c.id, c]));
  const baseIds = new Set(baseById.keys());
  const findings: MachineCheckFinding[] = [];
  for (const card of input.variantCards) {
    const base = card.base_rule_ref ? baseById.get(card.base_rule_ref) : undefined;
    findings.push(...checkR3(card, baseIds));
    findings.push(...checkR1(card, base));
    findings.push(...checkR2(card, input.baseCards, input.options));
  }
  const byRule: Record<string, string[]> = {};
  for (const f of findings) {
    const ruleId = f.rule_refs[0] ?? "unknown";
    byRule[ruleId] = [...(byRule[ruleId] ?? []), f.message];
  }
  return { findings, byRule };
}
