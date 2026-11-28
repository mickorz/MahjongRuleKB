// Rule Query Service 第三批 3/3：compare_rules 验收（含评审指定的四个场景）
import { afterEach, describe, expect, it } from "vitest";

import { compareRules, diffSlots, type CompareRuleRow } from "../../../studio/query/compare.ts";
import { clearSnapshotCache, type RuleRecord } from "../../../studio/query/rules.ts";

const ROOT = process.cwd();
const IDS = "ids" as const;

const okData = <T>(result: { ok: boolean } & Record<string, unknown>): T => {
  if (!result.ok) throw new Error(`期望成功，实际失败：${JSON.stringify(result)}`);
  return (result as unknown as { data: T }).data;
};

const run = (input: unknown) =>
  okData<{
    rows: CompareRuleRow[];
    config_rows: Array<Record<string, any>>;
    summary: Record<string, number>;
    truncated: boolean;
    caveats: string[];
    matched: number;
  }>(compareRules(input, { root: ROOT }));

afterEach(() => clearSnapshotCache());

describe("1) inherited：正确关联基座", () => {
  it("XS-R-ZHUANGJIA-01 → kind=inherited，base=HJ-R-DINGZHUANG", () => {
    const data = run({
      base: "hangzhou",
      variant: "xiaoshan",
      scope: { kind: IDS, side: "variant", ids: ["XS-R-ZHUANGJIA-01"] },
    });
    expect(data.rows).toHaveLength(1);
    const row = data.rows[0]!;
    expect(row.kind).toBe("inherited");
    expect(row.variant_id).toBe("XS-R-ZHUANGJIA-01");
    expect(row.base_id).toBe("HJ-R-DINGZHUANG");
    expect(row.change_type).toBe("inherited");
    expect(row.base_only).toBe(false);
  });
});

describe("2) modified：按 base_rule_ref 配对（ID 不同名）", () => {
  it("XS-R-ZHUANGJIA-02 ↔ HJ-R-LUNZHUANG，两侧名称不同", () => {
    const data = run({
      base: "hangzhou",
      variant: "xiaoshan",
      scope: { kind: IDS, side: "variant", ids: ["XS-R-ZHUANGJIA-02"] },
    });
    const row = data.rows[0]!;
    expect(row.kind).toBe("modified");
    expect(row.base_id).toBe("HJ-R-LUNZHUANG");
    expect(row.variant_name).toBe("连庄与换庄");
    expect(row.base_name).not.toBe(row.variant_name);
    expect(row.slot_diff.length).toBeGreaterThan(0);
  });
});

describe("3) added：没有基座对应卡", () => {
  it("XS-R-TUODI → kind=added，无 base_id", () => {
    const data = run({
      base: "hangzhou",
      variant: "xiaoshan",
      scope: { kind: IDS, side: "variant", ids: ["XS-R-TUODI"] },
    });
    const row = data.rows[0]!;
    expect(row.kind).toBe("added");
    expect(row.base_id).toBeUndefined();
    expect(row.base_only).toBe(false);
  });
});

describe("4) 配置差异：直接复用 effectiveConfigs", () => {
  it("XS-C-QIANGGANGHU：萧山 disabled / 杭州 enabled，changed=true", () => {
    const data = run({
      base: "hangzhou",
      variant: "xiaoshan",
      scope: { kind: IDS, side: "variant", ids: ["XS-C-QIANGGANGHU"] },
    });
    expect(data.rows).toHaveLength(0);
    expect(data.config_rows).toHaveLength(1);
    const cfg = data.config_rows[0]!;
    expect(cfg.canonical_id).toBe("HJ-C-QIANGGANGHU");
    expect(cfg.base_value).toBe("enabled");
    expect(cfg.variant_value).toBe("disabled");
    expect(cfg.changed).toBe(true);
    expect(cfg.change_type).toBe("modified");
    expect(data.summary.config_changed).toBe(1);
  });

  it("用基座配置 ID + side=base 也能拿到同一条", () => {
    const data = run({
      base: "hangzhou",
      variant: "xiaoshan",
      scope: { kind: IDS, side: "base", ids: ["HJ-C-QIANGGANGHU"] },
    });
    const cfg = data.config_rows[0]!;
    expect(cfg.canonical_id).toBe("HJ-C-QIANGGANGHU");
    expect(cfg.changed).toBe(true);
  });

  it("争议配置带出 status/blocker/candidates", () => {
    const data = run({
      base: "hangzhou",
      variant: "xiaoshan",
      scope: { kind: IDS, side: "variant", ids: ["XS-C-CAISHEN"] },
    });
    const cfg = data.config_rows[0]!;
    expect(cfg.status).toBe("disputed");
    expect(cfg.release_blocker).toBe(true);
    expect(cfg.candidates).toEqual(["white_dragon", "flipped_joker"]);
    expect(cfg.unresolved_refs).toContain("XS-U-001");
  });
});

describe("5) side=base 反向查询", () => {
  it("HJ-R-DINGZHUANG → 它被 XS-R-ZHUANGJIA-01 继承", () => {
    const data = run({
      base: "hangzhou",
      variant: "xiaoshan",
      scope: { kind: IDS, side: "base", ids: ["HJ-R-DINGZHUANG"] },
    });
    expect(data.rows.map((r) => r.variant_id)).toEqual(["XS-R-ZHUANGJIA-01"]);
    expect(data.rows[0]!.kind).toBe("inherited");
  });

  it("变体没覆盖的基座卡 → base_only", () => {
    // HJ-R-PENG（碰）没有变体覆盖
    const data = run({
      base: "hangzhou",
      variant: "xiaoshan",
      scope: { kind: IDS, side: "base", ids: ["HJ-R-PENG"] },
    });
    expect(data.rows).toHaveLength(1);
    const row = data.rows[0]!;
    expect(row.kind).toBe("base_only");
    expect(row.base_only).toBe(true);
    expect(row.variant_id).toBeUndefined();
  });
});

