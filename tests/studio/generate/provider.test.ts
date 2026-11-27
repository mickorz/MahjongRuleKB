// W1-1：provider 抽象测试
// 重点：能力分级都要能解析；解析失败必须重试且有上限；耗尽必须抛错而不是给半成品。
import { describe, it, expect, vi } from "vitest";

import { chapterDraftSchema } from "../../../studio/contracts/chapter-draft.ts";
import {
  DeterministicGenerator,
  generateChapterOrThrow,
  GenerationFailedError,
  parseChapterDraft,
  type ChapterRequest,
  type ChapterResponse,
  type Generator,
} from "../../../studio/generate/provider.ts";
import { readBaseRuleSet } from "../../../studio/pipeline/read-ruleset.ts";

const ruleset = readBaseRuleSet();
const openingRules = ruleset.rules.filter((r) => ["HJ-R-DINGZHUANG", "HJ-R-LUNZHUANG"].includes(r.id));
const openingConfigs = ruleset.configs.filter((c) => c.id === "HJ-C-RENSHU");

const request: ChapterRequest = {
  section_id: "opening",
  title: "开局与发牌",
  rules: openingRules,
  configs: openingConfigs,
  prompt_version: "p1",
};

const goodDraft = {
  section_id: "opening",
  paragraphs: [
    {
      title: "定庄",
      text: "首局随机确定庄家。",
      claims: [{ text: "首局随机", rule_refs: ["HJ-R-DINGZHUANG"], config_refs: [] }],
    },
  ],
};

class FakeGenerator implements Generator {
  readonly name = "fake";
  readonly version = "1.0.0";
  constructor(
    private readonly outputs: string[],
    readonly capabilities = { structured_output: "native" as const },
  ) {}
  private calls = 0;
  async generateChapter(): Promise<ChapterResponse> {
    const raw = this.outputs[Math.min(this.calls, this.outputs.length - 1)];
    this.calls += 1;
    const parsed = parseChapterDraft(raw);
    return { section_id: "opening", raw, ...parsed, retries: 0 };
  }
}

describe("W1-1 解析：三种能力都能拿到结构化草稿", () => {
  it("native / json_mode：纯 JSON", () => {
    expect(parseChapterDraft(JSON.stringify(goodDraft)).draft).toBeDefined();
  });

  it("text_only：带 ```json 围栏", () => {
    const raw = "说明文字\n```json\n" + JSON.stringify(goodDraft) + "\n```\n结尾";
    expect(parseChapterDraft(raw).draft?.paragraphs.length).toBe(1);
  });

  it("text_only：前后有废话但中间是 JSON", () => {
    const raw = "好的，以下是内容：" + JSON.stringify(goodDraft) + " 希望对你有帮助。";
    expect(parseChapterDraft(raw).draft).toBeDefined();
  });

  it("空内容与无效 JSON 返回可读错误", () => {
    expect(parseChapterDraft("   ").error).toMatch(/空内容/);
    expect(parseChapterDraft("这不是 JSON").error).toBeDefined();
  });

  it("结构不合法时错误里带路径，便于定位", () => {
    const bad = JSON.stringify({ section_id: "opening", paragraphs: [{ text: "x", claims: [] }] });
    const r = parseChapterDraft(bad);
    expect(r.draft).toBeUndefined();
    expect(r.error).toMatch(/paragraphs|claims|至少/);
  });
});

describe("W1-1 重试与失败冒泡", () => {
  it("首次不合法、次次合法 → 成功且 retries=1", async () => {
    const gen = new FakeGenerator(["不是 JSON", JSON.stringify(goodDraft)]);
    const onRetry = vi.fn();
    const res = await generateChapterOrThrow(gen, request, { onRetry });
    expect(res.draft).toBeDefined();
    expect(res.retries).toBe(1);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("一直不合法 → 抛 GenerationFailedError，且带上原始输出", async () => {
    const gen = new FakeGenerator(["坏", "还是坏", "继续坏"]);
    await expect(generateChapterOrThrow(gen, request, { maxRetries: 2 })).rejects.toBeInstanceOf(GenerationFailedError);
    await generateChapterOrThrow(gen, request, { maxRetries: 0 }).catch((e: GenerationFailedError) => {
      expect(e.sectionId).toBe("opening");
      expect(e.attempts).toBe(1);
      expect(e.lastRaw.length).toBeGreaterThan(0);
    });
  });

  it("重试次数有上限，不会无限重试", async () => {
    const gen = new FakeGenerator(["坏"]);
    const spy = vi.spyOn(gen, "generateChapter");
    await expect(generateChapterOrThrow(gen, request, { maxRetries: 2 })).rejects.toThrow();
    expect(spy).toHaveBeenCalledTimes(3);
  });
});

describe("W1-1 DeterministicGenerator", () => {
  it("能把规则与配置展开成合法草稿，且每条 claim 引用真实 ID", async () => {
    const gen = new DeterministicGenerator();
    expect(gen.capabilities.structured_output).toBe("text_only");
    const res = await gen.generateChapter(request);
    expect(res.error).toBeUndefined();
    const parsed = chapterDraftSchema.parse(res.draft);
    const refs = parsed.paragraphs.flatMap((p) => p.claims.flatMap((c) => [...c.rule_refs, ...c.config_refs]));
    expect(refs).toContain("HJ-R-DINGZHUANG");
    expect(refs).toContain("HJ-C-RENSHU");
  });

  it("退化生成不带任何编造 ID（引用集合是规则集的子集）", async () => {
    const gen = new DeterministicGenerator();
    const res = await gen.generateChapter(request);
    const known = new Set([
      ...ruleset.rules.map((r) => r.id),
      ...ruleset.configs.map((c) => c.id),
    ]);
    const refs = res.draft!.paragraphs.flatMap((p) => p.claims.flatMap((c) => [...c.rule_refs, ...c.config_refs]));
    for (const r of refs) expect(known.has(r), r).toBe(true);
  });
});
