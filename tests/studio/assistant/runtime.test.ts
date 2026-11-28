// Assistant Runtime 验收：工具注册表 / 预算 / 超时 / 降级 / grounding / 审计
import { afterEach, describe, expect, it } from "vitest";

import {
  collectIds,
  groundAnswer,
  parseClaims,
  validateClaims,
} from "../../../studio/assistant/grounding.ts";
import {
  DEFAULT_MAX_TOOL_CALLS,
  DEFAULT_MAX_ROUNDS,
  keywordOf,
  runAssistant,
  type AuditEntry,
  type ChatClient,
  type ChatResponse,
} from "../../../studio/assistant/runtime.ts";
import {
  findTool,
  READ_ONLY_TOOLS,
  toolDefinitionsForModel,
  type ToolSpec,
} from "../../../studio/assistant/tools.ts";
import { clearSnapshotCache } from "../../../studio/query/rules.ts";

const ROOT = process.cwd();

afterEach(() => clearSnapshotCache());

const json = (value: unknown) => JSON.stringify(value);

/** 只用假工具，避免依赖真实仓库数据 */
const echoTool = (name: string, cap: number, payload: unknown = { ids: ["XS-R-TUODI"] }): ToolSpec => ({
  name,
  description: "测试用回显工具",
  parameters: { type: "object", properties: {}, additionalProperties: true },
  maxCallsPerTool: cap,
  run: () => ({ ok: true, data: payload, context: undefined as never, citations: [] }),
});

const scripted = (responses: ChatResponse[]): ChatClient & { calls: number } => {
  let index = 0;
  const client = {
    calls: 0,
    async chat() {
      client.calls += 1;
      const response = responses[Math.min(index, responses.length - 1)]!;
      index += 1;
      return response;
    },
  };
  return client;
};

const answerWithClaims = (refs: string[]) =>
  `结论如下。\n\`\`\`json\n${json({ claims: [{ text: "拖底阈值 −200", refs, kind: "rule" }] })}\n\`\`\``;

describe("1) 工具注册表", () => {
  it("六个只读工具，且都有 JSON Schema 与单工具上限", () => {
    expect(READ_ONLY_TOOLS.map((t) => t.name).sort()).toEqual(
      ["compare_rules", "get_config", "get_rule", "list_unresolved", "read_evidence", "search_rules"].sort(),
    );
    for (const tool of READ_ONLY_TOOLS) {
      expect(tool.parameters.type).toBe("object");
      expect(tool.maxCallsPerTool).toBeGreaterThan(0);
      expect(tool.maxCallsPerTool).toBeLessThanOrEqual(DEFAULT_MAX_TOOL_CALLS);
    }
  });

  it("交给模型的定义是 OpenAI function 格式", () => {
    const defs = toolDefinitionsForModel([echoTool("echo", 2)]) as Array<Record<string, any>>;
    expect(defs[0]!.type).toBe("function");
    expect(defs[0]!.function.name).toBe("echo");
    expect(defs[0]!.function.parameters.type).toBe("object");
  });

  it("findTool 未注册时返回 undefined", () => {
    expect(findTool("nope")).toBeUndefined();
  });

  it("真实工具直接落到查询层：search_rules 返回带状态的规则", () => {
    const tool = findTool("search_rules")!;
    const result = tool.run({ variant: "xiaoshan", id: "XS-R-TUODI" }, { root: ROOT });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const data = result.data as { items: Array<Record<string, unknown>> };
    expect(data.items[0]!.id).toBe("XS-R-TUODI");
    expect(data.items[0]!.change_type).toBe("added");
  });

  it("参数非法时按 ToolResult 返回 invalid_params（不抛异常）", () => {
    const tool = findTool("get_rule")!;
    const result = tool.run({ variant: "xiaoshan" }, { root: ROOT });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("invalid_params");
  });
});

