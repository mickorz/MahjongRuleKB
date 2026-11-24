# Rule Studio 环境搭建（PiBot fork 开发环境）

> 日期：2026-11-24
> 对应执行计划：`dev-docs/planning/2026-11-24-RuleStudio执行计划.md` 的任务 0.4
> 适用：Windows 10 / 11、nvm-windows 1.2.x；PiBot fork 位于仓库内的 `thirdparties/PiBot`

## 当前状态（2026-11-24）

| 步骤 | 状态 | 说明 |
| --- | --- | --- |
| Node 26.11.1 | 已完成 | 装在 nvm-windows 的版本目录 `%NVM_HOME%\v26.11.1`；全局默认仍是 24.18.0 |
| pnpm 12.14.0 | 已完成 | 全局安装到 npm 全局目录，各 Node 版本共用 |
| fork 完整历史 | 已完成 | `git rev-parse --is-shallow-repository` 为 false；`upstream` 远程已补 |
| 国内镜像 | 已完成 | `~/.npmrc` 去掉代理、`registry` 指向 npmmirror；Electron 二进制用镜像补装（见第 6 节） |
| `pnpm install` | 已完成 | 36 分 5 秒；1457 包；`.pnpm-store` 3.7 GB + 根 `node_modules` 429 MB，都在 E 盘 |
| `pnpm dev` 启动冒烟 | 已完成（应用启动） | 首屏 18.7 秒，owner 已连接；「完成一次对话」需人工配模型 |
| `pnpm check` 基线 | 已完成 | typecheck / lint / probe:policy 通过；测试 3347 通过、1 失败（zh-CN locale 相关，见第 7 节）、1 跳过 |

## 版本要求

| 项 | 要求 | 依据 |
| --- | --- | --- |
| Node | 26.11.1 | PiBot `.nvmrc`；`engines.node` 也接受 `^22.12.0`、`^24.0.0`、`>=26.0.0` |
| pnpm | 12.14.0 | PiBot `package.json` 的 `packageManager`；`engines.pnpm` 为 `>=12.14.0 <13` |

Node 25 起不再捆绑 Corepack（26.11.1 的版本目录里没有 `corepack`），所以不能用 `corepack` 命令装 pnpm，直接 `npm i -g pnpm@12.14.0`。

## 步骤

### 1. 让当前终端使用 Node 26.11.1

全局默认没有切换。在 fork 里工作时，二选一：

临时（只影响当前终端）：

```sh
# Git Bash
export PATH="/c/Users/<用户名>/AppData/Local/nvm/v26.11.1:$PATH"
```

```powershell
# PowerShell
$env:Path = "$env:LOCALAPPDATA\nvm\v26.11.1;" + $env:Path
```

或全局切换（影响所有项目；知识库本身在 24 与 26 下都能运行）：

```sh
nvm use 26.11.1      # 切回：nvm use 24.18.0
```

验证：

```sh
node --version       # v26.11.1
pnpm --version       # 12.14.0
```

### 2. pnpm

```sh
npm i -g pnpm@12.14.0
```

npm 会提示 pnpm 的安装脚本未运行（`allow-scripts` 策略），不影响使用。

### 3. 安装 PiBot 依赖（已完成）

```sh
# 先检出 submodule（在 KB 根目录）
git submodule update --init thirdparties/PiBot

# 再装依赖
cd thirdparties/PiBot
pnpm install
```

磁盘：**不需要清理 C 盘**。PiBot 的 `.npmrc` 与 `pnpm-workspace.yaml` 把 `storeDir` / `cacheDir` 定在仓库内（`.pnpm-store`、`.cache/pnpm`），所以 3.7 GB 依赖全落在 E 盘（仓库所在盘），C 盘只增加 Electron 二进制缓存约 289 MB。项目级 `.npmrc` 会覆盖用户级 `store-dir`，不要指望用全局配置把它挪走。

实测（2026-11-24）：1457 个包，36 分 5 秒，`.pnpm-store` 3.7 GB，根 `node_modules` 429 MB。慢的原因不是网络卡住：`pnpm-workspace.yaml` 的 `supportedArchitectures` 声明了 `darwin/win32/linux × x64/arm64` 六套预编译二进制（biome、sharp、node-datachannel、expo、workerd…），实际要下 2～3 GB。装上后再跑 `pnpm install --frozen-lockfile` 是 330 ms。

安装脚本受 `pnpm-workspace.yaml` 的 `allowBuilds` 控制；安装结束会提示 `Agent skills awaiting approval: expo-sqlite`，需要时用 `pnpm approve` 复核。

### 4. 启动冒烟（应用启动已验证，对话待人工确认）

