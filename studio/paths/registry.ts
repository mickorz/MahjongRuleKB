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

/** 写入主体 */
export const actors = ["agent", "stage", "transaction", "archive", "compiler", "server"] as const;
export type Actor = (typeof actors)[number];

/** 允许的写操作类型（与 Proposal 的 op 解耦，这里只表达能力） */
export type WriteIntent =
  | "generate" // Stage 生成产物
  | "apply-expression" // approved Proposal 写表达层
  | "apply-structure" // approved Proposal 写章节装配
  | "apply-rule" // approved Proposal 写规则事实
  | "apply-review" // 本地服务端写审查记录
  | "archive" // Verify 后归档
  | "compile"; // 编译器写产物

/** 产物类别（W0-6：所有产物必须登记类别、生命周期与写入主体） */
export type ArtifactCategory =
  | "document"
  | "outline"
  | "override"
  | "review-input"
  | "review-record"
  | "lock"
  | "quality"
  | "diff-report"
  | "conflict"
  | "index"
  | "view"
  | "history";

type Writer = { actor: Actor; intent: WriteIntent };

export interface ArtifactSpec {
  /** 文件名；history 用目录前缀 "history/" */
  name: string;
  category: ArtifactCategory;
  lifetime: "persistent" | "version-bound" | "per-generation" | "per-check" | "during-upgrade" | "rebuildable" | "system";
  /** 允许写入的系统主体；空数组 = 只有外部人工直接改文件，系统内任何主体都不得写 */
  writers: readonly Writer[];
}

/**
 * 产物注册表。
 * 口径：12 个登记组（按 category 计），不是 12 个文件。
 * 设置 writers: [] 的产物（diff-review.yaml）由人工在系统外维护，不加 human actor。
 */
export const baseDocumentVariant = "hangzhou";

export const artifactCatalog: readonly ArtifactSpec[] = [
  { name: "document.json", category: "document", lifetime: "persistent", writers: [{ actor: "stage", intent: "generate" }] },
  {
    name: "document-outline.yaml",
    category: "outline",
    lifetime: "persistent",
    writers: [
      { actor: "stage", intent: "generate" },
      { actor: "transaction", intent: "apply-structure" },
    ],
  },
  { name: "editorial-overrides.yaml", category: "override", lifetime: "persistent", writers: [{ actor: "transaction", intent: "apply-expression" }] },
  // 人工输入：外部直接编辑文件，系统内任何主体都不允许写
  { name: "diff-review.yaml", category: "review-input", lifetime: "persistent", writers: [] },
  { name: "review-records.json", category: "review-record", lifetime: "persistent", writers: [{ actor: "server", intent: "apply-review" }] },
  { name: "generation.lock.json", category: "lock", lifetime: "version-bound", writers: [{ actor: "stage", intent: "generate" }] },
  { name: "quality-report.json", category: "quality", lifetime: "per-generation", writers: [{ actor: "stage", intent: "generate" }] },
  { name: "diff-warnings.json", category: "diff-report", lifetime: "per-check", writers: [{ actor: "stage", intent: "generate" }] },
  { name: "conflicts.json", category: "conflict", lifetime: "during-upgrade", writers: [{ actor: "stage", intent: "generate" }] },
  { name: "identity-map.json", category: "index", lifetime: "rebuildable", writers: [{ actor: "stage", intent: "generate" }] },
  { name: "provenance.json", category: "index", lifetime: "rebuildable", writers: [{ actor: "stage", intent: "generate" }] },
  { name: "changes.json", category: "index", lifetime: "rebuildable", writers: [{ actor: "stage", intent: "generate" }] },
  { name: "需求全文.md", category: "view", lifetime: "rebuildable", writers: [{ actor: "stage", intent: "generate" }] },
  { name: "差异视图.md", category: "view", lifetime: "rebuildable", writers: [{ actor: "stage", intent: "generate" }] },
  { name: "对照视图.md", category: "view", lifetime: "rebuildable", writers: [{ actor: "stage", intent: "generate" }] },
  { name: "history/", category: "history", lifetime: "system", writers: [{ actor: "transaction", intent: "apply-expression" }, { actor: "transaction", intent: "apply-structure" }] },
];

