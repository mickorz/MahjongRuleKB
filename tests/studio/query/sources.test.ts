// Rule Query Service 第三批 2/3：sources（read_evidence）验收，含安全边界
import { afterEach, describe, expect, it } from "vitest";

import {
  EvidencePathError,
  readEvidence,
  resolveSourcePath,
  sliceSection,
} from "../../../studio/query/sources.ts";
import { clearSnapshotCache } from "../../../studio/query/rules.ts";

const ROOT = process.cwd();

const okData = <T>(result: { ok: boolean } & Record<string, unknown>): T => {
  if (!result.ok) throw new Error(`期望成功，实际失败：${JSON.stringify(result)}`);
  return (result as unknown as { data: T }).data;
};

afterEach(() => clearSnapshotCache());

describe("1) 按 rule_id 读取已登记证据", () => {
  it("XS-R-ZHUANGJIA-02 读到 R-BANK-02 小节，带行号与标题", () => {
    const data = okData<{ line: number; heading?: string; text: string; available: number }>(
      readEvidence({ variant: "xiaoshan", rule_id: "XS-R-ZHUANGJIA-02" }, { root: ROOT }),
    );
    expect(data.line).toBeGreaterThan(0);
    expect(data.heading).toContain("R-BANK-02");
    expect(data.text.startsWith("#### R-BANK-02")).toBe(true);
    expect(data.text).toContain("连庄与换庄");
    expect(data.available).toBeGreaterThan(0);
  });

  it("基座证据当前全部不可定位（杭州源只有章节号/占位符）→ 明确报错而非静默成功", () => {
    // 实测：杭州 61 条证据 resolvable=0，萧山 108 条中 47 条可定位
    const res = readEvidence({ variant: "hangzhou", rule_id: "HJ-T-FAIPAI" }, { root: ROOT });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("not_found");
    expect(String(res.error.message)).toContain("没有可定位的证据");
  });
});

describe("2) 按 ref 读取（必须命中登记清单）", () => {
  it("file#section 形式可以读", () => {
    const data = okData<{ section?: string; text: string }>(
      readEvidence(
        {
          variant: "xiaoshan",
          ref: "rulebook/sources/xiaoshan/xiaoshan-rules.md#R-BANK-02",
        },
        { root: ROOT },
      ),
    );
    expect(data.section).toBe("R-BANK-02");
    expect(data.text).toContain("R-BANK-02");
  });

  it("未登记的 ref → not_found，并给出可用清单", () => {
    const res = readEvidence(
      { variant: "xiaoshan", ref: "rulebook/sources/xiaoshan/xiaoshan-rules.md#R-NOPE" },
      { root: ROOT },
    );
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("not_found");
    expect(JSON.stringify(res.error.details)).toContain("rulebook/sources/xiaoshan");
  });
});

describe("3) 参数与索引", () => {
  it("rule_id 与 ref 互斥", () => {
    const both = readEvidence(
      { variant: "xiaoshan", rule_id: "XS-R-TUODI", ref: "rulebook/sources/xiaoshan/xiaoshan-rules.md#R-CAP" },
      { root: ROOT },
    );
    expect(both.ok).toBe(false);
    if (both.ok) return;
    expect(both.error.code).toBe("invalid_params");

    const neither = readEvidence({ variant: "xiaoshan" }, { root: ROOT });
    expect(neither.ok).toBe(false);
    if (neither.ok) return;
    expect(neither.error.code).toBe("invalid_params");
  });

  it("index 越界 → invalid_params", () => {
    const res = readEvidence({ variant: "xiaoshan", rule_id: "XS-R-ZHUANGJIA-02", index: 5 }, { root: ROOT });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("invalid_params");
  });

  it("基座取证据失败时给的是「没有可定位证据」而不是「证据不存在」", () => {
    const res = readEvidence({ variant: "hangzhou", rule_id: "HJ-R-CHI" }, { root: ROOT });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("not_found");
    expect(String(res.error.hint)).toContain("section");
  });

  it("未知规则集 → unknown_variant", () => {
    const res = readEvidence({ variant: "shaoxing", rule_id: "XS-R-TUODI" }, { root: ROOT });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("unknown_variant");
  });
});

