import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { goldSetListSchema, type GoldSetCase } from "../../schemas/gold-set.ts";
import { calculateBankerMultiplier, calculateBaseSettlement } from "../../calculators/banker-multiplier.ts";
import { calculateContractSettlement } from "../../calculators/contract.ts";
import { calculateCapDistribution } from "../../calculators/cap-distribution.ts";
import { calculateGenZhuangPayment, isGenZhuangEstablished } from "../../calculators/genzhuang.ts";
import { loadRuleset } from "../../compiler/validator.ts";

const files = readdirSync("tests/gold-set").filter((f) => f.endsWith(".yaml")).sort();
const all: GoldSetCase[] = files.flatMap((f) => goldSetListSchema.parse(parse(readFileSync(join("tests/gold-set", f), "utf8"))));
const byFile = (name: string) => goldSetListSchema.parse(parse(readFileSync(join("tests/gold-set", name), "utf8")));

describe("Gold Set 结构", () => {
  it("共 60 条，ID 唯一", () => {
    expect(all).toHaveLength(60);
    expect(new Set(all.map((c) => c.id)).size).toBe(60);
  });

  it("P0 算分用例 21 条（庄闲倍率 6 + 承包 9 + 拖底 6）", () => {
    expect(byFile("banker-multiplier.yaml")).toHaveLength(6);
    expect(byFile("contract.yaml")).toHaveLength(9);
    expect(byFile("cap-distribution.yaml")).toHaveLength(6);
  });

  it("ruleset_id 是已知 manifest", () => {
    const known = new Set([loadRuleset("rulesets/hangzhou").manifest.ruleset_id, loadRuleset("variants/xiaoshan").manifest.ruleset_id]);
    for (const c of all) expect(known.has(c.ruleset_id), c.id).toBe(true);
  });

  it("rule_refs 指向存在的规则", () => {
    const ids = new Set([...loadRuleset("rulesets/hangzhou").rules.map((r) => r.meta.id), ...loadRuleset("variants/xiaoshan").rules.map((r) => r.meta.id)]);
    for (const c of all) for (const ref of c.rule_refs) expect(ids.has(ref), `${c.id} -> ${ref}`).toBe(true);
  });

  it("已 verified 的用例不引用未决规则", () => {
    const unresolved = new Set(
      [...loadRuleset("rulesets/hangzhou").rules, ...loadRuleset("variants/xiaoshan").rules]
        .filter((r) => r.meta.release_blocker && r.meta.status !== "confirmed")
        .map((r) => r.meta.id),
    );
    for (const c of all) {
      if (c.verification.status !== "verified") continue;
      for (const ref of c.rule_refs) expect(unresolved.has(ref), `${c.id} 引用了未决规则 ${ref}`).toBe(false);
    }
  });

  it("automated 用例的 test_ref 指向存在的文件", () => {
    for (const c of all) {
      if (c.automation.status !== "automated") continue;
      expect(c.automation.test_ref, c.id).toBeTruthy();
      expect(existsSync(c.automation.test_ref!), c.id).toBe(true);
    }
  });

  it("所有 P0 算分用例都有自动化测试", () => {
    for (const name of ["banker-multiplier.yaml", "contract.yaml", "cap-distribution.yaml"]) {
      for (const c of byFile(name)) expect(c.automation.status, c.id).toBe("automated");
    }
  });
});

describe("庄闲倍率计算", () => {
  for (const c of byFile("banker-multiplier.yaml")) {
    it(`${c.id} ${c.name}`, () => {
      const input = c.input as { ruleset_id: "hangzhou-friends-4p" | "xiaoshan-friends-4p"; winner_is_banker: boolean; win_type: "self_draw" | "discard"; fan_multiplier: number; banker_level: number; base_score: number };
      const result = calculateBaseSettlement(input);
      expect(result.winner_score).toBe((c.expected as { winner_score: number }).winner_score);
      expect(result.other_scores).toEqual((c.expected as { other_scores: number[] }).other_scores);
      // 校验倍率函数本身
      const mult = calculateBankerMultiplier({ ruleset_id: input.ruleset_id, winner_is_banker: input.winner_is_banker, payer_is_banker: !input.winner_is_banker, banker_level: input.banker_level });
      expect(mult).toBe(input.ruleset_id === "hangzhou-friends-4p" ? 8 : 2 ** input.banker_level);
    });
  }
});

describe("承包结算计算", () => {
  for (const c of byFile("contract.yaml")) {
    it(`${c.id} ${c.name}`, () => {
      const input = c.input as Parameters<typeof calculateContractSettlement>[0];
      const result = calculateContractSettlement(input);
      const expected = c.expected as { scores: Record<string, number>; applied: string[] };
      for (const [player, score] of Object.entries(expected.scores)) expect(result.scores[player], `${c.id} ${player}`).toBe(score);
      expect(result.applied).toEqual(expected.applied);
    });
  }
});

describe("拖底分配计算", () => {
  for (const c of byFile("cap-distribution.yaml")) {
    it(`${c.id} ${c.name}`, () => {
      const input = c.input as Parameters<typeof calculateCapDistribution>[0];
      const result = calculateCapDistribution(input);
      const expected = c.expected as { allocations: Array<{ payer: string; recipient: string; amount: number }>; final_net: number };
      expect(result.allocations).toEqual(expected.allocations);
      expect(result.final_net).toBe(expected.final_net);
    });
  }
});

describe("跟庄计算", () => {
  for (const c of byFile("genzhuang.yaml")) {
    it(`${c.id} ${c.name}`, () => {
      if (c.rule_refs.includes("XS-F-GZ") && (c.input as { dice?: number[] }).dice) {
        const input = c.input as { dice: [number, number]; first_player: string; other_players: string[] };
        expect(calculateGenZhuangPayment(input)).toEqual((c.expected as { payment: Record<string, number> }).payment);
      } else {
        const input = c.input as { tiles: string[]; joker: string };
        expect(isGenZhuangEstablished(input)).toBe((c.expected as { established: boolean }).established);
      }
    });
  }
});
