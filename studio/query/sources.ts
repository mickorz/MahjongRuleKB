// Rule Copilot 查询层：原始证据读取（第三批 2/3）
//
// 安全边界（本文件的核心职责）：
// - 只接受「当前规则集已登记的证据」：由 classifyEvidence 产出的 file+section，
//   不接受模型/客户端传入的任意路径；
// - 拒绝绝对路径、拒绝 `..` 穿越、规范化后必须仍在 rulebook/sources/ 内；
// - 用 realpath 校验真实路径不逃逸知识库（防符号链接逃逸）；
// - 只读、只读文件、超时/截断明确返回。
import { existsSync, readFileSync, realpathSync, statSync } from "node:fs";
import { posix } from "node:path";

import { z } from "zod";

import { ruleIdPattern } from "../../schemas/rule.ts";
import { PATHS } from "../../compiler/paths.ts";
import { buildSnapshot, classifyEvidence, type QueryOptions, type RuleSetSnapshot } from "./rules.ts";
import { invalidParams, type ToolResult } from "./types.ts";

const MAX_CHARS_LIMIT = 4000;
const DEFAULT_MAX_CHARS = 1200;
const SOURCES_PREFIX = `${PATHS.sourcesDir}/`;

export const readEvidenceInputSchema = z
  .object({
    variant: z.string(),
    /** 从这张卡的已登记证据里选一条 */
    rule_id: z.string().regex(ruleIdPattern).optional(),
    /** 直接给 `path#section`（必须命中已登记证据） */
    ref: z.string().min(1).optional(),
    /** rule_id 有多条证据时选第几条，默认 0 */
    index: z.number().int().min(0).max(20).default(0),
    max_chars: z.number().int().min(80).max(MAX_CHARS_LIMIT).default(DEFAULT_MAX_CHARS),
  })
  .strict()
  .refine((v) => Boolean(v.rule_id) !== Boolean(v.ref), {
    message: "rule_id 与 ref 必须且只能提供一个",
  });

export type ReadEvidenceInput = z.infer<typeof readEvidenceInputSchema>;

export interface ReadEvidenceOutput {
  file: string;
  section?: string;
  /** 起始行（1-based），用于 UI 跳转 */
  line: number;
  heading?: string;
  text: string;
  truncated: boolean;
  /** 本规则集已登记的证据条数，便于模型换 ref 重试 */
  available: number;
}

export type EvidencePathErrorCode =
  | "absolute_path"
  | "path_escape"
  | "outside_sources"
  | "not_a_file"
  | "symlink_escape";

export class EvidencePathError extends Error {
  // 注意：不能用 TS parameter property（readonly code），
  // 本项目以 node --experimental-strip-types 直跑，只支持可擦除语法。
  readonly code: EvidencePathErrorCode;

  constructor(message: string, code: EvidencePathErrorCode) {
    super(message);
    this.name = "EvidencePathError";
    this.code = code;
  }
}

/**
 * 安全解析：仓库相对路径 → 真实绝对路径。
 * 任何一步不通过都抛 EvidencePathError，不做静默降级。
 */
export function resolveSourcePath(root: string, relPath: string): string {
  const normalizedSeparators = relPath.replaceAll("\\", "/").trim();
  if (!normalizedSeparators) throw new EvidencePathError("证据路径为空", "path_escape");
  if (normalizedSeparators.startsWith("/") || /^[A-Za-z]:/.test(normalizedSeparators)) {
    throw new EvidencePathError(`拒绝绝对路径：${relPath}`, "absolute_path");
  }

  // 规范化之前先看原始分段：`a/b/../../c` 规范化后可能变成 `c`，会绕过前缀检查
  if (normalizedSeparators.split("/").some((segment) => segment === "..")) {
    throw new EvidencePathError(`拒绝路径穿越：${relPath}`, "path_escape");
  }
  const normalized = posix.normalize(normalizedSeparators);
  if (normalized.startsWith("../") || normalized === ".." || normalized.includes("/../")) {
    throw new EvidencePathError(`拒绝路径穿越：${relPath}`, "path_escape");
  }
  if (!normalized.startsWith(SOURCES_PREFIX)) {
    throw new EvidencePathError(`证据必须位于 ${SOURCES_PREFIX} 下：${relPath}`, "outside_sources");
  }

  const absolute = posix.join(root.replaceAll("\\", "/"), normalized);
  if (!existsSync(absolute)) throw new EvidencePathError(`证据文件不存在：${relPath}`, "not_a_file");
  if (!statSync(absolute).isFile()) throw new EvidencePathError(`证据不是文件：${relPath}`, "not_a_file");

  // 符号链接逃逸：真实路径必须仍在 <root>/rulebook/sources/ 内
  const realRoot = realpathSync(root).replaceAll("\\", "/");
  const realFile = realpathSync(absolute).replaceAll("\\", "/");
  const sourcesRoot = posix.join(realRoot, PATHS.sourcesDir);
  if (!realFile.startsWith(`${sourcesRoot}/`)) {
    throw new EvidencePathError(`真实路径逃逸出 ${PATHS.sourcesDir}：${relPath}`, "symlink_escape");
  }
  return realFile;
}

/* ---------------- 证据登记表 ---------------- */

interface RegisteredEvidence {
  file: string;
  section?: string;
  line: number;
  heading?: string;
  label: string;
}

