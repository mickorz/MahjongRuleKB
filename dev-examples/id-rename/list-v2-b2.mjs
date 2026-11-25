// 用片段文件把 B-5 / B-6 / C-4 / D-4+D-5 并入修订清单（v2 第二批）
import fs from "node:fs";

const f = "dev-docs/planning/2026-11-24-需求全文生成v1.3修订清单.md";
let s = fs.readFileSync(f, "utf8");
const read = (p) => fs.readFileSync(`dev-examples/id-rename/frag/${p}`, "utf8");

// 1) B 组尾部（原「## C. …共 3 项」标题）替换为 B-5/B-6 + 新 C 标题
const c3 = "---\n\n## C. 验收与数据模型（P0，共 3 项）";
if (!s.includes(c3)) throw new Error("C 组标题未匹配");
s = s.split(c3).join(read("b56.md").trimEnd());

// 2) C 组尾部（原「## D. …共 4 项」）替换为 C-4 + 新 D 标题
const d4 = "---\n\n## D. 设计补充（P1，共 4 项）";
if (!s.includes(d4)) throw new Error("D 组标题未匹配");
s = s.split(d4).join(read("c4.md").trimEnd());

// 3) D-4 行替换为 D-4（改）+ D-5（新）
const oldD4Start = "| D-4 | 十一、实施优先级 |";
const i = s.indexOf(oldD4Start);
if (i < 0) throw new Error("D-4 行未匹配");
const lineEnd = s.indexOf("\n", i);
s = s.slice(0, i) + read("d45.md").trimEnd() + s.slice(lineEnd);

fs.writeFileSync(f, s);
console.log("B-5 / B-6 / C-4 / D-4+D-5 已并入");
