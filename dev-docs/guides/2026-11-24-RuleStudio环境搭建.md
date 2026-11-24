# Rule Studio 环境搭建（PiBot fork 开发环境）

> 日期：2026-11-24
> 对应执行计划：`dev-docs/planning/2026-11-24-RuleStudio执行计划.md` 的任务 0.4
> 适用：Windows 10 / 11、nvm-windows 1.2.x；PiBot fork 位于仓库内的 `thirdparties/PiBot`

## 当前状态（2026-11-24）

| 步骤 | 状态 | 说明 |
| --- | --- | --- |
| Node 26.11.1 | 已完成 | 装在 nvm-windows 的版本目录 `%NVM_HOME%\v26.11.1`；全局默认仍是 24.18.0 |
| pnpm 12.14.0 | 已完成 | 全局安装到 npm 全局目录，各 Node 版本共用 |
| fork 完整历史 | 已完成 | 已 `git fetch --unshallow` |
| `pnpm install` | 未开始 | 等待 C 盘腾出空间（当时仅剩 5.2 GB，PiBot 依赖预计 2～4 GB） |
| `pnpm dev` 启动冒烟 | 未开始 | 依赖上一步 |
| `pnpm check` 基线 | 未开始 | 依赖上一步 |

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

### 3. 安装 PiBot 依赖（待执行）

```sh
cd thirdparties/PiBot
pnpm install
```

安装前先确认磁盘空间。依赖存储在 fork 目录内（`.pnpm-store`、`.cache`，已被 PiBot 的 `.gitignore` 覆盖），安装脚本受 `pnpm-workspace.yaml` 的 `allowBuilds` 控制。实测结果待补充。

### 4. 启动冒烟（待执行）

```sh
cd thirdparties/PiBot
PIBOT_DATA_DIR=<独立的数据目录> pnpm dev
```

`PIBOT_DATA_DIR` 用来把开发数据和已安装的 Pi Bot 隔开。验证应用能启动并完成一次对话后关闭。实测结果待补充。

### 5. 记录 `pnpm check` 基线（待执行）

```sh
cd thirdparties/PiBot
pnpm check
```

基线用于区分「上游本来就有的失败」和「我们引入的失败」。实测结果待补充。

## 已踩过的坑

| 现象 | 原因 | 处理 | 记录 |
| --- | --- | --- | --- |
| 配了 npmmirror 后 `nvm install` 报「尚未发布或不可下载」 | nvm-windows 用镜像上的 `latest/SHASUMS256.txt` 判断最新版，该镜像的 latest 停在 v24.9.0 | 手动安装：核对官方 SHA256 后解压到 `%NVM_HOME%\v26.11.1` | `dev-docs/experience/nvm-windows-mirror-latest-stale.md` |
| `pnpm` 报找不到 `corepack/dist/pnpm.js`，重装报 `EEXIST` | 全局目录里留着失效的 corepack 垫片 | 把 6 个旧垫片移走后重装 | `dev-docs/experience/stale-corepack-shims-block-pnpm.md` |
