// P0-B：杭州全套章节装配（11 章共享模板）
// 章节映射层独立于规则卡：规则按类型 + 语义关键词归章；配置按用途归章。
// 硬约束：任何规则或配置未归章即抛错（不允许静默遗漏）。
import { documentOutlineSchema, type DocumentOutline, type OutlineSection } from "../contracts/outline.ts";
import type { RuleSetView } from "./read-ruleset.ts";

/** 共享模板的章节顺序（与设计 v1.8 §3.1 一致） */
export const sectionOrder = [
  "overview",
  "terms",
  "opening",
  "gameplay",
  "contract",
  "scoring",
  "patterns",
  "settlement",
  "ui",
  "excluded",
  "pending",
] as const;

const titles: Record<string, string> = {
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

/** 规则卡归章：先按 ID / 名称关键词，再按类型兜底 */
const ruleRules: Array<{ section: string; match: RegExp }> = [
  // 承包类优先判定（避免被「胡」等关键词误捕）
  { section: "contract", match: /CHENGBAO|承包|TAN|摊/ },
  // 开局/庄家/发牌
  { section: "opening", match: /ZHUANGJIA|LUNZHUANG|DINGZHUANG|DUSAN|LAOSHU|FAIPAI|DEAL|掷骰|定庄|轮庄|连庄|庄家|发牌/ },
  // 算分（公式与倍率）
  { section: "scoring", match: /BEILV|YUANYING|PEIFEN|倍率|原应赔分|算分/ },
  // 番型与档位
  { section: "patterns", match: /FAN|PINGHU|BAOTOU|QIDUI|QIKE|GANGKAI|GANGBAO|GANGPIAO|PIAOGANG|CAIPIAO|LIANGANG|SHIFENG|HUCHI|番型|爆头|七对|七客|平胡|十风|连杠|杠爆|杠飘|飘杠|财飘|互斥/ },
  // 结算入账
  { section: "settlement", match: /RUZHANG|JIESUAN|HUANGZHUANG|DIANPAO|ZIMO|入账|结算|黄庄/ },
  // 界面
  { section: "ui", match: /^[A-Z]{2}-[VIA]-|界面|按钮|字效|头像|牌河|方位盘|提示/ },
];

/** 配置项归章 */
const configRules: Array<{ section: string; match: RegExp }> = [
  { section: "overview", match: /RENSHU|JUSHU|PAISHU|人数|局数|牌数/ },
  { section: "opening", match: /LIANZHUANG-MOSHI|ZHUANGJIA-LAOSHU|连庄模式|庄家牢数|发牌节奏|FAIPAI-JIEZOU/ },
  { section: "contract", match: /SANTAN-CHENGBAO|PENG-SUAN-TAN|三摊承包|碰算摊/ },
  { section: "scoring", match: /DIFEN|FENGDING|ZHUANGJIA-BEILV|ZHUANGXIAN-FANGCHONG|底分|封顶|倍率/ },
  { section: "patterns", match: /SHIFENG|YOUCAI|十风|有财/ },
  { section: "ui", match: /^[A-Z]{2}-C-UI-|倒计时|长按|动画|积分换算|昵称/ },
];

export function sectionOfRule(id: string, name: string): string {
  for (const r of ruleRules) if (r.match.test(id) || r.match.test(name)) return r.section;
  const type = id.split("-")[1];
  // 兜底：按类型归章
  if (type === "F") return "scoring";
  if (type === "K") return "patterns";
  if (type === "P") return "settlement";
  if (["V", "I", "A"].includes(type)) return "ui";
  return "gameplay";
}

function sectionOfConfig(id: string, name: string): string {
  for (const r of configRules) if (r.match.test(id) || r.match.test(name)) return r.section;
  return "gameplay";
}

/**
 * 构建杭州全套 outline。
 * 未归章的规则 / 配置不会静默丢弃，而是抛错并列出——避免「映射漏项」被当成通过。
 */
export function buildHangzhouOutline(ruleset: RuleSetView, templateVersion = "1.0.0"): DocumentOutline {
  const bySection = new Map<string, { rules: string[]; configs: string[] }>();
  for (const s of sectionOrder) bySection.set(s, { rules: [], configs: [] });

  for (const rule of ruleset.rules) {
    const section = sectionOfRule(rule.id, rule.name);
    const bucket = bySection.get(section);
    if (!bucket) throw new Error(`规则 ${rule.id} 归入未知章节 ${section}`);
    bucket.rules.push(rule.id);
  }
  for (const config of ruleset.configs) {
    const section = sectionOfConfig(config.id, config.name);
    const bucket = bySection.get(section);
    if (!bucket) throw new Error(`配置 ${config.id} 归入未知章节 ${section}`);
    bucket.configs.push(config.id);
  }

  const assignedRules = new Set([...bySection.values()].flatMap((b) => b.rules));
  const assignedConfigs = new Set([...bySection.values()].flatMap((b) => b.configs));
  const missingRules = ruleset.rules.filter((r) => !assignedRules.has(r.id)).map((r) => r.id);
  const missingConfigs = ruleset.configs.filter((c) => !assignedConfigs.has(c.id)).map((c) => c.id);
  if (missingRules.length || missingConfigs.length) {
    throw new Error(
      `章节映射遗漏：规则 ${missingRules.join(", ") || "无"}；配置 ${missingConfigs.join(", ") || "无"}`,
    );
  }

  const sections: OutlineSection[] = sectionOrder
    .map((id) => ({
      section_id: id,
      title: titles[id],
      rule_refs: bySection.get(id)!.rules,
      config_refs: bySection.get(id)!.configs,
      cross_reference_sections: [],
    }))
    // 空章节不产出块，但保留在 outline 中以便后续填充
    .filter((s) => s.rule_refs.length > 0 || s.config_refs.length > 0);

  return documentOutlineSchema.parse({ template_version: templateVersion, sections });
}
