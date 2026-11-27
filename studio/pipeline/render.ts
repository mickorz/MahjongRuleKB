// P0-A/P1：Document → Markdown 渲染
// 覆盖门禁与文档渲染放在同一模块：门禁结论与最终呈现必须基于同一份 Document。
import { looksLikeFormula, numericOnlyPattern, type Document, type DocumentBlock, type Segment } from "../contracts/document.ts";
import type { DocumentOutline } from "../contracts/outline.ts";
import type { RuleSetView } from "./read-ruleset.ts";

export const SECTION_TITLES: Record<string, string> = {
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

export interface CoverageReport {
  ok: boolean;
  sections: Array<{ section_id: string; block_id: string; segments: number }>;
  rules: { total: number; covered: number; missing: string[] };
  configs: { total: number; covered: number; missing: string[] };
  /** 规则集中尚未纳入本阶段范围的数量（P0-A 允许 >0） */
  outOfScope: { rules: number; configs: number };
  problems: string[];
}

/** 覆盖门禁：只按声明范围（outline）统计，范围外引用单独报告 */
export function checkCoverage(ruleset: RuleSetView, outline: DocumentOutline, document: Document): CoverageReport {
  const declaredRules = new Set(outline.sections.flatMap((s) => s.rule_refs));
  const declaredConfigs = new Set(outline.sections.flatMap((s) => s.config_refs));
  const docRules = new Set(document.blocks.flatMap((b) => b.content.flatMap((s) => s.references.rule_refs)));
  const docConfigs = new Set(document.blocks.flatMap((b) => b.content.flatMap((s) => s.references.config_refs)));

  const rulesInScope = ruleset.rules.filter((r) => declaredRules.has(r.id));
  const configsInScope = ruleset.configs.filter((c) => declaredConfigs.has(c.id));
  const missingRules = rulesInScope.filter((r) => !docRules.has(r.id)).map((r) => r.id);
  const missingConfigs = configsInScope.filter((c) => !docConfigs.has(c.id)).map((c) => c.id);

  const problems: string[] = [];
  if (missingRules.length) problems.push(`规则未落位：${missingRules.join(", ")}`);
  if (missingConfigs.length) problems.push(`配置未落位：${missingConfigs.join(", ")}`);
  // 声明的章节必须有块：否则章节声明与产物脱节
  const presentSections = new Set(document.blocks.map((b) => b.section_id));
  const missingSections = outline.sections.filter((s) => !presentSections.has(s.section_id)).map((s) => s.section_id);
  if (missingSections.length) problems.push(`章节未产出：${missingSections.join(", ")}`);

  return {
    ok: problems.length === 0,
    sections: document.blocks.map((b) => ({ section_id: b.section_id, block_id: b.block_id, segments: b.content.length })),
    rules: { total: rulesInScope.length, covered: rulesInScope.length - missingRules.length, missing: missingRules },
    configs: { total: configsInScope.length, covered: configsInScope.length - missingConfigs.length, missing: missingConfigs },
    outOfScope: {
      rules: ruleset.rules.length - rulesInScope.length,
      configs: ruleset.configs.length - configsInScope.length,
    },
    problems,
  };
}

/** 三维标记：让读者一眼看出这段是继承、修改还是新增 */
function lineageMark(seg: Segment): string {
  switch (seg.lineage) {
    case "default_inherited":
      return "「继承」";
    case "explicit_inherited":
      return "「显式继承」";
    case "modified":
      return "「修改」";
    case "added":
      return "「新增」";
    default:
      return "";
  }
}

function segmentLine(seg: Segment, showLineage: boolean): string[] {
  const marks: string[] = [];
  if (showLineage) {
    const m = lineageMark(seg);
    if (m) marks.push(m);
    if (seg.diff_status === "candidate") marks.push("「差异待确认」");
  }
  if (seg.release_blocker_refs.length > 0) marks.push(`「待裁决 ${seg.release_blocker_refs.join("、")}」`);
  // 只有纯数值或短公式片段才提示「不可改写」：长句里出现一个等号不刷屏
  const numericLike =
    numericOnlyPattern.test(seg.text) ||
    (seg.text.length <= 60 && looksLikeFormula(seg.text));
  if (!seg.editable && numericLike) marks.push("「数值·不可改写」");
  const prefix = marks.length ? `${marks.join("")} ` : "";
  const lines = [`- ${prefix}${seg.text}`];
  const base = seg.lineage === "modified" && seg.base_rule_ref ? `（对照杭麻：\`${seg.base_rule_ref}\`）` : "";
  if (base) lines[0] += base;
  return lines;
}

/** 渲染全文；变体文档自动显示三维标记，基座文档不显示 */
export function renderDocument(document: Document, outline: DocumentOutline): string {
  const titleOf = new Map(outline.sections.map((s) => [s.section_id, s.title]));
  const isVariant = document.target_variant !== "hangzhou";
  const lines: string[] = [
    `# ${document.ruleset_id} 需求全文`,
    "",
    `> 文档版本：${document.document_version}｜模板：${document.template_version}｜规则集：${document.ruleset_version}｜变体：${document.target_variant}`,
    "> 本文由规则集自动生成，是产出物而非事实源；发现问题请修改规则卡后重新生成。",
  ];
  if (isVariant) {
    lines.push(
      "> 标记说明：「继承」= 未改写沿用杭麻；「显式继承」= 变体卡显式声明沿用；「修改」= 变体卡改写；「新增」= 变体独有。",
      "> 「差异待确认」表示该段差异由 AI 比对得出、尚待人工确认；「待裁决」表示对应规则卡仍是未决项。",
    );
  }
  lines.push("");

  for (const block of document.blocks) {
    const title = titleOf.get(block.section_id) ?? SECTION_TITLES[block.section_id] ?? block.section_id;
    lines.push(`## ${title}`, "");
    for (const seg of block.content) lines.push(...segmentLine(seg, isVariant));
    const refs = [...block.references.rule_refs, ...block.references.config_refs];
    if (refs.length) lines.push("", `来源：${refs.map((r) => `\`${r}\``).join("、")}`);
    lines.push("");
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

/** 片段级来源：用于追溯单段来自哪条原始材料的哪一节 */
export function renderSourceAppendix(document: Document): string {
  const rows: string[] = ["## 附：片段来源索引", "", "| 片段 | 规则 | 原文证据 |", "| --- | --- | --- |"];
  for (const block of document.blocks as DocumentBlock[]) {
    for (const seg of block.content) {
      const ev = seg.references.source_evidence_refs.join("<br>") || "—";
      rows.push(`| ${seg.segment_id} | ${seg.references.rule_refs.join("、") || "—"} | ${ev} |`);
    }
  }
  return `${rows.join("\n")}\n`;
}

/** W2-6：差异视图 —— 只列 modified / added，附基座对照文本 */
export function renderDiffView(base: Document, variant: Document, baseSegmentOfModified: Record<string, string> = {}): string {
  const baseBySegment = new Map<string, Segment>();
  for (const b of base.blocks) for (const s of b.content) baseBySegment.set(s.segment_id, s);

  const lines: string[] = [
    `# ${variant.ruleset_id} 差异视图`,
    "",
    `> 基座：${base.ruleset_id} v${base.ruleset_version}（文档版本 ${base.document_version}）`,
    `> 变体：${variant.target_variant} v${variant.ruleset_version}（文档版本 ${variant.document_version}）`,
    "> 本视图只列与基座不同的内容；继承内容见完整视图。",
    "",
  ];
  const grouped = new Map<string, Segment[]>();
  for (const block of variant.blocks) {
    for (const seg of block.content) {
      if (seg.lineage !== "modified" && seg.lineage !== "added") continue;
      grouped.set(block.section_id, [...(grouped.get(block.section_id) ?? []), seg]);
    }
  }
  for (const [sectionId, segs] of grouped) {
    lines.push(`## ${SECTION_TITLES[sectionId] ?? sectionId}`, "");
    for (const seg of segs) {
      const tag = seg.lineage === "modified" ? "修改" : "新增";
      const confirm = seg.diff_status === "candidate" ? "（差异待确认）" : "";
      lines.push(`### [${tag}]${confirm} ${seg.references.rule_refs.join("、")}`);
      lines.push("", seg.text, "");
      const baseSeg = seg.base_segment_ref ? baseBySegment.get(seg.base_segment_ref) : undefined;
      if (baseSeg) {
        lines.push(`基座原文（\`${baseSeg.segment_id}\`）：`, "", `> ${baseSeg.text}`, "");
      }
      for (const blocker of seg.release_blocker_refs) lines.push(`待裁决：${blocker}`, "");
      for (const ev of seg.references.source_evidence_refs) lines.push(`来源：\`${ev}\``);
      lines.push("");
    }
  }
  if (grouped.size === 0) lines.push("（未发现差异）", "");
  return `${lines.join("\n").trimEnd()}\n`;
}

