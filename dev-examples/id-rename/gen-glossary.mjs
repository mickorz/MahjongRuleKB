// 由映射表与迁移前的卡片名生成术语拼音表（一次性，2026-11-24）
// 数据来源：git HEAD 的旧卡片（取中文 name）+ dev-examples/id-rename/mapping.mjs
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { MAP, DIR_MAP } from "./mapping.mjs";

const sh = (cmd) => execSync(cmd, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

// 迁移前所有 id → 中文名
const files = sh("git ls-tree -r --name-only HEAD rulesets/hangzhou variants/xiaoshan").trim().split("\n").filter((f) => f.endsWith(".md"));
const nameOf = new Map();
for (const f of files) {
  const txt = sh(`git show HEAD:${f}`);
  const fm = txt.match(/^---\r?\n[\s\S]*?\r?\n---/);
  if (!fm) continue;
  const id = (fm[0].match(/^id:\s*(\S+)/m) || [])[1];
  const name = (fm[0].match(/^name:\s*(.+)$/m) || [])[1];
  if (id) nameOf.set(id, (name || "").trim());
}

// 参数配置项：从 HEAD 的 config 文件取 id + name
for (const cfg of ["rulesets/hangzhou/config.yaml", "rulesets/hangzhou/config.ui.yaml", "variants/xiaoshan/config.yaml"]) {
  let txt;
  try {
    txt = sh(`git show HEAD:${cfg}`);
  } catch {
    continue;
  }
  for (const m of txt.matchAll(/- id: (\S+)\r?\n(?:[\s\S]*?)  name: (.+)/g)) nameOf.set(m[1], m[2].trim());
}

const groups = [
  ["A", "动画", "DONGHUA"],
  ["F", "公式", "GONGSHI"],
  ["I", "交互", "JIAOHU"],
  ["K", "档位表", "BIAOGE"],
  ["M", "状态记录", "JILU"],
  ["N", "状态计数", "JISHU"],
  ["P", "结算入账", "JIESUAN"],
  ["R", "判定", "PANDING"],
  ["T", "时序", "SHIXU"],
  ["V", "静态界面", "JIEMIAN"],
  ["C", "玩法参数", "CANSHU"],
];

const rows = [];
for (const [oldId, newId] of Object.entries(MAP)) {
  const seg = oldId.split("-")[1];
  rows.push({ seg, oldId, newId, name: nameOf.get(oldId) || "" });
}
const unmapped = [...nameOf.keys()].filter((id) => !(id in MAP));

const lines = [];
lines.push("# 规则命名规范与术语拼音表");
lines.push("");
lines.push("> 日期：2026-11-24");
lines.push("> 起因：`compiled/` 与规则源里文件名、目录名中英文混用（`hj-r-caishen` 拼音 / `hj-r-priority` 英文 / 目录全英文），难以检索与交接。");
lines.push("> 结论：文件名与目录名统一用中文拼音；ID 结构不变。本文是迁移记录，也是后续新增规则时的取名依据。");
lines.push("");
lines.push("## 命名规范");
lines.push("");
lines.push("1. **ID 结构**：`<规则集前缀>-<类型字母>-<拼音CODE>`，例如 `HJ-R-ZHUANGJIA-02`。");
lines.push("2. **CODE 段**：中文语义的拼音，全大写；多词用连字符分词（`CHI-JINSHOU`、`PIAOCAI-XIANZHI`），不写成 `CHIJINSHOU`。");
lines.push("3. **系列卡**：同一类型下成系列的卡改拼音后保留数字后缀（`BANK-01..04` → `ZHUANGJIA-01..04`、`HU-01..04` → `HUPAI-01..04`）。");
lines.push("4. **文件名**：等于 ID 的小写（`hj-r-zhuangjia-02.md`），一个卡一个文件。");
lines.push("5. **目录**：按类型字母落到拼音目录，见下表；目录名与 `type` 值（schema 枚举，保持英文）是两回事，别混。");
lines.push("6. **拼音写法**：不带声调、不缩写；专有名词按麻将通行读音（`zimo` 自摸、`qianggang` 抢杠、`dianpao` 点炮、`huangzhuang` 黄庄）。");
lines.push("");
lines.push("## 目录对照");
lines.push("");
lines.push("| 拼音目录 | 原英文目录 | 类型字母 | `type` 值 |");
lines.push("| --- | --- | --- | --- |");
const typeBySeg = { R: "judgment", T: "timing", N: "counter", M: "record", F: "formula", K: "lookup", P: "settlement", V: "static-ui", I: "interaction", A: "animation" };
const done = new Set();
for (const [seg, [oldDir, newDir]] of Object.entries(DIR_MAP)) {
  if (done.has(newDir)) {
    lines[lines.length - 1] = lines[lines.length - 1].replace(/\|$/, ` / ${typeBySeg[seg]} |`).replace(/(\|\s*`?[A-Z]`?\s*)\|/, `$1 / ${seg} |`);
    continue;
  }
  done.add(newDir);
  lines.push(`| \`${newDir}/\` | \`${oldDir}/\` | ${seg} | ${typeBySeg[seg]} |`);
}
lines.push("");
lines.push("## 术语拼音表（迁移映射）");
lines.push("");
lines.push("左侧是迁移前的 ID，右侧是现在的 ID。`未变` 表示本来就是拼音。");
lines.push("");
for (const [seg, label, pinyin] of groups) {
  const rowsOf = rows.filter((r) => r.seg === seg);
  if (!rowsOf.length) continue;
  lines.push(`### ${seg} —— ${label}（${pinyin}）`);
  lines.push("");
  lines.push("| 旧 ID | 中文 | 新 ID |");
  lines.push("| --- | --- | --- |");
  for (const r of rowsOf.sort((a, b) => a.oldId.localeCompare(b.oldId)))
    lines.push(`| \`${r.oldId}\` | ${r.name} | \`${r.newId}\` |`);
  lines.push("");
}
lines.push("### 迁移后未改动的 ID（本身已是拼音）");
lines.push("");
lines.push(unmapped.filter((id) => /-[A-Z]-/.test(id)).map((id) => `\`${id}\``).join("、"));
lines.push("");
lines.push("## 连带变更");
lines.push("");
lines.push("| 项 | 变更 |");
lines.push("| --- | --- |");
lines.push("| `rulesets/hangzhou/manifest.yaml` | `version` 1.0.0 → 1.1.0，重算 `content_hash` |");
lines.push("| `variants/xiaoshan/manifest.yaml` | `version` 0.1.0 → 0.2.0，`base.version` 1.0.0 → 1.1.0 |");
lines.push("| `compiler/compile.ts` | `dirFor` 与输出目录集合改为拼音目录 |");
lines.push("| `compiled/` | 重新生成（不得手改） |");
lines.push("| 引用 | 全部规则卡、`config*.yaml`、`unresolved.yaml`、`coverage.md`、`tests/`、`calculators/`、`dev-docs/` 里的 ID 同步改写 |");
lines.push("| 未改 | front matter 的 `type` 值（schema 枚举）与 `sources/` 原始材料 |");
lines.push("");

fs.mkdirSync("dev-docs/design", { recursive: true });
fs.writeFileSync("dev-docs/design/2026-11-24-规则命名规范与术语拼音表.md", lines.join("\n"));
console.log(`已生成，映射 ${rows.length} 条，未改动 ${unmapped.length} 条`);
