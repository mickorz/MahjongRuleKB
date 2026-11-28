// 工具中文名 patch：参考项目的中文映射只覆盖它自己的工具，
// 我们的六个只读工具会退化成英文名（"使用了一个 get_rule 工具"）。
// 这里给 work-items 注入一张显示名映射表，并把中文模板改成自然语序。
// 幂等：已打过则跳过；只在 worktree 内生效。
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MARK = "spike patch";
const CR = String.fromCharCode(13, 10);
const LF = String.fromCharCode(10);

/** 我们在 studio/assistant/tools.ts 里注册的六个只读工具 */
export const TOOL_LABELS = {
  search_rules: "规则检索",
  get_rule: "规则查询",
  get_config: "配置查询",
  compare_rules: "玩法对比",
  list_unresolved: "未决项查询",
  read_evidence: "原文取证",
};

function readLf(file) {
  const raw = readFileSync(file, "utf8");
  return { crlf: raw.includes(CR), src: raw.split(CR).join(LF) };
}

function writeBack(file, src, crlf) {
  writeFileSync(file, crlf ? src.split(LF).join(CR) : src, "utf8");
}

export function patchWorkItemLabels(forkDir) {
  const file = join(forkDir, "src/renderer/work-items.ts");
  const { crlf, src: original } = readLf(file);
  if (original.includes(MARK)) return { file, applied: false };
  let src = original;

  // 1) 注入显示名解析函数
  const anchor = "export function toolGroupSummary(";
  if (!src.includes(anchor)) throw new Error("patch 锚点缺失：work-items 的 toolGroupSummary");
  const table = Object.entries(TOOL_LABELS)
    .map(([key, label]) => `  ${key}: ${JSON.stringify(label)},`)
    .join("\n");
  src = src.replace(
    anchor,
    `/* ${MARK}: 工作台自有工具的显示名（参考项目只认识它自己的工具表） */
const TOOL_DISPLAY_NAMES: Record<string, string> = {
${table}
};

function toolDisplayName(toolName: string): string {
  return TOOL_DISPLAY_NAMES[toolName] ?? toolName;
}

${anchor}`,
  );

  // 2) 摘要里改用显示名
  const call = 'return usedToolsPhrase(category.slice("tool:".length), tools.length);';
  if (!src.includes(call)) throw new Error("patch 锚点缺失：work-items 的工具名分支");
  src = src.replace(call, 'return usedToolsPhrase(toolDisplayName(category.slice("tool:".length)), tools.length);');

  writeBack(file, src, crlf);
  return { file, applied: true };
}

export function patchZhLocale(forkDir) {
  const file = join(forkDir, "src/renderer/locales/zh-CN.ts");
  const { crlf, src: original } = readLf(file);
  if (original.includes(MARK)) return { file, applied: false };
  let src = original;

  // "使用了一个 {{name}} 工具" 在中文里是翻译腔，改成 "使用了{{name}}"
  const pairs = [
    ['usedToolA: "使用了一个 {{name}} 工具",', 'usedToolA: "使用了{{name}}",'],
    ['usedToolAn: "使用了一个 {{name}} 工具",', 'usedToolAn: "使用了{{name}}",'],
    ['usedToolsNamed: "使用了多个 {{name}} 工具",', 'usedToolsNamed: "多次使用{{name}}",'],
  ];
  let hits = 0;
  for (const [from, to] of pairs) {
    if (src.includes(from)) {
      src = src.replace(from, `/* ${MARK} */ ${to}`);
      hits += 1;
    }
  }
  if (hits === 0) throw new Error("patch 锚点缺失：zh-CN 的工具摘要模板");

  writeBack(file, src, crlf);
  return { file, applied: true };
}
