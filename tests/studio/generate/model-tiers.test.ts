// 模型档位解析测试
// 重点：默认走 fast；解析失败必须给 warning 而不是静默回退；池化配置取第一个。
import { describe, it, expect } from "vitest";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  DEFAULT_TIER,
  loadModelTiers,
  resolveTierModel,
  splitModelString,
  TIERS_PATH,
} from "../../../studio/generate/model-tiers.ts";

const makeKb = (content?: unknown) => {
  const kb = join(tmpdir(), `kb-tiers-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  mkdirSync(join(kb, ".pi/workflows"), { recursive: true });
  if (content !== undefined) writeFileSync(join(kb, TIERS_PATH), JSON.stringify(content), "utf8");
  return kb;
};

describe("模型档位解析", () => {
  it("默认档位是 fast", () => {
    expect(DEFAULT_TIER).toBe("fast");
  });

  it("项目内的 model-tiers.json 可解析，默认返回 fast 档的模型", () => {
    const tiers = loadModelTiers(".");
    expect(Object.keys(tiers.tiers)).toEqual(expect.arrayContaining(["fast", "big", "ultra"]));
    const resolved = resolveTierModel();
    expect(resolved.tier).toBe("fast");
    expect(resolved.model).toBeDefined();
    expect(resolved.warning).toBeUndefined();
  });

  it("显式指定档位时按档位解析，不再取默认", () => {
    const big = resolveTierModel("big");
    expect(big.tier).toBe("big");
    expect(big.model).not.toBe(resolveTierModel("fast").model);
  });

  it("配置里的 default 优先于内置 DEFAULT_TIER", () => {
    const kb = makeKb({ default: "big", tiers: { fast: "p/fast", big: "p/big" } });
    try {
      expect(resolveTierModel(undefined, kb)).toMatchObject({ tier: "big", model: "p/big" });
    } finally {
      rmSync(kb, { recursive: true, force: true });
    }
  });

  it("档位不存在时返回 warning，不静默回退", () => {
    const kb = makeKb({ tiers: { fast: "p/fast" } });
    try {
      const r = resolveTierModel("ultra", kb);
      expect(r.model).toBeUndefined();
      expect(r.warning).toMatch(/未配置/);
      expect(r.warning).toMatch(/fast/); // 告警里列出可用档位
    } finally {
      rmSync(kb, { recursive: true, force: true });
    }
  });

  it("整份配置缺失时告警里点出文件路径", () => {
    const kb = makeKb();
    try {
      const r = resolveTierModel(undefined, kb);
      expect(r.warning).toContain(TIERS_PATH);
    } finally {
      rmSync(kb, { recursive: true, force: true });
    }
  });

  it("池化配置取第一个模型", () => {
    const kb = makeKb({ tiers: { fast: [{ model: "p/a", concurrency: 2 }, { model: "p/b" }] } });
    try {
      expect(resolveTierModel("fast", kb).model).toBe("p/a");
    } finally {
      rmSync(kb, { recursive: true, force: true });
    }
  });

  it("非法配置（结构不符）视为未配置，不抛错", () => {
    const kb = makeKb({ tiers: "不是对象" });
    try {
      expect(loadModelTiers(kb).tiers).toEqual({});
    } finally {
      rmSync(kb, { recursive: true, force: true });
    }
  });

  it("模型串必须含 provider/modelId 分隔", () => {
    expect(splitModelString("cc-switch-zhipu-glm-copy/deepseek-v4.1-flash-official")).toEqual({
      provider: "cc-switch-zhipu-glm-copy",
      modelId: "deepseek-v4.1-flash-official",
    });
    expect(splitModelString("不带供应商")).toBeUndefined();
    expect(splitModelString("/缺prov")).toBeUndefined();
    expect(splitModelString("缺model/")).toBeUndefined();
  });
});
