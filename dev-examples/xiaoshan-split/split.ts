// 从 sources/xiaoshan/xiaoshan-rules.md 拆出 47 张卡到 variants/xiaoshan/
// 用法：node dev-examples/xiaoshan-split/split.ts
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { xiaoshanCards, dirByPrefix, typeByPrefix } from "./cards.ts";

const src = readFileSync("sources/xiaoshan/xiaoshan-rules.md", "utf8").split("\r\n").join("\n");

// 按 #### 标题切块
const blocks = new Map<string, { title: string; body: string; lineNo: number }>();
const lines = src.split("\n");
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^#### ([A-Z]+-[A-Z0-9-]+) (.+)$/);
  if (!m) continue;
  const id = m[1];
  const title = m[2].trim();
  const start = i + 1;
  let end = start;
  while (end < lines.length && !lines[end].startsWith("#### ") && !lines[end].startsWith("### ") && !lines[end].startsWith("## ")) end++;
  blocks.set(id, { title, body: lines.slice(start, end).join("\n").trim(), lineNo: i + 1 });
}

// 把正文里的 ID 引用加 XS- 前缀（原文用 `R-BANK-02` 反引号形式）
function prefixIds(body: string): string {
  return body.replace(/`([RTNMFKPVIA]-[A-Z0-9]+(?:-[A-Z0-9]+)*)`/g, "`XS-$1`");
}

// 把「原文未写/未定/未给/未单列/未另定」的地方标出来，方便后面写 unresolved
function findUnresolved(body: string): string[] {
  const out: string[] = [];
  const re = /^.*原文未.*$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) out.push(m[0].trim());
  return out;
}

const unresolvedReport: Record<string, string[]> = {};
let count = 0;

for (const card of xiaoshanCards) {
  const blk = blocks.get(card.id);
  if (!blk) throw new Error(`原文找不到 ${card.id}`);
  const seg = card.id.split("-")[0];
  const dir = dirByPrefix[seg];
  const type = typeByPrefix[seg];
  mkdirSync(join("variants/xiaoshan", dir), { recursive: true });

  const xsId = `XS-${card.id}`;
  const meta: string[] = [
    "---",
    `id: ${xsId}`,
    "origin: variant",
    `type: ${type}`,
    `name: ${card.name}`,
    `change_type: ${card.changeType}`,
  ];
  if (card.base) meta.push(`base_rule_ref: ${card.base}`);
  if (card.changeType === "modified" || card.changeType === "inherited") {
    meta.push(`compares_to: [${card.base}]`);
  } else {
    meta.push("compares_to: []");
  }
  meta.push("scope: four_player_friend_room");
  meta.push(`status: ${card.status ?? "confirmed"}`);
  meta.push(`release_blocker: ${card.releaseBlocker ?? false}`);
  const deps = card.dependsOn ?? [];
  meta.push(`depends_on: [${deps.join(", ")}]`);
  meta.push("sources:");
  meta.push("  - source: sources/xiaoshan/xiaoshan-rules.md");
  meta.push(`    section: "${card.id}"`);
  meta.push("---");

  const body = prefixIds(blk.body);
  const content = `${meta.join("\n")}\n\n# ${blk.title}\n\n${body}\n`;
  const file = join("variants/xiaoshan", dir, `${xsId.toLowerCase()}.md`);
  writeFileSync(file, content, "utf8");
  count++;

  const un = findUnresolved(blk.body);
  if (un.length) unresolvedReport[card.id] = un;
}

writeFileSync("dev-examples/xiaoshan-split/unresolved-raw.json", JSON.stringify(unresolvedReport, null, 2), "utf8");
console.log(`拆出 ${count} 张卡`);
console.log(`含「原文未」的卡：${Object.keys(unresolvedReport).length} 张，共 ${Object.values(unresolvedReport).reduce((a, b) => a + b.length, 0)} 行`);
