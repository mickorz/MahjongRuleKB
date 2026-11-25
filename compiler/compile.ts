// 最小规则派生编译器
// 用法：node compiler/compile.ts
// 流程（固定顺序）：加载基础 → 加载差异 → 校验版本锁定 → 建 ID 映射 →
//   处理 inherited/modified/added → 合并配置 → 合并 manifest scope →
//   重写依赖引用并检查闭合 → 统一发布门槛 → 输出 compiled/
// 编译器只做确定性的数据处理，不解释规则。
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { stringify as toYaml } from "yaml";
import { loadRuleset, splitFrontMatter, type LoadedRuleset, type LoadedRule, type RuleSetKind } from "./validator.ts";
import type { RuleMeta, VariantRuleMeta } from "../schemas/rule.ts";
import type { ConfigItem } from "../schemas/config.ts";
import { validateRuleset } from "./validator.ts";
import { DEFAULT_PATHS, type CompilePaths } from "./paths.ts";

export { DEFAULT_PATHS } from "./paths.ts";
export type { CompilePaths } from "./paths.ts";

interface CompiledRule extends LoadedRule {
  /** base = 直接取自杭州；variant = 来自萧山 */
  origin: "base" | "variant";
}

export function rulesetContentHash(rs: LoadedRuleset): string {
  // 正文统一成 LF 再参与指纹：git 的 autocrlf 会改变工作区换行符，指纹不能依赖检出环境
  const payload = {
    rules: rs.rules.map((r) => ({ id: r.meta.id, meta: r.meta, body: r.body.replace(/\r\n/g, "\n") })).sort((a, b) => a.id.localeCompare(b.id)),
    config: rs.config,
    configUi: rs.configUi,
  };
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

interface CompileResult {
  rules: CompiledRule[];
  // 编译产物中的 inherited / modified 配置已归一为 base 形态；运行时已由 Zod 校验。
  config: any[];
  configUi: any[];
  manifest: Record<string, unknown>;
  ruleAliases: Record<string, string>;
  blockers: string[];
  counts: { inherited: number; replaced: number; added: number; configMerged: number };
}

/** 按 ID 前缀段取目录 */
function dirFor(id: string): string {
  const seg = id.split("-")[1];
  return { R: "guize", T: "shixu", N: "zhuangtai", M: "zhuangtai", F: "gongshi", K: "biaoge", P: "jiesuan", V: "jiemian", I: "jiemian", A: "jiemian" }[seg] ?? "guize";
}

/** 重写正文里的依赖引用：`HJ-xxx` → 按 aliases 替换；base_rule_ref / compares_to 不在正文里，不处理 */
function rewriteBody(body: string, aliases: Record<string, string>): string {
  return body.replace(/`((?:HJ|XS)-[CRFKNMTPVIA]-[A-Z0-9]+(?:-[A-Z0-9]+)*)`/g, (m, id: string) => aliases[id] ? `\`${aliases[id]}\`` : m);
}

/** 杭州 pass-through：直接复制，不加变体标记 */
export function compileBase(base: LoadedRuleset): CompileResult {
  const result: CompileResult = {
    rules: base.rules.map((r) => ({ ...r, origin: "base" as const })),
    config: base.config,
    configUi: base.configUi,
    manifest: { ...base.manifest, compiled_from: { ruleset_id: (base.manifest as Record<string, string>).ruleset_id, version: (base.manifest as Record<string, string>).version }, releasable: true, blockers: [] },
    ruleAliases: {},
    blockers: [],
    counts: { inherited: 0, replaced: 0, added: 0, configMerged: 0 },
  };
  // 结果深拷贝后返回：调用方拿不到输入里的任何对象，隔着输出也改不到输入
  return structuredClone(result);
}

/** 萧山：合并 */
export function compileVariant(base: LoadedRuleset, variant: LoadedRuleset): CompileResult {
  const vm = variant.manifest as { base: { ruleset_id: string; version: string }; ruleset_id: string; version: string; scope: Record<string, unknown> };
  const bm = base.manifest as { ruleset_id: string; version: string; content_hash?: string; scope: Record<string, unknown> };

  // P2-C.1 校验版本锁定与基础内容指纹
  if (vm.base.ruleset_id !== bm.ruleset_id) throw new Error(`manifest.base.ruleset_id 不匹配：${vm.base.ruleset_id} vs ${bm.ruleset_id}`);
  if (vm.base.version !== bm.version) throw new Error(`manifest.base.version 锁定 ${vm.base.version}，但杭州当前是 ${bm.version}。萧山需要重新验收后升 base.version`);
  const currentBaseHash = rulesetContentHash(base);
  if (bm.content_hash && bm.content_hash !== currentBaseHash) {
    throw new Error(`杭州基础规则内容已变化但 manifest.version 未更新：content_hash ${bm.content_hash} != ${currentBaseHash}`);
  }

  const baseById = new Map(base.rules.map((r) => [r.meta.id, r]));
  const baseConfigById = new Map([...base.config, ...base.configUi].map((c) => [c.id, c]));

  // P2-C.5 / C.6 建立映射，检查冲突
  const aliases: Record<string, string> = {};
  const modifiedTarget = new Map<string, string>(); // HJ id -> XS id
  const inheritedTarget = new Map<string, string>();
  for (const r of variant.rules) {
    const m = r.meta as VariantRuleMeta;
    if (m.change_type === "modified") {
      const t = m.base_rule_ref!;
      if (modifiedTarget.has(t)) throw new Error(`${t} 被 ${modifiedTarget.get(t)} 和 ${m.id} 同时 modified`);
      if (inheritedTarget.has(t)) throw new Error(`${t} 被 ${inheritedTarget.get(t)} inherited 的同时又被 ${m.id} modified`);
      modifiedTarget.set(t, m.id);
      aliases[t] = m.id;
    } else if (m.change_type === "inherited") {
      const t = m.base_rule_ref!;
      if (modifiedTarget.has(t)) throw new Error(`${t} 被 ${modifiedTarget.get(t)} modified 的同时又被 ${m.id} inherited`);
      inheritedTarget.set(t, m.id);
      aliases[m.id] = t; // XS → HJ
    }
  }
  // 双向映射检查
  for (const [k, v] of Object.entries(aliases)) {
    if (aliases[v] === k) throw new Error(`rule_aliases 出现双向映射：${k} ↔ ${v}`);
  }

  // P2-C.2 处理规则卡
  const out: CompiledRule[] = [];
  let replaced = 0;
  let added = 0;
  const inheritedCount = inheritedTarget.size;
  const addedIds = new Set<string>();
  for (const r of variant.rules) {
    const m = r.meta as VariantRuleMeta;
    if (m.change_type === "added") {
      out.push({ ...r, origin: "variant" });
      addedIds.add(m.id);
      added++;
    }
  }
  for (const [hid, xid] of modifiedTarget) {
    const xr = variant.rules.find((r) => r.meta.id === xid)!;
    out.push({ ...xr, origin: "variant" });
    replaced++;
  }
  for (const r of base.rules) {
    if (modifiedTarget.has(r.meta.id)) continue;
    const inherited = inheritedTarget.has(r.meta.id);
    const variantMeta = inherited ? variant.rules.find((x) => x.meta.origin === "variant" && x.meta.change_type === "inherited" && x.meta.base_rule_ref === r.meta.id)?.meta as VariantRuleMeta | undefined : undefined;
    out.push({
      ...r,
      meta: variantMeta ? { ...r.meta, status: variantMeta.status, release_blocker: variantMeta.release_blocker } as RuleMeta : r.meta,
      origin: "base",
    });
  }

  // P2-C.3 合并配置
  const config: any[] = [];
  let configMerged = 0;
  const configAliases: Record<string, string> = {};
  const vConfigById = new Map(variant.config.map((c) => [c.id, c]));
  const handledBase = new Set<string>();
  for (const c of variant.config) {
    if (c.origin !== "variant") continue;
    if (c.change_type === "added") {
      config.push({ ...c, origin: "variant" } as ConfigItem);
      configMerged++;
    } else if (c.change_type === "modified") {
      const bc = baseConfigById.get(c.base_rule_ref!) as Extract<ConfigItem, { origin: "base" }>;
      config.push({ ...bc, id: c.id, value: c.value, status: c.status, release_blocker: c.release_blocker, description: c.description ?? bc.description, origin: "base" } as ConfigItem);
      handledBase.add(bc.id);
      configAliases[bc.id] = c.id;
      configMerged++;
    } else {
      // inherited：取基础值，带入变体 status / release_blocker
      const bc = baseConfigById.get(c.base_rule_ref!) as Extract<ConfigItem, { origin: "base" }>;
      config.push({ ...bc, id: bc.id, status: c.status, release_blocker: c.release_blocker, description: c.description ?? bc.description, origin: "base" } as ConfigItem);
      handledBase.add(bc.id);
      configAliases[c.id] = bc.id;
      configMerged++;
    }
  }
  for (const bc of base.config) {
    if (handledBase.has(bc.id)) continue;
    config.push({ ...bc, origin: "base" });
  }
  const configUi = base.configUi.map((c) => ({ ...c, origin: "base" as const })); // 纯继承

  // P2-C.4 manifest scope 合并
  const scope = { ...bm.scope, ...vm.scope };

  // P2-C.5 重写依赖引用（规则别名 + 配置别名）
  const allAliases = { ...aliases, ...configAliases };
  for (const r of out) {
    // out 里是浅拷贝，meta 仍可能与输入共享：必须生成新的 meta，不能就地改写
    const meta = r.meta as RuleMeta;
    r.meta = { ...meta, depends_on: meta.depends_on.map((d) => allAliases[d] ?? d) };
    r.body = rewriteBody(r.body, allAliases);
  }

  // 检查依赖引用闭合
  const outIds = new Set(out.map((r) => r.meta.id));
  const configIds = new Set([...config, ...configUi].map((c) => c.id));
  for (const r of out) {
    for (const d of r.meta.depends_on) {
      if (!outIds.has(d) && !configIds.has(d)) throw new Error(`编译后依赖悬空：${r.meta.id} depends_on ${d}`);
    }
    for (const ref of r.body.matchAll(/`((?:HJ|XS)-[CRFKNMTPVIA]-[A-Z0-9]+(?:-[A-Z0-9]+)*)`/g)) {
      const id = ref[1];
      if (!outIds.has(id) && !configIds.has(id)) throw new Error(`编译后正文引用悬空：${r.meta.id} -> ${id}`);
    }
  }

  // P2-C.7 统一发布门槛
  const blockers: string[] = [];
  for (const r of out) {
    const m = r.meta;
    if (m.release_blocker && m.status !== "confirmed") blockers.push(`${m.id} (${m.status})`);
  }
  for (const c of [...config, ...configUi]) {
    if (c.release_blocker && c.status !== "confirmed") blockers.push(`${c.id} (${c.status})`);
  }
  // unresolved.yaml 的 blocker 必须参与发布门槛。若关联对象已被上面扫描到，不重复报告；
  // 若关联对象没有自身 blocker，则仍报告未决条目，避免未决项被 status: confirmed 的目标掩盖。
  const scannedBlockerTargets = new Set(blockers.map((b) => b.split(" (")[0]));
  for (const u of variant.unresolved) {
    const resolvedTarget = configAliases[u.card_ref] ?? aliases[u.card_ref] ?? u.card_ref;
    const resolved = u.status === "confirmed" && typeof u.resolution === "string" && u.resolution.trim().length > 0;
    if (u.release_blocker && !resolved && !scannedBlockerTargets.has(resolvedTarget)) {
      blockers.push(`${u.id} (${u.status})`);
    }
  }
  const uniqueBlockers = [...new Set(blockers)];

  const result: CompileResult = {
    rules: out,
    config,
    configUi,
    manifest: {
      ...vm,
      scope,
      compiled_from: { ruleset_id: bm.ruleset_id, version: bm.version },
      releasable: uniqueBlockers.length === 0,
      blockers: uniqueBlockers,
    },
    ruleAliases: { ...aliases, ...configAliases },
    blockers: uniqueBlockers,
    counts: { inherited: inheritedCount, replaced, added, configMerged },
  };
  // 结果深拷贝后返回：调用方拿不到输入里的任何对象，隔着输出也改不到输入
  return structuredClone(result);
}

/** 写产物 */
function writeOutput(dir: string, result: CompileResult, unresolved: import("../schemas/unresolved.ts").UnresolvedEntry[]) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const dirs = new Set<string>(["guize", "shixu", "zhuangtai", "gongshi", "biaoge", "jiesuan", "jiemian"]);
  for (const d of dirs) mkdirSync(join(dir, d), { recursive: true });

  for (const r of result.rules) {
    const { meta, ..._ } = { meta: r.meta };
    // 产物 front matter：去掉 origin/change_type/base_rule_ref（保留溯源在 rule-index.json），加 compiled_origin
    const m = r.meta as Record<string, unknown>;
    const fm: Record<string, unknown> = {
      id: m.id,
      compiled_origin: r.origin,
      type: m.type,
      name: m.name,
      scope: m.scope,
      status: m.status,
      release_blocker: m.release_blocker,
      depends_on: m.depends_on,
      sources: m.sources,
    };
    if (r.origin === "variant") {
      const vm = m as unknown as VariantRuleMeta;
      fm.base_rule_ref = vm.base_rule_ref ?? null;
      fm.change_type = vm.change_type;
      fm.compares_to = vm.compares_to;
    }
    const content = `---\n${toYaml(fm).trimEnd()}\n---\n${r.body}`;
    const file = join(dir, dirFor(r.meta.id), `${r.meta.id.toLowerCase()}.md`);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content, "utf8");
  }
  writeFileSync(join(dir, "config.yaml"), toYaml(result.config.map((c) => ({ ...c, compiled_origin: c.origin }))), "utf8");
  writeFileSync(join(dir, "config.ui.yaml"), toYaml(result.configUi), "utf8");
  writeFileSync(join(dir, "manifest.yaml"), toYaml(result.manifest), "utf8");
  writeFileSync(join(dir, "rule-index.json"), JSON.stringify({ rule_aliases: result.ruleAliases }, null, 2) + "\n", "utf8");
  if (unresolved.length) writeFileSync(join(dir, "unresolved.yaml"), toYaml(unresolved), "utf8");

  // 编译报告
  const byType: Record<string, number> = {};
  for (const r of result.rules) byType[r.origin] = (byType[r.origin] ?? 0) + 1;
  const report = [
    `# 编译报告：${result.manifest.ruleset_id}`,
    "",
    `- 基础规则集：${(result.manifest.compiled_from as Record<string, string>).ruleset_id}@${(result.manifest.compiled_from as Record<string, string>).version}`,
    `- 规则总数：${result.rules.length}（继承自杭州 ${byType.base ?? 0}，来自萧山 ${byType.variant ?? 0}）`,
    `- 继承（inherited，不生成新卡）：${result.counts.inherited}`,
    `- 替换（modified）：${result.counts.replaced}`,
    `- 新增（added）：${result.counts.added}`,
    `- 配置合并：${result.counts.configMerged} 项`,
    `- 可发布：${result.manifest.releasable ? "是" : "否"}`,
    "",
    "## 阻塞项",
    "",
    ...(result.blockers.length ? result.blockers.map((b) => `- ${b}`) : ["无"]),
    "",
    "## 规则 ID 映射",
    "",
    "```json",
    JSON.stringify(result.ruleAliases, null, 2),
    "```",
    "",
  ].join("\n");
  writeFileSync(join(dir, "compile-report.md"), report, "utf8");
}

