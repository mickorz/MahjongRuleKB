// 结构测试：config、正文槽位、发布门槛、编译后引用闭合
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { loadRuleset, extractSlots, validateRuleset } from "../../compiler/validator.ts";
import { requiredSlotsFor } from "../../schemas/slot-definitions.ts";
import { configListSchema } from "../../schemas/config.ts";
import type { RuleType } from "../../schemas/rule.ts";
import { unresolvedEntrySchema } from "../../schemas/unresolved.ts";

const base = loadRuleset("rulebook/specs/base/hangzhou");
const variant = loadRuleset("rulebook/specs/variants/xiaoshan");

describe("config.yaml", () => {
  it("杭州配置可解析、ID 唯一且每项有 value", () => {
    const list = configListSchema.parse(parse(readFileSync("rulebook/specs/base/hangzhou/config.yaml", "utf8")));
    expect(new Set(list.map((c) => c.id)).size).toBe(list.length);
    for (const c of list) expect(c.value, c.id).toBeDefined();
  });

  it("萧山 config 的 base_rule_ref 都指向存在的杭州配置", () => {
    const baseConfigIds = new Set([...base.config, ...base.configUi].map((c) => c.id));
    for (const c of variant.config) {
      if (c.origin !== "variant" || c.change_type === "added") continue;
      expect(baseConfigIds.has(c.base_rule_ref!), `${c.id} -> ${c.base_rule_ref}`).toBe(true);
    }
  });

  it("萧山 config.ui.yaml 不存在（第一阶段界面参数纯继承）", () => {
    expect(variant.configUi).toHaveLength(0);
  });
});

describe("正文槽位", () => {
  it("杭州基础卡包含该类型全部基础槽位", () => {
    for (const r of base.rules) {
      const slots = extractSlots(r.body);
      for (const s of requiredSlotsFor("base", undefined, r.meta.type as RuleType)) expect(slots.has(s), `${r.meta.id} 缺少「${s}」`).toBe(true);
    }
  });

  it("萧山 inherited 卡不要求正文槽位", () => {
    for (const r of variant.rules) {
      if (r.meta.origin !== "variant" || r.meta.change_type !== "inherited") continue;
      expect(requiredSlotsFor("variant", "inherited", r.meta.type as RuleType)).toEqual([]);
    }
  });

  it("萧山 modified / added 卡包含完整槽位", () => {
    for (const r of variant.rules) {
      if (r.meta.origin !== "variant" || r.meta.change_type === "inherited") continue;
      const slots = extractSlots(r.body);
      for (const s of requiredSlotsFor("variant", r.meta.change_type, r.meta.type as RuleType)) expect(slots.has(s), `${r.meta.id} 缺少「${s}」`).toBe(true);
    }
  });
});

describe("发布门槛", () => {
  const manifest = parse(readFileSync("rulebook/compiled/xiaoshan/manifest.yaml", "utf8")) as { releasable: boolean; blockers: string[] };

  it("存在未决 blocker 时 releasable 为 false", () => {
    const hasBlocker = [...variant.rules, ...variant.config].some((x) => "release_blocker" in x && (x as { release_blocker: boolean }).release_blocker && (x as { status: string }).status !== "confirmed");
    expect(hasBlocker).toBe(true);
    expect(manifest.releasable).toBe(false);
  });

  it("blockers 与编译产物中的未决实体一致", () => {
    const compiledConfig = parse(readFileSync("rulebook/compiled/xiaoshan/config.yaml", "utf8")) as Array<{ id: string; status?: string; release_blocker?: boolean }>;
    const compiledRuleIds = readdirSync("rulebook/compiled/xiaoshan", { recursive: true })
      .map(String)
      .filter((f) => f.endsWith(".md") && !f.includes("compile-report"))
      .map((f) => {
        const text = readFileSync(join("rulebook/compiled/xiaoshan", f), "utf8");
        const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        return parse(m![1]) as { id: string; status?: string; release_blocker?: boolean };
      });
    const expectedIds = new Set([...compiledRuleIds, ...compiledConfig].filter((x) => x.release_blocker && x.status !== "confirmed").map((x) => x.id));
    const reportedIds = new Set(manifest.blockers.map((b) => b.split(" (")[0]));
    expect([...reportedIds].sort()).toEqual([...expectedIds].sort());
  });

  it("unresolved.yaml 的 blocker 有对应状态", () => {
    for (const u of variant.unresolved) {
      if (!u.release_blocker) continue;
      expect(u.status, u.id).not.toBe("confirmed");
      expect(u.resolution ?? "").toBe("");
    }
  });

  it("confirmed 的未决项必须有非空 resolution", () => {
    for (const u of variant.unresolved) {
      if (u.status !== "confirmed") continue;
      expect(typeof u.resolution === "string" && u.resolution.trim().length > 0, u.id).toBe(true);
    }
  });

  it("Schema 拒绝 status confirmed 但 resolution 为空的未决项", () => {
    const result = unresolvedEntrySchema.safeParse({
      id: "XS-U-999",
      card_ref: "XS-K-FANXING",
      description: "测试",
      status: "confirmed",
      release_blocker: true,
      resolution: null,
    });
    expect(result.success).toBe(false);
  });
});

describe("编译后引用闭合", () => {
  const dirs = ["rulebook/compiled/hangzhou", "rulebook/compiled/xiaoshan"];

  function loadCompiled(dir: string) {
    const files = readdirSync(dir, { recursive: true }).map(String).filter((f) => f.endsWith(".md") && !f.includes("compile-report"));
    const rules = files.map((f) => {
      const text = readFileSync(join(dir, f), "utf8");
      const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      if (!m) throw new Error(`${dir}/${f} 缺少 front matter`);
      return { meta: parse(m[1]) as { id: string; depends_on?: string[]; base_rule_ref?: string; compares_to?: string[] }, body: m[2] };
    });
    const config = parse(readFileSync(join(dir, "config.yaml"), "utf8")) as Array<{ id: string }>;
    const configUi = parse(readFileSync(join(dir, "config.ui.yaml"), "utf8")) as Array<{ id: string }>;
    return { rules, ids: new Set([...rules.map((r) => r.meta.id), ...config.map((c) => c.id), ...configUi.map((c) => c.id)]) };
  }

  for (const dir of dirs) {
    it(`${dir} 的 depends_on 与正文引用在产物内闭合`, () => {
      const { rules, ids } = loadCompiled(dir);
      for (const r of rules) {
        for (const d of r.meta.depends_on ?? []) expect(ids.has(d), `${r.meta.id} depends_on ${d}`).toBe(true);
        for (const ref of r.body.matchAll(/`((?:HJ|XS)-[CRFKNMTPVIA]-[A-Z0-9]+(?:-[A-Z0-9]+)*)`/g)) {
          expect(ids.has(ref[1]), `${r.meta.id} 正文引用 ${ref[1]}`).toBe(true);
        }
      }
    });

    it(`${dir} 的溯源引用指向原始杭州规则集`, () => {
      const { rules } = loadCompiled(dir);
      const baseIds = new Set(base.rules.map((r) => r.meta.id));
      for (const r of rules) {
        if (r.meta.base_rule_ref) expect(baseIds.has(r.meta.base_rule_ref), `${r.meta.id} base_rule_ref ${r.meta.base_rule_ref}`).toBe(true);
        for (const c of r.meta.compares_to ?? []) expect(baseIds.has(c), `${r.meta.id} compares_to ${c}`).toBe(true);
      }
    });
  }
});