describe("2) 工具调用循环", () => {
  it("调用一次工具后作答，refs 命中注入集合 → grounded", () => {
    const client = scripted([
      { tool_calls: [{ id: "c1", function: { name: "echo", arguments: "{}" } }] },
      { content: answerWithClaims(["XS-R-TUODI"]) },
    ]);
    return runAssistant(
      { messages: [{ role: "user", content: "拖底阈值" }] },
      { client, tools: [echoTool("echo", 2)] },
    ).then((result) => {
      expect(result.mode).toBe("tool_calls");
      expect(result.rounds).toBe(2);
      expect(result.toolCalls.map((t) => t.name)).toEqual(["echo"]);
      expect(result.grounded).toBe(true);
      expect(result.claims[0]!.status).toBe("ok");
      expect(result.injectedIds).toContain("XS-R-TUODI");
      expect(result.text).not.toContain("```");
    });
  });

  it("未注册的工具：回错误给模型但不中断", async () => {
    const client = scripted([
      { tool_calls: [{ id: "c1", function: { name: "rm_rf", arguments: "{}" } }] },
      { content: "无法调用该工具。" },
    ]);
    const result = await runAssistant(
      { messages: [{ role: "user", content: "删库" }] },
      { client, tools: [echoTool("echo", 2)] },
    );
    expect(result.toolCalls[0]!.ok).toBe(false);
    expect(result.toolCalls[0]!.code).toBe("invalid_params");
    expect(result.text).toContain("无法调用");
  });

  it("参数不是合法 JSON：返回 invalid_params，不崩", async () => {
    const client = scripted([
      { tool_calls: [{ id: "c1", function: { name: "echo", arguments: "{oops" } }] },
      { content: "参数有误。" },
    ]);
    const result = await runAssistant(
      { messages: [{ role: "user", content: "x" }] },
      { client, tools: [echoTool("echo", 2)] },
    );
    expect(result.toolCalls[0]!.ok).toBe(false);
    expect(result.toolCalls[0]!.code).toBe("invalid_params");
  });
});

