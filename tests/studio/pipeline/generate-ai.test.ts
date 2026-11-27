// W1-4：用 provider 生成并装配文档
// 重点：引用来自服务端校验后的 claim；坏引用必须拒绝该章；降级必须显式标注。
import { describe, it, expect } from "vitest";

import { documentSchema } from "../../../studio/contracts/document.ts";
import {
  DeterministicGenerator,
  parseChapterDraft,
  type ChapterRequest,
  type ChapterResponse,
  type Generator,
} from "../../../studio/generate/provider.ts";
import { generateDocumentWithProvider } from "../../../studio/pipeline/generate-ai.ts";
import { buildHangzhouOutline } from "../../../studio/pipeline/outline-hangzhou.ts";
import { planChapters } from "../../../studio/pipeline/plan.ts";
import { readBaseRuleSet } from "../../../studio/pipeline/read-ruleset.ts";

const ruleset = readBaseRuleSet();
const outline = buildHangzhouOutline(ruleset);
const plans = planChapters(ruleset, outline);

/** 按计划拼一个「合规」草稿：每张卡一段，引用真实 ID */
function draftFor(request: ChapterRequest): unknown {
  const paragraphs = [
    ...request.rules.map((r) => ({
      title: r.name,
      text: `${r.name}的完整说明，包含触发条件、处理过程与结果，长度足够避免空壳判定。`,
      claims: [{ text: r.name, rule_refs: [r.id], config_refs: [] }],
    })),
    ...request.configs.map((c) => ({
      title: c.name,
      text: `${c.name}取值为 ${String(c.value)}，作用于本玩法。`,
      claims: [{ text: c.name, rule_refs: [], config_refs: [c.id] }],
    })),
  ];
  return { section_id: request.section_id, paragraphs };
}

class PlanDrivenGenerator implements Generator {
  readonly name = "fake-plan";
  readonly version = "1.0.0";
  readonly capabilities = { structured_output: "native" as const };
  /** 指定某章返回坏草稿 */
  constructor(private readonly sabotage?: (req: ChapterRequest) => string | undefined) {}
  async generateChapter(request: ChapterRequest): Promise<ChapterResponse> {
    const bad = this.sabotage?.(request);
    const raw = bad ?? JSON.stringify(draftFor(request));
    const parsed = parseChapterDraft(raw);
    return { section_id: request.section_id, raw, ...parsed, retries: 0 };
  }
}

