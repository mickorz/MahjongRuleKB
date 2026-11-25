// Rule Studio 领域契约：共享基础值（ID 格式、状态枚举）
// 依据：dev-docs/design/2026-11-24-需求全文生成与变体差异标注.md（v1.8 冻结）
// 与 schemas/ 的边界：schemas/ 描述规则卡与配置；studio/contracts 描述 Rule Studio 的文档与变更领域。
import { z } from "zod";

/** 段落块 ID：DOC-<变体前缀>-<6 位序号>，与章节解耦、与文字内容解耦 */
export const blockIdPattern = /^DOC-[A-Z]{2}-\d{6}$/;
/** 片段 ID：SEG-<6 位序号> */
export const segmentIdPattern = /^SEG-\d{6}$/;
/** 跨变体逻辑段落 ID */
export const logicalBlockIdPattern = /^LBL-[A-Z0-9-]+$/;
/** 章节 ID：小写 kebab-case */
export const sectionIdPattern = /^[a-z][a-z0-9-]*$/;
/** 规则集 ID：如 hangzhou-friends-4p */
export const rulesetIdPattern = /^[a-z]+-[a-z]+-[0-9]+p$/;
/** 文档模板版本 / ruleset 版本：语义化版本 */
export const semverPattern = /^\d+\.\d+\.\d+$/;
/** sha256 十六进制指纹 */
export const sha256Pattern = /^[a-f0-9]{64}$/;
/** 变体目录名 */
export const variantPattern = /^[a-z][a-z0-9-]*$/;

/** 来源关系（lineage）：五类，含基座本身 */
export const lineageValues = ["base", "explicit_inherited", "default_inherited", "modified", "added"] as const;
/** 规则裁决状态 */
export const decisionStatusValues = ["confirmed", "unresolved", "disputed"] as const;
/** 差异审核状态；基座文档使用 not_applicable */
export const diffStatusValues = ["not_applicable", "candidate", "confirmed"] as const;

/** 文档块类型 */
export const blockTypeValues = ["paragraph", "table", "formula", "list", "callout"] as const;

/** Change 生命周期状态（静态契约，不含调度实现） */
export const changeStatusValues = [
  "draft",
  "ready",
  "approved",
  "applying",
  "regenerating",
  "verifying",
  "verified",
  "archived",
  "rejected",
  "stale",
  "blocked",
  "failed",
] as const;

/** Proposal 生命周期状态（只服务人工修改；Stage 生成不进入本状态机） */
export const proposalStatusValues = ["draft", "ready", "approved", "applied", "rejected", "stale", "failed"] as const;

/** Transaction 状态（K0-3 细化行为，这里只固化枚举） */
export const transactionStatusValues = [
  "preparing",
  "prepared",
  "writing",
  "committed",
  "rolled_back",
  "recovery_failed",
] as const;

export const blockIdSchema = z.string().regex(blockIdPattern, "block_id 格式应为 DOC-XX-000000");
export const segmentIdSchema = z.string().regex(segmentIdPattern, "segment_id 格式应为 SEG-000000");
export const logicalBlockIdSchema = z.string().regex(logicalBlockIdPattern, "logical_block_id 格式应为 LBL-...");
export const sectionIdSchema = z.string().regex(sectionIdPattern, "section_id 应为小写 kebab-case");
export const semverSchema = z.string().regex(semverPattern, "版本应为 x.y.z");
export const sha256Schema = z.string().regex(sha256Pattern, "应为 64 位小写十六进制 sha256");