/** 文档产物名白名单（由注册表派生，保留旧导出以兼容既有调用点） */
export const documentFileNames = artifactCatalog.map((a) => a.name).filter((n) => !n.endsWith("/")) as readonly string[];
export type DocumentFileName = string;

function findArtifact(rest: string): ArtifactSpec | undefined {
  return artifactCatalog.find((a) => (a.name.endsWith("/") ? rest.startsWith(a.name) : rest === a.name));
}

export type PathPolicyCode =
  | "not_relative"
  | "traversal"
  | "unknown_root"
  | "unknown_file"
  | "bad_variant"
  | "actor_denied"
  | "intent_denied";

// 不用 TS 参数属性：那样会让本文件在 `node --experimental-strip-types` 下无法直接运行，
// 而 pipeline 入口需要能直跑。
export class PathPolicyError extends Error {
  readonly code: PathPolicyCode;

  constructor(message: string, code: PathPolicyCode) {
    super(message);
    this.code = code;
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
}

const MATRIX: Record<Actor, Partial<Record<WriteIntent, Rule>>> = {
  agent: {}, // Agent 无任何直接写入
  stage: {
    // Stage 生成产物；表达层与审查记录不在其列
    generate: {
      prefixes: [`${ROOT_DOCUMENTS}/`, `${ROOT_RUNTIME}/workflow/`, `${ROOT_RUNTIME}/drafts/`],
    },
  },
  server: {
    // 本地 Web 服务只写审查记录，不碰文档内容
    "apply-review": { prefixes: [`${ROOT_DOCUMENTS}/`] },
  },
  transaction: {
    // 表达层只允许改 override；结构层只允许改章节装配
    "apply-expression": { prefixes: [`${ROOT_DOCUMENTS}/`] },
    "apply-structure": { prefixes: [`${ROOT_DOCUMENTS}/`] },
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
  // 文档产物：文件名必须已注册，且写入主体必须在注册表里被允许
  if (normalized.startsWith(`${ROOT_DOCUMENTS}/`)) {
    const parts = normalized.split("/");
    // documents/<variant>/<file> 或 documents/<variant>/history/...
    if (parts.length < 3) throw new PathPolicyError(`文档路径层级不足：${normalized}`, "unknown_file");
    const variant = parts[1];
    assertVariant(variant);
    const rest = parts.slice(2).join("/");
    const artifact = findArtifact(rest);
    if (!artifact) {
      throw new PathPolicyError(`未知文档产物：${normalized}`, "unknown_file");
    }
    // C1：基座内容不允许人工经事务写入；Stage 生成不受限
    if (
      variant === baseDocumentVariant &&
      (intent === "apply-expression" || intent === "apply-structure")
    ) {
      throw new PathPolicyError(
        `杭州基座内容不得人工编辑：${normalized}（基座变更请重新运行生成流程）`,
        "actor_denied",
      );
    }
    const allowed = artifact.writers.some((w) => w.actor === actor && w.intent === intent);
    if (!allowed) {
      const why = artifact.writers.length === 0 ? "该产物由人工在系统外维护" : "不在该产物的写入主体清单内";
      throw new PathPolicyError(`主体 ${actor} 不得以 ${intent} 写 ${normalized}（${why}）`, "actor_denied");
    }
  }
  return normalized;
}

/**
 * C1 变体隔离：写 `documents/<variant>/` 时，声明的 variant 必须与路径一致。
 * 基座（杭州）的写入由 assertWritable 的主体规则控制，这里只比较“写的是不是同一个变体”。
 */
export function assertVariantScoped(actor: Actor, intent: WriteIntent, path: string, variant: string): string {
  assertVariant(variant);
  const normalized = assertWritable(actor, intent, path);
  if (!normalized.startsWith(`${ROOT_DOCUMENTS}/`)) return normalized;
  const actual = normalized.split("/")[1];
  if (actual !== variant) {
    throw new PathPolicyError(
      `变体越权：当前上下文为 ${variant}，不得写 ${actual} 的产物（${normalized}）`,
      "actor_denied",
    );
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
