// P1：changes.json（变体相对基座的差异索引，可重建）
// 依据：设计 v1.8 §3.3（不支持删除）与 AD-37（P1 才生成）
import { z } from "zod";

export const changeEntrySchema = z
  .object({
    rule_id: z.string().min(1),
    /** 基座对照卡；added 无基座 */
    base_rule_ref: z.string().min(1).nullish(),
    /** 第一版只支持 replace / add */
    type: z.enum(["replace", "add"]),
    subject: z.string().min(1),
    /** 差异审核状态：AI 候选需人工确认 */
    diff_status: z.enum(["candidate", "confirmed"]),
    before: z.string().nullish(),
    after: z.string().min(1),
    evidence: z.array(z.string()).default([]),
  })
  .strict()
  .superRefine((e, ctx) => {
    if (e.type === "replace" && !e.base_rule_ref) {
      ctx.addIssue({ code: "custom", path: ["base_rule_ref"], message: "replace 必须有 base_rule_ref" });
    }
    if (e.type === "replace" && !e.before) {
      ctx.addIssue({ code: "custom", path: ["before"], message: "replace 必须有 before 文本" });
    }
  });

export const changesFileSchema = z
  .object({
    ruleset_id: z.string().min(1),
    base_ruleset_id: z.string().min(1),
    base_version: z.string().min(1),
    variant_version: z.string().min(1),
    entries: z.array(changeEntrySchema),
    generated_at: z.string().datetime(),
  })
  .strict();
export type ChangesFile = z.infer<typeof changesFileSchema>;

interface CompiledRuleLike {
  meta: Record<string, unknown> & {
    id: string;
    name: string;
    release_blocker?: boolean;
    base_rule_ref?: string;
    change_type?: string;
    sources?: Array<{ source: string; section?: string }>;
  };
  body: string;
  origin: "base" | "variant";
}

const evidenceOf = (rule: CompiledRuleLike): string[] =>
  (rule.meta.sources ?? []).map((s) => (s.section ? `${s.source}#${s.section}` : s.source));

/** 由编译产物 + 基座卡正文生成 changes.json（只列 modified / added） */
export function buildChangesFile(
  compiled: { rules: CompiledRuleLike[] },
  baseRules: ReadonlyArray<{ id: string; body: string }>,
  meta: { rulesetId: string; baseRulesetId: string; baseVersion: string; variantVersion: string },
  now = new Date().toISOString(),
  /** 已人工确认差异的规则 ID；不传则全部 candidate */
  confirmedRules: ReadonlySet<string> = new Set(),
): ChangesFile {
  const baseById = new Map(baseRules.map((r) => [r.id, r]));
  const entries: ChangesFile["entries"] = [];
  for (const rule of compiled.rules) {
    if (rule.origin !== "variant") continue;
    const changeType = rule.meta.change_type;
    if (changeType !== "modified" && changeType !== "added") continue;
    const baseRef = rule.meta.base_rule_ref ?? null;
    const base = baseRef ? baseById.get(baseRef) : undefined;
    entries.push(
      changeEntrySchema.parse({
        rule_id: rule.meta.id,
        base_rule_ref: baseRef,
        type: changeType === "added" ? "add" : "replace",
        subject: rule.meta.name,
        diff_status: confirmedRules.has(rule.meta.id) ? "confirmed" : "candidate",
        before: base?.body ?? null,
        after: rule.body,
        evidence: evidenceOf(rule),
      }),
    );
  }
  return changesFileSchema.parse({
    ruleset_id: meta.rulesetId,
    base_ruleset_id: meta.baseRulesetId,
    base_version: meta.baseVersion,
    variant_version: meta.variantVersion,
    entries,
    generated_at: now,
  });
}
