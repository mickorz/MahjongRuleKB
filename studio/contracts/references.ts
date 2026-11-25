// 规则引用：四类引用字段。requirement_refs 为可选预留（不要求填值），其余必填可为空数组。
import { z } from "zod";

/** 原子需求 ID（另一条工作流的产物，当前仅作可选预留） */
export const requirementRefPattern = /^[A-Z]{2}-[A-Z]-\d{3}$/;
/** 规则卡 / 配置项 ID */
export const ruleRefPattern = /^[A-Z]{2}-[C-RTNMKFPVIA](-[A-Z0-9]+)+$/;
/** 原文证据引用：文件路径 + 可选章节 */
export const sourceEvidencePattern = /^rulebook\/sources\/[^\s#]+(#[^\s]+)?$/;

export const requirementRefsSchema = z.array(
  z.string().regex(requirementRefPattern, "原子需求 ID 形如 HZ-F-001"),
);
export const ruleRefsSchema = z.array(z.string().regex(ruleRefPattern, "规则 ID 形如 HJ-R-ZHUANGJIA-02"));
export const configRefsSchema = z.array(z.string().regex(ruleRefPattern, "配置 ID 形如 HJ-C-CAISHEN"));
export const sourceEvidenceRefsSchema = z.array(
  z.string().regex(sourceEvidencePattern, "原文证据应形如 rulebook/sources/hangzhou/x.md#2.3.3"),
);

/**
 * 四类引用。
 * - requirement_refs：可选预留，默认空数组；P0 不校验内容完整性
 * - 其余三类：字段必填，值可为空数组
 */
export const referencesSchema = z.object({
  requirement_refs: requirementRefsSchema.default([]),
  rule_refs: ruleRefsSchema,
  config_refs: configRefsSchema,
  source_evidence_refs: sourceEvidenceRefsSchema,
});

export type References = z.infer<typeof referencesSchema>;
