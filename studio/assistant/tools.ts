// Assistant 工具注册表（六个只读工具）
//
// 边界：
// - 只注册 studio/query 里的只读能力，不提供文件/Shell/任意路径工具；
// - 参数以 JSON Schema 交给模型，执行前再用各工具自己的 Zod 校验（模型输出不可信）；
// - 每个工具有独立调用上限（低于 Runtime 的全局预算）。
import { getConfig } from "../query/configs.ts";
import { compareRules } from "../query/compare.ts";
import { getRule, searchRules } from "../query/rules.ts";
import { readEvidence } from "../query/sources.ts";
import { listUnresolved } from "../query/unresolved.ts";
import type { ToolResult } from "../query/types.ts";

export interface ToolSpec {
  name: string;
  description: string;
  /** 给模型看的 JSON Schema（手写，与工具内 Zod 对齐） */
  parameters: Record<string, unknown>;
  /** 单工具在该请求内的上限（低于 Runtime 全局预算） */
  maxCallsPerTool: number;
  run: (input: unknown, options?: { root?: string }) => ToolResult<unknown>;
}

const obj = (properties: Record<string, unknown>, required: string[]): Record<string, unknown> => ({
  type: "object",
  properties,
  required,
  additionalProperties: false,
});

const str = (description: string): Record<string, unknown> => ({ type: "string", description });
const bool = (description: string): Record<string, unknown> => ({ type: "boolean", description });
const num = (description: string): Record<string, unknown> => ({ type: "number", description });

export const READ_ONLY_TOOLS: ToolSpec[] = [
  {
    name: "search_rules",
    description:
      "按 ID / 前缀 / 名称或正文关键词 / 类型 / 状态检索规则卡。至少给一个条件；返回带 status、release_blocker、change_type、base_rule_ref 的摘要。",
    parameters: obj(
      {
        variant: str("规则集目录名，例如 hangzhou 或 xiaoshan"),
        query: str("名称或正文关键词"),
        id: str("精确规则 ID"),
        id_prefix: str("ID 前缀，例如 XS-K-"),
        type: str("规则类型：judgment/timing/counter/record/formula/lookup/settlement/static-ui/interaction/animation"),
        change_type: str("inherited / modified / added（仅变体）"),
        status: str("confirmed / inferred / unresolved / disputed"),
        only_blockers: bool("只看被 release_blocker 未决项阻塞的卡"),
        limit: num("返回条数，默认 20，上限 50"),
      },
      ["variant"],
    ),
    maxCallsPerTool: 3,
    run: (input, options) => searchRules(input, options) as ToolResult<unknown>,
  },
  {
    name: "get_rule",
    description:
      "读取一张规则卡的完整正文、槽位、依赖、对照信息、证据与引用了它的文档段落。",
    parameters: obj({ variant: str("规则集目录名"), id: str("规则 ID") }, ["variant", "id"]),
    maxCallsPerTool: 4,
    run: (input, options) => getRule(input, options) as ToolResult<unknown>,
  },
  {
    name: "get_config",
    description:
      "查询玩法配置项（底分、局数、财神、封顶、开关等）。变体未覆盖的配置会自动沿用基座值，并带 status / release_blocker / candidates。",
    parameters: obj(
      {
        variant: str("规则集目录名"),
        id: str("配置 ID，例如 HJ-C-DIFEN"),
        query: str("配置名称关键词"),
        include_base_fallback: bool("是否包含只有基座定义的条目，默认 true"),
      },
      ["variant"],
    ),
    maxCallsPerTool: 4,
    run: (input, options) => getConfig(input, options) as ToolResult<unknown>,
  },
  {
    name: "list_unresolved",
    description:
      "列出未决/争议项。默认返回全部；only_blockers 只看阻塞发布的；card_ref 精确过滤某张卡。",
    parameters: obj(
      {
        variant: str("规则集目录名"),
        only_blockers: bool("只看 release_blocker=true 的条目"),
        status: str("unresolved / disputed"),
        card_ref: str("只看这张规则卡或配置项的未决项"),
      },
      ["variant"],
    ),
    maxCallsPerTool: 3,
    run: (input, options) => listUnresolved(input, options) as ToolResult<unknown>,
  },
  {
    name: "read_evidence",
    description:
      "读取规则对应的原始策划证据片段。只能读「当前规则集已登记且可定位」的证据：给 rule_id（可选 index）或已登记的 file#section。",
    parameters: obj(
      {
        variant: str("规则集目录名"),
        rule_id: str("从这张卡的已登记证据里选"),
        ref: str("已登记的证据引用，形如 rulebook/sources/xiaoshan/xiaoshan-rules.md#R-BANK-02"),
        index: num("rule_id 有多条证据时选第几条，默认 0"),
        max_chars: num("返回字符数上限，默认 1200"),
      },
      ["variant"],
    ),
    maxCallsPerTool: 4,
    run: (input, options) => readEvidence(input, options) as ToolResult<unknown>,
  },
  {
    name: "compare_rules",
    description:
      "比较两个玩法的规则与配置差异。范围必须显式：ids（side=variant 从变体卡出发 / side=base 从基座卡出发）、keyword（双侧命中并集）、all_changes（显式全量）。配对只看 base_rule_ref。",
    parameters: obj(
      {
        base: str("基座规则集，例如 hangzhou"),
        variant: str("变体规则集，例如 xiaoshan"),
        scope: {
          type: "object",
          description:
            '比较范围：{"kind":"ids","side":"variant|base","ids":[...]} 或 {"kind":"keyword","query":"..."} 或 {"kind":"all_changes"}',
        },
        include: str("both（默认）/ rules / configs"),
        max_rows: num("返回条目总预算（规则+配置合计），默认 20"),
      },
      ["base", "variant", "scope"],
    ),
    maxCallsPerTool: 2,
    run: (input, options) => compareRules(input, options) as ToolResult<unknown>,
  },
];

export function findTool(name: string, tools: ReadonlyArray<ToolSpec> = READ_ONLY_TOOLS): ToolSpec | undefined {
  return tools.find((tool) => tool.name === name);
}

/** 交给模型的 tools 定义（OpenAI 兼容格式） */
export function toolDefinitionsForModel(tools: ReadonlyArray<ToolSpec> = READ_ONLY_TOOLS): unknown[] {
  return tools.map((tool) => ({
    type: "function",
    function: { name: tool.name, description: tool.description, parameters: tool.parameters },
  }));
}
