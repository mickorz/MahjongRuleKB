// P1-C 收尾：修测试（版本号、并发竞争、产物相对引用命名）
import fs from "node:fs";

const edit = (file, pairs) => {
  let s = fs.readFileSync(file, "utf8");
  for (const [a, b] of pairs) {
    if (!s.includes(a)) throw new Error(`MISS ${file}: ${a.slice(0, 60)}`);
    s = s.split(a).join(b);
  }
  fs.writeFileSync(file, s);
  console.log(`ok ${file}`);
};

// 1) 版本断言 1.1.0 → 1.2.0
edit("tests/compiler/variant-refs.test.ts", [
  ['it("manifest 锁定杭州 1.1.0"', 'it("manifest 锁定杭州 1.2.0"'],
  ['version: "1.1.0" });', 'version: "1.2.0" });'],
]);
edit("tests/compiler/compile.test.ts", [['version: "1.1.0" });', 'version: "1.2.0" });']]);

// 2) compile.test.ts：改在临时目录编译，不再改写仓库产物（消除与 structure.test 的并发竞争）
edit("tests/compiler/compile.test.ts", [
  [
    'import { readFileSync, readdirSync, existsSync } from "node:fs";\nimport { join } from "node:path";',
    'import { readFileSync, readdirSync, existsSync, mkdtempSync, rmSync } from "node:fs";\nimport { join } from "node:path";\nimport { tmpdir } from "node:os";',
  ],
  [
    'import { splitFrontMatter, loadRuleset } from "../../compiler/validator.ts";',
    'import { splitFrontMatter, loadRuleset } from "../../compiler/validator.ts";\nimport { DEFAULT_PATHS, main as compileTo } from "../../compiler/compile.ts";',
  ],
  [
    `describe("重新编译无 diff", () => {
  it("连续两次 compile 结果一致", () => {
    execSync("node compiler/compile.ts", { stdio: "ignore" });
    const snapshot = () => {
      const files = walk("rulebook/compiled").filter((f) => !f.includes("node_modules")).sort();
      return files.map((f) => \`\${f}:\${readFileSync(f, "utf8").length}:\${readFileSync(f, "utf8").slice(0, 200)}\`).join("\\n");
    };
    const a = snapshot();
    execSync("node compiler/compile.ts", { stdio: "ignore" });
    expect(snapshot()).toBe(a);
  }, 15000);
});`,
    `describe("重新编译无 diff", () => {
  // 编译到临时目录：不改写仓库产物，避免与其他测试文件读 rulebook/compiled 产生竞争
  it("连续两次 compile 结果一致", () => {
    const out = mkdtempSync(join(tmpdir(), "kb-compile-"));
    const paths = { ...DEFAULT_PATHS, compiledDir: out };
    const snapshot = () => {
      const files = walk(out).sort();
      return files.map((f) => \`\${f}:\${readFileSync(f, "utf8").length}:\${readFileSync(f, "utf8").slice(0, 200)}\`).join("\\n");
    };
    try {
      compileTo(paths);
      const a = snapshot();
      compileTo(paths);
      expect(snapshot()).toBe(a);
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  }, 30000);
});`,
  ],
  // 该用例断言的是正文不含相对引用，名字里的 sources/hangzhou 已过时
  [
    'it("产物不含 sources/hangzhou 的路径引用（可独立读取）", () => {',
    'it("产物正文不含「见杭州文档」类相对引用（可独立读取）", () => {',
  ],
]);
