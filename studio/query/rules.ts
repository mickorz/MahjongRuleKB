// Rule Copilot 查询层：规则检索与详情（第一批）
//
// 数据源：compiler/validator.ts 的 loadRuleset()（读 rulebook/specs/**），
// 槽位解析：studio/pipeline/read-ruleset.ts 的 cardSlots()。
// 两者都是只读复用，不改编译器、不改文档生成流程。
//
// 缓存：按「规则集 + 版本 + 内容指纹」缓存快照。变体 manifest 没有 content_hash，
// 所以指纹由服务端对规则/配置/未决文件的实际内容做确定性哈希（见 contentFingerprint）。
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { z } from "zod";

import { loadRuleset, type LoadedRuleset } from "../../compiler/validator.ts";
import { PATHS } from "../../compiler/paths.ts";
import type { RuleMeta } from "../../schemas/rule.ts";
import { changeTypes, ruleIdPattern, ruleStatuses, ruleTypes } from "../../schemas/rule.ts";
import { cardSlots } from "../pipeline/read-ruleset.ts";
import {
  invalidParams,
  matchReasons,
  type Citation,
  type EvidenceRef,
  type QueryContext,
  type RuleDetail,
  type MatchReason,
  type RuleSummary,
  type ToolResult,
  type UnresolvedRef,
} from "./types.ts";

/* ---------------- 内部视图 ---------------- */

/**
 * 规则 meta 的并集视图。
 * ruleMetaSchema 是 base / variant 的 union，直接读 change_type 会让 TS 报"属性不存在"，
 * 这里集中放宽一次，避免各处 as 满天飞。
 */
type WidenedMeta = RuleMeta & {
  change_type?: (typeof changeTypes)[number];
  base_rule_ref?: string;
  compares_to?: string[];
  not_applicable_slots?: Array<{ slot: string; reason: string; source?: string }>;
};

export function widenedMeta(meta: RuleMeta): WidenedMeta {
  return meta as WidenedMeta;
}

export interface RuleRecord {
  /** 原样保留的 front matter（ruleMetaSchema 解析结果） */
  meta: RuleMeta;
  body: string;
  /** 仓库相对路径，如 rulebook/specs/variants/xiaoshan/guize/xs-r-tuodi.md */
  file: string;
  slots: Array<{ slot: string; text: string }>;
}

export interface ConfigRecord {
  id: string;
  name: string;
  description?: string;
  value?: unknown;
  status: string;
  release_blocker: boolean;
  source?: string;
  change_type?: string;
  base_rule_ref?: string;
  candidates?: unknown[];
  origin: string;
}

export interface RuleSetSnapshot {
  context: QueryContext;
  rules: Map<string, RuleRecord>;
  configs: Map<string, ConfigRecord>;
  unresolved: UnresolvedRef[];
  /** rule/config id → 相关未决项（含非 blocker） */
  unresolvedByCard: Map<string, UnresolvedRef[]>;
  /** base_rule_ref → 变体卡 ID（compare 阶段用，本批先建好索引） */
  variantsByBase: Map<string, string[]>;
  /** 变体快照持有的基座快照（仅 kind=variant） */
  base?: RuleSetSnapshot;
}

export interface QueryOptions {
  /** 仓库根目录，默认当前工作目录 */
  root?: string;
  /** 关闭缓存（测试用） */
  noCache?: boolean;
}

/* ---------------- 路径与白名单 ---------------- */

const variantNamePattern = /^[a-z][a-z0-9-]*$/;
const baseVariant = "hangzhou";

function repoRoot(options: QueryOptions = {}): string {
  return options.root ?? process.cwd();
}

/** base → PATHS.baseDir；variant → PATHS.variantsDir/<name>。不做目录扫描。 */
export function resolveRulesetDir(variant: string, root: string): { dir: string; kind: "base" | "variant" } | null {
  if (variant === baseVariant) {
    const dir = join(root, PATHS.baseDir);
    return isRulesetDir(dir) ? { dir, kind: "base" } : null;
  }
  if (!variantNamePattern.test(variant)) return null;
  const dir = join(root, PATHS.variantsDir, variant);
  return isRulesetDir(dir) ? { dir, kind: "variant" } : null;
}

