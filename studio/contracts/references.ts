// 规则引用：四类引用字段。requirement_refs 为可选预留（不要求填值），其余必填可为空数组。
// 单一事实来源：规则类型字母只在这里定义，其他 Schema 从这里派生，避免各自维护正则。
import { z } from "zod";

/** 规则卡类型字母（不含 C=配置、U=未决） */
export const ruleTypeLetters = ["R", "T", "N", "M", "F", "K", "P", "V", "I", "A"] as const;

/** 规则卡 ID：<前缀>-<类型字母>-<CODE>，如 HJ-R-ZHUANGJIA-02 */
export const ruleRefPattern = new RegExp(`^[A-Z]{2}-[${ruleTypeLetters.join("")}](-[A-Z0-9]+)+$`);
/** 配置项 ID：<前缀>-C-<CODE>，如 HJ-C-CAISHEN */
export const configRefPattern = /^[A-Z]{2}-C(-[A-Z0-9]+)+$/;
/** 未决项 ID，如 XS-U-001 */
export const unresolvedRefPattern = /^[A-Z]{2}-U-\d{3}$/;
/** 原子需求 ID（另一条工作流的产物，当前仅作可选预留） */
export const requirementRefPattern = /^[A-Z]{2}-[A-Z]-\d{3}$/;
/** 原文证据引用：必须位于 rulebook/sources/ 下，可选 #章节 */
/**
 * 原文证据引用：必须位于 rulebook/sources/ 下，可选 `#章节`。
 * 章节号可能含中文、空格与花括号（真实卡：`#2.3.4.2 第 18-21 项`），故不限制 `#` 之后的内容。
 */
export const sourceEvidencePattern = /^rulebook\/sources\/\S+(#.+)?$/;

export const requirementRefsSchema = z.array(
  z.string().regex(requirementRefPattern, "原子需求 ID 形如 HZ-F-001"),
);
/** 规则引用：禁止填配置项 ID */
export const ruleRefsSchema = z.array(z.string().regex(ruleRefPattern, "规则 ID 形如 HJ-R-ZHUANGJIA-02"));
/** 配置引用：禁止填规则卡 ID */
export const configRefsSchema = z.array(z.string().regex(configRefPattern, "配置 ID 形如 HJ-C-CAISHEN"));
export const sourceEvidenceRefsSchema = z.array(
  z.string().regex(sourceEvidencePattern, "原文证据应形如 rulebook/sources/hangzhou/x.md#2.3.3"),
);

/**
 * 四类引用。
 * - requirement_refs：可选预留，默认空数组；P0 不校验内容完整性
 * - 其余三类：字段必填，值可为空数组
 * 未知字段一律拒绝（strict）。
 */
export const referencesSchema = z
  .object({
    requirement_refs: requirementRefsSchema.default([]),
    rule_refs: ruleRefsSchema,
    config_refs: configRefsSchema,
    source_evidence_refs: sourceEvidenceRefsSchema,
  })
  .strict();

export type References = z.infer<typeof referencesSchema>;
