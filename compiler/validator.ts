// 规则集结构校验脚本
// 用法：node compiler/validator.ts [规则集目录] [--kind base|variant]
//   --kind 省略时按目录位置推断（过渡期兼容），显式传入时以传入为准
// 检查：ID 唯一、ID 前缀与类型一致、引用闭合、YAML 元数据、正文必填槽位、config 可解析、ID 唯一
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { ruleMetaSchema, ruleIdPattern, type RuleMeta } from "../schemas/rule.ts";
import { configListSchema, type ConfigItem } from "../schemas/config.ts";
import { baseManifestSchema, variantManifestSchema } from "../schemas/manifest.ts";
import { requiredSlotsFor } from "../schemas/slot-definitions.ts";
import { unresolvedListSchema, type UnresolvedEntry } from "../schemas/unresolved.ts";

/** 规则集类型。校验与编译只认这个显式值，不看目录位置 */
export type RuleSetKind = "base" | "variant";

export { DEFAULT_BASE_DIR } from "./paths.ts";
import { DEFAULT_BASE_DIR } from "./paths.ts";

export interface LoadedRule {
  meta: RuleMeta;
  body: string;
  file: string;
}

export interface LoadedRuleset {
  dir: string;
  kind: RuleSetKind;
  manifest: Record<string, unknown>;
  config: ConfigItem[];
  configUi: ConfigItem[];
  rules: LoadedRule[];
  unresolved: UnresolvedEntry[];
}

export interface ValidationError {
  file: string;
  path: string;
  message: string;
}

/** 递归找 .md 文件，跳过非规则卡文件 */
function walkMd(dir: string): string[] {
  const out: string[] = [];
  const skip = new Set(["coverage.md", "README.md"]);
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walkMd(p));
    else if (name.endsWith(".md") && !skip.has(name)) out.push(p);
  }
  return out;
}

/** 解析 Markdown 的 YAML front matter 和正文 */
export function splitFrontMatter(text: string): { meta: unknown; body: string } {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) throw new Error("缺少 YAML front matter");
  return { meta: parseYaml(m[1]), body: m[2] };
}

/** 提取正文里的槽位名：形如 `- **触发**：` 或 `- **触发**:` */
export function extractSlots(body: string): Set<string> {
  const slots = new Set<string>();
  const re = /^\s*[-*]\s*\*\*(.+?)\*\*\s*[：:]/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) slots.add(m[1].trim());
  return slots;
}

/** 提取正文里引用的规则 ID */
export function extractBodyRefs(body: string): string[] {
  const ids: string[] = [];
  const re = /`((?:HJ|XS)-[RTNMFKPVIA]-[A-Z0-9]+(?:-[A-Z0-9]+)*)`/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) ids.push(m[1]);
  return ids;
}

/**
 * 按目录位置推断规则集类型。
 * 过渡期兼容用：仅当调用方没有显式传 kind 时才走这里。
 * 目录迁移到 rulebook/specs/{base,variants} 后应逐步改为全部显式传入。
 */
export function inferRulesetKind(dir: string): RuleSetKind {
  const norm = dir.replaceAll("\\", "/");
  return /(^|\/)variants\//.test(norm) ? "variant" : "base";
}

/** 加载一个规则集目录（kind 省略时按目录位置推断） */
export function loadRuleset(dir: string, kind: RuleSetKind = inferRulesetKind(dir)): LoadedRuleset {
  const manifestFile = join(dir, "manifest.yaml");
  const manifest = parseYaml(readFileSync(manifestFile, "utf8"));
  const configFile = join(dir, "config.yaml");
  const config = configListSchema.parse(parseYaml(readFileSync(configFile, "utf8")));
  let configUi: ConfigItem[] = [];
  try {
    configUi = configListSchema.parse(parseYaml(readFileSync(join(dir, "config.ui.yaml"), "utf8")));
  } catch {
    // 可选
  }
  const rules: LoadedRule[] = [];
  for (const file of walkMd(dir).sort()) {
    const { meta, body } = splitFrontMatter(readFileSync(file, "utf8"));
    rules.push({ meta: ruleMetaSchema.parse(meta), body, file });
  }
  let unresolved: UnresolvedEntry[] = [];
  const unresolvedFile = join(dir, "unresolved.yaml");
  try {
    unresolved = unresolvedListSchema.parse(parseYaml(readFileSync(unresolvedFile, "utf8")));
  } catch (error) {
    // 文件不存在时才按可选处理；文件存在但格式错误必须暴露。
    if (statSync(unresolvedFile, { throwIfNoEntry: false })) throw error;
  }
  return { dir, kind, manifest, config, configUi, rules, unresolved };
}