```sh
cd thirdparties/PiBot
PIBOT_DATA_DIR=E:/WorkProjects/MahjongRuleKB/dev-examples/pibot-env/data pnpm dev
```

`PIBOT_DATA_DIR` 用来把开发数据和已安装的 Pi Bot 隔开。实测：首屏 `gui_first_screen_ready` 18.7 秒（`gui_window_shown` 6.6 秒），owner 子进程正常连接，`bots.list` / `topics.list` 等首批 RPC 全部 ok。

AC-1 的「完成一次对话」需要配置模型 Key，由人工在窗口内完成。

### 5. 记录 `pnpm check` 基线（已完成）

```sh
cd thirdparties/PiBot
pnpm check
```

基线用于区分「上游本来就有的失败」和「我们引入的失败」。**基线（commit `152425f`，Node 26.11.1，Windows 11，系统 locale zh-CN）**：

| 检查项 | 结果 |
| --- | --- |
| `pnpm typecheck` | 通过（62 个 project references + 62 workspace semantics + 18 extra checks） |
| `pnpm lint` | 通过 |
| `pnpm probe:policy` | 通过 |
| `pnpm test` | 26 个文件通过 / 1 个文件失败；3347 通过、1 失败、1 跳过 |
| 失败项 | `@pibot/brain` `src/brain.test.ts` T8：断言英文提示词 `Commands: ask`，实际拿到中文提示词（locale 决定）。只在 zh-CN 机器上失败，非我们的改动引入 |
| `pnpm smoke` | `smoke:renderer` 通过；`smoke:owner` 在 Windows 上稳定失败于清理阶段（`ENOTEMPTY` rmdir），见第 7 节 |

`pnpm check` 不含 `pnpm smoke`；`pnpm smoke` 需要先 `pnpm build` 生成 `apps/desktop/out`。

### 6. 国内网络适配（不依赖代理）

代理关掉后直连 npm 官方源很慢，且 Electron / Node 二进制的 GitHub 下载直接失败。做法：

```sh
# ~/.npmrc：删掉 proxy / https-proxy 两行，registry 指向镜像
# registry=https://registry.npmmirror.com/
pnpm config get registry            # 确认生效
```

实测同一 25 MB tarball：官方源 793 KB/s（33.2 秒），npmmirror 3.35 MB/s（7.8 秒），约 4 倍。

Electron 二进制不走 npm registry，要单独给镜像（详见 `dev-docs/experience/pibot-electron-binary-download-fails.md`）：

```sh
cd thirdparties/PiBot
ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ \
  node node_modules/.pnpm/electron@<版本>/node_modules/electron/install.js
```

已核对镜像覆盖：`expo@58.0.23`、`react-native-webrtc@155.0.1`、`@earendil-works/pi-coding-agent@1.4.0`、`@cloudflare/workerd-windows-64@1.20261019.1`、`@typescript/typescript-win32-x64@7.0.2`、`@biomejs/cli-win32-x64@2.5.15` 等锁文件里最新的固定版本全部命中。镜像与上游有分钟级延迟，个别刚发布的版本查不到时单次绕开：`pnpm install --registry=https://registry.npmjs.org/`。

### 7. 已知的上游失败（不属于我们的改动）

| 项 | 现象 | 结论 |
| --- | --- | --- |
| `pnpm test` T8 | 断言 `Commands: ask`，zh-CN 机器上提示词是中文 | Node 在 Windows 上 `Intl.DateTimeFormat().resolvedOptions().locale` 不受 `LANG` / `LC_ALL` 影响，只能改系统 locale。上游 CI 是英文环境所以看不见。记录为基线失败，不改上游测试 |
| `pnpm smoke:owner` | `ENOTEMPTY: directory not empty, rmdir ...\compile-cache\...` | Windows 文件句柄释放滞后：owner 退出后清理临时目录时仍有句柄，上游工具只 kill Electron 不 kill 进程树。应用本身启动正常（`pnpm dev` 首屏 18.7 秒）。记录为基线失败，不绕过 |

## 已踩过的坑

| 现象 | 原因 | 处理 | 记录 |
| --- | --- | --- | --- |
| 配了 npmmirror 后 `nvm install` 报「尚未发布或不可下载」 | nvm-windows 用镜像上的 `latest/SHASUMS256.txt` 判断最新版，该镜像的 latest 停在 v24.9.0 | 手动安装：核对官方 SHA256 后解压到 `%NVM_HOME%\v26.11.1` | `dev-docs/experience/nvm-windows-mirror-latest-stale.md` |
| `pnpm` 报找不到 `corepack/dist/pnpm.js`，重装报 `EEXIST` | 全局目录里留着失效的 corepack 垫片 | 把 6 个旧垫片移走后重装 | `dev-docs/experience/stale-corepack-shims-block-pnpm.md` |
