// W1-8：章节级执行日志（对应评审 P0-4 后半：能定位「哪一章失败」）
// 目录结构：
//   .rule-studio/workflow/<task>/run.json
//   .rule-studio/workflow/<task>/chapters/<NN>-<section_id>/request.json
//                                                      /response.raw.txt
//                                                      /parsed.json 或 parse-error.txt
//                                                      /validation.json
//                                                      /retries.json
// 不建 Dashboard：只要 `ls` 能看出哪一章留下痕迹即可。
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { assertWritable, ROOT_RUNTIME } from "../paths/registry.ts";

const pad = (n: number) => String(n).padStart(2, "0");

export interface RunMeta {
  task_id: string;
  ruleset_id: string;
  target_variant: string;
  generator: string;
  prompt_version: string;
  input_hash?: string;
  started_at?: string;
}

export interface ChapterLogEvent {
  section_id: string;
  phase: "request" | "response" | "rejected" | "accepted";
  detail?: unknown;
}

/** 一次生成运行的日志目录；写盘前过权限矩阵（stage 允许写 .rule-studio/workflow/） */
export class GenerationRunLog {
  readonly dir: string;
  private readonly chapters = new Map<string, number>();
  private chapterCount = 0;

  private readonly kbRoot: string;
  readonly meta: RunMeta;

  constructor(kbRoot: string, meta: RunMeta) {
    this.kbRoot = kbRoot;
    this.meta = meta;
    this.dir = assertWritable("stage", "generate", `${ROOT_RUNTIME}/workflow/${meta.task_id}`);
    mkdirSync(join(kbRoot, this.dir, "chapters"), { recursive: true });
    this.writeJson("run.json", {
      ...meta,
      started_at: meta.started_at ?? new Date().toISOString(),
      status: "running",
    });
  }

  private writeJson(relative: string, value: unknown): void {
    const abs = join(this.kbRoot, this.dir, relative);
    mkdirSync(join(abs, ".."), { recursive: true });
    writeFileSync(abs, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  }

  private chapterDir(sectionId: string): { relative: string; index: number } {
    const existing = this.chapters.get(sectionId);
    if (existing !== undefined) return { relative: `chapters/${pad(existing)}-${sectionId}`, index: existing };
    this.chapterCount += 1;
    this.chapters.set(sectionId, this.chapterCount);
    return { relative: `chapters/${pad(this.chapterCount)}-${sectionId}`, index: this.chapterCount };
  }

  /** 记录一条章节事件；请求与响应分别落盘，便于失败时还原现场 */
  record(event: ChapterLogEvent): void {
    const { relative } = this.chapterDir(event.section_id);
    switch (event.phase) {
      case "request":
        this.writeJson(`${relative}/request.json`, event.detail ?? {});
        break;
      case "response": {
        const detail = (event.detail ?? {}) as { raw?: string; retries?: number };
        const raw = detail.raw ?? "";
        const abs = join(this.kbRoot, this.dir, relative);
        mkdirSync(abs, { recursive: true });
        writeFileSync(join(abs, "response.raw.txt"), raw, "utf8");
        this.writeJson(`${relative}/retries.json`, { retries: detail.retries ?? 0 });
        break;
      }
      case "accepted":
        this.writeJson(`${relative}/validation.json`, { ok: true });
        break;
      case "rejected":
        this.writeJson(`${relative}/validation.json`, { ok: false, issues: event.detail ?? [] });
        break;
    }
  }

  /** 记录解析结果（成功写 parsed.json，失败写 parse-error.txt） */
  recordParsed(sectionId: string, parsed: { draft?: unknown; error?: string; raw: string }): void {
    const { relative } = this.chapterDir(sectionId);
    const abs = join(this.kbRoot, this.dir, relative);
    mkdirSync(abs, { recursive: true });
    if (parsed.draft) {
      this.writeJson(`${relative}/parsed.json`, parsed.draft);
    } else {
      writeFileSync(join(abs, "parse-error.txt"), parsed.error ?? "未知解析错误", "utf8");
    }
    writeFileSync(join(abs, "response.raw.txt"), parsed.raw, "utf8");
  }

  finish(status: "passed" | "failed" | "degraded", extra: Record<string, unknown> = {}): void {
    this.writeJson("run.json", {
      ...this.meta,
      finished_at: new Date().toISOString(),
      status,
      chapters: [...this.chapters.entries()].map(([sectionId, index]) => ({ section_id: sectionId, index })),
      ...extra,
    });
  }
}
