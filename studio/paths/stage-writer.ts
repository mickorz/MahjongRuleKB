// W0-2/W0-6：Stage 产物写入口
// 目的：让「生成产物」也经过权限矩阵，而不是绕过它直接 fs.writeFileSync。
// 边界：只做 assert + 写文件；不做事务、不做 Hash 校验（那是 transaction 的职责）。
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { assertVariantScoped, ROOT_DOCUMENTS } from "./registry.ts";

/** 判断某个输出目录是否落在 documents/ 之下（决定是否必须走权限校验） */
export function isDocumentOutputDir(outDir: string): boolean {
  const normalized = outDir.replace(/\\/g, "/").replace(/^\.\//, "");
  return normalized === ROOT_DOCUMENTS || normalized.startsWith(`${ROOT_DOCUMENTS}/`);
}

/**
 * 写一个 Stage 产物到 documents/<variant>/<fileName>。
 * 会先过 assertVariantScoped（变体隔离 + 产物注册表 + 主体权限）。
 * 返回写入的相对路径。
 */
export function writeStageArtifact(
  kbRoot: string,
  variant: string,
  fileName: string,
  content: string,
): string {
  const relative = assertVariantScoped(
    "stage",
    "generate",
    `${ROOT_DOCUMENTS}/${variant}/${fileName}`,
    variant,
  );
  const abs = join(kbRoot, relative);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content, "utf8");
  return relative;
}
