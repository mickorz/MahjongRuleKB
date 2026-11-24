// Vitest 配置
// 只收集本仓库 tests/ 下的测试。thirdparties/（如 thirdparties 下的子模块）与 dev-examples/ 里有各自的测试文件，
// 不属于知识库的测试体系；没有本配置时 Vitest 会扫描整个仓库，把子模块的测试一并跑进来。
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
