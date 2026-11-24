import { z } from "zod";

export const goldSetStatusSchema = z.object({
  status: z.enum(["draft", "verified"]),
  by: z.string().optional(),
  source: z.string().min(1),
});

export const goldSetAutomationSchema = z.object({
  status: z.enum(["none", "automated"]),
  test_ref: z.string().optional(),
}).superRefine((v, ctx) => {
  if (v.status === "automated" && !v.test_ref) ctx.addIssue({ code: "custom", path: ["test_ref"], message: "automated 必须提供 test_ref" });
});

export const goldSetCaseSchema = z.object({
  id: z.string().regex(/^TC-[A-Z0-9_-]+$/),
  name: z.string().min(1),
  ruleset_id: z.enum(["hangzhou-friends-4p", "xiaoshan-friends-4p"]),
  rule_refs: z.array(z.string()).min(1),
  input: z.record(z.unknown()),
  expected: z.record(z.unknown()),
  verification: goldSetStatusSchema,
  automation: goldSetAutomationSchema,
});

export const goldSetListSchema = z.array(goldSetCaseSchema);
export type GoldSetCase = z.infer<typeof goldSetCaseSchema>;
