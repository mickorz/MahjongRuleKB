// Rule Studio 路径注册表（K0-2）
// 唯一职责：所有可写路径由服务端推导；拒绝绝对路径、`..`、反斜杠伪装与符号链接逃逸。
// 边界：本文件只处理「路径字符串规范化 + 白名单判定」，不写文件、不做事务。
import { posix } from "node:path";

/** 知识库内的三个根：规则资产、文档产物、运行时数据 */
export const ROOT_RULEBOOK = "rulebook";
export const ROOT_DOCUMENTS = "documents";
export const ROOT_RUNTIME = ".rule-studio";

/** 变体名：小写 kebab-case，禁止路径分隔符 */
const variantPattern = /^[a-z][a-z0-9-]*$/;
/** 文档产物文件名白名单（documents/<variant>/ 下） */
export const documentFileNames = [
  "document.json",
  "document-outline.yaml",
  "editorial-overrides.yaml",
  "identity-map.json",
  "provenance.json",
  "changes.json",
  "需求全文.md",
] as const;
export type DocumentFileName = (typeof documentFileNames)[number];

/** 写入主体 */
export const actors = ["agent", "stage", "transaction", "archive", "compiler"] as const;
export type Actor = (typeof actors)[number];

/** 允许的写操作类型（与 Proposal 的 op 解耦，这里只表达能力） */
export type WriteIntent =
  | "generate" // Stage 生成产物
  | "apply-expression" // approved Proposal 写表达层
  | "apply-structure" // approved Proposal 写章节装配
  | "apply-rule" // approved Proposal 写规则事实
  | "archive" // Verify 后归档
  | "compile"; // 编译器写产物

export class PathPolicyError extends Error {
  constructor(
    message: string,
    readonly code:
      | "not_relative"
      | "traversal"
      | "unknown_root"
      | "unknown_file"
      | "bad_variant"
      | "actor_denied"
      | "intent_denied",
  ) {
    super(message);
    this.name = "PathPolicyError";
  }
}

/** 路径规范化：统一分隔符、消除 `.` 与多余斜杠；不解析符号链接（那是 FS 层的事） */
export function normalizeRelative(input: string): string {
  if (input.includes("\\")) {
    throw new PathPolicyError(`路径不得包含反斜杠：${input}`, "not_relative");
  }
  if (input.startsWith("/") || /^[A-Za-z]:/.test(input)) {
    throw new PathPolicyError(`路径必须是知识库相对路径：${input}`, "not_relative");
  }
  if (input.includes("\0")) {
    throw new PathPolicyError("路径不得包含空字符", "not_relative");
  }
  const normalized = posix.normalize(input);
  if (normalized === "." || normalized.startsWith("../") || normalized === "..") {
    throw new PathPolicyError(`路径不得越出知识库根目录：${input}`, "traversal");
  }
  return normalized;
}

function assertVariant(variant: string): void {
  if (!variantPattern.test(variant)) {
    throw new PathPolicyError(`变体名不合法：${variant}`, "bad_variant");
  }
}

/** documents/<variant>/<file> 的规范路径 */
export function documentPath(variant: string, file: DocumentFileName): string {
  assertVariant(variant);
  if (!(documentFileNames as readonly string[]).includes(file)) {
    throw new PathPolicyError(`未知文档产物：${file}`, "unknown_file");
  }
  return `${ROOT_DOCUMENTS}/${variant}/${file}`;
}

/** documents/<variant>/history/<version>/ 目录（Stage 与 Transaction 各自快照） */
export function documentHistoryDir(variant: string, documentVersion: number): string {
  assertVariant(variant);
  if (!Number.isInteger(documentVersion) || documentVersion < 0) {
    throw new PathPolicyError(`文档版本必须是非负整数：${documentVersion}`, "bad_variant");
  }
  return `${ROOT_DOCUMENTS}/${variant}/history/v${documentVersion}`;
}

/** 运行时路径 */
export function proposalPath(id: string): string {
  if (!/^(DOC-P|PR)-\d{3}$/.test(id)) throw new PathPolicyError(`提案 ID 不合法：${id}`, "unknown_file");
  return `${ROOT_RUNTIME}/proposals/${id}.json`;
}
export function transactionDir(id: string): string {
  if (!/^TX-\d{3}$/.test(id)) throw new PathPolicyError(`事务 ID 不合法：${id}`, "unknown_file");
  return `${ROOT_RUNTIME}/transactions/${id}`;
}
export function workflowDir(taskId: string): string {
  if (!/^[A-Za-z0-9_-]+$/.test(taskId)) throw new PathPolicyError(`工作流 taskId 不合法：${taskId}`, "unknown_file");
  return `${ROOT_RUNTIME}/workflow/${taskId}`;
}
/** 归档包：rulebook/changes/archive/<date>-<changeId>/ */
export function archiveDir(date: string, changeId: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new PathPolicyError(`归档日期不合法：${date}`, "unknown_file");
  if (!/^CHG-\d{3}$/.test(changeId)) throw new PathPolicyError(`Change ID 不合法：${changeId}`, "unknown_file");
  return `${ROOT_RULEBOOK}/changes/archive/${date}-${changeId}`;
}

