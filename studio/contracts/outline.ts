// 章节装配契约：DocumentOutline
// 职责（主需求 11.1）：人工维护 / Stage 2 生成的「章节装配输入」，决定规则与配置如何组织到章节。
// 与 document.json 的区别：outline 是可编辑装配输入；document.json 是生成后的结构唯一事实源。
import { z } from "zod";
import { sectionIdSchema, semverSchema } from "./common.ts";

/** 章节内的一项装配目标：规则卡或配置项 */
export const outlineTargetSchema = z.object({
  rule_refs: z.array(z.string().regex(/^[A-Z]{2}-[RRTNMKFPVIA](-[A-Z0-9]+)+$/)).default([]),
  config_refs: z.array(z.string().regex(/^[A-Z]{2}-C(-[A-Z0-9]+)+$/)).default([]),
});
export type OutlineTarget = z.infer<typeof outlineTargetSchema>;

export const outlineSectionSchema = z
  .object({
    section_id: sectionIdSchema,
    title: z.string().min(1),
    /** 该章节装配的规则卡与配置项；允许为空（例如纯说明章节） */
    rule_refs: z.array(z.string().regex(/^[A-Z]{2}-[A-Z](-[A-Z0-9]+)+$/)).default([]),
    config_refs: z.array(z.string().regex(/^[A-Z]{2}-C(-[A-Z0-9]+)+$/)).default([]),
    /** 交叉引用章节：正文只在本章节展开，其他章节只引用 */
    cross_reference_sections: z.array(sectionIdSchema).default([]),
  })
  .strict()
  .superRefine((sec, ctx) => {
    if (sec.cross_reference_sections.includes(sec.section_id)) {
      ctx.addIssue({ code: "custom", path: ["cross_reference_sections"], message: "章节不能交叉引用自身" });
    }
  });
export type OutlineSection = z.infer<typeof outlineSectionSchema>;

/** 章节装配文件 */
export const documentOutlineSchema = z
  .object({
    template_version: semverSchema,
    sections: z.array(outlineSectionSchema).min(1),
  })
  .strict()
  .superRefine((outline, ctx) => {
    const seen = new Set<string>();
    const assigned = new Map<string, string>();
    for (const sec of outline.sections) {
      if (seen.has(sec.section_id)) {
        ctx.addIssue({ code: "custom", path: ["sections"], message: `section_id 重复：${sec.section_id}` });
      }
      seen.add(sec.section_id);
      // 同一规则 / 配置只能在主章节展开一次
      for (const ref of [...sec.rule_refs, ...sec.config_refs]) {
        const prev = assigned.get(ref);
        if (prev) {
          ctx.addIssue({
            code: "custom",
            path: ["sections"],
            message: `${ref} 同时在 ${prev} 与 ${sec.section_id} 展开；跨章节应使用 cross_reference_sections`,
          });
        } else {
          assigned.set(ref, sec.section_id);
        }
      }
    }
    // 交叉引用必须指向存在的章节
    for (const sec of outline.sections) {
      for (const ref of sec.cross_reference_sections) {
        if (!seen.has(ref)) {
          ctx.addIssue({
            code: "custom",
            path: ["sections"],
            message: `${sec.section_id} 交叉引用了不存在的章节 ${ref}`,
          });
        }
      }
    }
  });
export type DocumentOutline = z.infer<typeof documentOutlineSchema>;
