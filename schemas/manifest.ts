// manifest Zod Schema
import { z } from "zod";

export const manifestIdPattern = /^[a-z]+-[a-z]+-[0-9]+p$/; // 如 hangzhou-friends-4p
export const semverPattern = /^\d+\.\d+\.\d+$/;

/** 基础规则集 manifest：scope 只放适用范围，不放玩法参数 */
export const baseManifestSchema = z.object({
  ruleset_id: z.string().regex(manifestIdPattern),
  version: z.string().regex(semverPattern),
  content_hash: z.string().regex(/^[a-f0-9]{64}$/).optional(),
  scope: z.object({
    player_count: z.number().int().positive(),
    room_type: z.string().min(1),
  }),
  sources: z.array(z.string()).min(1),
  note: z.string().optional(),
});

/** 差异规则集 manifest：base 锁定基础规则版本 */
export const variantManifestSchema = z.object({
  ruleset_id: z.string().regex(manifestIdPattern),
  version: z.string().regex(semverPattern),
  base: z.object({
    ruleset_id: z.string().regex(manifestIdPattern),
    version: z.string().regex(semverPattern),
  }),
  scope: z.object({
    player_count: z.number().int().positive().optional(),
    room_type: z.string().min(1).optional(),
  }),
  sources: z.array(z.string()).optional(),
  note: z.string().optional(),
});

/** 编译产物 manifest：含 releasable 标记 */
export const compiledManifestSchema = variantManifestSchema.extend({
  compiled_from: z.object({
    ruleset_id: z.string(),
    version: z.string(),
  }),
  releasable: z.boolean(),
  blockers: z.array(z.string()),
});

export type BaseManifest = z.infer<typeof baseManifestSchema>;
export type VariantManifest = z.infer<typeof variantManifestSchema>;
export type CompiledManifest = z.infer<typeof compiledManifestSchema>;