/** 已注册的变体目录名（只列目录，不读 manifest；缺失目录返回空） */
export function availableVariants(root: string): string[] {
  const dir = join(root, PATHS.variantsDir);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => variantNamePattern.test(name) && isRulesetDir(join(dir, name)))
    .sort();
}

function isRulesetDir(dir: string): boolean {
  return existsSync(join(dir, "manifest.yaml")) && existsSync(join(dir, "config.yaml"));
}

/** 收集规则集内参与指纹的文件（确定性顺序：目录递归 + 文件名排序） */
function collectFingerprintFiles(dir: string, acc: string[]): void {
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      collectFingerprintFiles(full, acc);
      continue;
    }
    if (!/\.(md|ya?ml)$/.test(name)) continue;
    if (name === "README.md" || name === "coverage.md") continue;
    acc.push(full);
  }
}

/** 内容指纹：相对路径 + 内容，按路径排序后串行哈希 */
export function contentFingerprint(dir: string, root: string): string {
  const files: string[] = [];
  collectFingerprintFiles(dir, files);
  const hash = createHash("sha256");
  for (const file of files.sort()) {
    hash.update(relative(root, file).replaceAll("\\", "/"));
    hash.update("\u0000");
    hash.update(readFileSync(file));
    hash.update("\u0000");
  }
  return hash.digest("hex");
}

/* ---------------- 快照构建 ---------------- */

const snapshotCache = new Map<string, RuleSetSnapshot>();

function manifestFields(loaded: LoadedRuleset): QueryContext {
  const manifest = loaded.manifest as {
    ruleset_id?: string;
    version?: string;
    content_hash?: string;
    base?: { ruleset_id?: string; version?: string };
  };
  return {
    // 后续由 buildSnapshot 覆盖 variant / kind / content_fingerprint
    variant: "",
    kind: loaded.kind,
    ruleset_id: manifest.ruleset_id ?? "",
    version: manifest.version ?? "",
    ...(manifest.base?.ruleset_id && manifest.base.version
      ? { base: { ruleset_id: manifest.base.ruleset_id, version: manifest.base.version } }
      : {}),
    ...(manifest.content_hash ? { content_hash: manifest.content_hash } : {}),
    content_fingerprint: "",
  };
}

function toConfigRecord(item: Record<string, unknown>): ConfigRecord {
  return {
    id: String(item.id),
    name: String(item.name),
    ...(typeof item.description === "string" ? { description: item.description } : {}),
    ...(item.value !== undefined ? { value: item.value } : {}),
    status: typeof item.status === "string" ? item.status : "confirmed",
    release_blocker: item.release_blocker === true,
    ...(item.source !== undefined ? { source: String(item.source) } : {}),
    ...(typeof item.change_type === "string" ? { change_type: item.change_type } : {}),
    ...(typeof item.base_rule_ref === "string" ? { base_rule_ref: item.base_rule_ref } : {}),
    ...(Array.isArray(item.candidates) ? { candidates: item.candidates } : {}),
    origin: typeof item.origin === "string" ? item.origin : "base",
  };
}

