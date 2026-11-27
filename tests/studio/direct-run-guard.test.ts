// 守卫：studio/ 下不得出现 TS 构造函数参数属性
// 原因：pipeline 入口要用 `node --experimental-strip-types` 直跑，
// 参数属性会报 ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX，导致 CLI 直接崩。
// 这个坑已踩三次（registry/manager/run-log），用测试锁住。
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (name.endsWith(".ts")) acc.push(full);
  }
  return acc;
}

/** 匹配构造函数参数上的修饰符：constructor(... private readonly x: T ...) */
const paramPropertyPattern = /constructor\s*\([^)]*\b(?:public|private|protected|readonly)\s+\w+\s*:/s;

describe("可直跑性守卫", () => {
  it("studio/ 与 compiler/ 下没有 TS 参数属性", () => {
    const offenders = [...walk("studio"), ...walk("compiler")].filter((file) => {
      const source = readFileSync(file, "utf8");
      // 注释里提到不算
      const stripped = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
      return paramPropertyPattern.test(stripped);
    });
    expect(offenders, `以下文件含参数属性，会导致 node 直跑失败：\n${offenders.join("\n")}`).toEqual([]);
  });
});
