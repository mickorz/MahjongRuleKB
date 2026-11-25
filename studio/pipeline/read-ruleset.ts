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
    })),
    configs: [...rs.config, ...rs.configUi].map((c) => ({
      id: c.id,
      name: c.name,
      value: c.value,
      description: c.description,
    })),
  };
}

/** 从规则卡正文提取第一个匹配槽位的内容（例如「结果」槽） */
export function slotText(body: string, slot: string): string | null {
  const re = new RegExp(`^\\s*[-*]\\s*\\*\\*${slot}\\*\\*\\s*[：:]([\\s\\S]*?)(?=^\\s*[-*]\\s*\\*\\*|\\s*$)`, "m");
  const m = re.exec(body);
  return m ? m[1].trim() : null;
}
