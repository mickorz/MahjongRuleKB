// W1-6：连贯性与事实检查（A 结构 / B 事实）
// 对应评审 P1-3：关键词与长度不能作为主要判据。
// A 类（结构）与 B 类（事实）由程序判定；C 类可读性交人工问答，不在本模块。
import {
  machineCheckFindingSchema,
  statusOfFindings,
  type MachineCheckCode,
  type MachineCheckFinding,
  type MachineCheckStatus,
} from "../contracts/machine-check.ts";
import type { Document, Segment } from "../contracts/document.ts";
import type { DocumentOutline } from "../contracts/outline.ts";
import { checkNumericTraceability } from "./numeric-guard.ts";
import { sectionOrder } from "./outline-hangzhou.ts";
import type { RuleSetView } from "./read-ruleset.ts";

export interface CoherenceContext {
  ruleset: RuleSetView;
  /** calculators 产出的确定性数值 */
  calculatorValues?: ReadonlyArray<string>;
  /** 章节顺序基准（默认共享模板顺序） */
  sectionOrder?: ReadonlyArray<string>;
}

/** 结构顺序：开局 < 行牌 < 承包 < 算分 < 番型 < 结算 < 界面 */
const defaultOrder: ReadonlyArray<string> = sectionOrder;

const finding = (code: MachineCheckCode, message: string, extra: Partial<MachineCheckFinding> = {}) =>
  machineCheckFindingSchema.parse({
    code,
    severity: "warning",
    message,
    segment_ids: [],
    rule_refs: [],
    ...extra,
  });

/** A 类：结构完整性 */
export function checkStructure(document: Document, outline: DocumentOutline, ctx: CoherenceContext = { ruleset: { rules: [] } as never }): MachineCheckFinding[] {
  const findings: MachineCheckFinding[] = [];
  const order = ctx.sectionOrder ?? defaultOrder;

  // 1. 声明的章节必须有块
  const present = new Set(document.blocks.map((b) => b.section_id));
  for (const sec of outline.sections) {
    if (!present.has(sec.section_id)) {
      findings.push(finding("structure.missing-section", `章节 ${sec.section_id} 未产出`, { severity: "failed" }));
    }
  }

  // 2. 空壳段落：无引用且极短（不再用「不含 · 且长度 < 12」单判据）
  for (const block of document.blocks) {
    for (const seg of block.content) {
      const hasRefs = seg.references.rule_refs.length + seg.references.config_refs.length > 0;
      const short = seg.text.replace(/\s+/g, "").length < 8;
      if (short && !hasRefs) {
        findings.push(
          finding("structure.empty-segment", `片段 ${seg.segment_id} 过短且无来源引用：「${seg.text}」`, {
            segment_ids: [seg.segment_id],
          }),
        );
      }
    }
  }

  // 3. 章节顺序必须合法
  let lastIndex = -1;
  for (const block of document.blocks) {
    const idx = order.indexOf(block.section_id);
    if (idx < 0) continue;
    if (idx < lastIndex) {
      findings.push(finding("structure.section-order", `章节 ${block.section_id} 出现在其应在位置之前`, { severity: "failed" }));
    }
    lastIndex = Math.max(lastIndex, idx);
  }

  // 4. 正文里引用的章节名必须存在（形如「见第三章」这类跨章引用由规则卡生成，此处只查 section_id 引用）
  const known = new Set(outline.sections.map((sec) => sec.section_id));
  for (const block of document.blocks) {
    for (const seg of block.content) {
      for (const m of seg.text.matchAll(/section:([a-z0-9-]+)/g)) {
        if (!known.has(m[1])) {
          findings.push(
            finding("structure.dangling-cross-reference", `跨章引用指向不存在的章节：${m[1]}`, {
              segment_ids: [seg.segment_id],
            }),
          );
        }
      }
    }
  }
  return findings;
}

/** B 类：规则事实一致性 */
export function checkFacts(document: Document, ctx: CoherenceContext): MachineCheckFinding[] {
  const findings: MachineCheckFinding[] = [];
  const knownRules = new Set(ctx.ruleset.rules.map((r) => r.id));
  const knownConfigs = new Set(ctx.ruleset.configs.map((c) => c.id));
  const ruleBodies = new Map(ctx.ruleset.rules.map((r) => [r.id, r.body]));
  // 配置项的 value 与 description 都是规则事实的一部分（description 常写具体约束，如「剩 21 张时禁止杠」）
  const configValues = new Map(
    ctx.ruleset.configs.map((c) => [c.id, [String(c.value), c.description ?? ""].join(" ").trim()]),
  );

  for (const block of document.blocks) {
    for (const seg of block.content) {
      // 引用必须存在
      for (const ref of seg.references.rule_refs) {
        if (!knownRules.has(ref)) {
          findings.push(
            finding("fact.unknown-rule-ref", `片段 ${seg.segment_id} 引用了不存在的规则 ${ref}`, {
              severity: "failed",
              segment_ids: [seg.segment_id],
              rule_refs: [ref],
            }),
          );
        }
      }
      for (const ref of seg.references.config_refs) {
        if (!knownConfigs.has(ref)) {
          findings.push(
            finding("fact.unknown-config-ref", `片段 ${seg.segment_id} 引用了不存在的配置 ${ref}`, {
              severity: "failed",
              segment_ids: [seg.segment_id],
              rule_refs: [ref],
            }),
          );
        }
      }

      // 未决项不得被写成已确认
      if (seg.release_blocker_refs.length > 0 && seg.decision_status === "confirmed") {
        findings.push(
          finding("fact.blocker-marked-confirmed", `未决项 ${seg.release_blocker_refs.join(", ")} 被写成 confirmed`, {
            severity: "failed",
            segment_ids: [seg.segment_id],
          }),
        );
      }

      // 数值可追溯（只查可编辑片段：不可编辑的是计算器产物）
      if (seg.editable) {
        const numeric = checkNumericTraceability(
          seg.text,
          { ruleRefs: seg.references.rule_refs, configRefs: seg.references.config_refs },
          { ruleBodies, configValues, calculatorValues: ctx.calculatorValues },
        );
        for (const f of numeric) {
          findings.push({ ...f, segment_ids: [seg.segment_id] });
        }
      }
    }
  }
  return findings;
}

export interface CoherenceReport {
  status: MachineCheckStatus;
  findings: MachineCheckFinding[];
  structure: MachineCheckFinding[];
  facts: MachineCheckFinding[];
}

export function checkCoherence(document: Document, outline: DocumentOutline, ctx: CoherenceContext): CoherenceReport {
  const structure = checkStructure(document, outline, ctx);
  const facts = checkFacts(document, ctx);
  const findings = [...structure, ...facts];
  return { status: statusOfFindings(findings), findings, structure, facts };
}

/** 把检查结论写回片段级 machine_check_status（不改 diff_status） */
export function applyMachineStatus(document: Document, findings: ReadonlyArray<MachineCheckFinding>): Document {
  const failed = new Set(findings.filter((f) => f.severity === "failed").flatMap((f) => f.segment_ids));
  const warned = new Set(findings.filter((f) => f.severity === "warning").flatMap((f) => f.segment_ids));
  const blocks = document.blocks.map((b) => ({
    ...b,
    content: b.content.map((s: Segment) => ({
      ...s,
      machine_check_status: failed.has(s.segment_id) ? ("failed" as const) : warned.has(s.segment_id) ? ("warning" as const) : s.machine_check_status ?? ("passed" as const),
    })),
  }));
  return { ...document, blocks };
}
