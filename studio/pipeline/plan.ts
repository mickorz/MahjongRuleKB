// W1-3：章节规划
// 职责：把「章节装配 + 有效规则集」翻译成每章的生成计划（要覆盖哪些规则、需要哪些要素）。
// 边界：规划是确定性的；AI 只能对规划提建议，落地仍写 document-outline.yaml 并走权限矩阵。
import type { DocumentOutline } from "../contracts/outline.ts";
import { cardSlots, type RuleSetView } from "./read-ruleset.ts";

export interface ChapterPlan {
  section_id: string;
  title: string;
  rule_ids: string[];
  config_ids: string[];
  /** 本章规则卡里实际出现的槽位名，用于提示生成「该交代哪些要素」 */
  beats: string[];
  /** 本章规则依赖了但不在本章的规则（跨章引用，供生成时提示） */
  cross_section_refs: string[];
  /** 建议段落数：规则数 + 配置数，至少 1 */
  target_paragraphs: number;
}

const slotPriority = ["触发", "条件", "步骤", "过程", "结果", "公式", "表", "入账时点", "否则", "中断", "结束", "画面", "位置"];

/** 从一张卡的槽位里挑出「必须交代的要素」，按优先级去重 */
function beatsOf(body: string): string[] {
  const present = new Set(cardSlots(body).map((s) => s.slot));
  return slotPriority.filter((s) => present.has(s));
}

export function planChapters(ruleset: RuleSetView, outline: DocumentOutline): ChapterPlan[] {
  const ruleById = new Map(ruleset.rules.map((r) => [r.id, r]));
  const configById = new Map(ruleset.configs.map((c) => [c.id, c]));
  const sectionOfRule = new Map<string, string>();
  for (const sec of outline.sections) for (const id of sec.rule_refs) sectionOfRule.set(id, sec.section_id);

  return outline.sections.map((sec) => {
    const rules = sec.rule_refs.map((id) => ruleById.get(id)).filter((r): r is NonNullable<typeof r> => Boolean(r));
    const configs = sec.config_refs.map((id) => configById.get(id)).filter((c): c is NonNullable<typeof c> => Boolean(c));
    const beatSet = new Set<string>();
    for (const r of rules) for (const b of beatsOf(r.body)) beatSet.add(b);
    // 跨章引用：本章卡片相互依赖但不在本章的规则，其所属章节记入 cross_section_refs
    const cross = new Set<string>();
    for (const r of rules) {
      for (const dep of r.depends_on ?? []) {
        const other = sectionOfRule.get(dep);
        if (other && other !== sec.section_id) cross.add(other);
      }
    }
    return {
      section_id: sec.section_id,
      title: sec.title,
      rule_ids: rules.map((r) => r.id),
      config_ids: configs.map((c) => c.id),
      beats: slotPriority.filter((b) => beatSet.has(b)),
      cross_section_refs: [...cross],
      target_paragraphs: Math.max(1, rules.length + configs.length),
    };
  });
}

/** 规划自查：每个计划都必须有可覆盖的内容，空章节不应进入生成队列 */
export function assertPlanCoverage(ruleset: RuleSetView, plans: ChapterPlan[]): string[] {
  const plannedRules = new Set(plans.flatMap((p) => p.rule_ids));
  const plannedConfigs = new Set(plans.flatMap((p) => p.config_ids));
  const missing: string[] = [];
  for (const r of ruleset.rules) if (!plannedRules.has(r.id)) missing.push(r.id);
  for (const c of ruleset.configs) if (!plannedConfigs.has(c.id)) missing.push(c.id);
  return missing;
}
