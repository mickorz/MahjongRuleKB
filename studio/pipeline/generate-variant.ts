// P1：萧山变体全文（共用章节模板 + 三维标记 + 待裁决）
// 复用 compiler 的 compileVariant 得到有效规则集（86 条），不重写继承逻辑。
import { loadRuleset } from "../../compiler/validator.ts";
import { compileVariant } from "../../compiler/compile.ts";
import { PATHS } from "../../compiler/paths.ts";
import {
  documentSchema,
  looksLikeFormula,
  numericOnlyPattern,
  type Document,
  type DocumentBlock,
  type Segment,
} from "../contracts/document.ts";
import type { DocumentOutline } from "../contracts/outline.ts";
import type { RuleSetView } from "./read-ruleset.ts";
import { cardSlots, slotText } from "./read-ruleset.ts";
import { buildHangzhouOutline, sectionOfRule } from "./outline-hangzhou.ts";

interface CompiledRuleLike {
  meta: Record<string, unknown> & {
    id: string;
    type: string;
    name: string;
    status: string;
    release_blocker: boolean;
    sources?: Array<{ source: string; section?: string }>;
  };
  body: string;
  origin: "base" | "variant";
}

const preferredSlots = ["结果", "触发", "公式", "表", "入账时点", "步骤", "画面", "位置"];
/** 对照槽：属于「杭麻怎么写的」，不是萧山有效规则本体，不进正文（AGENTS.md 约束 2） */
const comparisonSlots = new Set(["杭麻", "差异"]);