function registeredEvidence(snapshot: RuleSetSnapshot, root: string): RegisteredEvidence[] {
  const out: RegisteredEvidence[] = [];
  const snapshots = snapshot.base ? [snapshot, snapshot.base] : [snapshot];
  for (const snap of snapshots) {
    for (const record of snap.rules.values()) {
      for (const ev of classifyEvidence(record.meta, root)) {
        if (!ev.resolvable || !ev.source_ref) continue;
        out.push({
          file: ev.file,
          ...(ev.section !== undefined ? { section: String(ev.section) } : {}),
          line: ev.source_ref.line,
          heading: ev.source_ref.value,
          label: ev.source_label,
        });
      }
    }
  }
  return out;
}

const sameRef = (a: { file: string; section?: string }, b: { file: string; section?: string }) =>
  a.file === b.file && (a.section ?? "") === (b.section ?? "");

/* ---------------- 读取 ---------------- */

/** 从标题行读到下一个同级或更高级标题之前 */
export function sliceSection(text: string, line: number, maxChars: number): { text: string; truncated: boolean; heading?: string } {
  const lines = text.split(/\r?\n/);
  const startIndex = Math.max(0, Math.min(lines.length - 1, line - 1));
  const headingMatch = /^(#{1,6})\s+(.*)$/.exec(lines[startIndex] ?? "");
  const level = headingMatch ? headingMatch[1]!.length : 6;
  let endIndex = lines.length;
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    const m = /^(#{1,6})\s+/.exec(lines[i] ?? "");
    if (m && m[1]!.length <= level) {
      endIndex = i;
      break;
    }
  }
  const body = lines.slice(startIndex, endIndex).join("\n").trim();
  const truncated = body.length > maxChars;
  return {
    text: truncated ? `${body.slice(0, maxChars)}…` : body,
    truncated,
    ...(headingMatch ? { heading: headingMatch[2]!.trim() } : {}),
  };
}

export function readEvidence(
  rawInput: unknown,
  options: QueryOptions = {},
): ToolResult<ReadEvidenceOutput> {
  const parsed = readEvidenceInputSchema.safeParse(rawInput);
  if (!parsed.success) return invalidParams(parsed.error, "rule_id 与 ref 二选一");
  const input = parsed.data;
  const root = options.root ?? process.cwd();

  const snapshotResult = buildSnapshot(input.variant, options);
  if (!snapshotResult.ok) return snapshotResult;
  const snapshot = snapshotResult.data;

  const registered = registeredEvidence(snapshot, root);
  if (registered.length === 0) {
    return {
      ok: false,
      error: {
        code: "not_found",
        message: `规则集 ${input.variant} 没有可定位的证据`,
        hint: "证据需要 source 是 rulebook/sources/ 下的路径，且 section 能匹配到源文件标题",
      },
      context: snapshot.context,
    };
  }

  let target: RegisteredEvidence | undefined;
  if (input.rule_id) {
    const id = input.rule_id.toUpperCase();
    const record = snapshot.rules.get(id) ?? snapshot.base?.rules.get(id);
    if (!record) {
      return {
        ok: false,
        error: {
          code: "not_found",
          message: `规则集 ${input.variant} 中不存在 ${input.rule_id}`,
          hint: "先用 get_rule 确认这张卡存在，再读它的证据",
        },
        context: snapshot.context,
      };
    }
    const own = classifyEvidence(record.meta, root).filter((e) => e.resolvable && e.source_ref);
    const picked = own[input.index];
    if (!picked) {
      return {
        ok: false,
        error: {
          code: "invalid_params",
          message: `该卡只有 ${own.length} 条可定位证据，index=${input.index} 越界`,
          hint: own.length === 0 ? "这张卡的证据都不可定位（章节号或 {{IP_xxx}} 占位符）" : undefined,
        },
        context: snapshot.context,
      };
    }
    target = registered.find((e) => sameRef(e, { file: picked.file, ...(picked.section !== undefined ? { section: String(picked.section) } : {}) }));
  } else {
    const [filePart, ...sectionParts] = String(input.ref).split("#");
    const file = (filePart ?? "").trim();
    const section = sectionParts.join("#").trim();
    target = registered.find((e) => e.file === file && (e.section ?? "") === section);
  }

  if (!target) {
    return {
      ok: false,
      error: {
        code: "not_found",
        message: "该证据引用不在当前规则集的已登记清单里",
        hint: `只接受 ${registered.length} 条已登记证据；请先用 get_rule 取 evidence[].file + section`,
        details: { available: registered.slice(0, 10).map((e) => `${e.file}#${e.section ?? ""}`) },
      },
      context: snapshot.context,
    };
  }

  // 路径安全：登记表里的路径也要重新校验，避免登记表被写坏时越权读盘
  let absolute: string;
  try {
    absolute = resolveSourcePath(root, target.file);
  } catch (error) {
    if (error instanceof EvidencePathError) {
      return {
        ok: false,
        error: { code: "invalid_params", message: error.message, hint: "证据路径被安全策略拒绝" },
        context: snapshot.context,
      };
    }
    throw error;
  }

  const raw = readFileSync(absolute, "utf8");
  const sliced = sliceSection(raw, target.line, input.max_chars);

  return {
    ok: true,
    data: {
      file: target.file,
      ...(target.section !== undefined ? { section: target.section } : {}),
      line: target.line,
      ...(sliced.heading ? { heading: sliced.heading } : {}),
      text: sliced.text,
      truncated: sliced.truncated,
      available: registered.length,
    },
    context: snapshot.context,
    citations: [
      {
        kind: "source",
        id: target.file,
        locator: `${target.file}#L${target.line}`,
      },
    ],
  };
}
