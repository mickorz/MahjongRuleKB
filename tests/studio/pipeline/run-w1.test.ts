// W1-8 / W1-9：章节级执行日志与生成入口
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { GenerationRunLog } from "../../../studio/pipeline/run-log.ts";
import { runW1, statsOf } from "../../../studio/pipeline/run-w1.ts";
import { parseChapterDraft, type ChapterRequest, type ChapterResponse, type Generator } from "../../../studio/generate/provider.ts";
import { documentSchema } from "../../../studio/contracts/document.ts";
import { qualityReportSchema } from "../../../studio/contracts/machine-check.ts";
import { parseInputLock } from "../../../studio/pipeline/lock.ts";
import { readBaseRuleSet } from "../../../studio/pipeline/read-ruleset.ts";

const ruleset = readBaseRuleSet();

class PlanDrivenGenerator implements Generator {
  readonly name = "fake-plan";
  readonly version = "1.0.0";
  readonly capabilities = { structured_output: "native" as const };
  constructor(private sabotageSection?: string) {}
  async generateChapter(request: ChapterRequest): Promise<ChapterResponse> {
    const broken = this.sabotageSection === request.section_id;
    const draft = {
      section_id: request.section_id,
      paragraphs: [
        ...request.rules.map((r) => ({
          title: r.name,
          text: `${r.name}的说明包含触发条件、处理过程与结果，长度足够不会被判空壳。`,
          claims: [{ text: r.name, rule_refs: [r.id], config_refs: [] }],
        })),
        ...request.configs.map((c) => ({
          title: c.name,
          text: `${c.name}取值为 ${String(c.value)}，作用于本玩法。`,
          claims: [{ text: c.name, rule_refs: [], config_refs: [c.id] }],
        })),
      ],
    };
    const raw = broken ? "不是 JSON" : JSON.stringify(draft);
    const parsed = parseChapterDraft(raw);
    return { section_id: request.section_id, raw, ...parsed, retries: 0 };
  }
}

