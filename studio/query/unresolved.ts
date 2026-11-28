// Rule Copilot 查询层：未决项（第三批 1/3）
//
// 数据源：snapshot.unresolved（variants/<v>/unresolved.yaml）与 unresolvedByCard。
// 语义：
// - 默认返回全部（萧山当前 17 条），只有 only_blockers=true 才收敛到 release_blocker 的 3 条；
// - card_ref 精确过滤（支持规则卡与配置项）；
// - 与 search_rules / get_rule 的 unresolved_refs 同源，不允许两边结论不一致。
import { z } from "zod";

import { ruleIdPattern, ruleStatuses } from "../../schemas/rule.ts";
import { buildSnapshot, type QueryOptions, type RuleSetSnapshot } from "./rules.ts";
import { invalidParams, type Citation, type QueryContext, type ToolResult } from "./types.ts";

export const listUnresolvedInputSchema = z
  .object({
    variant: z.string(),
    only_blockers: z.boolean().default(false),
    status: z.enum(ruleStatuses).optional(),
    /** 只看某张规则卡 / 某个配置项的未决项 */
    card_ref: z.string().regex(ruleIdPattern).optional(),
  })
  .strict();

export type ListUnresolvedInput = z.infer<typeof listUnresolvedInputSchema>;

export interface UnresolvedItemView {
  id: string;
  card_ref: string;
  /** 指向的卡名（能解析时给出，便于模型直接引用） */
  card_name?: string;
  description: string;
  status: (typeof ruleStatuses)[number];
  release_blocker: boolean;
  resolution: string | null;
}

export interface ListUnresolvedOutput {
  total: number;
  /** 是否可发布：无 release_blocker 未决项时为 true */
  releasable: boolean;
  blockers: number;
  items: UnresolvedItemView[];
}

function cardNameOf(snapshot: RuleSetSnapshot, cardRef: string): string | undefined {
  const key = cardRef.toUpperCase();
  const rule = snapshot.rules.get(key) ?? snapshot.base?.rules.get(key);
  if (rule) return rule.meta.name;
  const config = snapshot.configs.get(key) ?? snapshot.base?.configs.get(key);
  if (config) return config.name;
  return undefined;
}

export function listUnresolved(
  rawInput: unknown,
  options: QueryOptions = {},
): ToolResult<ListUnresolvedOutput> {
  const parsed = listUnresolvedInputSchema.safeParse(rawInput);
  if (!parsed.success) return invalidParams(parsed.error);
  const input = parsed.data;

  const snapshotResult = buildSnapshot(input.variant, options);
  if (!snapshotResult.ok) return snapshotResult;
  const snapshot = snapshotResult.data;

  // 未决清单属于"当前规则集自身"（变体清单在 variants/<v>/，基座暂无）
  const source = snapshot.unresolved;
  const blockers = source.filter((u) => u.release_blocker).length;

  let items: UnresolvedItemView[] = source.map((u) => {
    const name = cardNameOf(snapshot, u.card_ref);
    return {
      id: u.id,
      card_ref: u.card_ref,
      ...(name ? { card_name: name } : {}),
      description: u.description,
      status: u.status,
      release_blocker: u.release_blocker,
      resolution: u.resolution ?? null,
    };
  });

  if (input.only_blockers) items = items.filter((i) => i.release_blocker);
  if (input.status) items = items.filter((i) => i.status === input.status);
  if (input.card_ref) {
    const wanted = input.card_ref.toUpperCase();
    items = items.filter((i) => i.card_ref.toUpperCase() === wanted);
  }

  items.sort((a, b) => a.id.localeCompare(b.id));

  const citations: Citation[] = items.map((i) => ({ kind: "unresolved", id: i.id }));

  return {
    ok: true,
    data: {
      total: items.length,
      // releasable 以"当前规则集是否存在阻塞项"为准，不受本次过滤影响
      releasable: blockers === 0,
      blockers,
      items,
    },
    context: snapshot.context,
    citations,
  };
}

/** 供 compare / 后续工具复用：按卡取未决项 ID（与 search_rules 的 unresolved_refs 同源） */
export function unresolvedIdsForCard(snapshot: RuleSetSnapshot, cardRef: string): string[] {
  return (snapshot.unresolvedByCard.get(cardRef.toUpperCase()) ?? []).map((u) => u.id).sort();
}