/** 去掉正文里嵌套列表的列表符号，保留编号步骤 */
const flatten = (text: string): string =>
  text
    .replace(/[ \t]*[-*][ \t]+/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();

/** 一张卡展开为多段（与基座文档保持一致的可读粒度），对照槽除外 */
const textOf = (rule: CompiledRuleLike): string[] => {
  const slots = cardSlots(rule.body).filter((s) => !comparisonSlots.has(s.slot));
  if (slots.length === 0) return [rule.meta.name];
  return slots.map((s) => `${rule.meta.name}·${s.slot}：${flatten(s.text)}`);
};

const evidenceOf = (rule: CompiledRuleLike): string[] =>
  (rule.meta.sources ?? []).map((s) => (s.section ? `${s.source}#${s.section}` : s.source));

export interface VariantGenerateResult {
  document: Document;
  /** 待裁决项（release_blocker 为 true 的规则卡） */
  blockers: Array<{ rule_id: string; name: string; status: string; unresolved_refs: string[] }>;
  /** 资源映射：变体卡 → 基座卡 */
  mapping: Record<string, string>;
}

/** 未决条目：card_ref 指向被阻塞的卡 */
export interface UnresolvedItem {
  id: string;
  card_ref: string;
  status: string;
  release_blocker: boolean;
}

/**
 * 生成变体文档。
 * lineage 三维取值：
 * - base 卡（未被变体覆盖）→ default_inherited，base_rule_ref 指向自身基座卡
 * - 变体 inherited → explicit_inherited
 * - 变体 modified → modified，diff_status=candidate（待人工确认）
 * - 变体 added → added，无 base_rule_ref
 */
export function generateVariantDocument(
  compiled: { rules: CompiledRuleLike[]; ruleAliases: Record<string, string>; blockers?: string[] },
  outline: DocumentOutline,
  opts: {
    variant: string;
    templateVersion: string;
    rulesetId: string;
    rulesetVersion: string;
    documentVersion?: number;
    /** unresolved.yaml 条目：用于把卡级阻塞映射到 XS-U-### 引用 */
    unresolved?: UnresolvedItem[];
  },
): VariantGenerateResult {
  const rulesById = new Map(compiled.rules.map((r) => [r.meta.id, r]));
  // 变体新增卡（added）不在基座 outline 里，按同一关键词规则补挂到章节，避免差异段落丢失
  const expanded = outline.sections.map((sec) => ({ ...sec, rule_refs: [...sec.rule_refs] }));
  for (const rule of compiled.rules) {
    if (rule.origin !== "variant" || rule.meta.change_type !== "added") continue;
    const target = sectionOfRule(rule.meta.id, rule.meta.name);
    const sec = expanded.find((s) => s.section_id === target) ?? expanded[expanded.length - 1];
    if (!sec.rule_refs.includes(rule.meta.id)) sec.rule_refs.push(rule.meta.id);
  }
  const blockBySection = new Map<string, CompiledRuleLike[]>();
  for (const sec of expanded) {
    const list: CompiledRuleLike[] = [];
    for (const ref of sec.rule_refs) {
      const rule = rulesById.get(ref) ?? rulesById.get(compiled.ruleAliases[ref] ?? "");
      if (rule) list.push(rule);
    }
    blockBySection.set(sec.section_id, list);
  }

  const documentVersion = opts.documentVersion ?? 0;
  const code = opts.variant.replace(/[^a-z]/g, "").slice(0, 2).toUpperCase().padEnd(2, "X");
  const pad = (n: number, w: number) => String(n).padStart(w, "0");
  let segSeq = 0;
  let blockSeq = 0;
  const blockers: VariantGenerateResult["blockers"] = [];
  const blocks: DocumentBlock[] = [];

  for (const sec of outline.sections) {
    const rules = blockBySection.get(sec.section_id) ?? [];
    const segments: Segment[] = [];
    for (const rule of rules) {      const changeType = rule.meta.change_type as string | undefined;
      const lineage =
        rule.origin === "base"
          ? "default_inherited"
          : changeType === "inherited"
            ? "explicit_inherited"
            : changeType === "added"
              ? "added"
              : "modified";
      const baseRef = (rule.meta.base_rule_ref as string | undefined) ?? (rule.origin === "base" ? rule.meta.id : undefined);
      const texts = textOf(rule);
      // 卡级 release_blocker 必须映射到 unresolved.yaml 的 XS-U-### 才会被渲染层识别
      const blockerRefs = (opts.unresolved ?? [])
        .filter((u) => u.card_ref === rule.meta.id && u.release_blocker)
        .map((u) => u.id);
      if (blockerRefs.length > 0) {
        blockers.push({
          rule_id: rule.meta.id,
          name: rule.meta.name,
          status: rule.meta.status,
          unresolved_refs: blockerRefs,
        });
      }
      for (const text of texts) {
        segSeq += 1;
        segments.push({
          segment_id: `SEG-${pad(segSeq, 6)}`,
          text,
          editable: !looksLikeFormula(text) && !numericOnlyPattern.test(text),
          lineage,
          decision_status: (rule.meta.status as Segment["decision_status"]) ?? "confirmed",
          diff_status: lineage === "modified" || lineage === "added" ? "candidate" : "not_applicable",
          // 未决项必须能被渲染层识别出来，否则待裁决内容在文档里看不见
          release_blocker_refs: blockerRefs,
          references: {
            requirement_refs: [],
            rule_refs: [rule.meta.id],
            config_refs: [],
            source_evidence_refs: evidenceOf(rule),
          },
          ...(lineage === "added" ? {} : { base_rule_ref: baseRef }),
        });
      }
    }
    if (segments.length === 0) continue;
    blockSeq += 1;
    blocks.push({
      block_id: `DOC-${code}-${pad(blockSeq, 6)}`,
      logical_block_id: `LBL-${sec.section_id.toUpperCase()}-01`,
      section_id: sec.section_id,
      type: "paragraph",
      document_version: documentVersion,
      content: segments,
      references: {
        requirement_refs: [],
        rule_refs: [...new Set(segments.flatMap((s) => s.references.rule_refs))],
        config_refs: [],
        source_evidence_refs: [...new Set(segments.flatMap((s) => s.references.source_evidence_refs))],
      },
    });
  }

  const document = documentSchema.parse({
    ruleset_id: opts.rulesetId,
    target_variant: opts.variant,
    template_version: opts.templateVersion,
    ruleset_version: opts.rulesetVersion,
    document_version: documentVersion,
    blocks,
    segment_lineage: [],
  });

  return { document, blockers, mapping: compiled.ruleAliases };
}

/** 读取并编译萧山变体（内部复用 compiler） */
export function compileXiaoshan() {
  const base = loadRuleset(PATHS.baseDir, "base");
  const variant = loadRuleset(`${PATHS.variantsDir}/xiaoshan`, "variant");
  const compiled = compileVariant(base, variant);
  return { base, variant, compiled };
}

/** 变体全文使用的章节模板：与杭州共用（section_id 一致） */
export function sharedOutline(baseRuleset: RuleSetView, templateVersion = "1.0.0"): DocumentOutline {
  return buildHangzhouOutline(baseRuleset, templateVersion);
}
