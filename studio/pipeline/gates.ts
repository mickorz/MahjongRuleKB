// P0-A：Stage 5 覆盖门禁 + Stage 6 渲染
import type { Document } from "../contracts/document.ts";
import type { DocumentOutline } from "../contracts/outline.ts";
import type { RuleSetView } from "./read-ruleset.ts";

export interface CoverageReport {
  ok: boolean;
  /** 本阶段声明范围内的覆盖（P0-A 为单章节，P0-B 为全量） */
  rules: { total: number; covered: number; missing: string[] };
  configs: { total: number; covered: number; missing: string[] };
  /** 规则集中尚未纳入本阶段范围的数量（P0-A 允许 >0） */
  outOfScope: { rules: number; configs: number };
  /** 每个章节的段落数与块 ID */
  sections: Array<{ section_id: string; block_id: string; segments: number }>;
  problems: string[];
}

/**
 * P0-A 覆盖门禁：只检查「已结构化的规则与配置是否完整成文」。
 * 不检查原始需求覆盖（属另一条工作流，见 I-42 / 边界冻结）。
 */
export function checkCoverage(
  ruleset: RuleSetView,
  outline: DocumentOutline,
  document: Document,
): CoverageReport {
  const inDocRules = new Set(document.blocks.flatMap((b) => b.references.rule_refs));
  const inDocConfigs = new Set(document.blocks.flatMap((b) => b.references.config_refs));

  // 本阶段范围：outline 声明的规则与配置（P0-B 才要求全量）
  const scopeRules = [...new Set(outline.sections.flatMap((s) => s.rule_refs))];
  const scopeConfigs = [...new Set(outline.sections.flatMap((s) => s.config_refs))];
  const missingRules = scopeRules.filter((id) => !inDocRules.has(id));
  const missingConfigs = scopeConfigs.filter((id) => !inDocConfigs.has(id));

  const problems: string[] = [];
  // outline 里声明了但文档中没有对应块
  for (const sec of outline.sections) {
    if (!document.blocks.some((b) => b.section_id === sec.section_id)) {
      problems.push(`章节 ${sec.section_id} 在文档中没有块`);
    }
  }
  // 段落必须都可追溯（P0-A 要求 rule/config 至少有一类）
  for (const block of document.blocks) {
    for (const seg of block.content) {
      const { rule_refs, config_refs, source_evidence_refs } = seg.references;
      if (rule_refs.length === 0 && config_refs.length === 0 && source_evidence_refs.length === 0) {
        // 确定性算例允许没有引用，但必须不可编辑
        if (seg.editable) problems.push(`片段 ${seg.segment_id} 无任何引用却可编辑`);
      }
    }
  }

  return {
    ok: missingRules.length === 0 && missingConfigs.length === 0 && problems.length === 0,
    rules: { total: scopeRules.length, covered: scopeRules.length - missingRules.length, missing: missingRules },
    configs: {
      total: scopeConfigs.length,
      covered: scopeConfigs.length - missingConfigs.length,
      missing: missingConfigs,
    },
    outOfScope: {
      rules: ruleset.rules.length - scopeRules.length,
      configs: ruleset.configs.length - scopeConfigs.length,
    },
    sections: document.blocks.map((b) => ({
      section_id: b.section_id,
      block_id: b.block_id,
      segments: b.content.length,
    })),
    problems,
  };
}

const SECTION_TITLES: Record<string, string> = {
  overview: "游戏规则概述",
  terms: "基础名词与概念",
  opening: "开局与发牌",
  gameplay: "行牌规则",
  contract: "三摊承包",
  scoring: "算分规则",
  patterns: "番型规则",
  settlement: "结算流程",
  ui: "UI 交互及表现",
  excluded: "不适用规则",
  pending: "待确认事项",
};

/** Stage 6：Document → Markdown（只读渲染，不产生事实） */
export function renderDocument(document: Document, outline: DocumentOutline): string {
  const titleOf = new Map(outline.sections.map((s) => [s.section_id, s.title]));
  const lines: string[] = [
    `# ${document.ruleset_id} 需求全文`,
    "",
    `> 文档版本：${document.document_version}｜模板：${document.template_version}｜规则集：${document.ruleset_version}`,
    "> 本文由规则集自动生成，是产出物而非事实源；发现问题请修改规则卡后重新生成。",
    "",
  ];
  for (const block of document.blocks) {
    const title = titleOf.get(block.section_id) ?? SECTION_TITLES[block.section_id] ?? block.section_id;
    lines.push(`## ${title}`, "");
    for (const seg of block.content) {
      lines.push(`- ${seg.text}`);
    }
    const refs = [...block.references.rule_refs, ...block.references.config_refs];
    if (refs.length) lines.push("", `来源：${refs.map((r) => `\`${r}\``).join("、")}`);
    lines.push("");
  }
  return `${lines.join("\n").trimEnd()}\n`;
}
