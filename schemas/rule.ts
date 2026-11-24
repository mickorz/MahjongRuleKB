// 规则卡 YAML 元数据的 Zod Schema
// 基础卡（origin: base）和差异卡（origin: variant）是两个对象，字段约束不同
import { z } from "zod";

/** 11 种规则二级类型（4 个一级领域 + 11 个二级类型） */
export const ruleTypes = [
  "judgment", // 判定 R
  "timing", // 时序 T
  "counter", // 计数 N
  "record", // 记录 M
  "formula", // 公式 F
  "lookup", // 查表 K
  "settlement", // 入账分配 P
  "static-ui", // 静态常显 V
  "interaction", // 交互 I
  "animation", // 动效 A
] as const;
export type RuleType = (typeof ruleTypes)[number];

/** ID 类型前缀段 → 类型的映射 */
export const idPrefixToType: Record<string, RuleType> = {
  R: "judgment",
  T: "timing",
  N: "counter",
  M: "record",
  F: "formula",
  K: "lookup",
  P: "settlement",
  V: "static-ui",
  I: "interaction",
  A: "animation",
};

export const ruleStatuses = ["confirmed", "inferred", "unresolved", "disputed"] as const;
export const changeTypes = ["inherited", "modified", "added"] as const;

/** 规则 ID 格式：HJ-R-BANK-02 / XS-R-ZHUANGJIA-02；配置 ID：HJ-C-DIFEN。depends_on 可引用配置项 */
export const ruleIdPattern = /^(HJ|XS)-[CRFKNMTPVIA]-[A-Z0-9]+(-[A-Z0-9]+)*$/;

const sourceSchema = z.object({
  source: z.string().min(1),
  section: z.union([z.string(), z.number()]).transform(String),
});

const commonFields = {
  id: z.string().regex(ruleIdPattern, "规则 ID 格式应为 HJ-R-XXX 或 XS-R-XXX"),
  type: z.enum(ruleTypes),
  name: z.string().min(1),
  scope: z.literal("four_player_friend_room"),
  status: z.enum(ruleStatuses).default("confirmed"),
  release_blocker: z.boolean().default(false),
  sources: z.array(sourceSchema).min(1),
  depends_on: z.array(z.string().regex(ruleIdPattern)).default([]),
};

/** 基础卡：没有 change_type / base_rule_ref / compares_to */
export const baseRuleMetaSchema = z.object({
  ...commonFields,
  origin: z.literal("base"),
});

/** 差异卡：必须有 change_type，引用字段按 change_type 约束 */
export const variantRuleMetaSchema = z
  .object({
    ...commonFields,
    origin: z.literal("variant"),
    change_type: z.enum(changeTypes),
    base_rule_ref: z.string().regex(ruleIdPattern).optional(),
    compares_to: z.array(z.string().regex(ruleIdPattern)).default([]),
  })
  .superRefine((v, ctx) => {
    if (v.change_type === "added") {
      if (v.base_rule_ref !== undefined) {
        ctx.addIssue({ code: "custom", path: ["base_rule_ref"], message: "added 卡不允许有 base_rule_ref" });
      }
    } else {
      if (v.base_rule_ref === undefined) {
        ctx.addIssue({ code: "custom", path: ["base_rule_ref"], message: `${v.change_type} 卡必须有 base_rule_ref` });
      }
    }
    if (!v.id.startsWith("XS-")) {
      ctx.addIssue({ code: "custom", path: ["id"], message: "variant 卡 ID 必须以 XS- 开头" });
    }
  });

/** 联合：先按 origin 字段分发（Node type stripping 下 discriminatedUnion 拿不到 shape，手动分发） */
export const ruleMetaSchema = z.union([baseRuleMetaSchema, variantRuleMetaSchema]).superRefine((v, ctx) => {
  if (v.origin === "base" && !v.id.startsWith("HJ-")) {
    ctx.addIssue({ code: "custom", path: ["id"], message: "base 卡 ID 必须以 HJ- 开头" });
  }
});
export type RuleMeta = z.infer<typeof ruleMetaSchema>;
export type BaseRuleMeta = z.infer<typeof baseRuleMetaSchema>;
export type VariantRuleMeta = z.infer<typeof variantRuleMetaSchema>;