export function buildSnapshot(variant: string, options: QueryOptions = {}): ToolResult<RuleSetSnapshot> {
  const root = repoRoot(options);
  const resolved = resolveRulesetDir(variant, root);
  if (!resolved) {
    const available = [baseVariant, ...availableVariants(root)];
    return {
      ok: false,
      error: {
        code: "unknown_variant",
        message: `未知规则集：${variant}`,
        hint: `可用：${available.join(" / ")}`,
        details: { available },
      },
    };
  }

  const loaded = loadRuleset(resolved.dir, resolved.kind);
  const fingerprint = contentFingerprint(resolved.dir, root);
  const context: QueryContext = {
    ...manifestFields(loaded),
    variant,
    kind: resolved.kind,
    content_fingerprint: fingerprint,
  };

  const cacheKey = [variant, context.version, fingerprint, context.base?.version ?? "-"].join("|");
  if (!options.noCache) {
    const hit = snapshotCache.get(cacheKey);
    if (hit) return { ok: true, data: hit, context: hit.context, citations: [] };
  }

  const rules = new Map<string, RuleRecord>();
  for (const rule of loaded.rules) {
    rules.set(rule.meta.id.toUpperCase(), {
      meta: rule.meta,
      body: rule.body,
      file: relative(root, rule.file).replaceAll("\\", "/"),
      slots: cardSlots(rule.body),
    });
  }

  const configs = new Map<string, ConfigRecord>();
  for (const item of [...loaded.config, ...loaded.configUi]) {
    const record = toConfigRecord(item as unknown as Record<string, unknown>);
    configs.set(record.id.toUpperCase(), record);
  }

  const unresolved: UnresolvedRef[] = loaded.unresolved.map((entry) => ({
    id: entry.id,
    card_ref: entry.card_ref,
    status: entry.status,
    release_blocker: entry.release_blocker,
    description: entry.description,
    ...(entry.resolution !== undefined ? { resolution: entry.resolution } : {}),
  }));

  const unresolvedByCard = new Map<string, UnresolvedRef[]>();
  for (const entry of unresolved) {
    const key = entry.card_ref.toUpperCase();
    const list = unresolvedByCard.get(key) ?? [];
    list.push(entry);
    unresolvedByCard.set(key, list);
  }

  const variantsByBase = new Map<string, string[]>();
  if (resolved.kind === "variant") {
    for (const rule of rules.values()) {
      const meta = widenedMeta(rule.meta);
      const baseRef = meta.change_type ? meta.base_rule_ref : undefined;
      if (!baseRef) continue;
      const key = baseRef.toUpperCase();
      const list = variantsByBase.get(key) ?? [];
      list.push(rule.meta.id);
      variantsByBase.set(key, list);
    }
  }

  const snapshot: RuleSetSnapshot = { context, rules, configs, unresolved, unresolvedByCard, variantsByBase };

  if (resolved.kind === "variant") {
    const base = buildSnapshot(baseVariant, options);
    if (base.ok) snapshot.base = base.data;
  }

  if (!options.noCache) snapshotCache.set(cacheKey, snapshot);
  return { ok: true, data: snapshot, context, citations: [] };
}

/** 清空缓存（测试/长驻进程用） */
export function clearSnapshotCache(): void {
  snapshotCache.clear();
}

/* ---------------- 摘要 ---------------- */

/** 摘要优先取有规则语义的槽位；「差异 / 杭麻」属对照信息，不作为摘要 */
const SUMMARY_SLOT_PREFERENCE = ["结果", "表", "公式", "内容", "画面", "键", "初值", "写入", "触发", "条件", "步骤"];
const NON_SEMANTIC_SLOTS = new Set(["差异", "杭麻", "另见", "参考", "来源"]);

