// P3：G5 Gold Set 门禁（文档级追溯）
// 默认关闭，只有显式开启才运行（CLAUDE.md：G5 只由用户触发）。
// 检查三件事：
// 1. 每条 verified 用例引用的规则都能在目标文档中找到落点（文档覆盖了被验证的规则）
// 2. 未决项（release_blocker）在文档中的 decision_status 不得被写成 confirmed
// 3. 数值类片段不得 editable=true（防止自然语言模型改写数值）
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";

import { goldSetListSchema, type GoldSetCase } from "../../schemas/gold-set.ts";
import { looksLikeFormula, numericOnlyPattern, type Document } from "../contracts/document.ts";

export interface GoldSetGateResult {
  ok: boolean;
  enabled: boolean;
  checked: number;
  total: number;
  skipped: number;
  problems: string[];
}

const emptyResult = (): GoldSetGateResult => ({ ok: true, enabled: true, checked: 0, total: 0, skipped: 0, problems: [] });

/** 读取全部 Gold Set 用例（可按规则集过滤） */
export function loadGoldSet(dir = "tests/gold-set", rulesetId?: string): GoldSetCase[] {
  if (!existsSync(dir)) return [];
  const all = readdirSync(dir)
    .filter((f) => f.endsWith(".yaml"))
    .sort()
    .flatMap((f) => goldSetListSchema.parse(parse(readFileSync(join(dir, f), "utf8"))));
  return rulesetId ? all.filter((c) => c.ruleset_id === rulesetId) : all;
}

/** 文档中出现的全部规则 ID（片段级引用） */
function ruleRefsIn(document: Document): Set<string> {
  const ids = new Set<string>();
  for (const block of document.blocks) for (const seg of block.content) for (const r of seg.references.rule_refs) ids.add(r);
  return ids;
}

/**
 * 运行 G5。enabled=false 时直接返回未启用，不产生门禁结论。
 * 只统计 verified 用例——draft 用例本来就没有人工确认，不能作为门禁依据。
 */
export function checkGoldSet(
  document: Document,
  opts: { enabled: boolean; cases?: GoldSetCase[]; dir?: string },
): GoldSetGateResult {
  if (!opts.enabled) return { ...emptyResult(), ok: true, enabled: false };
  const cases = opts.cases ?? loadGoldSet(opts.dir, document.ruleset_id);
  const result = emptyResult();
  result.total = cases.length;
  if (cases.length === 0) {
    result.problems.push(`规则集 ${document.ruleset_id} 没有 Gold Set 用例，G5 无依据`);
    result.ok = false;
    return result;
  }

  const refs = ruleRefsIn(document);
  const segs = document.blocks.flatMap((b) => b.content);

  for (const c of cases) {
    if (c.verification.status !== "verified") {
      result.skipped += 1;
      continue;
    }
    result.checked += 1;
    for (const ref of c.rule_refs) {
      if (!refs.has(ref)) result.problems.push(`${c.id} 引用的规则 ${ref} 在文档中无落点`);
    }
  }

  // 未决项不得被写成已确认
  for (const seg of segs) {
    if (!seg.release_blocker_refs || seg.release_blocker_refs.length === 0) continue;
    if (seg.decision_status === "confirmed") {
      result.problems.push(`未决项 ${seg.release_blocker_refs.join(", ")} 在文档中被写成 confirmed`);
    }
  }

  // 数值片段不可编辑
  for (const seg of segs) {
    if (seg.editable && (looksLikeFormula(seg.text) || numericOnlyPattern.test(seg.text))) {
      result.problems.push(`数值/公式片段被标记可编辑：${seg.segment_id}`);
    }
  }

  result.ok = result.problems.length === 0;
  return result;
}
