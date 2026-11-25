// 变更契约：Change Package 与 Artifact 的静态数据形状
// K0-1 只定义数据契约；不实现 create/update/resume、Artifact Graph 计算、Verify/Archive、多 Proposal 调度。
import { z } from "zod";
import { changeStatusValues, semverSchema, sha256Schema, variantPattern, rulesetIdPattern } from "./common.ts";

/** Change 内的产物类型（固定集合，不做通用 Schema 引擎） */
export const artifactKindValues = [
  "proposal",
  "diff",
  "impact",
  "validation",
  "approval",
  "verify",
  "change",
  "regeneration",
] as const;

/** 产物状态：可否继续生成由 Artifact Graph 在后续阶段计算 */
export const artifactStatusValues = ["missing", "candidate", "ready", "stale", "failed", "confirmed"] as const;

export const artifactSchema = z.object({
  artifact_id: z.string().regex(/^ART-[A-Z0-9-]+$/, "artifact_id 形如 ART-DIFF-01"),
  kind: z.enum(artifactKindValues),
  status: z.enum(artifactStatusValues),
  /** 生成该产物时的输入指纹；输入变化即失效 */
  input_hash: sha256Schema.nullish(),
  /** 产物文件相对路径；不放绝对路径 */
  path: z.string().min(1).nullish(),
  generated_at: z.string().datetime().nullish(),
}).strict();
export type Artifact = z.infer<typeof artifactSchema>;

/** Change Package 的静态数据契约 */
export const changeSchema = z
  .object({
    change_id: z.string().regex(/^CHG-\d{3}$/, "change_id 形如 CHG-001"),
    status: z.enum(changeStatusValues),
    ruleset_id: z.string().regex(rulesetIdPattern),
    target_variant: z.string().regex(variantPattern),
    template_version: semverSchema,
    /** 变更意图与范围（人类可读） */
    intent: z.string().min(1),
    scope: z.array(z.string().min(1)).default([]),
    /** 成员提案 ID：同一 Change 可包含多个 Proposal */
    proposal_ids: z.array(z.string().regex(/^DOC-P-\d{3}$/)).default([]),
    artifacts: z.array(artifactSchema).default([]),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    /** Verify 通过后的归档路径（P1+ 才产生） */
    archive_path: z.string().min(1).nullish(),
  })
  .strict()
  .superRefine((change, ctx) => {
    const kinds = new Set<string>();
    for (const a of change.artifacts) {
      if (kinds.has(a.artifact_id)) {
        ctx.addIssue({ code: "custom", path: ["artifacts"], message: `artifact_id 重复：${a.artifact_id}` });
      }
      kinds.add(a.artifact_id);
      if (a.status === "ready" || a.status === "confirmed") {
        if (!a.input_hash) {
          ctx.addIssue({
            code: "custom",
            path: ["artifacts"],
            message: `${a.artifact_id} 处于 ${a.status} 但缺少 input_hash`,
          });
        }
      }
    }
    // 归档状态与归档路径必须同时存在
    if (change.status === "archived" && !change.archive_path) {
      ctx.addIssue({ code: "custom", path: ["archive_path"], message: "archived 的 Change 必须有 archive_path" });
    }
    if (change.status !== "archived" && change.archive_path) {
      ctx.addIssue({ code: "custom", path: ["archive_path"], message: "非 archived 的 Change 不应有 archive_path" });
    }
    if (new Date(change.updated_at).getTime() < new Date(change.created_at).getTime()) {
      ctx.addIssue({ code: "custom", path: ["updated_at"], message: "updated_at 不能早于 created_at" });
    }
  });
export type Change = z.infer<typeof changeSchema>;
