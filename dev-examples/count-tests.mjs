// 统计各测试文件的用例数，用于测试文档
import { execSync } from "node:child_process";

const out = execSync("npx vitest run --reporter=json", { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const json = JSON.parse(out.slice(out.indexOf("{")));
const rows = json.testResults.map((f) => ({
  file: f.name.replace(/^.*MahjongRuleKB[\\/]/, "").replace(/\\/g, "/"),
  count: f.assertionResults.length,
}));
rows.sort((a, b) => b.count - a.count || a.file.localeCompare(b.file));
for (const r of rows) console.log(String(r.count).padStart(3), r.file);
const total = rows.reduce((a, b) => a + b.count, 0);
console.log("---");
console.log(`总计 ${total} 条 / ${rows.length} 个文件`);
