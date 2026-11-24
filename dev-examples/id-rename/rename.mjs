// 规则 ID 与目录拼音化迁移（一次性脚本，2026-11-24）
// 用法：node dev-examples/id-rename/rename.mjs --dry   （只看计划）
//       node dev-examples/id-rename/rename.mjs         （执行）
// 步骤：① 冲突检查 ② 目录改名 ③ 写新卡 ④ 单次正则重写全仓 ID 引用
//       ⑤ 清理文件名与 ID 不符的残留 ⑥ 更新编译器目录映射
import { readFileSync, writeFileSync, existsSync, renameSync, readdirSync, rmSync, mkdirSync } from "node:fs";
import { join, dirname, basename, relative } from "node:path";
import { MAP, DIR_MAP } from "./mapping.mjs";

const ROOT = process.cwd();
const DRY = process.argv.includes("--dry");
const RULESETS = ["rulesets/hangzhou", "variants/xiaoshan"];
const IGNORE_DIRS = new Set([".git", "node_modules", "compiled", ".cache", "dist", ".rule-studio"]);
const SELF = "dev-examples/id-rename";

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return IGNORE_DIRS.has(e.name) ? [] : walk(p);
    return [p];
  });
const rel = (p) => relative(ROOT, p).replaceAll("\\", "/");
const dirOf = (id) => DIR_MAP[id.split("-")[1]][1];
const idOf = (file) => {
  const fm = readFileSync(file, "utf8").match(/^---\n[\s\S]*?\n---/);
  return fm ? (fm[0].match(/^id:\s*(\S+)/m) || [])[1] : undefined;
};

// ── 0. 冲突检查 ──
const targets = Object.values(MAP);
const dup = [...new Set(targets.filter((v, i) => targets.indexOf(v) !== i))];
if (dup.length) throw new Error(`映射目标重复：${dup.join(", ")}`);
const idsInRepo = new Set();
for (const root of RULESETS)
  for (const f of walk(join(ROOT, root)))
    if (/\.(md|ya?ml)$/.test(f))
      for (const m of readFileSync(f, "utf8").matchAll(/\b((?:HJ|XS)-[A-Z](?:-[A-Z0-9]+)+)\b/g)) idsInRepo.add(m[1]);
const collide = targets.filter((v) => idsInRepo.has(v) && !(v in MAP));
if (collide.length) throw new Error(`新 ID 与未映射的现有 ID 冲突：${collide.join(", ")}`);

// ── 1. 规划：规则卡重命名 ──
const moves = [];
for (const root of RULESETS)
  for (const f of walk(join(ROOT, root)).filter((f) => f.endsWith(".md"))) {
    const id = idOf(f);
    if (!id || !MAP[id]) continue;
    moves.push({ from: f, to: join(ROOT, root, dirOf(MAP[id]), `${MAP[id].toLowerCase()}.md`), oldId: id, newId: MAP[id] });
  }
console.log(`待迁移规则卡：${moves.length} 张`);

// ── 2. 目录改名 ──
const dirsDone = new Set();
for (const root of RULESETS)
  for (const [oldName, newName] of Object.values(DIR_MAP)) {
    const key = `${root}/${oldName}`;
    if (dirsDone.has(key)) continue;
    dirsDone.add(key);
    const from = join(ROOT, root, oldName);
    if (!existsSync(from)) continue;
    console.log(`目录 ${root}/${oldName} → ${root}/${newName}`);
    if (!DRY) renameSync(from, join(ROOT, root, newName));
  }

// ── 3. 写新卡（旧文件在步骤 5 统一清理）──
for (const mv of moves) {
  const body = readFileSync(mv.from, "utf8").replace(/^id:\s*\S+/m, `id: ${mv.newId}`);
  if (!DRY) {
    mkdirSync(dirname(mv.to), { recursive: true });
    writeFileSync(mv.to, body);
  }
}

// ── 4. 单次正则重写全仓 ID 引用（长 ID 优先，前后不得紧接字母数字或连字符）──
if (!DRY) {
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `(?<![A-Z0-9-])(${Object.keys(MAP).sort((a, b) => b.length - a.length).map(esc).join("|")})(?![A-Z0-9-])`,
    "g",
  );
  let touched = 0;
  for (const f of walk(ROOT)) {
    if (!/\.(md|ts|mjs|js|json|ya?ml)$/.test(f)) continue;
    if (rel(f).startsWith(SELF)) continue;
    const txt = readFileSync(f, "utf8");
    const out = txt.replace(pattern, (m) => MAP[m]);
    if (out !== txt) {
      touched++;
      writeFileSync(f, out);
    }
  }
  console.log(`重写 ID 引用的文件数：${touched}`);
}

// ── 5. 清理文件名与 ID 不符的残留（目录改名后旧名字的副本）──
if (!DRY) {
  let removed = 0;
  for (const root of RULESETS)
    for (const f of walk(join(ROOT, root)).filter((f) => f.endsWith(".md"))) {
      const id = idOf(f);
      if (id && basename(f) !== `${id.toLowerCase()}.md`) {
        rmSync(f);
        removed++;
      }
    }
  console.log(`清理残留卡：${removed} 张`);
}

// ── 6. 编译器目录映射 ──
const compileFile = join(ROOT, "compiler/compile.ts");
let cs = readFileSync(compileFile, "utf8");
const oldDir = 'return { R: "rules", T: "timing", N: "state", M: "state", F: "formulas", K: "tables", P: "settlement", V: "ui", I: "ui", A: "ui" }[seg] ?? "rules";';
const newDir = 'return { R: "guize", T: "shixu", N: "zhuangtai", M: "zhuangtai", F: "gongshi", K: "biaoge", P: "jiesuan", V: "jiemian", I: "jiemian", A: "jiemian" }[seg] ?? "guize";';
if (cs.includes(oldDir)) cs = cs.replace(oldDir, newDir);
else if (!cs.includes(newDir)) throw new Error("compile.ts 的 dirFor 未匹配，请手工检查");
const oldSet = 'const dirs = new Set<string>(["rules", "timing", "state", "formulas", "tables", "settlement", "ui"]);';
const newSet = 'const dirs = new Set<string>(["guize", "shixu", "zhuangtai", "gongshi", "biaoge", "jiesuan", "jiemian"]);';
if (cs.includes(oldSet)) cs = cs.replace(oldSet, newSet);
else if (!cs.includes(newSet)) throw new Error("compile.ts 的 dirs 集合未匹配，请手工检查");
if (!DRY) writeFileSync(compileFile, cs);
console.log("编译器目录映射已更新");

console.log(`\n映射 ${Object.keys(MAP).length} 条，${DRY ? "试运行未写盘" : "已写盘"}`);
