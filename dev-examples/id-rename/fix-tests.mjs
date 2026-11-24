// 迁移后修正测试里的版本号期望（一次性，2026-11-24）
import fs from "node:fs";

const rep = (file, pairs) => {
  let s = fs.readFileSync(file, "utf8");
  for (const [a, b] of pairs) {
    if (!s.includes(a)) throw new Error(`MISS ${file}: ${a}`);
    s = s.split(a).join(b);
  }
  fs.writeFileSync(file, s);
  console.log(`ok ${file}`);
};

rep("tests/compiler/variant-refs.test.ts", [
  ['it("manifest 锁定杭州 1.0.0"', 'it("manifest 锁定杭州 1.1.0"'],
  ['version: "1.0.0" });', 'version: "1.1.0" });'],
]);
rep("tests/compiler/compile.test.ts", [['version: "1.0.0" });', 'version: "1.1.0" });']]);
