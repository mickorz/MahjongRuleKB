// P0-A：Stage 2/3 —— 章节装配 → Document Block 生成
// 只用冻结契约表达结果：lineage=base、diff_status=not_applicable、片段引用来自规则卡自身来源。
import {
  documentSchema,
  looksLikeFormula,
  numericOnlyPattern,
  type Document,
  type DocumentBlock,
  type Segment,
} from "../contracts/document.ts";
import type { DocumentOutline } from "../contracts/outline.ts";
import { calculateBankerMultiplier } from "../../calculators/banker-multiplier.ts";
import type { RuleSetView } from "./read-ruleset.ts";
import { slotText } from "./read-ruleset.ts";

export interface GenerateOptions {
  /** 生成任务使用的模板版本 */
  templateVersion: string;
  /** 初始文档版本（Stage 首次生成通常为 0） */
  documentVersion?: number;
  /** 变体名，用于 DOC-<前缀> 块 ID */
  variant: string;
}

export interface GenerateResult {
  document: Document;
  /** 未分配到任何章节的规则 / 配置 */
  unassigned: { rules: string[]; configs: string[] };
}

const variantCode = (variant: string): string => {
  const seg = variant.replace(/[^a-z]/g, "").slice(0, 2).toUpperCase();
  return seg.padEnd(2, "X");
};

const pad = (n: number, width: number) => String(n).padStart(width, "0");

/** 规则卡正文里挑一个可读槽位作为段落文本 */
function ruleText(body: string, name: string): string {
  const preferred = ["结果", "触发", "公式", "表", "入账时点", "步骤", "画面", "位置"];
  for (const slot of preferred) {
    const text = slotText(body, slot);
    if (text) return `${name}：${text.replace(/\r?\n/g, " ").trim()}`;
  }
  return name;
}

/**
 * Stage 3：按 outline 生成 Document Block。
 * - 每个章节一个块；块内按「规则 → 配置 → 确定性算例」顺序生成片段
 * - 所有片段 lineage=base、diff_status=not_applicable（P0-A 为基座文档）
 * - 数值片段 editable=false，数值来自 calculators
 */
export function generateDocument(
  ruleset: RuleSetView,
  outline: DocumentOutline,
  opts: GenerateOptions,
): GenerateResult {
  const rulesById = new Map(ruleset.rules.map((r) => [r.id, r]));
  const configById = new Map(ruleset.configs.map((c) => [c.id, c]));
  const assignedRules = new Set<string>();
  const assignedConfigs = new Set<string>();

  const documentVersion = opts.documentVersion ?? 0;
  const code = variantCode(opts.variant);
  let blockSeq = 0;
  let segmentSeq = 0;

  const blocks: DocumentBlock[] = [];
  for (const section of outline.sections) {
    const segments: Segment[] = [];

    for (const ruleId of section.rule_refs) {
      const rule = rulesById.get(ruleId);
      if (!rule) continue;
      assignedRules.add(ruleId);
      segmentSeq += 1;
      segments.push({
        segment_id: `SEG-${pad(segmentSeq, 6)}`,
        text: ruleText(rule.body, rule.name),
        editable: !looksLikeFormula(ruleText(rule.body, rule.name)) && !numericOnlyPattern.test(ruleText(rule.body, rule.name)),
        lineage: "base",
        decision_status: "confirmed",
        diff_status: "not_applicable",
        release_blocker_refs: [],
        references: {
          requirement_refs: [],
          rule_refs: [ruleId],
          config_refs: [],
          source_evidence_refs: rule.evidence,
        },
      });
    }

    for (const configId of section.config_refs) {
      const config = configById.get(configId);
      if (!config) continue;
      assignedConfigs.add(configId);
      segmentSeq += 1;
      const configText = `${config.name}：${String(config.value)}${config.description ? `（${config.description}）` : ""}`;
      segments.push({
        segment_id: `SEG-${pad(segmentSeq, 6)}`,
        text: configText,
        editable: !looksLikeFormula(configText) && !numericOnlyPattern.test(configText),
        lineage: "base",
        decision_status: "confirmed",
        diff_status: "not_applicable",
        release_blocker_refs: [],
        references: {
          requirement_refs: [],
          rule_refs: [],
          config_refs: [configId],
          source_evidence_refs: [],
        },
      });
    }

    // 算分章节附加一个确定性算例（数值来自 calculators，AI 不得改写）
    if (section.section_id === "scoring" && assignedRules.size > 0) {
      const multiplier = calculateBankerMultiplier({
        ruleset_id: ruleset.rulesetId as "hangzhou-friends-4p" | "xiaoshan-friends-4p",
        winner_is_banker: true,
        payer_is_banker: false,
      });
      segmentSeq += 1;
      segments.push({
        segment_id: `SEG-${pad(segmentSeq, 6)}`,
        text: `庄家自摸时每笔庄闲倍率：${multiplier}`,
        editable: false,
        lineage: "base",
        decision_status: "confirmed",
        diff_status: "not_applicable",
        release_blocker_refs: [],
        references: {
          requirement_refs: [],
          rule_refs: [],
          config_refs: [],
          source_evidence_refs: [],
        },
      });
    }

    if (segments.length === 0) continue;

    blockSeq += 1;
    const union = {
      requirement_refs: [...new Set(segments.flatMap((s) => s.references.requirement_refs))],
      rule_refs: [...new Set(segments.flatMap((s) => s.references.rule_refs))],
      config_refs: [...new Set(segments.flatMap((s) => s.references.config_refs))],
      source_evidence_refs: [...new Set(segments.flatMap((s) => s.references.source_evidence_refs))],
    };
    blocks.push({
      block_id: `DOC-${code}-${pad(blockSeq, 6)}`,
      logical_block_id: `LBL-${section.section_id.toUpperCase()}-01`,
      section_id: section.section_id,
      type: "paragraph",
      document_version: documentVersion,
      content: segments,
      references: union,
    });
  }

  const document = documentSchema.parse({
    ruleset_id: ruleset.rulesetId,
    target_variant: opts.variant,
    template_version: opts.templateVersion,
    ruleset_version: ruleset.version,
    document_version: documentVersion,
    blocks,
    segment_lineage: [],
  });

  const unassignedRules = ruleset.rules.filter((r) => !assignedRules.has(r.id)).map((r) => r.id);
  const unassignedConfigs = ruleset.configs.filter((c) => !assignedConfigs.has(c.id)).map((c) => c.id);
  return { document, unassigned: { rules: unassignedRules, configs: unassignedConfigs } };
}