describe("W1-8 章节级日志", () => {
  let kb: string;
  beforeEach(() => {
    kb = join(tmpdir(), `kb-log-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    mkdirSync(kb, { recursive: true });
  });
  afterEach(() => rmSync(kb, { recursive: true, force: true }));

  it("按章节建目录，请求与响应分别落盘", () => {
    const log = new GenerationRunLog(kb, {
      task_id: "t1",
      ruleset_id: "hangzhou-friends-4p",
      target_variant: "hangzhou",
      generator: "fake",
      prompt_version: "p1",
    });
    log.record({ section_id: "opening", phase: "request", detail: { rules: ["HJ-R-DINGZHUANG"] } });
    log.record({ section_id: "opening", phase: "response", detail: { raw: "{\"a\":1}", retries: 1 } });
    log.record({ section_id: "opening", phase: "accepted" });
    log.finish("passed");

    const dir = join(kb, log.dir);
    expect(existsSync(join(dir, "run.json"))).toBe(true);
    const chapterDir = join(dir, "chapters/01-opening");
    expect(existsSync(join(chapterDir, "request.json"))).toBe(true);
    expect(readFileSync(join(chapterDir, "response.raw.txt"), "utf8")).toBe("{\"a\":1}");
    expect(JSON.parse(readFileSync(join(chapterDir, "retries.json"), "utf8")).retries).toBe(1);
    expect(JSON.parse(readFileSync(join(chapterDir, "validation.json"), "utf8")).ok).toBe(true);
    expect(JSON.parse(readFileSync(join(dir, "run.json"), "utf8")).status).toBe("passed");
  });

  it("失败章节留下 parse-error 与拒绝原因", () => {
    const log = new GenerationRunLog(kb, {
      task_id: "t2",
      ruleset_id: "hangzhou-friends-4p",
      target_variant: "hangzhou",
      generator: "fake",
      prompt_version: "p1",
    });
    log.recordParsed("scoring", { raw: "坏输出", error: "JSON 解析失败" });
    log.record({ section_id: "scoring", phase: "rejected", detail: [{ code: "draft.unknown-rule-ref" }] });
    const chapterDir = join(kb, log.dir, "chapters/01-scoring");
    expect(readFileSync(join(chapterDir, "parse-error.txt"), "utf8")).toContain("JSON 解析失败");
    expect(JSON.parse(readFileSync(join(chapterDir, "validation.json"), "utf8")).issues.length).toBe(1);
  });
});

describe("W1-9 入口", () => {
  let dir: string;
  beforeEach(() => {
    dir = join(tmpdir(), `w1-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    mkdirSync(dir, { recursive: true });
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("合规 provider：四件产物齐备且通过", async () => {
    const out = join(dir, "out");
    const res = await runW1({ outDir: out, kbRoot: dir, taskId: "t-pass", generator: new PlanDrivenGenerator() });
    expect(res.ok, res.reasons.join("；")).toBe(true);
    expect(res.degraded).toBe(false);
    expect(existsSync(join(out, "document.json"))).toBe(true);
    expect(existsSync(join(out, "需求全文.md"))).toBe(true);
    expect(existsSync(join(out, "generation.lock.json"))).toBe(true);
    expect(existsSync(join(out, "quality-report.json"))).toBe(true);

    const doc = JSON.parse(readFileSync(join(out, "document.json"), "utf8"));
    expect(documentSchema.safeParse(doc).success).toBe(true);
    expect(qualityReportSchema.safeParse(JSON.parse(readFileSync(join(out, "quality-report.json"), "utf8"))).success).toBe(true);
    expect(parseInputLock(readFileSync(join(out, "generation.lock.json"), "utf8")).input_hash).toBe(res.lock.input_hash);
  });

  it("确定性降级：门禁全过也不算 W1 通过", async () => {
    const res = await runW1({ outDir: join(dir, "deg"), kbRoot: dir, taskId: "t-deg" });
    expect(res.degraded).toBe(true);
    expect(res.ok).toBe(false);
    expect(res.reasons.join()).toMatch(/降级/);
    expect(JSON.parse(readFileSync(join(dir, ".rule-studio/workflow/t-deg/run.json"), "utf8")).status).toBe("degraded");
  });

  it("单章失败即整体不通过，且日志里能看到该章", async () => {
    const res = await runW1({
      outDir: join(dir, "fail"),
      kbRoot: dir,
      taskId: "t-fail",
      generator: new PlanDrivenGenerator("ui"),
    });
    expect(res.ok).toBe(false);
    expect(res.reasons.join()).toMatch(/章节失败.*ui/);
    const run = JSON.parse(readFileSync(join(dir, ".rule-studio/workflow/t-fail/run.json"), "utf8"));
    expect(run.status).toBe("failed");
    expect(run.reasons.join()).toMatch(/ui/);
  });

  it("G5 默认开启；显式关闭时不再计入原因", async () => {
    const on = await runW1({ outDir: join(dir, "g5on"), kbRoot: dir, taskId: "t-on", generator: new PlanDrivenGenerator() });
    expect(on.goldset.enabled).toBe(true);
    const off = await runW1({ outDir: join(dir, "g5off"), kbRoot: dir, taskId: "t-off", generator: new PlanDrivenGenerator(), goldset: false });
    expect(off.goldset.enabled).toBe(false);
  }, 30000);
});

describe("W1-9 新旧对比统计", () => {
  it("统计块数、段数、平均段长、空壳数、引用密度", () => {
    const stats = statsOf({
      blocks: [
        {
          section_id: "opening",
          content: [
            { text: "首局从四名参战玩家中随机确定庄家", references: { rule_refs: ["HJ-R-DINGZHUANG"], config_refs: [] } },
            { text: "牢", references: { rule_refs: [], config_refs: [] } },
          ],
        },
      ],
    });
    expect(stats.blocks).toBe(1);
    expect(stats.segments).toBe(2);
    expect(stats.shellSegments).toBe(1);
    expect(stats.refsPerSegment).toBe(0.5);
    expect(stats.sections).toEqual(["opening"]);
  });

  it("空文档不除零", () => {
    expect(statsOf({ blocks: [] })).toMatchObject({ blocks: 0, segments: 0, avgSegmentLength: 0, refsPerSegment: 0 });
  });

  it("对比口径能区分「槽位展开（段多且短）」与「章节生成（段少且长）」", () => {
    // 槽位展开：一卡多段，段均较短，引用密度高
    const slotStyle = statsOf({
      blocks: [
        {
          section_id: "opening",
          content: Array.from({ length: 8 }, (_, i) => ({
            text: `定庄·槽位${i}：内容`,
            references: { rule_refs: ["HJ-R-DINGZHUANG"], config_refs: [] },
          })),
        },
      ],
    });
    // 章节生成：一段话覆盖多条规则，段均更长，引用密度更低
    const proseStyle = statsOf({
      blocks: [
        {
          section_id: "opening",
          content: [
            {
              text: "首局从四名参战玩家中随机确定庄家，掷骰开始前庄家及其牢数已确定；第二小局起按轮庄规则连庄或换庄，掷骰只作展示用途。",
              references: { rule_refs: ["HJ-R-DINGZHUANG", "HJ-R-LUNZHUANG"], config_refs: [] },
            },
          ],
        },
      ],
    });
    expect(slotStyle.segments).toBeGreaterThan(proseStyle.segments);
    expect(slotStyle.avgSegmentLength).toBeLessThan(proseStyle.avgSegmentLength);
    expect(slotStyle.shellSegments).toBe(0);
    expect(proseStyle.shellSegments).toBe(0);
    expect(ruleset.rules.length).toBeGreaterThan(0);
  });
});
