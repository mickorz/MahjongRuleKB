// 编译器不可变性测试：不修改输入、输出不与输入共享引用、结果与编译次数和变种顺序无关
// 背景：compileVariant 过去对规则做浅拷贝后就地改写共享的 meta.depends_on，
// 多个变种共用同一个 base 时，后编译的变种与基础内容指纹都会拿到被污染的杭州规则。
import { describe, it, expect } from "vitest";
import { loadRuleset, type LoadedRuleset } from "../../compiler/validator.ts";
import { compileBase, compileVariant, rulesetContentHash } from "../../compiler/compile.ts";

/** 深冻结：之后任何对输入的写入都会抛 TypeError */
function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const v of Object.values(value as Record<string, unknown>)) deepFreeze(v);
  }
  return value;
}

/** 收集 value 可达的全部对象与数组 */
function collectObjects(value: unknown, out = new Set<object>()): Set<object> {
  if (value && typeof value === "object" && !out.has(value)) {
    out.add(value);
    for (const v of Object.values(value as Record<string, unknown>)) collectObjects(v, out);
  }
  return out;
}

/** 一个没有任何差异卡、全部默认继承的内存变种：用来检测 base 是否被上一次编译污染 */
function emptyVariant(base: LoadedRuleset, rulesetId: string): LoadedRuleset {
  const bm = base.manifest as { ruleset_id: string; version: string };
  return {
    dir: `variants/${rulesetId}`,
    kind: "variant",
    manifest: { ruleset_id: rulesetId, version: "0.1.0", base: { ruleset_id: bm.ruleset_id, version: bm.version }, scope: {} },
    config: [],
    configUi: [],
    rules: [],
    unresolved: [],
  };
}

describe("编译器不修改输入", () => {
  it("输入深冻结后仍可编译，且编译前后输入深比较一致", () => {
    const inputs = { base: loadRuleset("rulesets/hangzhou"), variant: loadRuleset("variants/xiaoshan") };
    const before = structuredClone(inputs);
    deepFreeze(inputs.base);
    deepFreeze(inputs.variant);
    compileBase(inputs.base);
    compileVariant(inputs.base, inputs.variant);
    expect(structuredClone(inputs)).toEqual(before);
  });

  it("同一输入连续编译两次，结果一致", () => {
    const base = loadRuleset("rulesets/hangzhou");
    const variant = loadRuleset("variants/xiaoshan");
    const first = compileVariant(base, variant);
    const second = compileVariant(base, variant);
    expect(second).toEqual(first);
  });

  it("编译萧山之后，杭州 pass-through 结果与基础内容指纹不被污染", () => {
    const base = loadRuleset("rulesets/hangzhou");
    const hangzhouBefore = compileBase(base);
    const hashBefore = rulesetContentHash(base);
    compileVariant(base, loadRuleset("variants/xiaoshan"));
    expect(rulesetContentHash(base)).toBe(hashBefore);
    expect(compileBase(base)).toEqual(hangzhouBefore);
  });

  it("编译萧山之后，另一个变种的编译结果与直接编译相同", () => {
    const base = loadRuleset("rulesets/hangzhou");
    const direct = compileVariant(base, emptyVariant(base, "tonglu-fake"));
    compileVariant(base, loadRuleset("variants/xiaoshan"));
    expect(compileVariant(base, emptyVariant(base, "tonglu-fake"))).toEqual(direct);
  });

  it("输出不与输入共享任何引用", () => {
    const base = loadRuleset("rulesets/hangzhou");
    const variant = loadRuleset("variants/xiaoshan");
    const inputs = collectObjects([base, variant]);
    const shared = [...collectObjects([compileBase(base), compileVariant(base, variant)])].filter((o) => inputs.has(o));
    expect(shared).toEqual([]);
  });
});

describe("基础内容指纹与换行符无关", () => {
  it("正文为 CRLF 与为 LF 的同一规则集，指纹相同，且等于 manifest 记录的值", () => {
    const base = loadRuleset("rulesets/hangzhou");
    const withBodies = (body: (text: string) => string): LoadedRuleset => ({
      ...base,
      rules: base.rules.map((r) => ({ ...r, body: body(r.body) })),
    });
    const lf = withBodies((text) => text.replace(/\r\n/g, "\n"));
    const crlf = withBodies((text) => text.replace(/\r?\n/g, "\r\n"));
    // 先确认两种写法确实不同，避免测试空转
    expect(crlf.rules.some((r, i) => r.body !== lf.rules[i].body)).toBe(true);
    expect(rulesetContentHash(crlf)).toBe(rulesetContentHash(lf));
    expect(rulesetContentHash(lf)).toBe(base.manifest.content_hash);
  });
});
