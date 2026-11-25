// 真实文件系统层的路径校验：符号链接与目录逃逸（K0-2）
// 关键约束（评审要求）：不能用字符串 endsWith 判安全；必须先规范化，再验证真实路径仍在允许根目录内。
import { realpathSync, existsSync, mkdirSync, writeFileSync, symlinkSync, rmSync } from "node:fs";
import { resolve, sep } from "node:path";
import { tmpdir } from "node:os";

export class FsPathError extends Error {
  constructor(
    message: string,
    readonly code: "not_found" | "escaped_root" | "symlink_escape",
  ) {
    super(message);
    this.name = "FsPathError";
  }
}

/** 判断 child 是否位于 root 之内（按路径段比较，避免 /a/bc 匹配 /a/b） */
export function isWithin(root: string, child: string): boolean {
  const r = resolve(root);
  const c = resolve(child);
  if (c === r) return true;
  return c.startsWith(r.endsWith(sep) ? r : r + sep);
}

/**
 * 解析一个已存在的路径，并确认其真实路径仍在 root 内。
 * 对符号链接逃逸抛 symlink_escape。
 */
export function assertRealPathWithin(root: string, target: string): string {
  const abs = resolve(root, target);
  if (!existsSync(abs)) throw new FsPathError(`路径不存在：${abs}`, "not_found");
  if (!isWithin(root, abs)) throw new FsPathError(`路径越出根目录：${abs}`, "escaped_root");
  const real = realpathSync(abs);
  if (!isWithin(realpathSync(root), real)) {
    throw new FsPathError(`符号链接逃逸：${abs} → ${real}`, "symlink_escape");
  }
  return real;
}

/** 供测试夹具使用：在临时目录构造 root 结构 */
export function makeTempRoot(): string {
  const root = resolve(tmpdir(), `kb-path-${process.pid}-${Date.now()}`);
  mkdirSync(root, { recursive: true });
  return root;
}

export function cleanupTempRoot(root: string): void {
  rmSync(root, { recursive: true, force: true });
}

export { writeFileSync, symlinkSync, mkdirSync };