describe("3) 预算：全局次数 / 单工具次数 / 轮数", () => {
  it("全局 6 次：超预算返回 tool_budget_exceeded 并收口", async () => {
    const client = scripted([
      {
        tool_calls: Array.from({ length: 3 }, (_, i) => ({
          id: `c${i}`,
          function: { name: "echo", arguments: "{}" },
        })),
      },
      {
        tool_calls: Array.from({ length: 3 }, (_, i) => ({
          id: `d${i}`,
          function: { name: "echo", arguments: "{}" },
        })),
      },
      { content: answerWithClaims(["XS-R-TUODI"]) },
    ]);
    const result = await runAssistant(
      { messages: [{ role: "user", content: "x" }] },
      { client, tools: [echoTool("echo", 10)], maxToolCalls: 3 },
    );
    expect(result.budgetExceeded).toBe(true);
    expect(result.toolCalls.filter((t) => t.ok)).toHaveLength(3);
    expect(result.toolCalls.some((t) => t.code === "tool_budget_exceeded")).toBe(true);
  });

  it("单工具上限低于全局：第 3 次调用被拒", async () => {
    const client = scripted([
      { tool_calls: [{ id: "c1", function: { name: "echo", arguments: "{}" } }] },
      { tool_calls: [{ id: "c2", function: { name: "echo", arguments: "{}" } }] },
      { tool_calls: [{ id: "c3", function: { name: "echo", arguments: "{}" } }] },
      { content: "够了。" },
    ]);
    const result = await runAssistant(
      { messages: [{ role: "user", content: "x" }] },
      { client, tools: [echoTool("echo", 2)] },
    );
    expect(result.toolCalls).toHaveLength(3);
    expect(result.toolCalls[2]!.ok).toBe(false);
    expect(result.toolCalls[2]!.code).toBe("tool_budget_exceeded");
  });

  it("轮数上限：maxRounds=1 时先跑一轮工具，再收口要正文", async () => {
    const client = scripted([
      { tool_calls: [{ id: "c1", function: { name: "echo", arguments: "{}" } }] },
      { content: answerWithClaims(["XS-R-TUODI"]) },
    ]);
    const result = await runAssistant(
      { messages: [{ role: "user", content: "x" }] },
      { client, tools: [echoTool("echo", 5)], maxRounds: 1 },
    );
    // 1 轮工具 + 1 轮收口
    expect(result.rounds).toBe(2);
    expect(client.calls).toBe(2);
    expect(result.text.length).toBeGreaterThan(0);
    expect(result.grounded).toBe(true);
  });

  it("默认预算与设计一致：8 次 / 5 轮（跨玩法对比需要余量）", () => {
    expect(DEFAULT_MAX_TOOL_CALLS).toBe(8);
    expect(DEFAULT_MAX_ROUNDS).toBe(5);
  });

  it("预算被拒时回带已收集 ID，便于模型直接收口", async () => {
    const seen: string[] = [];
    const client: ChatClient = {
      async chat({ messages }) {
        const toolMsg = messages.filter((m) => m.role === "tool").pop();
        if (toolMsg?.content) seen.push(String(toolMsg.content));
        if (messages.filter((m) => m.role === "tool").length <= 1) {
          return { tool_calls: [{ id: `c${seen.length}`, function: { name: "echo", arguments: "{}" } }] };
        }
        if (!messages.some((m) => m.content?.includes("预算已用尽"))) {
          return { tool_calls: [{ id: "c9", function: { name: "echo", arguments: "{}" } }] };
        }
        return { content: answerWithClaims(["XS-R-TUODI"]) };
      },
    };
    await runAssistant(
      { messages: [{ role: "user", content: "x" }] },
      { client, tools: [echoTool("echo", 1)], maxToolCalls: 1 },
    );
    // 第 2 次调用被全局预算拒绝，内容里应带 collected_ids
    const rejected = seen.find((c) => c.includes("tool_budget_exceeded"));
    expect(rejected).toBeTruthy();
    expect(rejected).toContain("collected_ids");
    expect(rejected).toContain("XS-R-TUODI");
  });
});

describe("4) 超时", () => {
  it("工具超过 timeoutMs → tool_timeout，不阻塞循环", async () => {
    const slow: ToolSpec = {
      name: "slow",
      description: "慢工具",
      parameters: { type: "object", properties: {} },
      maxCallsPerTool: 2,
      run: () => new Promise((resolve) => setTimeout(() => resolve({ ok: true, data: {}, context: undefined as never, citations: [] }), 200)) as never,
    };
    const client = scripted([
      { tool_calls: [{ id: "c1", function: { name: "slow", arguments: "{}" } }] },
      { content: "超时了。" },
    ]);
    const result = await runAssistant(
      { messages: [{ role: "user", content: "x" }] },
      { client, tools: [slow], toolTimeoutMs: 20 },
    );
    expect(result.toolCalls[0]!.code).toBe("tool_timeout");
    expect(result.text).toBe("超时了。");
  });
});

describe("5) 无 tool_calls 能力的降级（预检索）", () => {
  it("模型报不支持 tools → 走预检索，把检索结果注入再答", async () => {
    const client: ChatClient = {
      async chat({ messages }) {
        if (messages.length <= 2 && messages[0]!.role === "system" && messages[1]!.role === "user" && !messages[1]!.content!.includes("检索到的知识库内容")) {
          throw new Error("this model does not support tools");
        }
        return { content: answerWithClaims(["XS-R-TUODI"]) };
      },
    };
    const result = await runAssistant(
      { messages: [{ role: "user", content: "拖底阈值多少" }] },
      {
        client,
        tools: [echoTool("echo", 2)],
        preRetrieval: async () => [
          { tool: "search_rules", result: { ok: true, data: { items: [{ id: "XS-R-TUODI" }] }, context: {} as never, citations: [] } },
        ],
      },
    );
    expect(result.mode).toBe("pre_retrieval");
    expect(result.injectedIds).toContain("XS-R-TUODI");
    expect(result.grounded).toBe(true);
  });

  it("forcePreRetrieval 直接走降级，模型工具能力无关", async () => {
    const client = scripted([{ content: answerWithClaims(["XS-R-TUODI"]) }]);
    const result = await runAssistant(
      { messages: [{ role: "user", content: "拖底" }] },
      {
        client,
        forcePreRetrieval: true,
        preRetrieval: async () => [
          { tool: "get_rule", result: { ok: true, data: { id: "XS-R-TUODI" }, context: {} as never, citations: [] } },
        ],
      },
    );
    expect(result.mode).toBe("pre_retrieval");
    expect(result.grounded).toBe(true);
  });
});

