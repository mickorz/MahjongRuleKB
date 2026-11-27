// LlmGenerator 测试：全部用本地 HTTP 假端点，不打真实 API
// 重点：请求形状正确、失败都走 error 而不是抛未捕获异常、key 不进日志、prompt 有界。
import { describe, it, expect, afterEach } from "vitest";
import { createServer, type Server } from "node:http";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  buildUserPrompt,
  createLlmGeneratorFromTier,
  LlmGenerator,
  resolveProviderConfig,
} from "../../../studio/generate/llm-generator.ts";
import type { ChapterRequest } from "../../../studio/generate/provider.ts";

const servers: Server[] = [];
afterEach(async () => {
  await Promise.all(servers.splice(0).map((s) => new Promise<void>((r) => s.close(() => r()))));
});

const request: ChapterRequest = {
  section_id: "opening",
  title: "开局与发牌",
  rules: [
    { id: "HJ-R-DINGZHUANG", name: "定庄", body: "- **触发**：每场首小局开始。\n- **结果**：随机确定庄家。" },
    { id: "HJ-R-LUNZHUANG", name: "轮庄", body: "- **条件**：第二小局起。" },
  ],
  configs: [{ id: "HJ-C-RENSHU", name: "人数", value: 4 }],
  prompt_version: "p1",
};

const validDraft = {
  section_id: "opening",
  paragraphs: [
    {
      title: "定庄",
      text: "首局从四名参战玩家中随机确定庄家。",
      claims: [{ text: "首局随机", rule_refs: ["HJ-R-DINGZHUANG"], config_refs: ["HJ-C-RENSHU"] }],
    },
  ],
};

/** 起一个假端点，记录收到的请求体 */
async function startServer(
  handler: (body: { model?: string; messages?: Array<{ role: string; content: string }>; response_format?: unknown }) => {
    status: number;
    body: string;
    delayMs?: number;
  },
): Promise<{ baseUrl: string; calls: Array<{ body: unknown; auth?: string }> }> {
  const calls: Array<{ body: unknown; auth?: string }> = [];
  const server = createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => {
      const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
      calls.push({ body, auth: req.headers.authorization });
      const out = handler(body);
      setTimeout(() => {
        res.writeHead(out.status, { "content-type": "application/json" });
        res.end(out.body);
      }, out.delayMs ?? 0);
    });
  });
  servers.push(server);
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", () => r()));
  const port = (server.address() as { port: number }).port;
  return { baseUrl: `http://127.0.0.1:${port}/v1`, calls };
}

const chatBody = (content: string) => JSON.stringify({ choices: [{ message: { content } }] });

describe("LlmGenerator 请求形状", () => {
  it("POST /v1/chat/completions，带 model、messages、json_object、Bearer", async () => {
    const { baseUrl, calls } = await startServer(() => ({ status: 200, body: chatBody(JSON.stringify(validDraft)) }));
    const gen = new LlmGenerator({ baseUrl, apiKey: "sk-test", model: "deepseek-v4.1-flash-official" });
    const res = await gen.generateChapter(request);

    expect(res.draft?.paragraphs.length).toBe(1);
    expect(calls.length).toBe(1);
    const body = calls[0].body as { model: string; response_format: unknown; messages: Array<{ role: string; content: string }> };
    expect(body.model).toBe("deepseek-v4.1-flash-official");
    expect(body.response_format).toEqual({ type: "json_object" });
    expect(body.messages[0].role).toBe("system");
    expect(body.messages[1].role).toBe("user");
    expect(calls[0].auth).toBe("Bearer sk-test");
  });

  it("prompt 里含本章全部规则与配置 ID，且规则正文按上限截断", () => {
    const longBody = "字".repeat(5000);
    const prompt = buildUserPrompt({ ...request, rules: [{ id: "HJ-R-LONG", name: "长卡", body: longBody }] }, 100);
    expect(prompt).toContain("HJ-R-LONG");
    expect(prompt).toContain("HJ-C-RENSHU");
    expect(prompt).toContain("已截断");
    expect(prompt.length).toBeLessThan(longBody.length);
    expect(prompt).toContain('section_id 必须是 "opening"');
  });

  it("text_only 能力时不发 response_format（避免服务端拒绝）", async () => {
    const { baseUrl, calls } = await startServer(() => ({ status: 200, body: chatBody(JSON.stringify(validDraft)) }));
    const gen = new LlmGenerator({ baseUrl, apiKey: "k", model: "m", structuredOutput: "text_only" });
    await gen.generateChapter(request);
    expect((calls[0].body as { response_format?: unknown }).response_format).toBeUndefined();
  });
});

