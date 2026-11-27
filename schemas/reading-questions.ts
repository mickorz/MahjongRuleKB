// 阅读验收问题清单 Schema（W1-7）
// 用途：只看生成的需求全文，不看规则卡，回答这些问题。
// 这是 W1 的验收数据，不是规则事实本身——答案以规则卡为准。
import { z } from "zod";

/** 与需求全文的章节 ID 对齐，便于统计覆盖 */
export const readingQuestionSectionValues = [
  "overview",
  "opening",
  "gameplay",
  "contract",
  "scoring",
  "patterns",
  "settlement",
  "ui",
] as const;

export const readingQuestionSchema = z
  .object({
    id: z.string().regex(/^RQ-\d{3}$/, "id 形如 RQ-001"),
    question: z.string().min(8),
    /** 判定要点：答案中出现这些要点即算答对（人工判定，非字符串匹配） */
    expected_points: z.array(z.string().min(1)).min(1),
    /** 答案应来自哪一章；用于检查文档覆盖是否均衡 */
    section_hint: z.enum(readingQuestionSectionValues),
    /** 支撑该答案的规则卡，便于人工复核与定位 */
    rule_refs: z.array(z.string().min(1)).min(1),
    /** 该题是否依赖未决项；为 true 时不允许计入通过率（未决规则本来就无答案） */
    depends_on_unresolved: z.boolean().default(false),
  })
  .strict();
export type ReadingQuestion = z.infer<typeof readingQuestionSchema>;

export const readingQuestionListSchema = z.array(readingQuestionSchema).superRefine((list, ctx) => {
  const seen = new Set<string>();
  for (const q of list) {
    if (seen.has(q.id)) ctx.addIssue({ code: "custom", path: [q.id], message: `id 重复：${q.id}` });
    seen.add(q.id);
  }
});
