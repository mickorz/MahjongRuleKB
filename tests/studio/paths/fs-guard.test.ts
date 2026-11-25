// 真实文件系统路径校验测试：符号链接与目录逃逸
import { describe, it, expect, afterEach } from "vitest";
import {
  assertRealPathWithin,
  cleanupTempRoot,
  FsPathError,
  isWithin,
  makeTempRoot,
  mkdirSync,
  symlinkSync,
  writeFileSync,
} from "../../../studio/paths/fs-guard.ts";
import { join } from "node:path";

const roots: string[] = [];
const newRoot = () => {
  const r = makeTempRoot();
  roots.push(r);
  return r;
};

afterEach(() => {
  for (const r of roots.splice(0)) cleanupTempRoot(r);
});

describe("fs 层路径校验", () => {
  it("isWithin 按路径段比较，不做字符串前缀误判", () => {
    expect(isWithin("/a/b", "/a/b/c")).toBe(true);
    expect(isWithin("/a/b", "/a/b")).toBe(true);
    // /a/bc 不是 /a/b 的子路径
    expect(isWithin("/a/b", "/a/bc")).toBe(false);
  });

  it("正常文件通过", () => {
    const root = newRoot();
    mkdirSync(join(root, "documents/hangzhou"), { recursive: true });
    writeFileSync(join(root, "documents/hangzhou/document.json"), "{}");
    expect(assertRealPathWithin(root, "documents/hangzhou/document.json")).toContain("document.json");
  });

  it("不存在的路径报 not_found", () => {
    const root = newRoot();
    expect(() => assertRealPathWithin(root, "documents/nope.json")).toThrow(FsPathError);
  });

  it(".. 越界被拒绝", () => {
    const root = newRoot();
    expect(() => assertRealPathWithin(root, "../outside.json")).toThrow(FsPathError);
  });

  it("符号链接指向根外被拒绝（symlink_escape）", () => {
    const root = newRoot();
    const outside = makeTempRoot();
    roots.push(outside);
    writeFileSync(join(outside, "secret.json"), "{}");
    mkdirSync(join(root, "documents/hangzhou"), { recursive: true });
    try {
      symlinkSync(join(outside, "secret.json"), join(root, "documents/hangzhou/link.json"), "file");
    } catch {
      // Windows 无创建符号链接权限时跳过该断言
      return;
    }
    expect(() => assertRealPathWithin(root, "documents/hangzhou/link.json")).toThrow(/符号链接逃逸|路径越出根目录/);
  });
});
