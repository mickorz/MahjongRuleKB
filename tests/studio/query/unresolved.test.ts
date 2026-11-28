// Rule Query Service 第三批 1/3：unresolved 验收
import { afterEach, describe, expect, it } from "vitest";

import { listUnresolved, unresolvedIdsForCard } from "../../../studio/query/unresolved.ts";
import { buildSnapshot, clearSnapshotCache } from "../../../studio/query/rules.ts";

const ROOT = process.cwd();

const okData = <T>(result: { ok: boolean } & Record<string, unknown>): T => {
  if (!result.ok) throw new Error(`期望成功，实际失败：${JSON.stringify(result)}`);
  return (result as unknown as { data: T }).data;
};

afterEach(() => clearSnapshotCache());

describe("1) 默认返回全部未决项", () => {
  it("萧山 17 条，其中 3 条阻塞，releasable=false", () => {
    const data = okData<{ total: number; blockers: number; releasable: boolean }>(
      listUnresolved({ variant: "xiaoshan" }, { root: ROOT }),
    );
    expect(data.total).toBe(17);
    expect(data.blockers).toBe(3);
    expect(data.releasable).toBe(false);
  });
});

describe("2) only_blockers 收敛到阻塞项", () => {
  it("只剩 XS-U-001/002/003", () => {
    const data = okData<{ total: number; items: Array<{ id: string; release_blocker: boolean }> }>(
      listUnresolved({ variant: "xiaoshan", only_blockers: true }, { root: ROOT }),
    );
    expect(data.total).toBe(3);
    expect(data.items.map((i) => i.id)).toEqual(["XS-U-001", "XS-U-002", "XS-U-003"]);
    expect(data.items.every((i) => i.release_blocker)).toBe(true);
  });

  it("releasable 不受过滤影响（仍为 false）", () => {
    const data = okData<{ releasable: boolean; blockers: number }>(
      listUnresolved({ variant: "xiaoshan", status: "confirmed" }, { root: ROOT }),
    );
    expect(data.releasable).toBe(false);
    expect(data.blockers).toBe(3);
  });
});

describe("3) card_ref 精确过滤", () => {
  it("XS-C-CAISHEN 只有 XS-U-001，并带出卡名", () => {
    const data = okData<{ total: number; items: Array<Record<string, any>> }>(
      listUnresolved({ variant: "xiaoshan", card_ref: "XS-C-CAISHEN" }, { root: ROOT }),
    );
    expect(data.total).toBe(1);
    expect(data.items[0]!.id).toBe("XS-U-001");
    expect(data.items[0]!.card_name).toBe("财神");
  });

  it("同一张卡可有多条（XS-A-JIAZHUANG 两条非阻塞）", () => {
    const data = okData<{ items: Array<Record<string, any>> }>(
      listUnresolved({ variant: "xiaoshan", card_ref: "XS-A-JIAZHUANG" }, { root: ROOT }),
    );
    expect(data.items.map((i) => i.id)).toEqual(["XS-U-010", "XS-U-011"]);
    expect(data.items.every((i) => i.release_blocker === false)).toBe(true);
  });

  it("没有未决项的卡 → 空数组，不报错", () => {
    const data = okData<{ total: number }>(
      listUnresolved({ variant: "xiaoshan", card_ref: "XS-R-TUODI" }, { root: ROOT }),
    );
    expect(data.total).toBe(0);
  });
});

describe("4) status 过滤", () => {
  it("disputed 只命中 XS-U-001", () => {
    const data = okData<{ items: Array<{ id: string; status: string }> }>(
      listUnresolved({ variant: "xiaoshan", status: "disputed" }, { root: ROOT }),
    );
    expect(data.items.map((i) => i.id)).toEqual(["XS-U-001"]);
    expect(data.items[0]!.status).toBe("disputed");
  });

  it("confirmed 目前没有条目", () => {
    const data = okData<{ total: number }>(
      listUnresolved({ variant: "xiaoshan", status: "confirmed" }, { root: ROOT }),
    );
    expect(data.total).toBe(0);
  });
});

describe("5) 参数与规则集校验", () => {
  it("card_ref 格式非法 → invalid_params", () => {
    const res = listUnresolved({ variant: "xiaoshan", card_ref: "XS-CAISHEN" }, { root: ROOT });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("invalid_params");
  });

  it("未知规则集 → unknown_variant", () => {
    const res = listUnresolved({ variant: "shaoxing" }, { root: ROOT });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("unknown_variant");
  });
});

describe("6) 与 search_rules 的 unresolved_refs 同源", () => {
  it("XS-C-CAISHEN 在两边都能拿到 XS-U-001", () => {
    const snap = buildSnapshot("xiaoshan", { root: ROOT });
    const snapshot = okData<{ snapshot: never }>(snap) as unknown as never;
    expect(unresolvedIdsForCard(snapshot, "XS-C-CAISHEN")).toEqual(["XS-U-001"]);

    const listed = okData<{ items: Array<{ id: string; card_ref: string }> }>(
      listUnresolved({ variant: "xiaoshan", card_ref: "XS-C-CAISHEN" }, { root: ROOT }),
    );
    expect(listed.items.map((i) => i.id)).toEqual(unresolvedIdsForCard(snapshot, "XS-C-CAISHEN"));
  });

  it("XS-A-JIAZHUANG 两边一致（非阻塞也要一致）", () => {
    const snap = buildSnapshot("xiaoshan", { root: ROOT });
    const snapshot = okData<{ snapshot: never }>(snap) as unknown as never;
    expect(unresolvedIdsForCard(snapshot, "XS-A-JIAZHUANG")).toEqual(["XS-U-010", "XS-U-011"]);
  });
});

describe("7) 基座视图：当前没有未决项", () => {
  it("hangzhou 返回 0 条且 releasable=true", () => {
    const data = okData<{ total: number; releasable: boolean; blockers: number }>(
      listUnresolved({ variant: "hangzhou" }, { root: ROOT }),
    );
    expect(data.total).toBe(0);
    expect(data.blockers).toBe(0);
    expect(data.releasable).toBe(true);
  });
});