/** 校验一个规则集，返回错误列表（空数组表示通过） */
export function validateRuleset(rs: LoadedRuleset, base?: LoadedRuleset): ValidationError[] {
  const errs: ValidationError[] = [];
  const push = (file: string, path: string, message: string) => errs.push({ file, path, message });

  // manifest：按显式 kind 选 Schema，不看目录前缀
  const mres = (rs.kind === "variant" ? variantManifestSchema : baseManifestSchema).safeParse(rs.manifest);
  if (!mres.success) for (const i of mres.error.issues) push("manifest.yaml", i.path.join("."), i.message);

  // ID 唯一：规则卡 + 配置项 + UI 配置项
  const seen = new Map<string, string>();
  for (const r of rs.rules) {
    if (seen.has(r.meta.id)) push(relative(rs.dir, r.file), "id", `ID 重复：${r.meta.id} 已在 ${seen.get(r.meta.id)} 定义`);
    seen.set(r.meta.id, relative(rs.dir, r.file));
  }
  for (const c of [...rs.config, ...rs.configUi]) {
    if (seen.has(c.id)) push("config.yaml", "id", `ID 重复：${c.id} 已在 ${seen.get(c.id)} 定义`);
    seen.set(c.id, "config.yaml");
  }

  // 引用目标集合：本规则集内 + （若为 variant）基础规则集内
  const localIds = new Set(seen.keys());
  const baseIds = new Set<string>();
  if (base) {
    for (const r of base.rules) baseIds.add(r.meta.id);
    for (const c of [...base.config, ...base.configUi]) baseIds.add(c.id);
  }

  // 逐卡检查
  for (const r of rs.rules) {
    const file = relative(rs.dir, r.file);
    const meta = r.meta;

    // ID 前缀段与 type 一致
    const seg = meta.id.split("-")[1];
    const expectType = { R: "judgment", T: "timing", N: "counter", M: "record", F: "formula", K: "lookup", P: "settlement", V: "static-ui", I: "interaction", A: "animation" }[seg];
    if (expectType !== meta.type) push(file, "type", `ID 前缀 ${seg} 对应类型 ${expectType}，但 type 字段是 ${meta.type}`);

    // 槽位
    const required = requiredSlotsFor(meta.origin, meta.origin === "variant" ? meta.change_type : undefined, meta.type);
    const have = extractSlots(r.body);
    for (const s of required) if (!have.has(s)) push(file, "body", `缺少必填槽位「${s}」`);

    // 引用闭合
    if (meta.origin === "variant") {
      if (meta.base_rule_ref) {
        const where = meta.change_type === "inherited" ? baseIds : baseIds;
        if (!where.has(meta.base_rule_ref)) push(file, "base_rule_ref", `指向的 ${meta.base_rule_ref} 不存在于基础规则集`);
      }
      for (const c of meta.compares_to) if (!baseIds.has(c)) push(file, "compares_to", `指向的 ${c} 不存在于基础规则集`);
    }
    for (const d of meta.depends_on) {
      if (!localIds.has(d) && !baseIds.has(d)) push(file, "depends_on", `指向的 ${d} 不存在`);
    }
    for (const b of extractBodyRefs(r.body)) {
      if (!localIds.has(b) && !baseIds.has(b)) push(file, "body", `正文引用的 ${b} 不存在`);
    }
  }

  // 配置项引用
  for (const c of [...rs.config, ...rs.configUi]) {
    if (c.origin === "variant" && c.base_rule_ref && !baseIds.has(c.base_rule_ref)) {
      push("config.yaml", "base_rule_ref", `配置项 ${c.id} 指向的 ${c.base_rule_ref} 不存在于基础规则集`);
    }
  }

  // 未决清单引用
  rs.unresolved.forEach((u, i) => {
    if (!localIds.has(u.card_ref)) push("unresolved.yaml", `[${i}].card_ref`, `指向的 ${u.card_ref} 不存在`);
  });

  return errs;
}

// 直接运行时执行（argv[1] 是本文件路径）
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const kindFlag = args.indexOf("--kind");
  const explicitKind = kindFlag >= 0 ? (args[kindFlag + 1] as RuleSetKind | undefined) : undefined;
  if (explicitKind && explicitKind !== "base" && explicitKind !== "variant") {
    console.error(`--kind 只能是 base 或 variant，收到：${explicitKind}`);
    process.exit(2);
  }
  const target = args.find((a, i) => !a.startsWith("--") && i !== (kindFlag >= 0 ? kindFlag + 1 : -1)) ?? DEFAULT_BASE_DIR;
  const kind = explicitKind ?? inferRulesetKind(target);
  const rs = loadRuleset(target, kind);
  const base = kind === "variant" ? loadRuleset(DEFAULT_BASE_DIR, "base") : undefined;
  const errs = validateRuleset(rs, base);
  if (errs.length === 0) {
    console.log(`[通过] ${target}（${kind}）：${rs.rules.length} 张卡，${rs.config.length} 项玩法配置，${rs.configUi.length} 项界面配置`);
  } else {
    console.error(`[失败] ${target}（${kind}）：${errs.length} 处错误`);
    for (const e of errs) console.error(`  ${e.file}  ${e.path}  ${e.message}`);
    process.exit(1);
  }
}
