// 模型档位解析（与 pi-code-mode 的 .pi/workflows/model-tiers.json 同构）
// 约束（沿用上游项目经验）：
// 1. 禁止硬编码 provider/model —— 模型串只能来自档位配置
// 2. 默认档位固定为 fast：reasoning 模型做「读规则 + 输出结构化 JSON」慢 5~10 倍
// 3. 解析不到档位必须给出告警，不允许静默回退宿主默认
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

export const modelTierEntrySchema = z.union([
  z.string().min(1),
  z.array(z.object({ model: z.string().min(1), concurrency: z.number().int().positive().optional() }).strict()).min(1),
]);
export type ModelTierEntry = z.infer<typeof modelTierEntrySchema>;

export const modelTiersFileSchema = z
  .object({
    /** 未显式指定档位时使用哪个档；缺省按 DEFAULT_TIER */
    default: z.string().min(1).optional(),
    tiers: z.record(modelTierEntrySchema),
  })
  .strict();
export type ModelTiersFile = z.infer<typeof modelTiersFileSchema>;

/** 默认档位：生成类任务一律走 fast，避免 reasoning 模型拖慢结构化输出 */
export const DEFAULT_TIER = "fast";

export const TIERS_PATH = ".pi/workflows/model-tiers.json";

export interface ResolvedTier {
  tier: string;
  /** 实际使用的模型串；池化配置取第一个 */
  model?: string;
  /** 解析失败原因（非空时调用方必须告警） */
  warning?: string;
}

export function loadModelTiers(kbRoot = "."): ModelTiersFile {
  const file = join(kbRoot, TIERS_PATH);
  if (!existsSync(file)) return { tiers: {} };
  const parsed = modelTiersFileSchema.safeParse(JSON.parse(readFileSync(file, "utf8")));
  if (!parsed.success) return { tiers: {} };
  return parsed.data;
}

/**
 * 解析档位到模型串。
 * 未指定档位时取配置里的 default，再退到 DEFAULT_TIER。
 * 解析不到不抛错也不静默回退：返回 warning，由调用方决定告警方式。
 */
export function resolveTierModel(tier?: string, kbRoot = "."): ResolvedTier {
  const tiers = loadModelTiers(kbRoot);
  const wanted = tier ?? tiers.default ?? DEFAULT_TIER;
  const entry = tiers.tiers[wanted];

  if (entry === undefined) {
    const known = Object.keys(tiers.tiers);
    return {
      tier: wanted,
      warning:
        known.length === 0
          ? `未找到档位配置 ${TIERS_PATH}（或文件为空），档位 ${wanted} 无法解析`
          : `档位 ${wanted} 未配置；可用档位：${known.join(", ")}`,
    };
  }
  const model = typeof entry === "string" ? entry : entry[0]?.model;
  if (!model) return { tier: wanted, warning: `档位 ${wanted} 的配置项为空` };
  return { tier: wanted, model };
}

/** 模型串拆成 provider 与 modelId；格式不符即视为非法（不猜） */
export function splitModelString(model: string): { provider: string; modelId: string } | undefined {
  const idx = model.indexOf("/");
  if (idx <= 0 || idx === model.length - 1) return undefined;
  return { provider: model.slice(0, idx), modelId: model.slice(idx + 1) };
}