export function summaryOf(record: RuleRecord, maxChars = 80): string {
  const pick = (slot: string): string | undefined => record.slots.find((s) => s.slot === slot)?.text;
  for (const slot of SUMMARY_SLOT_PREFERENCE) {
    const text = pick(slot);
    if (text) return clip(text, maxChars);
  }
  const fallback = record.slots.find((s) => !NON_SEMANTIC_SLOTS.has(s.slot));
  if (fallback) return clip(fallback.text, maxChars);
  const firstLine = record.body
    .split(/\r?\n/)
    .map((l) => l.replace(/^#+\s*/, "").trim())
    .find((l) => l.length > 0);
  return clip(firstLine ?? "", maxChars);
}

function clip(text: string, maxChars: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > maxChars ? `${flat.slice(0, maxChars)}…` : flat;
}

/* ---------------- 证据分类 ---------------- */

const SECTION_ANCHOR_PATTERN = /^[A-Z][A-Z0-9]*(-[A-Z0-9]+)*$/;
const SOURCE_PREFIX = `${PATHS.sourcesDir}/`;

/**
 * source 必须是 rulebook/sources/ 下的仓库相对路径；section 三种形态：
 * 1) 锚点（萧山 R-BANK-02）→ 可定位，带行号
 * 2) 标题文本 → 可定位
 * 3) 章节号 / {{IP_xxx}} 占位符 → 不可定位，只给 label
 */
export function classifyEvidence(meta: RuleMeta, root: string): EvidenceRef[] {
  const sources = (meta.sources ?? []) as Array<{ source: string; section?: string }>;
  return sources.map((item) => {
    const file = String(item.source);
    const section = item.section === undefined ? undefined : String(item.section);
    const labelBase = file.split("/").pop() ?? file;
    const label = section ? `${labelBase} · ${section}` : labelBase;

    if (!file.startsWith(SOURCE_PREFIX)) {
      // 非路径来源（历史数据里可能出现「1.1 配置表 / 术语」这类标签）
      return { file, ...(section !== undefined ? { section } : {}), source_label: label, resolvable: false };
    }
    const abs = join(root, file);
    if (!existsSync(abs)) {
      return { file, ...(section !== undefined ? { section } : {}), source_label: label, resolvable: false };
    }
    const located = locateSection(readFileSync(abs, "utf8"), section);
    if (!located) {
      return { file, ...(section !== undefined ? { section } : {}), source_label: label, resolvable: false };
    }
    return {
      file,
      ...(section !== undefined ? { section } : {}),
      source_ref: located,
      source_label: `${labelBase} · ${located.value}`,
      resolvable: true,
    };
  });
}

function locateSection(
  text: string,
  section: string | undefined,
): { kind: "anchor" | "heading"; value: string; line: number } | undefined {
  if (!section) return undefined;
  if (section.includes("{{")) return undefined;
  const lines = text.split(/\r?\n/);
  const headings = lines
    .map((line, index) => ({ line, index: index + 1, m: /^(#{1,6})\s+(.*)$/.exec(line) }))
    .filter((h): h is { line: string; index: number; m: RegExpExecArray } => h.m !== null)
    .map((h) => ({ text: h.m[2].trim(), line: h.index }));

  if (SECTION_ANCHOR_PATTERN.test(section)) {
    const hit = headings.find((h) => new RegExp(`(^|\\s)${escapeRegExp(section)}(\\s|$)`).test(h.text));
    return hit ? { kind: "anchor", value: hit.text, line: hit.line } : undefined;
  }

  const exact = headings.find((h) => h.text === section);
  if (exact) return { kind: "heading", value: exact.text, line: exact.line };
  const contains = headings.find((h) => h.text.includes(section) || section.includes(h.text));
  return contains ? { kind: "heading", value: contains.text, line: contains.line } : undefined;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* ---------------- 文档段落反查 ---------------- */

interface ProjectedSegment {
  segment_id: string;
  references?: { rule_refs?: string[]; config_refs?: string[] };
}

export function documentSegments(variant: string, ruleId: string, root: string): string[] {
  const file = join(root, "documents", variant, "document.json");
  if (!existsSync(file)) return [];
  try {
    const doc = JSON.parse(readFileSync(file, "utf8")) as {
      blocks?: Array<{ segments?: ProjectedSegment[]; content?: ProjectedSegment[] }>;
    };
    const out: string[] = [];
    for (const block of doc.blocks ?? []) {
      const segments = block.segments ?? block.content ?? [];
      for (const seg of segments) {
        const refs = seg.references?.rule_refs ?? [];
        if (refs.includes(ruleId)) out.push(seg.segment_id);
      }
    }
    return out;
  } catch {
    return [];
  }
}

/* ---------------- 记录 → 对外结构 ---------------- */

function coreOf(record: RuleRecord) {
  const meta = widenedMeta(record.meta);
  return {
    id: meta.id,
    name: meta.name,
    type: meta.type,
    origin: meta.origin,
    ...(meta.change_type ? { change_type: meta.change_type } : {}),
    status: meta.status,
    release_blocker: meta.release_blocker,
    ...(meta.base_rule_ref ? { base_rule_ref: meta.base_rule_ref } : {}),
  };
}

function unresolvedIdsOf(snapshot: RuleSetSnapshot, id: string): string[] {
  return (snapshot.unresolvedByCard.get(id.toUpperCase()) ?? []).map((u) => u.id);
}

/* ---------------- search_rules ---------------- */

export const searchRulesInputSchema = z
  .object({
    variant: z.string(),
    /** 名称或正文关键词 */
    query: z.string().trim().min(1).max(60).optional(),
    /** 精确规则 ID */
    id: z.string().optional(),
    /** 形如 XS-K- / HJ-R- */
    id_prefix: z.string().regex(/^(HJ|XS)-[CRTFKNMTPVIA]?-?$/).optional(),
    type: z.enum(ruleTypes).optional(),
    change_type: z.enum(changeTypes).optional(),
    status: z.enum(ruleStatuses).optional(),
    /** 等价于「只返回被 release_blocker 未决项阻塞的卡」 */
    only_blockers: z.boolean().optional(),
    limit: z.number().int().min(1).max(50).default(20),
  })
  .strict()
  .refine(
    (v) =>
      Boolean(v.query || v.id || v.id_prefix || v.type || v.change_type || v.status || v.only_blockers),
    { message: "至少提供一个检索条件（query / id / id_prefix / type / change_type / status / only_blockers）" },
  );

export type SearchRulesInput = z.infer<typeof searchRulesInputSchema>;

export interface SearchRulesOutput {
  total: number;
  truncated: boolean;
  items: RuleSummary[];
}

export function searchRules(
  rawInput: unknown,
  options: QueryOptions = {},
): ToolResult<SearchRulesOutput> {
  const parsed = searchRulesInputSchema.safeParse(rawInput);
  if (!parsed.success) return invalidParams(parsed.error);
  const input = parsed.data;

  const snapshotResult = buildSnapshot(input.variant, options);
  if (!snapshotResult.ok) return snapshotResult;
  const snapshot = snapshotResult.data;
  const root = repoRoot(options);

  if (input.change_type && snapshot.context.kind === "base") {
    return {
      ok: false,
      error: {
        code: "invalid_params",
        message: "基座规则集没有 change_type",
        hint: "change_type 只对 variant 有效",
      },
      context: snapshot.context,
    };
  }

  const hits: RuleSummary[] = [];
  for (const record of snapshot.rules.values()) {
    const reasons = matchRecord(record, input, snapshot);
    if (!reasons) continue;
    hits.push({
      ...coreOf(record),
      summary: summaryOf(record),
      depends_on: (record.meta.depends_on ?? []) as string[],
      unresolved_refs: unresolvedIdsOf(snapshot, record.meta.id),
      matched_by: reasons,
    });
  }

  hits.sort((a, b) => a.id.localeCompare(b.id));
  const total = hits.length;
  const items = hits.slice(0, input.limit);
  const citations: Citation[] = items.map((item) => ({
    kind: "rule",
    id: item.id,
    locator: snapshot.rules.get(item.id.toUpperCase())?.file,
  }));

  return {
    ok: true,
    data: { total, truncated: total > items.length, items },
    context: snapshot.context,
    citations,
  };
}

function matchRecord(
  record: RuleRecord,
  input: SearchRulesInput,
  snapshot: RuleSetSnapshot,
): MatchReason[] | null {
  const reasons: MatchReason[] = [];
  const meta = widenedMeta(record.meta);

  if (input.id !== undefined) {
    if (meta.id.toUpperCase() !== input.id.toUpperCase()) return null;
    reasons.push("id");
  }

  const filtersUsed =
    input.id_prefix !== undefined ||
    input.type !== undefined ||
    input.change_type !== undefined ||
    input.status !== undefined ||
    input.only_blockers === true;

  if (input.id_prefix !== undefined && !meta.id.toUpperCase().startsWith(input.id_prefix.toUpperCase())) return null;
  if (input.type !== undefined && meta.type !== input.type) return null;
  if (input.change_type !== undefined && meta.change_type !== input.change_type) return null;
  if (input.status !== undefined && meta.status !== input.status) return null;
  if (input.only_blockers === true) {
    const blocked = (snapshot.unresolvedByCard.get(meta.id.toUpperCase()) ?? []).some((u) => u.release_blocker);
    if (!blocked) return null;
  }
  if (filtersUsed) reasons.push("filter");

  if (input.query !== undefined) {
    const q = input.query.toLowerCase();
    if (meta.name.toLowerCase().includes(q)) {
      reasons.push("name");
    } else if (record.slots.some((s) => s.text.toLowerCase().includes(q)) || record.body.toLowerCase().includes(q)) {
      reasons.push("body");
    } else {
      return null;
    }
  }

  return reasons.length > 0 ? reasons : null;
}

/* ---------------- get_rule ---------------- */

export const getRuleInputSchema = z
  .object({
    variant: z.string(),
    id: z.string().regex(ruleIdPattern),
  })
  .strict();

export type GetRuleInput = z.infer<typeof getRuleInputSchema>;

export function getRule(rawInput: unknown, options: QueryOptions = {}): ToolResult<RuleDetail> {
  const parsed = getRuleInputSchema.safeParse(rawInput);
  if (!parsed.success) return invalidParams(parsed.error);
  const input = parsed.data;

  const snapshotResult = buildSnapshot(input.variant, options);
  if (!snapshotResult.ok) return snapshotResult;
  const snapshot = snapshotResult.data;
  const root = repoRoot(options);
  const id = input.id.toUpperCase();

  const wrongSet = snapshot.context.kind === "variant" ? id.startsWith("HJ-") : id.startsWith("XS-");
  if (wrongSet) {
    const target = snapshot.context.kind === "variant" ? baseVariant : "对应的变体规则集";
    return {
      ok: false,
      error: {
        code: "not_found",
        message: `${id} 不属于规则集 ${input.variant}`,
        hint: `HJ- 卡属于基座，请用 variant="${target}" 查询；或从变体卡的 base_rule_ref 回溯`,
      },
      context: snapshot.context,
    };
  }

  const record = snapshot.rules.get(id);
  if (!record) {
    return {
      ok: false,
      error: {
        code: "not_found",
        message: `规则集 ${input.variant} 中不存在 ${id}`,
        hint: "先用 search_rules 确认 ID",
      },
      context: snapshot.context,
    };
  }

  const meta = widenedMeta(record.meta);

  const detail: RuleDetail = {
    ...coreOf(record),
    scope: String(meta.scope),
    body: record.body,
    slots: record.slots,
    depends_on: (meta.depends_on ?? []) as string[],
    compares_to: (meta.compares_to ?? []) as string[],
    not_applicable_slots: (meta.not_applicable_slots ?? []).map((s) => ({
      slot: s.slot,
      reason: s.reason,
      ...(s.source ? { source: s.source } : {}),
    })),
    evidence: classifyEvidence(meta, root),
    document_segments: documentSegments(input.variant, meta.id, root),
    unresolved_refs: unresolvedIdsOf(snapshot, meta.id),
    file: record.file,
  };

  const citations: Citation[] = [
    { kind: "rule", id: detail.id, locator: detail.file },
    ...detail.evidence
      .filter((e) => e.resolvable && e.source_ref)
      .map((e) => ({
        kind: "source" as const,
        id: e.file,
        locator: `${e.file}#L${e.source_ref!.line}`,
      })),
    ...detail.unresolved_refs.map((u) => ({ kind: "unresolved" as const, id: u })),
  ];

  return { ok: true, data: detail, context: snapshot.context, citations };
}
