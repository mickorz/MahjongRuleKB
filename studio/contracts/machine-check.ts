// W0-3：机器检查状态契约
// 边界（对应评审 P0-1）：本契约只表达「机器检查结论」，与
//   diff_status（人工是否确认差异）、ReviewRecord（策划是否完成审查）互不替代。
// 任何「机器检查通过 → 自动置 diff_status=confirmed」的写法都是错的，测试见
// tests/studio/contracts/machine-check.test.ts。
import { z } from "zod";

export const machineCheckStatusValues = ["not_checked", "passed", "warning", "failed"] as const;
export type MachineCheckStatus = (typeof machineCheckStatusValues)[number];

/** 检查项代码：稳定字符串，进报告与 UI，不随文案变化 */
export const machineCheckCodeValues = [
  // 结构完整性（A 类）
  "structure.empty-segment",
  "structure.missing-section",
  "structure.dangling-cross-reference",
  "structure.section-order",
  // 规则事实一致性（B 类）
  "fact.unknown-rule-ref",
  "fact.unknown-config-ref",
  "fact.untraceable-number",
  "fact.blocker-marked-confirmed",
  // 变体差异（R1/R2/R3）
  "diff.missing-base-slot",
  "diff.suspected-duplicate",
  "diff.change-type-mismatch",
  // 继承一致性
  "inherit.text-drift",
  "inherit.segment-missing",
] as const;
export type MachineCheckCode = (typeof machineCheckCodeValues)[number];

export const machineCheckFindingSchema = z
  .object({
    code: z.enum(machineCheckCodeValues),
    severity: z.enum(["warning", "failed"]),
    message: z.string().min(1),
    /** 受影响的片段；检查对象是卡片级时可为空 */
    segment_ids: z.array(z.string().min(1)).default([]),
    rule_refs: z.array(z.string().min(1)).default([]),
    /** 修复建议，便于 UI 直接展示 */
    hint: z.string().optional(),
  })
  .strict();
export type MachineCheckFinding = z.infer<typeof machineCheckFindingSchema>;

/** 机器检查报告文件（documents/<variant>/quality-report.json 的内容形状） */
export const qualityReportSchema = z
  .object({
    ruleset_id: z.string().min(1),
    target_variant: z.string().min(1),
    document_version: z.number().int().nonnegative(),
    checked_at: z.string().datetime(),
    status: z.enum(machineCheckStatusValues),
    findings: z.array(machineCheckFindingSchema),
    /** 计数汇总，便于报表与门禁读取 */
    summary: z
      .object({
        total: z.number().int().nonnegative(),
        failed: z.number().int().nonnegative(),
        warning: z.number().int().nonnegative(),
      })
      .strict(),
  })
  .strict();
export type QualityReport = z.infer<typeof qualityReportSchema>;

/** 由 findings 推出整体状态：有 failed 即 failed，有 warning 即 warning，否则 passed */
export function statusOfFindings(findings: ReadonlyArray<MachineCheckFinding>): MachineCheckStatus {
  if (findings.some((f) => f.severity === "failed")) return "failed";
  if (findings.some((f) => f.severity === "warning")) return "warning";
  return "passed";
}

/** 片段级状态：只取与该片段相关的 findings 汇总 */
export function segmentStatusOf(
  findings: ReadonlyArray<MachineCheckFinding>,
  segmentId: string,
): MachineCheckStatus {
  const own = findings.filter((f) => f.segment_ids.includes(segmentId));
  return own.length === 0 ? "passed" : statusOfFindings(own);
}

/**
 * 门禁判定：只有 passed 才允许产出最终文档。
 * warning 不等于通过——它表示「有可命名的问题需要人看」，由调用方决定是否放行。
 */
export function isGatePassing(status: MachineCheckStatus): boolean {
  return status === "passed";
}