describe("6) side 与 ID 前缀必须一致", () => {
  it("side=variant 传 HJ- → invalid_params", () => {
    const res = compareRules(
      { base: "hangzhou", variant: "xiaoshan", scope: { kind: IDS, side: "variant", ids: ["HJ-R-DINGZHUANG"] } },
      { root: ROOT },
    );
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("invalid_params");
    expect(String(res.error.hint)).toContain("XS-");
  });

  it("side=base 传 XS- → invalid_params", () => {
    const res = compareRules(
      { base: "hangzhou", variant: "xiaoshan", scope: { kind: IDS, side: "base", ids: ["XS-R-TUODI"] } },
      { root: ROOT },
    );
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("invalid_params");
  });
});

describe("7) 不存在的 ID 明确报错", () => {
  it("变体侧不存在 → not_found，不静默忽略", () => {
    const res = compareRules(
      { base: "hangzhou", variant: "xiaoshan", scope: { kind: IDS, side: "variant", ids: ["XS-R-NOPE"] } },
      { root: ROOT },
    );
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("not_found");
  });

  it("基座侧不存在 → not_found", () => {
    const res = compareRules(
      { base: "hangzhou", variant: "xiaoshan", scope: { kind: IDS, side: "base", ids: ["HJ-R-NOPE"] } },
      { root: ROOT },
    );
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("not_found");
  });
});

describe("8) 对照槽位不参与差异判定", () => {
  it("diffSlots 忽略「差异」「杭麻」", () => {
    const record = (slots: Array<{ slot: string; text: string }>) =>
      ({ meta: {}, body: "", file: "", slots }) as unknown as RuleRecord;
    const diffs = diffSlots(
      record([{ slot: "差异", text: "修改" }, { slot: "杭麻", text: "旧表述" }, { slot: "结果", text: "A" }]),
      record([{ slot: "差异", text: "沿用" }, { slot: "杭麻", text: "新表述" }, { slot: "结果", text: "A" }]),
    );
    expect(diffs).toEqual([]);
  });

  it("真实 inherited 卡的 slot_diff 里不含「差异」「杭麻」", () => {
    const data = run({
      base: "hangzhou",
      variant: "xiaoshan",
      scope: { kind: IDS, side: "variant", ids: ["XS-R-ZHUANGJIA-01"] },
    });
    const slots = data.rows[0]!.slot_diff.map((d) => d.slot);
    expect(slots).not.toContain("差异");
    expect(slots).not.toContain("杭麻");
  });
});

describe("9) keyword 范围", () => {
  it("query=财神 命中规则与配置，并提示未决项", () => {
    const data = run({ base: "hangzhou", variant: "xiaoshan", scope: { kind: "keyword", query: "财神" } });
    expect(data.matched).toBeGreaterThan(0);
    expect(data.caveats.join(" ")).toContain("未决项");
    expect(data.caveats.join(" ")).toContain("XS-U-001");
  });
});

describe("10) all_changes 规模上限", () => {
  it("超过 20 组时 truncated=true，并提示缩小范围", () => {
    const data = run({ base: "hangzhou", variant: "xiaoshan", scope: { kind: "all_changes" } });
    expect(data.rows.length).toBeLessThanOrEqual(20);
    expect(data.truncated).toBe(true);
    expect(data.caveats.join(" ")).toContain("缩小范围");
    expect(data.summary.inherited + data.summary.modified + data.summary.added + data.summary.uncertain)
      .toBe(data.rows.length);
  });
});

describe("11) 争议与阻塞原样带出", () => {
  it("XS-K-LIANGANG 行带 XS-U-002 且 caveats 标注阻塞发布", () => {
    const data = run({
      base: "hangzhou",
      variant: "xiaoshan",
      scope: { kind: IDS, side: "variant", ids: ["XS-K-LIANGANG"] },
    });
    const row = data.rows[0]!;
    expect(row.unresolved_refs).toContain("XS-U-002");
    expect(row.variant_status).toBe("unresolved");
    expect(data.caveats.join(" ")).toContain("阻塞发布");
  });
});

describe("12) 参数与规则集方向", () => {
  it("base 与 variant 相同 → invalid_params", () => {
    const res = compareRules(
      { base: "hangzhou", variant: "hangzhou", scope: { kind: "all_changes" } },
      { root: ROOT },
    );
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("invalid_params");
  });

  it("variant 传基座规则集 → invalid_params", () => {
    const res = compareRules(
      { base: "hangzhou", variant: "hangzhou", scope: { kind: "all_changes" } },
      { root: ROOT },
    );
    expect(res.ok).toBe(false);
  });

  it("未知规则集 → unknown_variant", () => {
    const res = compareRules(
      { base: "hangzhou", variant: "shaoxing", scope: { kind: "all_changes" } },
      { root: ROOT },
    );
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("unknown_variant");
  });

  it("scope 缺 kind → invalid_params（不允许空参数等于全量）", () => {
    const res = compareRules({ base: "hangzhou", variant: "xiaoshan", scope: {} }, { root: ROOT });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("invalid_params");
  });
});
