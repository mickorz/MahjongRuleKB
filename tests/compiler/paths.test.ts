// 路径集中化测试：根路径只在 compiler/paths.ts 定义，其余代码不得散落字符串字面量
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { PATHS, DEFAULT_PATHS, DEFAULT_BASE_DIR, RULEBOOK_ROOT } from "../../compiler/paths.ts";

const COMPILER_DIR = "compiler";

describe("路径常量集中化", () => {
  it("paths.ts 定义的目录真实存在", () => {
    for (const dir of [PATHS.sourcesDir, PATHS.baseDir, PATHS.variantsDir, PATHS.compiledDir, PATHS.changesArchiveDir]) {
      expect(existsSync(dir), `${dir} 应存在`).toBe(true);
    }
    expect(PATHS.baseDir.startsWith(`${RULEBOOK_ROOT}/`)).toBe(true);
    expect(DEFAULT_PATHS.baseDir).toBe(PATHS.baseDir);
    expect(DEFAULT_PATHS.variantsDir).toBe(PATHS.variantsDir);
    expect(DEFAULT_PATHS.compiledDir).toBe(PATHS.compiledDir);
    expect(DEFAULT_BASE_DIR).toBe(PATHS.baseDir);
  });

  it("compiler/ 下除 paths.ts 外没有根路径字符串字面量", () => {
    const offenders: string[] = [];
    for (const name of readdirSync(COMPILER_DIR)) {
      if (!name.endsWith(".ts") || name === "paths.ts") continue;
      const file = join(COMPILER_DIR, name);
      const src = readFileSync(file, "utf8");
      // 只查「引号内的根路径字面量」；inferRulesetKind 的正则 /(^|\/)variants\// 不算
      const m = src.match(/["'`](?:rulesets|variants|compiled)\//g);
      if (m) offenders.push(`${file}: ${[...new Set(m)].join(", ")}`);
    }
    expect(offenders).toEqual([]);
  });
});
