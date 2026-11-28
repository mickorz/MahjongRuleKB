// 构建流水线：参考项目 worktree → patch → 抽 CSS → vite lib 构建 → server/chat-widget
//
// 用法：node vendor/xc-chat/build.mjs
// 前置：thirdparties/xc-ui-flow 存在（junction 或本地克隆），其 node_modules 已安装。
// 产物：server/chat-widget/chat-lib.js + chat-lib.css（不入库，服务端检测到就启用）
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { patchAgentTimeline } from "./patches/agent-timeline.mjs";
import { extractChatCss } from "./patches/extract-css.mjs";
import { patchWorkItemLabels, patchZhLocale } from "./patches/work-item-labels.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../..");
const sourceRepo = join(repoRoot, "thirdparties/xc-ui-flow");
const forkDir = join(here, "fork");
const distDir = join(repoRoot, "server/chat-widget");

if (!existsSync(sourceRepo)) {
  throw new Error(`参考项目不存在：${sourceRepo}（thirdparties/xc-ui-flow）`);
}

/** 1) 准备 worktree：不修改只读副本，用 git worktree 拉一个可打补丁的副本 */
function ensureFork() {
  if (existsSync(join(forkDir, "src/renderer/agent-timeline.tsx"))) return;
  mkdirSync(dirname(forkDir), { recursive: true });
  execFileSync("git", ["-C", sourceRepo, "worktree", "add", forkDir, "-b", "spike/chat-lib"], {
    stdio: "inherit",
  });
}

/** 2) node_modules 复用参考项目（junction / 符号链接），避免重复安装 */
function ensureNodeModules() {
  const target = join(forkDir, "node_modules");
  if (existsSync(target)) return;
  if (process.platform === "win32") {
    execFileSync(
      "powershell.exe",
      ["-NoProfile", "-Command", `New-Item -ItemType Junction -Path '${target}' -Target '${join(sourceRepo, "node_modules")}' | Out-Null`],
      { stdio: "inherit" },
    );
    return;
  }
  execFileSync("ln", ["-s", join(sourceRepo, "node_modules"), target], { stdio: "inherit" });
}

/** 3) 生成 vite 配置（放在 worktree 内，插件与 tsconfig 才解析得到） */
function stageSources() {
  // 入口必须落在 worktree 内：否则 react/react-dom 从入口目录向上找不到 node_modules
  const staged = join(forkDir, ".xc-chat");
  mkdirSync(staged, { recursive: true });
  for (const name of ["chat-lib.tsx", "stub-en.ts", "stub-model-preview.tsx", "stub-markdown.tsx", "chat-subset.css"]) {
    cpSync(join(here, "src", name), join(staged, name));
  }
  return staged;
}

function writeViteConfig(staged) {
  const entry = join(staged, "chat-lib.tsx");
  const stubEn = join(staged, "stub-en.ts");
  const stubModel = join(staged, "stub-model-preview.tsx");
  const stubMarkdown = join(staged, "stub-markdown.tsx");
  const useFullMarkdown = process.env.XC_CHAT_FULL_MARKDOWN === "1";
  const config = `// 由 vendor/xc-chat/build.mjs 生成，请勿手改
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const posix = (p) => p.replaceAll("\\\\", "/");

export default defineConfig({
  plugins: [
    react(),
    {
      name: "xc-chat-stubs",
      enforce: "pre",
      resolveId(id) {
        // 用 endsWith 而不是正则：这段代码在模板字符串里，反斜杠会被吃掉
        const hit = (name) => id.endsWith("/" + name + ".tsx") || id.endsWith("/" + name + ".js");
        if (hit("model-preview")) return posix(${JSON.stringify(stubModel)});
        if (hit("locales/en")) return posix(${JSON.stringify(stubEn)});
        // 完整 markdown（react-markdown + remark-gfm ≈ 45KB gz）默认换轻量实现；
        // 需要表格等完整语法时用 XC_CHAT_FULL_MARKDOWN=1 构建
        if (!${useFullMarkdown} && hit("markdown-content")) return posix(${JSON.stringify(stubMarkdown)});
        return null;
      },
    },
  ],
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    outDir: posix(${JSON.stringify(distDir)}),
    emptyOutDir: true,
    target: "es2022",
    minify: "esbuild",
    sourcemap: false,
    cssCodeSplit: true,
    lib: { entry: posix(${JSON.stringify(entry)}), formats: ["es"], fileName: () => "chat-lib.js" },
    rollupOptions: { external: [], output: {} },
  },
});
`;
  writeFileSync(join(forkDir, "xc-chat.vite.config.mjs"), config, "utf8");
  return join(forkDir, "xc-chat.vite.config.mjs");
}

ensureFork();
ensureNodeModules();

const patch = patchAgentTimeline(forkDir);
console.log(`[xc-chat] patch agent-timeline: ${patch.applied ? "已应用" : "已是最新"}`);

for (const [name, run] of [
  ["work-items 工具中文名", patchWorkItemLabels],
  ["zh-CN 工具摘要模板", patchZhLocale],
]) {
  const result = run(forkDir);
  console.log(`[xc-chat] patch ${name}: ${result.applied ? "已应用" : "已是最新"}`);
}

const cssOut = join(here, "src/chat-subset.css");
const css = extractChatCss(forkDir, cssOut);
console.log(`[xc-chat] 抽出聊天 CSS 子集：${css.kept} 条规则 / ${(css.bytes / 1024).toFixed(1)}KB`);

const staged = stageSources();
const configFile = writeViteConfig(staged);
const viteBin = join(forkDir, "node_modules/vite/bin/vite.js");
if (!existsSync(viteBin)) throw new Error(`找不到 vite：${viteBin}`);

execFileSync(process.execPath, [viteBin, "build", "--config", configFile], {
  cwd: forkDir,
  stdio: "inherit",
});

// 4) 体积报告 + 清理中间产物
for (const name of ["chat-lib.js", "chat-lib.css"]) {
  const file = join(distDir, name);
  if (!existsSync(file)) continue;
  console.log(`[xc-chat] ${name}: ${(statSync(file).size / 1024).toFixed(1)}KB`);
}

rmSync(join(forkDir, "xc-chat.vite.config.mjs"), { force: true });
rmSync(staged, { recursive: true, force: true });
console.log("[xc-chat] 完成 → server/chat-widget/（完整 markdown：XC_CHAT_FULL_MARKDOWN=1）");
