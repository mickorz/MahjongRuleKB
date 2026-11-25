// W0-3：机器检查状态契约测试
// 重点：机器检查结论不得污染 diff_status（评审 P0-1 的核心约束）
import { describe, it, expect } from "vitest";

import {
  isGatePassing,
  machineCheckFindingSchema,
  qualityReportSchema,
  segmentStatusOf,
  statusOfFindings,
  type MachineCheckFinding,
} from "../../../studio/contracts/machine-check.ts";
import { segmentSchema } from "../../../studio/contracts/document.ts";
import { documentFixture, segment } from "../fixtures.ts";

const finding = (over: Partial<MachineCheckFinding> = {}): MachineCheckFinding =>
  machineCheckFindingSchema.parse({
    code: "structure.empty-segment",
    severity: "warning",
    message: "空壳段落",
    segment_ids: ["SEG-000001"],
    rule_refs: [],
    ...over,
  });

describe("W0-3 机器检查状态", () => {
  it("无 finding = passed，有 warning = warning，有 failed = failed", () => {
    expect(statusOfFindings([])).toBe("passed");
    expect(statusOfFindings([finding()])).toBe("warning");
    expect(statusOfFindings([finding(), finding({ severity: "failed", code: "fact.unknown-rule-ref" })])).toBe("failed");
  });

  it("片段级状态只取与本片段相关的 finding", () => {
    const findings = [finding({ segment_ids: ["SEG-000002"] })];
    expect(segmentStatusOf(findings, "SEG-000001")).toBe("passed");
    expect(segmentStatusOf(findings, "SEG-000002")).toBe("warning");
  });

  it("只有 passed 才算过门禁（warning 不放行）", () => {
    expect(isGatePassing("passed")).toBe(true);
    expect(isGatePassing("warning")).toBe(false);
    expect(isGatePassing("failed")).toBe(false);
    expect(isGatePassing("not_checked")).toBe(false);
  });

  it("检查代码必须是注册过的稳定值", () => {
    expect(() => machineCheckFindingSchema.parse({ ...finding(), code: "随便写的" })).toThrow();
  });

  it("报告必须有计数汇总，且形状固定", () => {
    const report = qualityReportSchema.parse({
      ruleset_id: "hangzhou-friends-4p",
      target_variant: "hangzhou",
      document_version: 0,
      checked_at: new Date().toISOString(),
      status: "warning",
      findings: [finding()],
      summary: { total: 1, failed: 0, warning: 1 },
    });
    expect(report.status).toBe("warning");
    expect(() => qualityReportSchema.parse({ ...report, summary: undefined })).toThrow();
  });

  it("机器检查通过后 diff_status 不得被改动（三维独立）", () => {
    const doc = documentFixture();
    const seg = doc.blocks[0].content[0];
    // 机器检查把该片段标为 passed，但 diff_status 保持不变
    const status = segmentStatusOf([], seg.segment_id);
    expect(status).toBe("passed");
    expect(seg.diff_status).toBe("not_applicable");
  });

  it("文档 Schema 接受 machine_check_status，且默认缺省不报错", () => {
    const withStatus = segment("SEG-000001", { machine_check_status: "warning" } as never);
    expect(withStatus.machine_check_status).toBe("warning");
    const without = segment("SEG-000002");
    expect(without.machine_check_status).toBeUndefined();
  });

  it("machine_check_status 非法值被拒（走 Schema）", () => {
    const base = segment("SEG-000003");
    expect(() => segmentSchema.parse({ ...base, machine_check_status: "ok" })).toThrow();
    expect(segmentSchema.parse({ ...base, machine_check_status: "failed" }).machine_check_status).toBe("failed");
  });
});
