// Rule Query Service 第一批：searchRules / getRule 的 12 组验收用例
// 数据源是真实的 rulebook/specs（杭州基座 + 萧山变体），不构造假数据；
// 仅"缓存指纹失效"一项用临时目录夹具，因为它必须能改文件。
import { afterEach, describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  buildSnapshot,
  classifyEvidence,
  clearSnapshotCache,
  contentFingerprint,
  getRule,
  searchRules,
} from "../../../studio/query/rules.ts";
import type { RuleMeta } from "../../../schemas/rule.ts";

const ROOT = process.cwd();

const okData = <T>(result: { ok: boolean } & Record<string, unknown>): T => {
  if (!result.ok) throw new Error(`期望成功，实际失败：${JSON.stringify(result)}`);
  return (result as unknown as { data: T }).data;
};

afterEach(() => {
  clearSnapshotCache();
});

describe("1) 基座卡：元数据齐全", () => {
  it("HJ-R-DINGZHUANG 带 origin=base，且无 change_type / base_rule_ref", () => {
    const res = searchRules({ variant: "hangzhou", id: "HJ-R-DINGZHUANG" }, { root: ROOT });
    const data = okData<{ total: number; items: Array<Record<string, unknown>> }>(res);
    expect(data.total).toBe(1);
    const item = data.items[0]!;
    expect(item.origin).toBe("base");
    expect(item.change_type).toBeUndefined();
    expect(item.base_rule_ref).toBeUndefined();
    expect(typeof item.status).toBe("string");
    expect(typeof item.release_blocker).toBe("boolean");
    expect(item.matched_by).toEqual(["id"]);
    expect(String(item.summary).length).toBeGreaterThan(0);
  });
});

describe("2) inherited 卡：继承关系与摘要", () => {
  it("XS-R-ZHUANGJIA-01 是 inherited，摘要取「结果」而非「差异：沿用」", () => {
    const res = getRule({ variant: "xiaoshan", id: "XS-R-ZHUANGJIA-01" }, { root: ROOT });
    const detail = okData<Record<string, any>>(res);
    expect(detail.change_type).toBe("inherited");
    expect(detail.base_rule_ref).toBe("HJ-R-DINGZHUANG");
    expect(detail.compares_to).toEqual(["HJ-R-DINGZHUANG"]);
    // 槽位里第一篇是「差异：沿用」，摘要不能直接抄它
    expect(detail.slots[0].slot).toBe("差异");
    const summary = detail.summary as string | undefined;
    // getRule 不带 summary；用 search 校验摘要选择
    expect(summary).toBeUndefined();

    const search = searchRules({ variant: "xiaoshan", id: "XS-R-ZHUANGJIA-01" }, { root: ROOT });
    const item = okData<{ items: Array<{ summary: string }> }>(search).items[0]!;
    expect(item.summary).not.toContain("沿用");
    expect(item.summary).toContain("庄家");
  });
});

describe("3) modified 卡：按 base_rule_ref 配对（ID 不同名）", () => {
  it("XS-R-ZHUANGJIA-02 ↔ HJ-R-LUNZHUANG，且两卡名称不同", () => {
    const variant = getRule({ variant: "xiaoshan", id: "XS-R-ZHUANGJIA-02" }, { root: ROOT });
    const v = okData<Record<string, any>>(variant);
    expect(v.change_type).toBe("modified");
    expect(v.base_rule_ref).toBe("HJ-R-LUNZHUANG");
    expect(v.name).toBe("连庄与换庄");

    const base = getRule({ variant: "hangzhou", id: "HJ-R-LUNZHUANG" }, { root: ROOT });
    const b = okData<Record<string, any>>(base);
    expect(b.name).not.toBe(v.name); // 名称不同，只能靠 base_rule_ref 配对
    expect(b.origin).toBe("base");
  });
});

describe("4) added 卡：没有基座对应", () => {
  it("XS-R-TUODI 的 base_rule_ref 与 compares_to 都为空", () => {
    const res = getRule({ variant: "xiaoshan", id: "XS-R-TUODI" }, { root: ROOT });
    const d = okData<Record<string, any>>(res);
    expect(d.change_type).toBe("added");
    expect(d.base_rule_ref).toBeUndefined();
    expect(d.compares_to).toEqual([]);
  });
});

describe("5) 未决卡：状态与阻塞项联动", () => {
  it("XS-K-LIANGANG 是 unresolved + release_blocker，且带 XS-U-002", () => {
    const res = getRule({ variant: "xiaoshan", id: "XS-K-LIANGANG" }, { root: ROOT });
    const d = okData<Record<string, any>>(res);
    expect(d.status).toBe("unresolved");
    expect(d.release_blocker).toBe(true);
    expect(d.unresolved_refs).toContain("XS-U-002");
  });

  it("XS-K-FANXING 带 XS-U-003", () => {
    const res = getRule({ variant: "xiaoshan", id: "XS-K-FANXING" }, { root: ROOT });
    const d = okData<Record<string, any>>(res);
    expect(d.unresolved_refs).toContain("XS-U-003");
  });
});