/** W2-6：对照视图 —— 章节内基座 vs 变体并排 */
export function renderComparisonView(base: Document, variant: Document): string {
  const lines: string[] = [
    `# ${variant.ruleset_id} 对照视图`,
    "",
    `> 左：基座 ${base.ruleset_id} v${base.ruleset_version}｜右：变体 ${variant.target_variant} v${variant.ruleset_version}`,
    "",
  ];
  const baseBySection = new Map(base.blocks.map((b) => [b.section_id, b]));
  const sections = [...new Set([...base.blocks.map((b) => b.section_id), ...variant.blocks.map((b) => b.section_id)])];
  for (const sectionId of sections) {
    const baseBlock = baseBySection.get(sectionId);
    const variantBlock = variant.blocks.find((b) => b.section_id === sectionId);
    const title = SECTION_TITLES[sectionId] ?? sectionId;
    const inherited = variantBlock?.content.filter((s) => s.lineage.endsWith("inherited")).length ?? 0;
    const modified = variantBlock?.content.filter((s) => s.lineage === "modified").length ?? 0;
    const added = variantBlock?.content.filter((s) => s.lineage === "added").length ?? 0;
    lines.push(`## ${title}`, "");
    lines.push(`继承 ${inherited} 段｜修改 ${modified} 段｜新增 ${added} 段`, "");
    const summarize = (d?: Document) => d?.blocks.find((b) => b.section_id === sectionId)?.content.map((s) => s.text) ?? [];
    const baseTexts = summarize(base);
    const variantTexts = summarize(variant);
    lines.push("| 基座 | 变体 |", "| --- | --- |");
    const rows = Math.max(baseTexts.length, variantTexts.length);
    for (let i = 0; i < rows; i += 1) {
      const left = (baseTexts[i] ?? "—").replace(/\|/g, "\|").slice(0, 200);
      const right = (variantTexts[i] ?? "—").replace(/\|/g, "\|").slice(0, 200);
      lines.push(`| ${left} | ${right} |`);
    }
    lines.push("");
  }
  return `${lines.join("\n").trimEnd()}\n`;
}
