// 规则集类型（kind）判定测试：类型只由显式 kind 决定，不再依赖目录路径前缀
// 目的：目录迁移到 rulebook/specs/{base,variants} 后，校验行为不得改变
import { describe, it, expect } from "vitest";
import { inferRulesetKind, loadRuleset, validateRuleset } from "../../compiler/validator.ts";

describe("规则集类型（kind）", () => {
  it("加载基础规则集时 kind 为 base", () => {
    expect(loadRuleset("rulebook/specs/base/hangzhou").kind).toBe("base");
  });

  it("加载差异规则集时 kind 为 variant", () => {
    expect(loadRuleset("rulebook/specs/variants/xiaoshan").kind).toBe("variant");
  });

  it("显式传入的 kind 覆盖路径推断", () => {
    expect(loadRuleset("rulebook/specs/base/hangzhou", "variant").kind).toBe("variant");
    expect(loadRuleset("rulebook/specs/variants/xiaoshan", "base").kind).toBe("base");
  });

  it("校验按 kind 选 manifest Schema，而不是看目录前缀", () => {
    // 同一个目录：按 base 校验通过，按 variant 校验必须因为缺 manifest.base 失败
    expect(validateRuleset(loadRuleset("rulebook/specs/base/hangzhou", "base"))).toEqual([]);

    const asVariant = validateRuleset(loadRuleset("rulebook/specs/base/hangzhou", "variant"));
    expect(asVariant.length).toBeGreaterThan(0);
    expect(asVariant.some((e) => e.file === "manifest.yaml" && e.path === "base")).toBe(true);
  });

  it("过渡期路径推断同时兼容现有目录与迁移后的目录", () => {
    expect(inferRulesetKind("rulebook/specs/base/hangzhou")).toBe("base");
    expect(inferRulesetKind("rulebook/specs/variants/xiaoshan")).toBe("variant");
    expect(inferRulesetKind("rulebook/specs/base/hangzhou")).toBe("base");
    expect(inferRulesetKind("rulebook/specs/variants/xiaoshan")).toBe("variant");
    // Windows 路径分隔符同样成立
    expect(inferRulesetKind("rulebook\\specs\\variants\\xiaoshan")).toBe("variant");
  });
});