describe("W1-4 装配", () => {
  it("合规 provider 生成合法文档，规则与配置全覆盖", async () => {
    const res = await generateDocumentWithProvider(ruleset, outline, new PlanDrivenGenerator(), {
      templateVersion: outline.template_version,
      variant: "hangzhou",
    });
    expect(res.failures).toEqual([]);
    expect(res.degraded).toBe(false);
    expect(documentSchema.safeParse(res.document).success).toBe(true);

    const refs = new Set(res.document.blocks.flatMap((b) => b.content.flatMap((s) => s.references.rule_refs)));
    for (const plan of plans) for (const id of plan.rule_ids) expect(refs.has(id), id).toBe(true);
    const configs = new Set(res.document.blocks.flatMap((b) => b.content.flatMap((s) => s.references.config_refs)));
    for (const plan of plans) for (const id of plan.config_ids) expect(configs.has(id), id).toBe(true);
  });

  it("段落的引用来自 claim，而不是模型自报的结构", async () => {
    const res = await generateDocumentWithProvider(ruleset, outline, new PlanDrivenGenerator(), {
      templateVersion: outline.template_version,
      variant: "hangzhou",
    });
    const openingBlock = res.document.blocks.find((b) => b.section_id === "opening")!;
    const seg = openingBlock.content.find((s) => s.references.rule_refs.includes("HJ-R-DINGZHUANG"))!;
    expect(seg.text).toContain("定庄");
    expect(seg.references.source_evidence_refs.length).toBeGreaterThan(0);
  });

  it("模型编造规则 ID → 该章被拒，记入 failures，不静默丢弃", async () => {
    const gen = new PlanDrivenGenerator((req) =>
      req.section_id === "scoring"
        ? JSON.stringify({
            section_id: "scoring",
            paragraphs: [
              {
                text: "编造的算分规则说明，足够长以避免空壳判定。",
                claims: [{ text: "编造", rule_refs: ["HJ-F-MADE-UP"], config_refs: [] }],
              },
            ],
          })
        : undefined,
    );
    const res = await generateDocumentWithProvider(ruleset, outline, gen, {
      templateVersion: outline.template_version,
      variant: "hangzhou",
    });
    expect(res.failures.length).toBe(1);
    expect(res.failures[0].section_id).toBe("scoring");
    expect(res.failures[0].error).toContain("HJ-F-MADE-UP");
    expect(res.document.blocks.some((b) => b.section_id === "scoring")).toBe(false);
  });

  it("章节 ID 写错也被拒", async () => {
    const gen = new PlanDrivenGenerator((req) =>
      req.section_id === "contract"
        ? JSON.stringify({ section_id: "gameplay", paragraphs: [{ text: "错章内容足够长不会触发空壳判定", claims: [{ text: "x", rule_refs: [req.rules[0].id], config_refs: [] }] }] })
        : undefined,
    );
    const res = await generateDocumentWithProvider(ruleset, outline, gen, { templateVersion: outline.template_version, variant: "hangzhou" });
    expect(res.failures[0].section_id).toBe("contract");
    expect(res.failures[0].error).toMatch(/章节不符/);
  });

  it("确定性降级必须被标记 degraded", async () => {
    const res = await generateDocumentWithProvider(ruleset, outline, new DeterministicGenerator(), {
      templateVersion: outline.template_version,
      variant: "hangzhou",
    });
    expect(res.degraded).toBe(true);
    expect(documentSchema.safeParse(res.document).success).toBe(true);
  });

  it("身份稳定：block_id 按章节序、segment_id 单调且唯一", async () => {
    const res = await generateDocumentWithProvider(ruleset, outline, new PlanDrivenGenerator(), {
      templateVersion: outline.template_version,
      variant: "hangzhou",
    });
    const blocks = res.document.blocks;
    expect(blocks[0].block_id).toBe("DOC-HA-000001");
    for (const [i, b] of blocks.entries()) expect(b.block_id).toBe(`DOC-HA-${String(i + 1).padStart(6, "0")}`);
    const ids = blocks.flatMap((b) => b.content.map((s) => s.segment_id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("算分算例由 calculators 注入且不可编辑（AI 不产数值片段）", async () => {
    const res = await generateDocumentWithProvider(ruleset, outline, new PlanDrivenGenerator(), {
      templateVersion: outline.template_version,
      variant: "hangzhou",
    });
    const scoring = res.document.blocks.find((b) => b.section_id === "scoring")!;
    const injected = scoring.content.filter((s) => s.text.startsWith("庄家自摸时每笔庄闲倍率："));
    expect(injected.length).toBe(1);
    expect(injected[0].editable).toBe(false);
    expect(injected[0].machine_check_status).toBe("passed");
  });

  it("章节级日志回调覆盖 request / response / accepted", async () => {
    const events: string[] = [];
    await generateDocumentWithProvider(ruleset, outline, new PlanDrivenGenerator(), {
      templateVersion: outline.template_version,
      variant: "hangzhou",
      onChapter: (e) => events.push(`${e.section_id}:${e.phase}`),
    });
    expect(events).toContain("opening:request");
    expect(events).toContain("opening:response");
    expect(events).toContain("opening:accepted");
  });

  it("单章彻底失败时文档仍可返回，但 failures 非空（调用方不得当合格产物）", async () => {
    const gen = new PlanDrivenGenerator((req) => (req.section_id === "ui" ? "不是 JSON" : undefined));
    const res = await generateDocumentWithProvider(ruleset, outline, gen, { templateVersion: outline.template_version, variant: "hangzhou", maxRetries: 0 });
    expect(res.failures.length).toBe(1);
    expect(res.failures[0].section_id).toBe("ui");
    expect(documentSchema.safeParse(res.document).success).toBe(true);
  });
});
