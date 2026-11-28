// 规则/配置 ID → 中文名（供前端把 HJ-C-RENSHU 显示成「人数」）
// 数据源：rulebook/compiled/<variant>/ 下规则卡 front matter 的 name，
// 以及 config.yaml 的 id/name。按 variant 缓存，进程内只扫一次。
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface RefName {
  id: string;
  name: string;
}

interface NameIndex {
  rules: Map<string, string>;
  configs: Map<string, string>;
}

const cache = new Map<string, NameIndex>();

function frontMatterName(text: string): { id?: string; name?: string } {
  if (!text.startsWith("---")) return {};
  const end = text.indexOf("\n---", 3);
  if (end < 0) return {};
  const block = text.slice(3, end);
  const id = /^id:\s*(.+)$/m.exec(block)?.[1]?.trim();
  const name = /^name:\s*(.+)$/m.exec(block)?.[1]?.trim();
  return { ...(id ? { id } : {}), ...(name ? { name } : {}) };
}

function scanRules(dir: string, out: Map<string, string>): void {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      scanRules(full, out);
      continue;
    }
    if (!entry.name.endsWith(".md")) continue;
    const { id, name } = frontMatterName(readFileSync(full, "utf8"));
    if (id && name) out.set(id.toUpperCase(), name);
  }
}

function scanConfigs(file: string, out: Map<string, string>): void {
  if (!existsSync(file)) return;
  // 只认「- id: X」后紧跟的「  name: Y」，避免误吞 ruleset 里的其它 name
  const lines = readFileSync(file, "utf8").split("\n");
  let pendingId: string | null = null;
  for (const line of lines) {
    const idMatch = /^-\s*id:\s*([A-Za-z0-9-]+)\s*$/.exec(line);
    if (idMatch) {
      pendingId = idMatch[1].toUpperCase();
      continue;
    }
    const nameMatch = /^\s+name:\s*(.+)$/.exec(line);
    if (nameMatch && pendingId) {
      out.set(pendingId, nameMatch[1].trim());
      pendingId = null;
    }
    if (/^-\s/.test(line) && !idMatch) pendingId = null;
  }
}

/** ruleset_id → 编译目录名（hangzhou-friends-4p → hangzhou） */
function rulesetDirs(kbRoot: string): Map<string, string> {
  const root = join(kbRoot, "rulebook", "compiled");
  const map = new Map<string, string>();
  if (!existsSync(root)) return map;
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const manifest = join(root, entry.name, "manifest.yaml");
    if (!existsSync(manifest)) continue;
    const id = /^ruleset_id:\s*(.+)$/m.exec(readFileSync(manifest, "utf8"))?.[1]?.trim();
    if (id) map.set(id, entry.name);
  }
  return map;
}

/** 基座 ruleset_id（派生规则集要连基线一起查名字） */
function baseOf(kbRoot: string, dir: string): string | null {
  const manifest = join(kbRoot, "rulebook", "compiled", dir, "manifest.yaml");
  if (!existsSync(manifest)) return null;
  const lines = readFileSync(manifest, "utf8").split(String.fromCharCode(10));
  const i = lines.findIndex((l) => /^base:\s*$/.test(l));
  if (i < 0) return null;
  for (const l of lines.slice(i + 1, i + 6)) {
    const m = /ruleset_id:\s*(.+)/.exec(l);
    if (m) return m[1].trim();
    if (/^\S/.test(l)) break;
  }
  return null;
}

export function nameIndex(kbRoot: string, variant: string): NameIndex {
  const key = join(kbRoot, "rulebook", "compiled", variant);
  const hit = cache.get(key);
  if (hit) return hit;

  const index: NameIndex = { rules: new Map(), configs: new Map() };
  const dirs = rulesetDirs(kbRoot);

  // 先派生、后基座：基座同名 ID 不覆盖派生（派生才是本玩法实际生效的卡）
  const chain: string[] = [];
  let dir: string | null = variant;
  for (let depth = 0; dir && depth < 4; depth += 1) {
    chain.push(dir);
    const baseId = baseOf(kbRoot, dir);
    dir = baseId ? dirs.get(baseId) ?? null : null;
  }

  for (const name of chain) {
    const root = join(kbRoot, "rulebook", "compiled", name);
    const rules = new Map<string, string>();
    const configs = new Map<string, string>();
    scanRules(root, rules);
    scanConfigs(join(root, "config.yaml"), configs);
    for (const [id, n] of rules) if (!index.rules.has(id)) index.rules.set(id, n);
    for (const [id, n] of configs) if (!index.configs.has(id)) index.configs.set(id, n);
  }

  cache.set(key, index);
  return index;
}

/** 把 ID 列表翻成中文名；翻不到就保留原 ID（不隐藏事实） */
export function resolveNames(kbRoot: string, variant: string, refs: ReadonlyArray<string>, kind: "rule" | "config"): RefName[] {
  const index = nameIndex(kbRoot, variant);
  const table = kind === "rule" ? index.rules : index.configs;
  return refs.map((id) => ({ id, name: table.get(id.toUpperCase()) ?? id }));
}

/** 全量 ID 列表（/api/refs 用） */
export function allRefIds(kbRoot: string, variant: string, kind: "rules" | "configs"): string[] {
  const index = nameIndex(kbRoot, variant);
  return [...(kind === "rules" ? index.rules.keys() : index.configs.keys())];
}
