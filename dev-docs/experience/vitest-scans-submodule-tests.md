# 添加子模块后 npm test 扫到了子模块里的测试

> 日期：2026-11-24
> 涉及：`vitest.config.ts`、`thirdparties/PiBot`（submodule）

## 问题现象

用 add-submodule 把 PiBot 加到 `thirdparties/PiBot` 后，执行 `npm test`：

```text
Test Files  21 failed | 9 passed (30)
```

失败项全部来自 `thirdparties/PiBot/**` 下的测试文件（依赖 React、Electron 等），例如 `Failed to load url react/jsx-dev-runtime`。知识库自己的 3 个测试文件淹没在其中。

## 排查过程

- 失败堆栈里的路径都在 `thirdparties/PiBot/apps/desktop/...`。
- 仓库根目录没有 `vitest.config.*`，`package.json` 的 `test` 是 `vitest run`。

## 根因

没有配置文件时，Vitest 默认收集整个仓库的 `**/*.test.*`（只排除 `node_modules`、`dist` 等）。子模块是一个完整的 monorepo，自带大量测试，被一并收集。

## 解决方案

新增 `vitest.config.ts`，只收集知识库自己的测试目录：

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
```

知识库的测试按约定只放在 `tests/` 下。修复后：`Test Files 3 passed (3)`（合并 `main` 后为 5 个文件 79 个测试）。

## 预防与注意事项

- 往仓库里放任何自带测试的目录（子模块、参考项目、沙盒）之前，先确认测试收集范围。
- 同类检查：`tsconfig.json` 的 `include` 是显式列举（`schemas`、`compiler`、`calculators`、`tests`），不受子模块影响。
- 新增子模块后，把「`npm test` 的收集结果只包含本仓库测试」当作一项验收。