describe("6) 非阻塞未决项也要带出（接口一致性）", () => {
  it("XS-A-JIAZHUANG 卡本身 confirmed，但 unresolved_refs 含非 blocker 的 XS-U-010/011", () => {
    const res = getRule({ variant: "xiaoshan", id: "XS-A-JIAZHUANG" }, { root: ROOT });
    const d = okData<Record<string, any>>(res);
    expect(d.status).toBe("confirmed");
    expect(d.release_blocker).toBe(false);
    expect(d.unresolved_refs.length).toBeGreaterThan(0);
    expect(d.unresolved_refs).toEqual(expect.arrayContaining(["XS-U-010", "XS-U-011"]));
  });
});

describe("7) 非法 ID", () => {
  it("不存在的 ID 返回 not_found 并给 hint", () => {
    const res = getRule({ variant: "xiaoshan", id: "XS-R-NOT-EXIST" }, { root: ROOT });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("not_found");
    expect(res.error.hint).toBeTruthy();
  });

  it("格式不合法（缺类型段）走 invalid_params", () => {
    const res = getRule({ variant: "xiaoshan", id: "XS-DINGZHUANG" }, { root: ROOT });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("invalid_params");
  });
});

describe("8) 跨规则集误用：不静默回退", () => {
  it("在萧山视图查 HJ- 卡 → not_found，提示改用 hangzhou / base_rule_ref", () => {
    const res = getRule({ variant: "xiaoshan", id: "HJ-R-DINGZHUANG" }, { root: ROOT });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("not_found");
    expect(res.error.hint).toContain("hangzhou");
  });

  it("在杭州视图查 XS- 卡 → not_found", () => {
    const res = getRule({ variant: "hangzhou", id: "XS-R-TUODI" }, { root: ROOT });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("not_found");
  });
});

describe("9) 变体白名单", () => {
  it("未注册的规则集名 → unknown_variant，且不读盘", () => {
    const res = searchRules({ variant: "shaoxing", query: "财神" }, { root: ROOT });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("unknown_variant");
    expect(res.error.hint).toContain("xiaoshan");
    expect(res.error.hint).toContain("hangzhou");
    expect(res.error.details).toEqual({ available: ["hangzhou", "xiaoshan"] });
  });

  it("目录名含非法字符同样拒绝", () => {
    const res = searchRules({ variant: "../hangzhou", query: "财神" }, { root: ROOT });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("unknown_variant");
  });
});

describe("10) search_rules 必须带检索条件", () => {
  it("什么都不给 → invalid_params", () => {
    const res = searchRules({ variant: "hangzhou" }, { root: ROOT });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("invalid_params");
    expect(res.error.message).toContain("change_type"); // refine 的提示里含有效条件枚举
  });

  it("change_type 是有效检索条件（修复 refine 漏项）", () => {
    const res = searchRules({ variant: "xiaoshan", change_type: "added" }, { root: ROOT });
    const data = okData<{ total: number; items: Array<Record<string, unknown>> }>(res);
    expect(data.total).toBeGreaterThan(0);
    expect(data.items.every((i) => i.change_type === "added")).toBe(true);
    expect(data.items[0]!.matched_by).toContain("filter");
  });

  it("基座视图传 change_type → invalid_params", () => {
    const res = searchRules({ variant: "hangzhou", change_type: "modified" }, { root: ROOT });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("invalid_params");
  });

  it("limit 截断时回传 total 与 truncated", () => {
    const res = searchRules({ variant: "hangzhou", status: "confirmed", limit: 5 }, { root: ROOT });
    const data = okData<{ total: number; truncated: boolean; items: unknown[] }>(res);
    expect(data.items.length).toBe(5);
    expect(data.total).toBeGreaterThan(5);
    expect(data.truncated).toBe(true);
  });
});