/** 主流程：校验并编译基础规则集与变种目录下全部变种，写入编译产物目录 */
export function main(paths: CompilePaths = DEFAULT_PATHS) {
  const base = loadRuleset(paths.baseDir, "base");
  if (validateRuleset(base).length) throw new Error(`${paths.baseDir} 校验未通过，先跑 node compiler/validator.ts`);

  writeOutput(join(paths.compiledDir, "hangzhou"), compileBase(base), []);

  for (const name of readdirSync(paths.variantsDir)) {
    const vdir = join(paths.variantsDir, name);
    if (!statSync(vdir).isDirectory()) continue;
    const variant = loadRuleset(vdir, "variant");
    const errs = validateRuleset(variant, base);
    if (errs.length) throw new Error(`${vdir} 校验未通过：\n${errs.map((e) => `  ${e.file} ${e.path} ${e.message}`).join("\n")}`);
    const result = compileVariant(base, variant);
    writeOutput(join(paths.compiledDir, name), result, variant.unresolved);
    console.log(`[compiled] ${name}: ${result.rules.length} 条规则（继承 ${result.counts.inherited} / 替换 ${result.counts.replaced} / 新增 ${result.counts.added}），配置 ${result.config.length} 项，${result.manifest.releasable ? "可发布" : `不可发布（${result.blockers.length} 个阻塞）`}`);
  }
  console.log(`[compiled] hangzhou: ${base.rules.length} 条规则（pass-through）`);
}

// 直接运行时执行（argv[1] 是本文件路径）；被测试 import 时不跑主流程
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
