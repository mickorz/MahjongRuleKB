// 结构测试：萧山差异规则集
import { describe, it, expect } from "vitest";
import { loadRuleset, validateRuleset } from "../../compiler/validator.ts";

describe("rulebook/specs/variants/xiaoshan", () => {
  const base = loadRuleset("rulebook/specs/base/hangzhou");
  const rs = loadRuleset("rulebook/specs/variants/xiaoshan");
  const errs = validateRuleset(rs, base);

  it("通过全部结构校验", () => {
    expect(errs).toEqual([]);
  });

  it("47 张卡，全部 XS- 前缀", () => {
    expect(rs.rules.length).toBe(47);
    for (const r of rs.rules) expect(r.meta.id).toMatch(/^XS-/);
  });

  it("change_type 分布：inherited 4 / modified 18 / added 25", () => {
    const count = { inherited: 0, modified: 0, added: 0 };
    for (const r of rs.rules) if (r.meta.origin === "variant") count[r.meta.change_type]++;
    expect(count).toEqual({ inherited: 4, modified: 18, added: 25 });
  });

  it("所有 inherited / modified 卡的 base_rule_ref 指向存在的杭州卡", () => {
    const baseIds = new Set(base.rules.map((r) => r.meta.id));
    for (const r of rs.rules) {
      if (r.meta.origin !== "variant") continue;
      if (r.meta.change_type !== "added") {
        expect(r.meta.base_rule_ref, r.meta.id).toBeDefined();
        expect(baseIds.has(r.meta.base_rule_ref!), `${r.meta.id} -> ${r.meta.base_rule_ref}`).toBe(true);
      } else {
        expect(r.meta.base_rule_ref, r.meta.id).toBeUndefined();
      }
    }
  });

  it("同一张杭州卡最多被一张萧山卡 modified", () => {
    const seen = new Map<string, string>();
    for (const r of rs.rules) {
      if (r.meta.origin !== "variant" || r.meta.change_type !== "modified") continue;
      const b = r.meta.base_rule_ref!;
      expect(seen.has(b), `${b} 被 ${seen.get(b)} 和 ${r.meta.id} 同时 modified`).toBe(false);
      seen.set(b, r.meta.id);
    }
  });

  it("manifest 锁定杭州 1.2.0", () => {
    expect(rs.manifest.base).toEqual({ ruleset_id: "hangzhou-friends-4p", version: "1.2.0" });
  });

  it("inherited 配置项不填 value", () => {
    for (const c of rs.config) {
      if (c.origin === "variant" && c.change_type === "inherited") expect(c.value).toBeUndefined();
    }
  });

  it("翻财神配置项标 disputed + release_blocker", () => {
    const joker = rs.config.find((c) => c.id === "XS-C-CAISHEN")!;
    expect(joker.status).toBe("disputed");
    expect(joker.release_blocker).toBe(true);
  });

  it("未决清单 17 条，3 条 blocker", () => {
    expect(rs.unresolved.length).toBe(17);
    expect(rs.unresolved.filter((u) => u.release_blocker).length).toBe(3);
  });

  it("K-FAN 和 K-GANG 标 unresolved + release_blocker", () => {
    for (const id of ["XS-K-FANXING", "XS-K-LIANGANG"]) {
      const r = rs.rules.find((x) => x.meta.id === id)!;
      expect(r.meta.status).toBe("unresolved");
      expect(r.meta.release_blocker).toBe(true);
    }
  });

  it("modified 卡正文都含「杭麻」对照槽", () => {
    for (const r of rs.rules) {
      if (r.meta.origin === "variant" && r.meta.change_type === "modified") {
        expect(r.body, r.meta.id).toMatch(/\*\*杭麻\*\*/);
      }
    }
  });
});