describe("6) grounding：逐条校验", () => {
  it("解析 ```json 围栏里的 claims，并从正文里去掉代码块", () => {
    const parsed = parseClaims(answerWithClaims(["XS-R-TUODI"]));
    expect(parsed.parsed).toBe(true);
    expect(parsed.claims).toHaveLength(1);
    expect(parsed.claims[0]!.refs).toEqual(["XS-R-TUODI"]);
    expect(parsed.text).toContain("结论如下");
    expect(parsed.text).not.toContain("claims");
  });

  it("没有 claims → parsed=false，整体不 grounded", () => {
    const result = groundAnswer("萧山拖底是 −200。", new Set(["XS-R-TUODI"]));
    expect(result.claims).toHaveLength(0);
    expect(result.grounded).toBe(false);
  });

  it("refs 不在注入集合 → invalid_ref；空 refs → unverified；全 ok 才 grounded", () => {
    const injected = new Set(["XS-R-TUODI"]);
    const result = validateClaims(
      [
        { text: "有效", refs: ["XS-R-TUODI"] },
        { text: "编造", refs: ["XS-R-FAKE"] },
        { text: "无出处", refs: [] },
      ],
      injected,
    );
    expect(result.claims.map((c) => c.status)).toEqual(["ok", "invalid_ref", "unverified"]);
    expect(result.claims[1]!.invalid_refs).toEqual(["XS-R-FAKE"]);
    expect(result.grounded).toBe(false);
  });

  it("collectIds 能从任意工具返回里抽出规则/配置/未决 ID", () => {
    const ids = collectIds({
      items: [{ id: "XS-R-TUODI", base_rule_ref: "HJ-R-TUODI" }],
      configs: [{ canonical_id: "HJ-C-DIFEN" }],
      unresolved: ["XS-U-001"],
    });
    expect([...ids].sort()).toEqual(["HJ-C-DIFEN", "HJ-R-TUODI", "XS-R-TUODI", "XS-U-001"]);
  });
});

describe("7) 审计", () => {
  it("每次工具调用写一条，带参数、状态、耗时与引用", async () => {
    const entries: AuditEntry[] = [];
    const client = scripted([
      { tool_calls: [{ id: "c1", function: { name: "echo", arguments: json({ q: 1 }) } }] },
      { content: answerWithClaims(["XS-R-TUODI"]) },
    ]);
    await runAssistant(
      { messages: [{ role: "user", content: "x" }] },
      { client, tools: [echoTool("echo", 2)], onAudit: (entry) => entries.push(entry) },
    );
    expect(entries).toHaveLength(1);
    expect(entries[0]!.tool).toBe("echo");
    expect(entries[0]!.args).toEqual({ q: 1 });
    expect(entries[0]!.ok).toBe(true);
    expect(entries[0]!.citations).toContain("XS-R-TUODI");
    expect(typeof entries[0]!.ms).toBe("number");
  });
});

describe("8) 降级检索关键词", () => {
  it("keywordOf 去掉疑问词并取有效片段", () => {
    expect(keywordOf("杭州和萧山的财神有什么区别？")).toBe("杭州");
    expect(keywordOf("拖底阈值是多少")).toBe("拖底阈值");
  });
});
