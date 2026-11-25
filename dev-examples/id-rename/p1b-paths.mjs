// P1-B 一次性脚本：把测试与现存脚本里的根路径替换为 rulebook/ 结构（2026-11-24）
import fs from "node:fs";

const MAP = [
  ['"rulesets/hangzhou', '"rulebook/specs/base/hangzhou'],
  ['"variants/xiaoshan', '"rulebook/specs/variants/xiaoshan'],
  ['"variants/', '"rulebook/specs/variants/'],
  ['"compiled/', '"rulebook/compiled/'],
  // 单引号与模板字面量形式
  ["'rulesets/hangzhou", "'rulebook/specs/base/hangzhou"],
  ["'variants/xiaoshan", "'rulebook/specs/variants/xiaoshan"],
  ["'variants/", "'rulebook/specs/variants/"],
  ["'compiled/", "'rulebook/compiled/"],
  ["`rulesets/hangzhou", "`rulebook/specs/base/hangzhou"],
  ["`variants/xiaoshan", "`rulebook/specs/variants/xiaoshan"],
  ["`compiled/", "`rulebook/compiled/"],
];

const files = [
  "tests/compiler/compile-purity.test.ts",
  "tests/compiler/compile.test.ts",
  "tests/compiler/rule-ids.test.ts",
  "tests/compiler/ruleset-kind.test.ts",
  "tests/compiler/structure.test.ts",
  "tests/compiler/variant-refs.test.ts",
  "tests/regression/gold-set.test.ts",
];

for (const f of files) {
  let s = fs.readFileSync(f, "utf8");
  const before = s;
  for (const [from, to] of MAP) s = s.split(from).join(to);
  if (s !== before) {
    fs.writeFileSync(f, s);
    const n = (before.match(/"[a-z]+\/(hangzhou|xiaoshan|compiled|variants)/g) ?? []).length;
    console.log(`ok ${f}（约 ${n} 处）`);
  } else {
    console.log(`-- ${f} 无变化`);
  }
}