describe("LlmGenerator 失败路径", () => {
  it("HTTP 非 2xx → error 含状态码与响应片段，不抛异常", async () => {
    const { baseUrl } = await startServer(() => ({ status: 429, body: '{"error":{"message":"rate limited"}}' }));
    const gen = new LlmGenerator({ baseUrl, apiKey: "k", model: "m" });
    const res = await gen.generateChapter(request);
    expect(res.draft).toBeUndefined();
    expect(res.error).toMatch(/HTTP 429/);
    expect(res.error).toMatch(/rate limited/);
    expect(res.raw.length).toBeGreaterThan(0);
  });

  it("响应不是 Chat Completions 格式 → error 说清楚", async () => {
    const { baseUrl } = await startServer(() => ({ status: 200, body: "not json" }));
    const res = await new LlmGenerator({ baseUrl, apiKey: "k", model: "m" }).generateChapter(request);
    expect(res.error).toMatch(/非 Chat Completions/);
  });

  it("choices 为空 → error 空内容", async () => {
    const { baseUrl } = await startServer(() => ({ status: 200, body: JSON.stringify({ choices: [] }) }));
    const res = await new LlmGenerator({ baseUrl, apiKey: "k", model: "m" }).generateChapter(request);
    expect(res.error).toMatch(/空内容/);
  });

  it("模型返回非 JSON 内容 → error 由解析层给出", async () => {
    const { baseUrl } = await startServer(() => ({ status: 200, body: chatBody("我觉得应该随机定庄") }));
    const res = await new LlmGenerator({ baseUrl, apiKey: "k", model: "m" }).generateChapter(request);
    expect(res.draft).toBeUndefined();
    expect(res.error).toBeDefined();
  });

  it("超时 → error 含超时说明", async () => {
    const { baseUrl } = await startServer(() => ({ status: 200, body: chatBody(JSON.stringify(validDraft)), delayMs: 300 }));
    const res = await new LlmGenerator({ baseUrl, apiKey: "k", model: "m", timeoutMs: 50 }).generateChapter(request);
    expect(res.error).toMatch(/超时/);
  });

  it("连接失败（端口未监听）→ error 网络错误", async () => {
    const res = await new LlmGenerator({ baseUrl: "http://127.0.0.1:9/v1", apiKey: "k", model: "m", timeoutMs: 300 }).generateChapter(request);
    expect(res.error).toMatch(/网络错误/);
  });
});

describe("provider 配置解析", () => {
  it("从 models.json 读取 baseUrl / apiKey / modelIds", () => {
    const dir = join(tmpdir(), `prov-${process.pid}-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, "models.json");
    writeFileSync(
      file,
      JSON.stringify({
        providers: {
          "p1": { baseUrl: "https://example.test/v1", apiKey: "sk-file", models: [{ id: "m1" }, { id: "m2" }] },
        },
      }),
      "utf8",
    );
    const cfg = resolveProviderConfig("p1", { modelsFile: file, env: {} });
    expect(cfg.baseUrl).toBe("https://example.test/v1");
    expect(cfg.apiKey).toBe("sk-file");
    expect(cfg.modelIds).toEqual(["m1", "m2"]);
    rmSync(dir, { recursive: true, force: true });
  });

  it("环境变量优先于 models.json", () => {
    const dir = join(tmpdir(), `prov2-${process.pid}-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, "models.json");
    writeFileSync(file, JSON.stringify({ providers: { p1: { baseUrl: "https://file/v1", apiKey: "sk-file", models: [] } } }), "utf8");
    const cfg = resolveProviderConfig("p1", {
      modelsFile: file,
      env: { RULE_STUDIO_LLM_BASE_URL: "https://env/v1", RULE_STUDIO_LLM_API_KEY: "sk-env" },
    });
    expect(cfg.baseUrl).toBe("https://env/v1");
    expect(cfg.apiKey).toBe("sk-env");
    rmSync(dir, { recursive: true, force: true });
  });

  it("缺 baseUrl/apiKey → 抛错并点名缺什么，不回退宿主默认", () => {
    const dir = join(tmpdir(), `prov3-${process.pid}-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, "models.json");
    writeFileSync(file, JSON.stringify({ providers: {} }), "utf8");
    expect(() => resolveProviderConfig("missing", { modelsFile: file, env: {} })).toThrow(/baseUrl \/ apiKey/);
    rmSync(dir, { recursive: true, force: true });
  });

  it("由档位模型串构造生成器；模型不在清单时给 warning 但继续", () => {
    const dir = join(tmpdir(), `prov4-${process.pid}-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, "models.json");
    writeFileSync(file, JSON.stringify({ providers: { p1: { baseUrl: "https://x/v1", apiKey: "k", models: [{ id: "m1" }] } } }), "utf8");
    const ok = createLlmGeneratorFromTier("p1/m1", { modelsFile: file, env: {} });
    expect(ok.generator.name).toBe("llm:m1");
    expect(ok.warning).toBeUndefined();

    const warn = createLlmGeneratorFromTier("p1/unknown-model", { modelsFile: file, env: {} });
    expect(warn.warning).toMatch(/不在 provider/);
    expect(() => createLlmGeneratorFromTier("没有斜杠", { modelsFile: file, env: {} })).toThrow(/provider\/model/);
    rmSync(dir, { recursive: true, force: true });
  });

  it("本仓库默认档位可解析出 baseUrl 与模型清单（不打印 key）", () => {
    let meta: ReturnType<typeof resolveProviderConfig> | undefined;
    try {
      meta = resolveProviderConfig("cc-switch-zhipu-glm-copy");
    } catch {
      return; // 无本机配置时跳过（CI 环境）
    }
    expect(meta.baseUrl).toContain("http");
    expect(meta.modelIds.length).toBeGreaterThan(0);
    // 只断言结构，绝不把 apiKey 写进断言消息
    expect(typeof meta.apiKey).toBe("string");
  });
});
