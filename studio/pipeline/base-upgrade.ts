// P3：基座升级回归（等价于「上游合并演练」）
// 场景：杭州规则集升版后，所有派生变体必须同步 base.version / content_hash，
// 且每个变体卡的 base_rule_ref 必须仍指向存在的基座卡。
import { loadRuleset } from "../../compiler/validator.ts";
import { PATHS } from "../../compiler/paths.ts";

export interface BaseUpgradeReport {
  ok: boolean;
  base: { ruleset_id: string; version: string; content_hash: string | null };
  variants: Array<{
    ruleset_id: string;
    version: string;
    locked_base_version: string;
    version_ok: boolean;
    /** 是否额外锁定 hash（契约只要求 version，锁定 hash 是加分项） */
    hash_locked: boolean;
    /** 指向已不存在的基座卡 */
    dangling_refs: Array<{ rule_id: string; base_rule_ref: string }>;
  }>;
  problems: string[];
}

/**
 * 检查基座 → 派生一致性。
 * 只做检查，不改 manifest：升版必须由人确认（AGENTS.md 第 4 条）。
 */
export function checkBaseUpgrade(
  baseDir = PATHS.baseDir,
  variants: string[] = ["xiaoshan"],
): BaseUpgradeReport {
  const base = loadRuleset(baseDir, "base");
  const baseIds = new Set(base.rules.map((r) => r.meta.id));
  const baseManifest = base.manifest as { ruleset_id: string; version: string; content_hash?: string };
  const report: BaseUpgradeReport = {
    ok: true,
    base: {
      ruleset_id: baseManifest.ruleset_id,
      version: baseManifest.version,
      content_hash: baseManifest.content_hash ?? null,
    },
    variants: [],
    problems: [],
  };

  for (const name of variants) {
    const variant = loadRuleset(`${PATHS.variantsDir}/${name}`, "variant");
    const vm = variant.manifest as { ruleset_id: string; version: string; base: { version: string; content_hash?: string } };
    const dangling: Array<{ rule_id: string; base_rule_ref: string }> = [];
    const seen = new Set<string>();
    for (const rule of variant.rules) {
      const ref = (rule.meta as { base_rule_ref?: string }).base_rule_ref;
      if (!ref) continue;
      seen.add(ref);
      if (!baseIds.has(ref)) dangling.push({ rule_id: rule.meta.id, base_rule_ref: ref });
    }
    const versionOk = vm.base.version === baseManifest.version;
    // 契约只要求锁 base.version；hash 锁定是可选加分项，不锁定不算失败
    const hashLocked = vm.base.content_hash ? vm.base.content_hash === baseManifest.content_hash : false;
    report.variants.push({
      ruleset_id: vm.ruleset_id,
      version: vm.version,
      locked_base_version: vm.base.version,
      version_ok: versionOk,
      hash_locked: hashLocked,
      dangling_refs: dangling,
    });
    if (!versionOk) report.problems.push(`${vm.ruleset_id} 锁定的 base.version ${vm.base.version} ≠ 当前 ${baseManifest.version}`);
    for (const d of dangling) report.problems.push(`${d.rule_id} 的 base_rule_ref ${d.base_rule_ref} 在基座中不存在`);
  }

  report.ok = report.problems.length === 0;
  return report;
}
