// 未决清单 Zod Schema
import { z } from "zod";
import { ruleStatuses } from "./rule.ts";

export const unresolvedEntrySchema = z.object({
  id: z.string().regex(/^(HJ|XS)-U-\d{3}$/, "未决 ID 格式应为 XS-U-001"),
  card_ref: z.string().regex(/^(HJ|XS)-[CRFKNMTPVIA]-[A-Z0-9]+(-[A-Z0-9]+)*$/, "必须指向存在的卡或配置项"),
  description: z.string().min(1),
  status: z.enum(ruleStatuses),
  release_blocker: z.boolean(),
  resolution: z.string().nullable().optional(),
}).superRefine((entry, ctx) => {
  if (entry.status === "confirmed" && (!entry.resolution || entry.resolution.trim().length === 0)) {
    ctx.addIssue({ code: "custom", path: ["resolution"], message: "confirmed 未决项必须有非空 resolution" });
  }
});

export const unresolvedListSchema = z.array(unresolvedEntrySchema);
export type UnresolvedEntry = z.infer<typeof unresolvedEntrySchema>;
