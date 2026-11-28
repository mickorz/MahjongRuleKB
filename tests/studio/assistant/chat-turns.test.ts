// 适配层验收：我们的消息 → 参考项目聊天框的 Turn / ThreadItem
import { describe, expect, it } from "vitest";

import {
  itemsForMessage,
  stepLabel,
  summarizeSteps,
  toChatTurns,
  type AssistantUiMessage,
} from "../../../studio/assistant/chat-turns.ts";

const user = (content: string): AssistantUiMessage => ({ role: "user", content });
const assistant = (patch: Partial<AssistantUiMessage> = {}): AssistantUiMessage => ({
  role: "assistant",
  content: "结论：拖底阈值 −200。",
  ...patch,
});

describe("1) 一问一答 → 一个 turn", () => {
  it("user 与 assistant 合进同一 turn，items 顺序为 user → 工具 → 正文", () => {
    const turns = toChatTurns([
      user("拖底怎么判"),
      assistant({ steps: [{ name: "search_rules", ok: true, ms: 90 }, { name: "get_rule", ok: true, ms: 110 }] }),
    ]);
    expect(turns).toHaveLength(1);
    const types = turns[0]!.items.map((i) => i.type);
    expect(types).toEqual(["userMessage", "dynamicToolCall", "dynamicToolCall", "agentMessage"]);
    expect(turns[0]!.status).toBe("completed");
  });

  it("多轮对话 → 每轮一个 turn，id 稳定递增", () => {
    const turns = toChatTurns([user("q1"), assistant(), user("q2"), assistant()]);
    expect(turns.map((t) => t.id)).toEqual(["turn-1", "turn-2"]);
    expect(turns[0]!.items.map((i) => i.type)).toEqual(["userMessage", "agentMessage"]);
    expect(turns[1]!.items.map((i) => i.type)).toEqual(["userMessage", "agentMessage"]);
  });

  it("同一 turn 内 item id 唯一", () => {
    const turns = toChatTurns([
      user("q"),
      assistant({ steps: [{ name: "a", ok: true }, { name: "b", ok: true }, { name: "c", ok: false, code: "not_found" }] }),
    ]);
    const ids = turns[0]!.items.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("2) 工具步骤映射", () => {
  it("成功 / 失败分别映射 status 与 output", () => {
    const items = itemsForMessage(
      assistant({
        steps: [
          { name: "get_rule", ok: true, ms: 88 },
          { name: "get_rule", ok: false, code: "invalid_params" },
        ],
      }),
      "turn-1",
      1,
    ) as unknown as Array<Record<string, unknown>>;

    const tools = items.filter((i) => i.type === "dynamicToolCall");
    expect(tools).toHaveLength(2);
    expect(tools[0]!.status).toBe("completed");
    expect(tools[0]!.output).toBe("ok · 88ms");
    expect(tools[1]!.status).toBe("failed");
    expect(tools[1]!.output).toBe("invalid_params");
    expect(tools[0]!.tool).toBe("get_rule");
  });

  it("参数原样带进 arguments，便于展开看明细", () => {
    const items = itemsForMessage(
      assistant({ steps: [{ name: "search_rules", ok: true, args: { variant: "xiaoshan", query: "财神" } }] }),
      "turn-1",
      1,
    ) as unknown as Array<Record<string, unknown>>;
    const tool = items.find((i) => i.type === "dynamicToolCall")!;
    expect(tool.arguments).toEqual({ variant: "xiaoshan", query: "财神" });
  });
});

describe("3) grounding 可见性", () => {
  it("有未通过校验的 claim → 生成一条 reasoning 提示", () => {
    const items = itemsForMessage(
      assistant({
        claims: [
          { text: "有效的结论", refs: ["XS-R-TUODI"], status: "ok" },
          { text: "编造的结论", refs: ["XS-R-FAKE"], status: "invalid_ref", invalid_refs: ["XS-R-FAKE"] },
          { text: "没出处的结论", refs: [], status: "unverified" },
        ],
        grounded: false,
      }),
      "turn-1",
      1,
    ) as unknown as Array<Record<string, unknown>>;

    const notice = items.find((i) => i.type === "reasoning")!;
    expect(notice).toBeDefined();
    expect(String(notice.text)).toContain("2 条结论缺少可追溯依据");
    expect(String(notice.text)).toContain("编造的结论");
  });

  it("全部 claim 通过 → 不产生提示项", () => {
    const items = itemsForMessage(
      assistant({ claims: [{ text: "ok", refs: ["XS-R-TUODI"], status: "ok" }], grounded: true }),
      "turn-1",
      1,
    ) as unknown as Array<Record<string, unknown>>;
    expect(items.some((i) => i.type === "reasoning")).toBe(false);
  });
});

describe("4) 人话摘要（对齐参考项目 toolGroupSummary）", () => {
  it("按工具类别聚合 + 失败单独计数", () => {
    const summary = summarizeSteps([
      { name: "search_rules", ok: true },
      { name: "search_rules", ok: true },
      { name: "get_config", ok: true },
      { name: "get_rule", ok: false, code: "not_found" },
    ]);
    expect(summary).toContain("检索规则 2 次");
    expect(summary).toContain("查询配置 1 次");
    expect(summary).toContain("1 次失败");
  });

  it("全部失败时只报失败次数", () => {
    expect(summarizeSteps([{ name: "get_rule", ok: false }, { name: "get_rule", ok: false }])).toBe("2 次调用失败");
  });

  it("空步骤 → 空摘要", () => {
    expect(summarizeSteps([])).toBe("");
  });

  it("未知工具名回退为原名", () => {
    expect(stepLabel("mystery_tool")).toBe("mystery_tool");
  });
});

describe("5) 边界", () => {
  it("空历史 → 空数组", () => {
    expect(toChatTurns([])).toEqual([]);
  });

  it("连续两条 assistant（无 user）也各自成 turn，不丢内容", () => {
    const turns = toChatTurns([assistant({ content: "甲" }), assistant({ content: "乙" })]);
    // 首条 assistant 会开一个 turn（因为还没有 current），第二条仍归该 turn
    expect(turns).toHaveLength(1);
    const texts = turns[0]!.items.map((i) => (i as { text?: string }).text ?? "");
    expect(texts.join("|")).toContain("甲");
    expect(texts.join("|")).toContain("乙");
  });

  it("内容为空且无步骤的消息不产生 item", () => {
    const items = itemsForMessage({ role: "assistant", content: "   " }, "turn-1", 1);
    expect(items).toEqual([]);
  });
});