describe("4) 截断", () => {
  it("max_chars 生效并标记 truncated", () => {
    const data = okData<{ text: string; truncated: boolean }>(
      readEvidence({ variant: "xiaoshan", rule_id: "XS-R-ZHUANGJIA-02", max_chars: 80 }, { root: ROOT }),
    );
    expect(data.truncated).toBe(true);
    expect(data.text.length).toBeLessThanOrEqual(81); // 80 + 省略号
    expect(data.text.endsWith("…")).toBe(true);
  });
});

describe("5) 路径安全（resolveSourcePath 单测）", () => {
  const expectCode = (fn: () => unknown, code: string) => {
    try {
      fn();
    } catch (error) {
      expect(error).toBeInstanceOf(EvidencePathError);
      expect((error as EvidencePathError).code).toBe(code);
      return;
    }
    throw new Error("期望抛错但没有");
  };

  it("正常仓库路径通过", () => {
    const abs = resolveSourcePath(ROOT, "rulebook/sources/xiaoshan/xiaoshan-rules.md");
    expect(abs.replaceAll("\\", "/")).toContain("/rulebook/sources/xiaoshan/xiaoshan-rules.md");
  });

  it("绝对路径被拒", () => {
    expectCode(() => resolveSourcePath(ROOT, "/etc/passwd"), "absolute_path");
    expectCode(() => resolveSourcePath(ROOT, "C:/Windows/win.ini"), "absolute_path");
  });

  it("路径穿越被拒", () => {
    expectCode(() => resolveSourcePath(ROOT, "rulebook/sources/../../package.json"), "path_escape");
    expectCode(() => resolveSourcePath(ROOT, "../package.json"), "path_escape");
    expectCode(() => resolveSourcePath(ROOT, "rulebook/sources/x/../../../package.json"), "path_escape");
  });

  it("sources 之外被拒", () => {
    expectCode(() => resolveSourcePath(ROOT, "package.json"), "outside_sources");
    expectCode(() => resolveSourcePath(ROOT, "rulebook/specs/base/hangzhou/manifest.yaml"), "outside_sources");
  });

  it("不存在的文件被拒", () => {
    expectCode(() => resolveSourcePath(ROOT, "rulebook/sources/nope.md"), "not_a_file");
  });
});

describe("6) 小节切片", () => {
  it("从标题读到下一个同级标题前，不含后续小节", () => {
    const text = [
      "# 顶层",
      "",
      "#### R-A 甲",
      "",
      "甲内容",
      "",
      "#### R-B 乙",
      "",
      "乙内容",
      "",
    ].join(String.fromCharCode(10));
    const sliced = sliceSection(text, 3, 400);
    expect(sliced.heading).toBe("R-A 甲");
    expect(sliced.text).toContain("甲内容");
    expect(sliced.text).not.toContain("乙内容");
  });

  it("行号越界时退化为末行，不抛错", () => {
    const sliced = sliceSection("第一行", 99, 100);
    expect(typeof sliced.text).toBe("string");
  });
});

describe("7) 走错工具时指路（不白烧预算）", () => {
  it("rule_id 传配置 ID → invalid_params + suggest get_config", () => {
    const res = readEvidence({ variant: "xiaoshan", rule_id: "XS-C-CAISHEN" }, { root: ROOT });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("invalid_params");
    expect(String(res.error.hint)).toContain("get_config");
    expect(JSON.stringify(res.error.details)).toContain("get_config");
  });

  it("rule_id 传未决项 ID → invalid_params + suggest list_unresolved", () => {
    const res = readEvidence({ variant: "xiaoshan", rule_id: "XS-U-001" }, { root: ROOT });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error.code).toBe("invalid_params");
    expect(String(res.error.hint)).toContain("list_unresolved");
  });
});
