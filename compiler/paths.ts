// 规则资产根路径的唯一定义处。
// 除本文件外，compiler/ 下不得再出现 "rulesets/"、"variants/"、"compiled/" 之类的字符串字面量
// （由 tests/compiler/paths.test.ts 强制）。
//
// 目录结构（见 dev-docs/planning/2026-11-24-目录重新规划与重构执行计划.md）：
//   rulebook/sources/          原始证据（只读）
//   rulebook/specs/base/       基础规则（唯一事实源）
//   rulebook/specs/variants/   地方玩法差异规范
//   rulebook/changes/archive/  已归档变更（审计留痕）
//   rulebook/compiled/         编译产物（禁手改）

/** 规则知识资产根目录 */
export const RULEBOOK_ROOT = "rulebook";

export const PATHS = {
  /** 原始规则资料，只读 */
  sourcesDir: "rulebook/sources",
  /** 基础规则集目录（默认杭州） */
  baseDir: "rulebook/specs/base/hangzhou",
  /** 所有地方玩法差异规则集的父目录 */
  variantsDir: "rulebook/specs/variants",
  /** 编译产物输出目录 */
  compiledDir: "rulebook/compiled",
  /** 已归档变更 */
  changesArchiveDir: "rulebook/changes/archive",
} as const;

/** 编译入口使用的路径集合（可覆盖，便于测试编译到临时目录） */
export interface CompilePaths {
  baseDir: string;
  variantsDir: string;
  compiledDir: string;
}

/** 编译入口默认路径 */
export const DEFAULT_PATHS = {
  baseDir: PATHS.baseDir,
  variantsDir: PATHS.variantsDir,
  compiledDir: PATHS.compiledDir,
} as const;

/** 校验入口默认目录（基础规则集） */
export const DEFAULT_BASE_DIR = PATHS.baseDir;
