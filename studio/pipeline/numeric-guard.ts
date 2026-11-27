// W1-5：数值分级与可追溯校验（对应评审 P0-5）
// 四类数值的处理不同：
//   规则卡既有数值 → 可写，但必须能在所引规则卡正文或配置值里找到
//   配置参数值     → 可写，必须与配置逐字一致
//   公式计算结果   → 只能由 calculators 注入，AI 产出即失败
//   AI 自行推断    → 禁止
// 边界：本模块只判定与报出问题，不改文档。
import { machineCheckFindingSchema, type MachineCheckFinding } from "../contracts/machine-check.ts";

/** 数值 token：数字（含千分位/小数）+ 可选中文单位 */
const numericTokenPattern = /-?\d+(?:[.,]\d+)?\s*(?:倍|分|张|番|个|组|牢|秒|毫秒|%)?/g;

/** 提取文本中的数值 token（已去重、按出现顺序） */
export function extractNumericTokens(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(numericTokenPattern)) {
    const token = m[0].trim();
    // 单字符 "0"/(如序号) 也保留：宁可多校验一次，不可漏放
    if (!out.includes(token)) out.push(token);
  }
  return out;
}

export interface NumericContext {
  /** 本段所引规则卡的正文（用于判定「规则卡既有数值」） */
  ruleBodies: ReadonlyMap<string, string>;
  /** 配置 ID → 配置值文本 */
  configValues: ReadonlyMap<string, string>;
  /** calculators 产出的确定性数值（AI 不得自造） */
  calculatorValues?: ReadonlyArray<string>;
}

export type NumericOrigin = "calculator" | "rule" | "config" | "inferred";

/** 归一化：去掉空白，便于「8 倍」与「8倍」比较 */
const norm = (s: string) => s.replace(/\s+/g, "");

/** 数字核心：去掉单位后的数字部分（「136张」→「136」） */
const coreOf = (token: string) => norm(token).replace(/(倍|分|张|番|个|组|牢|秒|毫秒|%)$/, "");

/**
 * 文本里是否含该数值。
 * 先比整体（带单位），再比数字核心，且核心必须落在数字边界上：
 * 避免「8」被「800」或「18」误命中。
 */
const hasNumber = (text: string, token: string): boolean => {
  const flat = norm(text);
  if (flat.includes(norm(token))) return true;
  const core = coreOf(token);
  if (!/^-?\d+(?:[.,]\d+)?$/.test(core)) return false;
  const escaped = core.replace(/[.*+?^$()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^0-9.])${escaped}([^0-9.]|$)`).test(flat);
};

export interface NumericVerdict {
  token: string;
  origin: NumericOrigin;
  /** 命中的来源 ID（规则卡或配置），推断时为空 */
  hit?: string;
}

/**
 * 判定单个数值 token 的来源。
 * 顺序：计算器 → 所引规则卡 → 所引配置 → 推断。
 * 之所以先看计算器，是因为同一数值可能既出现在规则卡文字里又由计算器产出，
 * 此时应记为「计算器」（更强来源）。
 */
export function classifyNumericToken(
  token: string,
  refs: { ruleRefs: ReadonlyArray<string>; configRefs: ReadonlyArray<string> },
  ctx: NumericContext,
): NumericVerdict {
  const t = norm(token);
  for (const v of ctx.calculatorValues ?? [])
    if (norm(v) === t || coreOf(v) === coreOf(token)) return { token, origin: "calculator" };
  for (const id of refs.ruleRefs) {
    const body = ctx.ruleBodies.get(id);
    if (body && hasNumber(body, token)) return { token, origin: "rule", hit: id };
  }
  for (const id of refs.configRefs) {
    const value = ctx.configValues.get(id);
    if (value && hasNumber(value, token)) return { token, origin: "config", hit: id };
  }
  return { token, origin: "inferred" };
}

/**
 * 校验一段文本里的全部数值。
 * 「公式类」片段（由计算器注入）不参与 AI 校验，调用方应跳过 editable=false 的片段。
 */
export function checkNumericTraceability(
  text: string,
  refs: { ruleRefs: ReadonlyArray<string>; configRefs: ReadonlyArray<string> },
  ctx: NumericContext,
): MachineCheckFinding[] {
  const findings: MachineCheckFinding[] = [];
  for (const token of extractNumericTokens(text)) {
    const verdict = classifyNumericToken(token, refs, ctx);
    if (verdict.origin === "inferred") {
      findings.push(
        machineCheckFindingSchema.parse({
          code: "fact.untraceable-number",
          severity: "failed",
          message: `数值「${token}」在所引规则卡与配置中均找不到来源`,
          segment_ids: [],
          rule_refs: [...refs.ruleRefs],
          hint: "要么改成规则卡里已有的表述，要么把该数值移入 calculators 计算",
        }),
      );
    }
  }
  return findings;
}

/** 汇总统计，供报告展示 */
export function summarizeNumeric(verdicts: ReadonlyArray<NumericVerdict>): Record<NumericOrigin, number> {
  const acc: Record<NumericOrigin, number> = { calculator: 0, rule: 0, config: 0, inferred: 0 };
  for (const v of verdicts) acc[v.origin] += 1;
  return acc;
}
