// P0-A：从规则集读取章节装配所需的规则与配置（复用 compiler 的加载器，不重写解析）
// 边界：本层只读，不写盘；写入由 Stage 通过 paths 权限矩阵完成。
import { loadRuleset } from "../../compiler/validator.ts";
import { PATHS } from "../../compiler/paths.ts";

export interface RuleSummary {
  id: string;
  type: string;
  name: string;
  /** 原文证据引用：rulebook/sources/...#section */
  evidence: string[];
  /** 正文（Markdown 槽位文本） */
  body: string;
  /** 声明依赖的规则 / 配置 ID（来自 front matter） */
  depends_on: string[];
}

export interface ConfigSummary {
  id: string;
  name: string;
  value: unknown;
  description?: string;
}

export interface RuleSetView {
  rulesetId: string;
  version: string;
  rules: RuleSummary[];
  configs: ConfigSummary[];
}

/** 读取基础规则集（默认杭州），产出章节装配可用的扁平视图 */
export function readBaseRuleSet(baseDir: string = PATHS.baseDir): RuleSetView {
  const rs = loadRuleset(baseDir, "base");
  const manifest = rs.manifest as { ruleset_id: string; version: string };
  return {
    rulesetId: manifest.ruleset_id,
    version: manifest.version,
    rules: rs.rules.map((r) => ({
      id: r.meta.id,
      type: r.meta.type,
      name: r.meta.name,
      evidence: (r.meta.sources ?? []).map((s: { source: string; section?: string }) =>
        s.section ? `${s.source}#${s.section}` : s.source,
      ),
      body: r.body,
      depends_on: (r.meta.depends_on ?? []) as string[],
    })),
    configs: [...rs.config, ...rs.configUi].map((c) => ({
      id: c.id,
      name: c.name,
      value: c.value,
      description: c.description,
    })),
  };
}

const SLOT_LINE = /^\s*[-*]\s*\*\*(.+?)\*\*\s*[：:]\s*(.*)$/;

/**
 * 解析整卡正文的全部槽位（`- **槽**：内容`），按出现顺序返回。
 * 把一张规则卡完整展开成文档段落，避免只取一个槽位导致正文只剩标题。
 * 后续续行（缩进的列表内容）会被并入上一槽位。
 */
export function cardSlots(body: string): Array<{ slot: string; text: string }> {
  const out: Array<{ slot: string; text: string }> = [];
  const lines = body.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const m = SLOT_LINE.exec(lines[i]);
    if (!m) continue;
    const slot = m[1].trim();
    const parts: string[] = [];
    if (m[2].trim()) parts.push(m[2].trim());
    // 续行：缩进更深的列表项属于该槽位内容
    for (let j = i + 1; j < lines.length; j += 1) {
      const line = lines[j];
      if (line.trim() === "") break;
      if (/^\s*[-*]\s*\*\*/.test(line)) break;
      if (/^\s{2,}\S/.test(line) || /^\s{2,}[-*]/.test(line) || /^\s*\d+[.、]/.test(line)) {
        parts.push(line.trim());
        i = j;
        continue;
      }
      break;
    }
    const text = parts.join(" ").replace(/\s+/g, " ").trim();
    if (text) out.push({ slot, text });
  }
  return out;
}

/** 从规则卡正文提取第一个匹配槽位的内容（例如「结果」槽） */
export function slotText(body: string, slot: string): string | null {
  const found = cardSlots(body).find((s) => s.slot === slot);
  return found ? found.text : null;
}
