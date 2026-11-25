// W0-6：产物注册表 + Stage 写入口
// 重点：未注册产物一律拒绝；人工输入（diff-review.yaml）任何主体都不得写；
//      基座允许 Stage 生成但禁止人工编辑；变体隔离在写盘路径上真实生效（不是只在断言函数里）。
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  artifactCatalog,
  assertWritable,
  baseDocumentVariant,
  PathPolicyError,
  ROOT_DOCUMENTS,
} from "../../../studio/paths/registry.ts";
import { isDocumentOutputDir, writeStageArtifact } from "../../../studio/paths/stage-writer.ts";

describe("W0-6 产物注册表", () => {
  it("12 个登记组，类别无拼写漂移", () => {
    const expected = [
      "document",
      "outline",
      "override",
      "review-input",
      "review-record",
      "lock",
      "quality",
      "diff-report",
      "conflict",
      "index",
      "view",
      "history",
    ];
    expect(new Set(artifactCatalog.map((a) => a.category))).toEqual(new Set(expected));
  });

  it("每个产物都声明了生命周期，且持久类产物不会被标记为可重建", () => {
    const rebuildable = artifactCatalog.filter((a) => a.lifetime === "rebuildable").map((a) => a.name);
    expect(rebuildable).toContain("需求全文.md");
    expect(rebuildable).toContain("changes.json");
    expect(rebuildable).not.toContain("document.json");
    expect(rebuildable).not.toContain("editorial-overrides.yaml");
  });

  it("正式文档只允许 stage 生成，review-records 只允许 server 写", () => {
    const doc = artifactCatalog.find((a) => a.name === "document.json")!;
    expect(doc.writers).toEqual([{ actor: "stage", intent: "generate" }]);
    const review = artifactCatalog.find((a) => a.name === "review-records.json")!;
    expect(review.writers).toEqual([{ actor: "server", intent: "apply-review" }]);
  });

  it("history 用目录前缀登记，允许事务写快照", () => {
    expect(assertWritable("transaction", "apply-expression", "documents/xiaoshan/history/v4/document.json")).toBeTruthy();
    expect(() => assertWritable("stage", "generate", "documents/xiaoshan/history/v4/document.json")).toThrow(
      PathPolicyError,
    );
  });
});

describe("W0-6 Stage 写入口", () => {
  let kb: string;
  beforeEach(() => {
    kb = join(tmpdir(), `kb-stage-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    mkdirSync(join(kb, ROOT_DOCUMENTS, "hangzhou"), { recursive: true });
    mkdirSync(join(kb, ROOT_DOCUMENTS, "xiaoshan"), { recursive: true });
  });
  afterEach(() => rmSync(kb, { recursive: true, force: true }));

  it("变体产物正常写出", () => {
    const rel = writeStageArtifact(kb, "xiaoshan", "document.json", "{}\n");
    expect(rel).toBe("documents/xiaoshan/document.json");
    expect(readFileSync(join(kb, rel), "utf8")).toBe("{}\n");
  });

  it("基座允许 Stage 生成与重新生成", () => {
    writeStageArtifact(kb, baseDocumentVariant, "document.json", '{"v":1}\n');
    writeStageArtifact(kb, baseDocumentVariant, "document.json", '{"v":2}\n');
    expect(readFileSync(join(kb, "documents/hangzhou/document.json"), "utf8")).toBe('{"v":2}\n');
  });

  it("未注册产物写不进去", () => {
    expect(() => writeStageArtifact(kb, "xiaoshan", "临时草稿.json", "x")).toThrow(/未知文档产物/);
    expect(existsSync(join(kb, "documents/xiaoshan/临时草稿.json"))).toBe(false);
  });

  it("人工输入 diff-review.yaml 通过写入口一律拒绝", () => {
    expect(() => writeStageArtifact(kb, "xiaoshan", "diff-review.yaml", "confirmed_rules: []\n")).toThrow(
      /系统外维护/,
    );
    expect(existsSync(join(kb, "documents/xiaoshan/diff-review.yaml"))).toBe(false);
  });

  it("输出目录判断：documents/ 内必须校验，临时目录不强制", () => {
    expect(isDocumentOutputDir("documents/xiaoshan")).toBe(true);
    expect(isDocumentOutputDir("documents")).toBe(true);
    expect(isDocumentOutputDir("./documents/xiaoshan")).toBe(true);
    expect(isDocumentOutputDir("tmp/out")).toBe(false);
  });
});
