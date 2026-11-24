# Electron 二进制没装上（pnpm 跳过 postinstall / GitHub 下载失败）

## 现象

`pnpm check` 里两个失败看起来毫不相关：

```
TypeError: fetch failed
stdout | src/main/host/host-rpc.test.ts
Downloading Electron binary...

 FAIL  |@pibot/desktop| src/main/host/host-rpc.test.ts [ apps/desktop/src/main/host/host-rpc.test.ts ]
Error: Electron failed to install correctly. Please delete `node_modules/electron` and run "npx install-electron --no" manually.
```

`node_modules/.pnpm/electron@44.7.0_*/node_modules/electron/` 里没有 `dist/`，也没有 `path.txt`。

## 排查过程

1. `grep -rn "Downloading Electron binary"` 命中 `electron/index.js` 第 8 行 —— 消息来自 Electron 包自己在**缺少 `path.txt` 时懒下载**，不是 PiBot 的代码。
2. 该懒下载走 GitHub Releases，国内网络直连失败 → `TypeError: fetch failed`。
3. 正常路径本应是安装期 postinstall 下载。`pnpm-workspace.yaml` 的 `allowBuilds` 白名单里只有 `esbuild` 和各 `tree-sitter`、`workerd` 等条目，**没有 `electron`**，pnpm 12 默认不跑未登记的构建脚本，所以 `dist/` 从未生成。

## 根因

两层：安装期被 `allowBuilds` 跳过（无 `dist/`），测试期懒下载又走 GitHub 直连（失败）。

## 解决方案

用 npmmirror 的 Electron 镜像手动跑一次 Electron 自己的安装脚本：

```sh
cd thirdparties/PiBot
export PATH="/c/Users/<用户名>/AppData/Local/nvm/v26.11.1:$PATH"   # 用 Node 26.11.1
ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ \
  node node_modules/.pnpm/electron@44.7.0_supports-color@7.2.0/node_modules/electron/install.js
```

验证：

```sh
cat node_modules/.pnpm/electron@44.7.0_*/node_modules/electron/path.txt   # electron.exe
./node_modules/.pnpm/electron@44.7.0_*/node_modules/electron/dist/electron.exe --version  # v44.7.0
```

之后 `npx vitest run apps/desktop/src/main/host/host-rpc.test.ts` 5 个测试全过。二进制落在 `%LOCALAPPDATA%\electron` 缓存里（约 289 MB，C 盘）。

## 预防/注意事项

- **不要 `rm -rf node_modules/electron` 重来**：错误提示建议删包重装，但 pnpm 装回来仍然没有 `dist/`（`allowBuilds` 没登记），只是把缓存里的二进制引用又断一次。
- 换 Electron 大版本（`package.json` 里升级）时要重跑一次上面的 install 脚本，用新版本号替换路径里的 `electron@<版本>`。
- 判断「是不是构建脚本被跳过」：先看 `pnpm-workspace.yaml` 的 `allowBuilds` 有没有这个包名，再看包目录有没有 `dist/` / `path.txt`。
- 同理适用于其他带二进制下载的包（`@napi-rs/*`、`sharp`、`node-datachannel`）。这次 `sharp` 走的是 npm 上的 optional 平台包，没走 GitHub，所以只有 Electron 出问题。

## 参考

- Electron 安装与镜像：<https://www.electronjs.org/docs/latest/tutorial/installation>
- npmmirror 二进制镜像列表：<https://npmmirror.com/mirrors/>
- pnpm 构建脚本白名单（`allowBuilds`）：<https://pnpm.io/settings>
