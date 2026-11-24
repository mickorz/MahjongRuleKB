// 配置项 Zod Schema，基础配置和差异配置用同样的 origin / change_type 结构
import { z } from "zod";
import { ruleStatuses, changeTypes } from "./rule.ts";

export const configIdPattern = /^(HJ|XS)-C-[A-Z0-9]+(-[A-Z0-9]+)*$/;

const commonFields = {
  id: z.string().regex(configIdPattern, "配置 ID 格式应为 HJ-C-XXX 或 XS-C-XXX"),
  name: z.string().min(1),
  description: z.string().optional(),
  scope: z.literal("four_player_friend_room").default("four_player_friend_room"),
  status: z.enum(ruleStatuses).default("confirmed"),
  release_blocker: z.boolean().default(false),
  source: z.union([z.string(), z.number()]).transform(String).optional(),
};

/** 基础配置：必须有 value */
export const baseConfigSchema = z.object({
  ...commonFields,
  origin: z.literal("base"),
  value: z.union([z.string(), z.number(), z.boolean()]),
  unit: z.string().optional(),
});

/** 差异配置：inherited 不填 value；modified / added 必须填 value */
export const variantConfigSchema = z
  .object({
    ...commonFields,
    origin: z.literal("variant"),
    change_type: z.enum(changeTypes),
    base_rule_ref: z.string().regex(configIdPattern).optional(),
    value: z.union([z.string(), z.number(), z.boolean()]).optional(),
    unit: z.string().optional(),
    candidates: z.array(z.union([z.string(), z.number(), z.boolean()])).optional(),
    resolution: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.change_type === "inherited") {
      if (v.value !== undefined) {
        ctx.addIssue({ code: "custom", path: ["value"], message: "inherited 配置项不填 value，编译时取基础值" });
      }
      if (v.base_rule_ref === undefined) {
        ctx.addIssue({ code: "custom", path: ["base_rule_ref"], message: "inherited 配置项必须有 base_rule_ref" });
      }
    } else if (v.change_type === "modified") {
      if (v.value === undefined) {
        ctx.addIssue({ code: "custom", path: ["value"], message: "modified 配置项必须填 value" });
      }
      if (v.base_rule_ref === undefined) {
        ctx.addIssue({ code: "custom", path: ["base_rule_ref"], message: "modified 配置项必须有 base_rule_ref" });
      }
    } else {
      if (v.value === undefined) {
        ctx.addIssue({ code: "custom", path: ["value"], message: "added 配置项必须填 value" });
      }
      if (v.base_rule_ref !== undefined) {
        ctx.addIssue({ code: "custom", path: ["base_rule_ref"], message: "added 配置项不允许有 base_rule_ref" });
      }
    }
    // 有候选值时 status 不能是 confirmed
    if (v.candidates && v.candidates.length > 0 && v.status === "confirmed") {
      ctx.addIssue({ code: "custom", path: ["status"], message: "有候选值的配置项 status 不能是 confirmed" });
    }
    if (!v.id.startsWith("XS-")) {
      ctx.addIssue({ code: "custom", path: ["id"], message: "variant 配置 ID 必须以 XS- 开头" });
    }
  });

export const configSchema = z.union([baseConfigSchema, variantConfigSchema]);
export const configListSchema = z.array(configSchema);
export type ConfigItem = z.infer<typeof configSchema>;
export type BaseConfigItem = z.infer<typeof baseConfigSchema>;
export type VariantConfigItem = z.infer<typeof variantConfigSchema>;