/** 规则资产路径（读取为主，写入只允许规则 Transaction） */
export function rulebookSpecPath(rel: string): string {
  const normalized = normalizeRelative(rel);
  if (!normalized.startsWith(`${ROOT_RULEBOOK}/specs/`)) {
    throw new PathPolicyError(`规则资产写入只允许 rulebook/specs/ 下：${rel}`, "actor_denied");
  }
  return normalized;
}

/** 原文证据路径：只读，且必须在 rulebook/sources/ 下 */
export function sourceEvidencePath(rel: string): string {
  const normalized = normalizeRelative(rel);
  if (!normalized.startsWith(`${ROOT_RULEBOOK}/sources/`)) {
    throw new PathPolicyError(`原文证据只允许 rulebook/sources/ 下：${rel}`, "traversal");
  }
  return normalized;
}

/**
 * 权限矩阵：actor × intent → 允许的路径前缀集合。
 * 与主需求 11.1 对齐；这里是可执行版本，11.1 是规范版。
 */
interface Rule {
  /** 允许的路径前缀 */
  prefixes: readonly string[];
  /** 若给出，则（在前缀命中后）还需命中此文件名白名单 */
  files?: readonly string[];
}

const MATRIX: Record<Actor, Partial<Record<WriteIntent, Rule>>> = {
  agent: {}, // Agent 无任何直接写入
  stage: {
    // Stage 生成产物；表达层（editorial-overrides）与规则事实不在其列
    generate: {
      prefixes: [`${ROOT_DOCUMENTS}/`, `${ROOT_RUNTIME}/workflow/`],
      files: [
        "document.json",
        "document-outline.yaml",
        "identity-map.json",
        "provenance.json",
        "changes.json",
        "需求全文.md",
      ],
    },
  },
  transaction: {
    // 表达层只允许改 override；结构层只允许改章节装配
    "apply-expression": { prefixes: [`${ROOT_DOCUMENTS}/`], files: ["editorial-overrides.yaml"] },
    "apply-structure": { prefixes: [`${ROOT_DOCUMENTS}/`], files: ["document-outline.yaml"] },
    "apply-rule": { prefixes: [`${ROOT_RULEBOOK}/specs/`] },
  },
  archive: {
    archive: { prefixes: [`${ROOT_RULEBOOK}/changes/archive/`] },
  },
  compiler: {
    compile: { prefixes: [`${ROOT_RULEBOOK}/compiled/`] },
  },
};

/** 判定 actor 是否被允许以 intent 写该路径；不合法时抛错 */
export function assertWritable(actor: Actor, intent: WriteIntent, path: string): string {
  const normalized = normalizeRelative(path);
  const rule = MATRIX[actor][intent];
  if (!rule) {
    throw new PathPolicyError(`主体 ${actor} 不允许执行 ${intent}`, "intent_denied");
  }
  if (!rule.prefixes.some((prefix) => normalized.startsWith(prefix))) {
    throw new PathPolicyError(`主体 ${actor} 不得以 ${intent} 写 ${normalized}`, "actor_denied");
  }
  // intent 级文件白名单：例如 Stage 不得写 editorial-overrides.yaml
  // 仅对 documents/ 生效；.rule-studio/workflow/ 中间产物文件名由 Stage 自定
  if (rule.files && normalized.startsWith(`${ROOT_DOCUMENTS}/`)) {
    const name = normalized.split("/").pop() ?? "";
    if (!rule.files.includes(name)) {
      throw new PathPolicyError(`主体 ${actor} 不得以 ${intent} 写 ${normalized}（不在该 intent 的文件白名单）`, "actor_denied");
    }
  }
  // 文档产物只允许白名单文件
  if (normalized.startsWith(`${ROOT_DOCUMENTS}/`)) {
    const parts = normalized.split("/");
    // documents/<variant>/<file> 或 documents/<variant>/history/vN
    if (parts.length < 3) throw new PathPolicyError(`文档路径层级不足：${normalized}`, "unknown_file");
    const rest = parts.slice(2).join("/");
    const isHistory = rest.startsWith("history/");
    if (!isHistory && !(documentFileNames as readonly string[]).includes(rest)) {
      throw new PathPolicyError(`未知文档产物：${normalized}`, "unknown_file");
    }
    assertVariant(parts[1]);
  }
  return normalized;
}

/** 只读路径白名单：允许读取的范围 */
export function assertReadable(path: string): string {
  const normalized = normalizeRelative(path);
  const allowedRoots = [`${ROOT_RULEBOOK}/`, `${ROOT_DOCUMENTS}/`, `${ROOT_RUNTIME}/`];
  if (!allowedRoots.some((root) => normalized.startsWith(root))) {
    throw new PathPolicyError(`不在可读范围内：${normalized}`, "unknown_root");
  }
  return normalized;
}
