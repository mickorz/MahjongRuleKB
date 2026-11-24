# npm 依赖慢：换国内镜像而不是挂代理

## 现象

PiBot fork（`thirdparties/PiBot`）`pnpm install` 跑了 **36 分 5 秒**，日志里反复刷同一行 `Downloading @biomejs/cli-linux-x64@2.5.15: 23.96 MB/24.65 MB`，看起来像卡死，实际一直在动。

## 排查过程

1. 看日志到最后：`Progress: resolved 1457, reused 0, downloaded 1429, added 1457, done` —— 不是卡住，是下载总量大。
2. `du -sh .pnpm-store`：3.7 GB。查 `pnpm-workspace.yaml` 发现：

   ```yaml
   supportedArchitectures:
     os: [darwin, win32, linux]
     cpu: [x64, arm64]
   ```

   即每个有平台二进制的包（biome、sharp、node-datachannel、expo-modules、workerd、typescript 原生包…）都要下 6 套，实际下载 2～3 GB。
3. 网络：`~/.npmrc` 里配了 `proxy=http://127.0.0.1:7897`。关掉代理后直连官方源测速：793 KB/s。

## 根因

两件事叠加：**多平台二进制放大下载量** + **官方源在国内带宽低**。代理不是银弹，本机代理绕出去后速度并不比镜像快。

## 解决方案

`~/.npmrc` 去掉代理行、`registry` 指向 npmmirror：

```ini
prefix=D:\DevTools\npm-global
cache=D:\DevTools\npm-cache
registry=https://registry.npmmirror.com/
```

改前备份 `~/.npmrc.bak-20261124`。注意**别把 authToken 行改坏**：先 `cp` 备份，再用 `cat > .npmrc <<'EOF'` 整文件重写（不要用 `printf` 拼 `D:\...` 路径，`\n` 会被解释成换行把路径劈成两行）。

实测同一 25 MB tarball：

| 源 | 速度 | 耗时 |
| --- | --- | --- |
| registry.npmjs.org | 793 KB/s | 33.2 s |
| registry.npmmirror.com | 3.35 MB/s | 7.8 s |

约 4 倍。全新临时项目 `pnpm add zod yaml` 2.1 秒装完。

## 预防/注意事项

- **镜像有分钟级同步延迟**。PiBot 锁文件里全是刚发布的精确版本，改镜像前应抽查：curl 镜像的包元数据，确认固定版本存在（本次抽查了 `expo@58.0.23`、`react-native-webrtc@155.0.1`、`@earendil-works/pi-coding-agent@1.4.0`、`@cloudflare/workerd-windows-64@1.20261019.1`、`@typescript/typescript-win32-x64@7.0.2` 等，全部命中）。
- 真遇到镜像缺版本，单次绕开即可：`pnpm install --registry=https://registry.npmjs.org/`。
- **npm registry 镜像 ≠ nvm 镜像**。nvm-windows 配 npmmirror 会误判 Node 版本（见 `nvm-windows-mirror-latest-stale.md`），那是另一套服务，别混用。
- 判断「慢」还是「卡死」：看日志末尾有没有 `Progress:` 在涨，不要凭某一行长时间不变就下结论。
- 项目级 `.npmrc` 的 `store-dir` / `cache-dir` 会覆盖用户级配置。PiBot 把 store 定在仓库内（`.pnpm-store`），所以依赖落在仓库所在盘，与 `%LOCALAPPDATA%`（C 盘）无关——C 盘空间紧张时不用为此清理 C 盘。

## 参考

- npmmirror 镜像站：<https://npmmirror.com/>
- pnpm 配置文件（`.npmrc` 与 `pnpm-workspace.yaml` 的划分）：<https://pnpm.io/npmrc>