describe("11) 证据三态：可定位 / 章节号不可定位 / 占位符不可定位", () => {
  it("萧山 R-BANK-02 锚点可定位并带行号", () => {
    const res = getRule({ variant: "xiaoshan", id: "XS-R-ZHUANGJIA-02" }, { root: ROOT });
    const d = okData<Record<string, any>>(res);
    const ev = d.evidence[0];
    expect(ev.resolvable).toBe(true);
    expect(ev.source_ref.kind).toBe("anchor");
    expect(ev.source_ref.value).toContain("R-BANK-02");
    expect(ev.source_ref.line).toBeGreaterThan(0);
    expect(ev.source_label).toContain("R-BANK-02");
  });

  it("杭州 section 「2.3.3」源文件里没有同号标题 → 不可定位但保留 section", () => {
    const res = getRule({ variant: "hangzhou", id: "HJ-F-ZHUANGXIAN-BEILV" }, { root: ROOT });
    const d = okData<Record<string, any>>(res);
    const ev = d.evidence[0];
    expect(ev.resolvable).toBe(false);
    expect(ev.source_ref).toBeUndefined();
    expect(ev.section).toBe("2.3.3");
    expect(ev.source_label).toContain("2.3.3");
  });

  it("含 {{IP_xxx}} 占位符 → 不可定位，原文保留", () => {
    // 直接用合成 meta 断言占位符分支，避免受真实卡片数据版本影响
    const meta = {
      id: "HJ-R-FIXTURE",
      name: "夹具",
      sources: [{ source: "rulebook/sources/hangzhou/hangzhou-core-flow.md", section: "{{IP_abc}}" }],
    } as unknown as RuleMeta;
    const [ev] = classifyEvidence(meta, ROOT);
    expect(ev).toBeDefined();
    expect(ev!.resolvable).toBe(false);
    expect(ev!.source_ref).toBeUndefined();
    expect(String(ev!.section).includes("{{IP_")).toBe(true);
    expect(String(ev!.source_label).includes("{{IP_")).toBe(true);
  });

  it("真实卡：占位符来源一律不可定位（不挑具体卡）", () => {
    const res = getRule({ variant: "hangzhou", id: "HJ-R-CHI" }, { root: ROOT });
    const d = okData<Record<string, any>>(res);
    expect(d.evidence.length).toBeGreaterThan(0);
    expect(d.evidence.every((e: Record<string, unknown>) => e.resolvable === false)).toBe(true);
    expect(typeof d.evidence[0].section).toBe("string");
    expect(String(d.evidence[0].source_label).length).toBeGreaterThan(0);
  });
});

describe("12) 上下文与缓存指纹", () => {
  it("变体上下文带 base 绑定，基座上下文带 content_hash", () => {
    const variant = buildSnapshot("xiaoshan", { root: ROOT });
    const v = okData<{ context: Record<string, any> }>(variant).context;
    expect(v.kind).toBe("variant");
    expect(v.ruleset_id).toBe("xiaoshan-friends-4p");
    expect(v.base.version).toBeTypeOf("string");
    expect(v.content_fingerprint).toMatch(/^[a-f0-9]{64}$/);

    const base = buildSnapshot("hangzhou", { root: ROOT });
    const b = okData<{ context: Record<string, any> }>(base).context;
    expect(b.kind).toBe("base");
    expect(b.content_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(b.content_fingerprint).toMatch(/^[a-f0-9]{64}$/);
  });

  it("同版本但内容变了，指纹必须变（不能只靠 manifest.version 缓存）", () => {
    const dir = mkdtempSync(join(tmpdir(), "query-cache-"));
    const baseDir = join(dir, "rulebook", "specs", "base", "hangzhou");
    mkdirSync(join(baseDir, "guize"), { recursive: true });
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
      ].join("\n"),
      "utf8",
    );
    writeFileSync(
      join(baseDir, "config.yaml"),
      ["- id: HJ-C-A", "  origin: base", "  name: A", "  value: 1", "  scope: four_player_friend_room", ""].join("\n"),
      "utf8",
    );
    const card = (result: string) =>
      [
        "---",
        "id: HJ-R-FIXTURE",
        "origin: base",
        "type: judgment",
        "name: 夹具规则",
        "scope: four_player_friend_room",
        "sources:",
        "  - source: rulebook/sources/fixture/x.md",
        "    section: 1",
        "---",
        "# 夹具规则",
        "",
        `- **结果**：${result}`,
        "",
      ].join("\n");
    const cardFile = join(baseDir, "guize", "hj-r-fixture.md");
    writeFileSync(cardFile, card("第一版"), "utf8");

    const first = buildSnapshot("hangzhou", { root: dir });
    const firstCtx = okData<{ context: Record<string, any> }>(first).context;
    const firstSummary = okData<{ items: Array<{ summary: string }> }>(
      searchRules({ variant: "hangzhou", id: "HJ-R-FIXTURE" }, { root: dir }),
    ).items[0]!.summary;
    expect(firstSummary).toContain("第一版");

    // 版本号不动，只改内容
    writeFileSync(cardFile, card("第二版"), "utf8");

    const second = buildSnapshot("hangzhou", { root: dir });
    const secondCtx = okData<{ context: Record<string, any> }>(second).context;
    expect(secondCtx.version).toBe(firstCtx.version);
    expect(secondCtx.content_fingerprint).not.toBe(firstCtx.content_fingerprint);

    const secondSummary = okData<{ items: Array<{ summary: string }> }>(
      searchRules({ variant: "hangzhou", id: "HJ-R-FIXTURE" }, { root: dir }),
    ).items[0]!.summary;
    expect(secondSummary).toContain("第二版");

    // 指纹函数本身对同一内容稳定
    expect(contentFingerprint(baseDir, dir)).toBe(secondCtx.content_fingerprint);

    rmSync(dir, { recursive: true, force: true });
  });
});

describe("13) 工具互相指路：ID 类型走错时给 suggest", () => {
  it("get_rule 收到配置 ID → invalid_params + suggest get_config", () => {
    const res = getRule({ variant: "xiaoshan", id: "XS-C-CAISHEN" }, { root: ROOT });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("invalid_params");
    expect(String(res.error.hint)).toContain("get_config");
    expect(JSON.stringify(res.error.details)).toContain("get_config");
  });
});
