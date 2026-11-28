// Rule Query Service 第二批：getConfig 验收（配置继承 / 争议状态 / 来源 / 未决联动）
import { afterEach, describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { classifyConfigSource, displayValue, effectiveConfigs, getConfig } from "../../../studio/query/configs.ts";
import { buildSnapshot, clearSnapshotCache } from "../../../studio/query/rules.ts";

const ROOT = process.cwd();

const okData = <T>(result: { ok: boolean } & Record<string, unknown>): T => {
  if (!result.ok) throw new Error(`期望成功，实际失败：${JSON.stringify(result)}`);
  return (result as unknown as { data: T }).data;
};

afterEach(() => clearSnapshotCache());

describe("1) 基座配置：精确读取", () => {
  it("HJ-C-RENSHU = 4，origin=base，无继承来源", () => {
    const res = getConfig({ variant: "hangzhou", id: "HJ-C-RENSHU" }, { root: ROOT });
    const item = okData<{ total: number; items: Array<Record<string, any>> }>(res).items[0]!;
    expect(item.id).toBe("HJ-C-RENSHU");
    expect(item.value).toBe(4);
    expect(item.value_display).toBe("4");
    expect(item.origin).toBe("base");
    expect(item.inherited_from).toBeUndefined();
  });
});

describe("2) 变体 inherited 配置：值来自基座，状态来自变体", () => {
  it("XS-C-CAISHEN：canonical 归并到 HJ-C-CAISHEN，值沿用基座，状态 disputed+blocker", () => {
    const res = getConfig({ variant: "xiaoshan", id: "XS-C-CAISHEN" }, { root: ROOT });
    const item = okData<{ items: Array<Record<string, any>> }>(res).items[0]!;
    expect(item.id).toBe("XS-C-CAISHEN");
    expect(item.canonical_id).toBe("HJ-C-CAISHEN");
    expect(item.change_type).toBe("inherited");
    expect(item.base_rule_ref).toBe("HJ-C-CAISHEN");
    // 继承项不填 value → 取基座值
    expect(item.value).toBe("white_dragon");
    expect(item.status).toBe("disputed");
    expect(item.release_blocker).toBe(true);
    expect(item.candidates).toEqual(["white_dragon", "flipped_joker"]);
    expect(item.inherited_from).toEqual({ ruleset_id: "hangzhou-friends-4p", version: "1.2.0" });
  });
});

describe("3) 变体 modified 配置：覆盖基座值并保留基座原值", () => {
  it("XS-C-QIANGGANGHU = disabled，base_value = enabled；用基座 ID 也能查到同一条", () => {
    const byVariantId = okData<{ items: Array<Record<string, any>> }>(
      getConfig({ variant: "xiaoshan", id: "XS-C-QIANGGANGHU" }, { root: ROOT }),
    ).items[0]!;
    expect(byVariantId.value).toBe("disabled");
    expect(byVariantId.base_value).toBe("enabled");
    expect(byVariantId.change_type).toBe("modified");

    const byBaseId = okData<{ items: Array<Record<string, any>> }>(
      getConfig({ variant: "xiaoshan", id: "HJ-C-QIANGGANGHU" }, { root: ROOT }),
    ).items[0]!;
    expect(byBaseId.id).toBe("XS-C-QIANGGANGHU");
    expect(byBaseId.canonical_id).toBe("HJ-C-QIANGGANGHU");
    expect(byBaseId.value).toBe("disabled");
  });
});

describe("4) 变体 added 配置：没有基座对应", () => {
  it("XS-C-TUODI-EDU = 200，无 base_rule_ref / 无 inherited_from", () => {
    const item = okData<{ items: Array<Record<string, any>> }>(
      getConfig({ variant: "xiaoshan", id: "XS-C-TUODI-EDU" }, { root: ROOT }),
    ).items[0]!;
    expect(item.value).toBe(200);
    expect(item.change_type).toBe("added");
    expect(item.base_rule_ref).toBeUndefined();
    expect(item.inherited_from).toBeUndefined();
  });
});

describe("5) 变体未覆盖的基座配置：仍然可见并标 inherited", () => {
  it("萧山视图查 HJ-C-RENSHU：origin=base 且带 inherited_from", () => {
    const item = okData<{ items: Array<Record<string, any>> }>(
      getConfig({ variant: "xiaoshan", id: "HJ-C-RENSHU" }, { root: ROOT }),
    ).items[0]!;
    expect(item.id).toBe("HJ-C-RENSHU");
    expect(item.origin).toBe("base");
    expect(item.value).toBe(4);
    expect(item.inherited_from).toEqual({ ruleset_id: "hangzhou-friends-4p", version: "1.2.0" });
  });
});

describe("6) include_base_fallback 开关", () => {
  it("默认包含基座回退项；关闭后只剩变体侧有记录的条目（含 inherited）", () => {
    const all = okData<{ total: number }>(getConfig({ variant: "xiaoshan", query: "e" }, { root: ROOT }));
    const own = okData<{ total: number; items: Array<Record<string, any>> }>(
      getConfig({ variant: "xiaoshan", query: "e", include_base_fallback: false }, { root: ROOT }),
    );
    expect(all.total).toBeGreaterThan(own.total);
    expect(own.items.every((i) => i.origin === "variant")).toBe(true);
  });
});

describe("7) 按名称检索：中文名可命中，结果带上变体身份", () => {
  it("萧山视图 query=底分 → canonical HJ-C-DIFEN，变体侧 XS-C-DIFEN inherited", () => {
    const data = okData<{ total: number; items: Array<Record<string, any>> }>(
      getConfig({ variant: "xiaoshan", query: "底分" }, { root: ROOT }),
    );
    expect(data.total).toBe(1);
    const item = data.items[0]!;
    expect(item.name).toBe("底分");
    expect(item.canonical_id).toBe("HJ-C-DIFEN");
    expect(item.id).toBe("XS-C-DIFEN");
    expect(item.change_type).toBe("inherited");
    expect(item.value).toBe(1);
  });
});

describe("8) 参数校验：id 与 query 至少一个", () => {
  it("都不给 → invalid_params", () => {
    const res = getConfig({ variant: "hangzhou" }, { root: ROOT });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("invalid_params");
  });

  it("ID 格式非法 → invalid_params", () => {
    const res = getConfig({ variant: "hangzhou", id: "HJ-RENSHU" }, { root: ROOT });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("invalid_params");
  });
});

describe("9) 不存在的配置", () => {
  it("not_found + hint", () => {
    const res = getConfig({ variant: "xiaoshan", id: "XS-C-NOPE" }, { root: ROOT });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("not_found");
    expect(res.error.hint).toBeTruthy();
  });

  it("未知规则集 → unknown_variant（与 rules 一致）", () => {
    const res = getConfig({ variant: "shaoxing", id: "HJ-C-DIFEN" }, { root: ROOT });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("unknown_variant");
  });
});

describe("10) 来源：路径可定位 / 标签不可定位", () => {
  it("真实数据里配置 source 都是标签 → 全部不可定位且原样展示", () => {
    const item = okData<{ items: Array<Record<string, any>> }>(
      getConfig({ variant: "xiaoshan", id: "XS-C-CAISHEN" }, { root: ROOT }),
    ).items[0]!;
    expect(item.source_resolvable).toBe(false);
    expect(item.source_ref).toBeUndefined();
    expect(item.source_label).toBe("1.1 配置表 / 术语");
  });

  it("classifyConfigSource 对仓库路径给出可定位 ref", () => {
    const view = classifyConfigSource("rulebook/sources/hangzhou/hangzhou-core-flow.md", ROOT);
    expect(view.source_resolvable).toBe(true);
    expect(view.source_ref?.file).toBe("rulebook/sources/hangzhou/hangzhou-core-flow.md");
    expect(view.source_ref?.line).toBeGreaterThan(0);
  });

  it("空来源与不存在的路径都不抛错", () => {
    expect(classifyConfigSource(undefined, ROOT).source_resolvable).toBe(false);
    expect(classifyConfigSource("rulebook/sources/nope.md", ROOT).source_resolvable).toBe(false);
  });
});

describe("11) 未决项联动：配置也有 unresolved_refs", () => {
  it("XS-C-CAISHEN → XS-U-001", () => {
    const item = okData<{ items: Array<Record<string, any>> }>(
      getConfig({ variant: "xiaoshan", id: "XS-C-CAISHEN" }, { root: ROOT }),
    ).items[0]!;
    expect(item.unresolved_refs).toContain("XS-U-001");
  });
});

describe("13) 变体缓存必须随基座内容变化失效", () => {
  it("同版本下改基座配置值，变体视图立即读到新值", () => {
    const dir = mkdtempSync(join(tmpdir(), "query-base-fp-"));
    const baseDir = join(dir, "rulebook", "specs", "base", "hangzhou");
    const variantDir = join(dir, "rulebook", "specs", "variants", "fixture");
    mkdirSync(join(baseDir, "guize"), { recursive: true });
    mkdirSync(variantDir, { recursive: true });

    writeFileSync(
      join(baseDir, "manifest.yaml"),
      [
        "ruleset_id: fixture-friends-4p",
        "version: 1.0.0",
        "scope:",
        "  player_count: 4",
        "  room_type: friends",
        "sources:",
        "  - rulebook/sources/fixture/x.md",
        "",
      ].join(String.fromCharCode(10)),
      "utf8",
    );
    const baseConfig = (value: number) =>
      ["- id: HJ-C-A", "  origin: base", "  name: A", "  value: " + value, "  scope: four_player_friend_room", ""].join(String.fromCharCode(10));
    const configFile = join(baseDir, "config.yaml");
    writeFileSync(configFile, baseConfig(1), "utf8");
    writeFileSync(
      join(baseDir, "guize", "hj-r-a.md"),
      [
        "---",
        "id: HJ-R-A",
        "origin: base",
        "type: judgment",
        "name: A 规则",
        "scope: four_player_friend_room",
        "sources:",
        "  - source: rulebook/sources/fixture/x.md",
        "    section: 1",
        "---",
        "# A 规则",
        "",
        "- **结果**：A",
        "",
      ].join(String.fromCharCode(10)),
      "utf8",
    );

    writeFileSync(
      join(variantDir, "manifest.yaml"),
      [
        "ruleset_id: fixture2-friends-4p",
        "version: 1.0.0",
        "base:",
        "  ruleset_id: fixture-friends-4p",
        "  version: 1.0.0",
        "scope:",
        "  room_type: friends",
        "sources:",
        "  - rulebook/sources/fixture/x.md",
        "",
      ].join(String.fromCharCode(10)),
      "utf8",
    );
    writeFileSync(
      join(variantDir, "config.yaml"),
      [
        "- id: XS-C-A",
        "  origin: variant",
        "  name: A",
        "  change_type: inherited",
        "  base_rule_ref: HJ-C-A",
        "  source: 1.1 配置表",
        "",
      ].join(String.fromCharCode(10)),
      "utf8",
    );

    const first = okData<{ items: Array<Record<string, any>> }>(
      getConfig({ variant: "fixture", id: "HJ-C-A" }, { root: dir }),
    );
    expect(first.items[0]!.value).toBe(1);

    // 版本号不动，只改基座配置值
    writeFileSync(configFile, baseConfig(2), "utf8");

    const second = okData<{ items: Array<Record<string, any>> }>(
      getConfig({ variant: "fixture", id: "HJ-C-A" }, { root: dir }),
    );
    expect(second.items[0]!.value).toBe(2);

    rmSync(dir, { recursive: true, force: true });
  });
});

describe("12) 值呈现与上下文", () => {
  it("displayValue：布尔 / 数字 / 数组 / undefined", () => {
    expect(displayValue(true)).toBe("已启用");
    expect(displayValue(false)).toBe("已关闭");
    expect(displayValue(200)).toBe("200");
    expect(displayValue(["a", "b"])).toBe("a / b");
    expect(displayValue(undefined)).toBe("—");
  });

  it("布尔配置在列表里可读", () => {
    const item = okData<{ items: Array<Record<string, any>> }>(
      getConfig({ variant: "hangzhou", id: "HJ-C-QIANGGANGHU" }, { root: ROOT }),
    ).items[0]!;
    expect(item.value).toBe("enabled");
    expect(item.value_display).toBe("enabled"); // 字符串值原样展示
    expect(item.unresolved_refs).toEqual([]);
  });

  it("上下文带规则集与版本，变体带 base 绑定", () => {
    const variant = buildSnapshot("xiaoshan", { root: ROOT });
    const data = okData<{ context: Record<string, any> }>(variant);
    expect(data.context.ruleset_id).toBe("xiaoshan-friends-4p");
    expect(data.context.base.version).toBeTypeOf("string");

    // effectiveConfigs 是公开的合并视图，可直接断言条数与键
    const view = effectiveConfigs(data as never, ROOT);
    expect(view.size).toBeGreaterThan(20); // 基座 20 + 变体新增
    expect(view.has("HJ-C-CAISHEN")).toBe(true);
    expect(view.get("XS-C-TUODI-EDU")?.id).toBe("XS-C-TUODI-EDU"); // added 无 base_rule_ref，键为自身 ID
  });
});

describe("14) 工具互相指路：get_config 收到规则 ID", () => {
  it("invalid_params + suggest get_rule", () => {
    const res = getConfig({ variant: "xiaoshan", id: "XS-R-TUODI" }, { root: ROOT });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("invalid_params");
    expect(String(res.error.hint)).toContain("get_rule");
  });
});
