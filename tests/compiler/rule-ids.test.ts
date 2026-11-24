// 结构测试：规则集通过校验、ID 分数据集唯一、引用闭合
import { describe, it, expect } from "vitest";
import { loadRuleset, validateRuleset } from "../../compiler/validator.ts";

describe("rulesets/hangzhou", () => {
  const rs = loadRuleset("rulesets/hangzhou");
  const errs = validateRuleset(rs);

  it("通过全部结构校验", () => {
    expect(errs).toEqual([]);
  });

  it("ID 在数据集内唯一", () => {
    const ids = [...rs.rules.map((r) => r.meta.id), ...rs.config.map((c) => c.id), ...rs.configUi.map((c) => c.id)];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("所有 base 卡 ID 以 HJ- 开头", () => {
    for (const r of rs.rules) expect(r.meta.id).toMatch(/^HJ-/);
  });

  it("ID 前缀段与 type 一致", () => {
    const expectType: Record<string, string> = { R: "judgment", T: "timing", N: "counter", M: "record", F: "formula", K: "lookup", P: "settlement", V: "static-ui", I: "interaction", A: "animation" };
    for (const r of rs.rules) {
      const seg = r.meta.id.split("-")[1];
      expect(r.meta.type, `${r.meta.id} 前缀 ${seg}`).toBe(expectType[seg]);
    }
  });

  it("文件名 = ID 小写", () => {
    for (const r of rs.rules) {
      const base = r.file.split(/[\\/]/).pop()!.replace(/\.md$/, "");
      expect(base, r.file).toBe(r.meta.id.toLowerCase());
    }
  });

  it("manifest 符合 schema 且 scope 不含玩法参数", () => {
    expect(rs.manifest.ruleset_id).toBe("hangzhou-friends-4p");
    expect(rs.manifest.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(Object.keys(rs.manifest.scope as object).sort()).toEqual(["player_count", "room_type"]);
  });

  it("配置项每项有唯一 HJ-C- ID 且有 value", () => {
    for (const c of rs.config) {
      expect(c.id).toMatch(/^HJ-C-/);
      expect(c.value).toBeDefined();
    }
  });

  it("卡数与 coverage.md 统计一致（60 张）", () => {
    expect(rs.rules.length).toBe(60);
  });
});
