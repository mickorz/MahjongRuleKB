# nvm-windows 配镜像后安装新版 Node 报「尚未发布」

> 日期：2026-11-24
> 涉及：nvm-windows 1.2.2、npmmirror、Node 26.11.1

## 问题现象

- `nvm install 26.11.1` 用默认源 nodejs.org：开始下载，但 7 分钟没有下完（本机到 nodejs.org 很慢，一个 HEAD 请求就要 13 秒）。
- 把 `node_mirror` 换成 npmmirror（短地址或 cdn.npmmirror.com 都试过）：立刻报
  `Node.js v26.11.1 is not yet released or is not available for download yet.`
- 而 26.11.1 明明已经发布：nodejs.org 和镜像上 `node-v26.11.1-win-x64.zip`、`SHASUMS256.txt`、`index.tab`、`index.json` 全都能取到，清单里也有这个版本。

## 排查过程

1. 先怀疑短地址的 302 跳转，换成跳转后的 CDN 地址（直接 200），报错不变。
2. 逐个确认安装可能用到的文件（zip、7z、`win-x64/node.exe`、`SHASUMS256.txt`、`index.json`），镜像上全部存在。
3. 读 nvm-windows 源码：`install()` 在下载前调用 `checkVersionExceedsLatest(version)`，它读取 `<node_mirror>/latest/SHASUMS256.txt`，用其中的版本号当作「最新版」做比较，请求的版本更大就报上面那句。报错信息把「镜像数据滞后」说成了「版本未发布」。
4. 实测：nodejs.org 的 `latest/SHASUMS256.txt` 是 v26.13.1；npmmirror 的是 v24.9.0，Last-Modified 停在 2025-10-06。

## 根因

镜像上的 `latest/` 目录一年多没有同步。nvm-windows 的「是否超过最新版」检查依赖它，于是任何大于 24.9.0 的版本都会被判为「尚未发布」。这是 nvm-windows 文档里列出的已知坑（Stale Mirror SHASUMS256.txt Blocks Valid Installs）。

## 解决方案

1. 把 `settings.txt` 的 `node_mirror` 恢复为空（改动前先备份，改完删除备份）。
2. 手动安装，做法与 `nvm install` 在 1.2.x 的实际行为一致（解压官方 zip，把内层目录的内容放到 `%NVM_HOME%\v<版本>\`）：
   - 取得官方 zip（浏览器从 nodejs.org 下载，或从镜像下载）。
   - 用 nodejs.org 官方的 `SHASUMS256.txt` 核对：`sha256sum` 结果与清单里的值一致才继续。
   - `unzip -q node-v26.11.1-win-x64.zip -d <临时目录>`，再把 `node-v26.11.1-win-x64` 移为 `%NVM_HOME%\v26.11.1`。
3. 验证：`nvm list` 能列出 26.11.1；`%NVM_HOME%\v26.11.1\node.exe --version` 输出 v26.11.1；目录结构与已有的 `v22.11.0` 一致（少两个文件：`corepack`、`corepack.cmd`，因为 Node 25 起不再捆绑 Corepack）。

没有执行 `nvm use`，全局默认版本保持不变；需要时在终端里把该版本目录放到 PATH 最前面，或 `nvm use 26.11.1`。

## 预防与注意事项

- 在国内网络下不要给 nvm-windows 长期配置 npmmirror 作为 `node_mirror`，尤其是装刚发布的版本。
- `nvm node_mirror <url>` 在 1.2.2 下没有把值写进 `settings.txt`，也不要指望它；真要改就改 `settings.txt`，并记得恢复。
- 长时间下载不要放在可能被超时打断的命令里：nvm 被打断后不会留下半成品目录，但后续清理操作也不会执行。后台运行加轮询更稳。
- 手动安装必须核对官方 SHA256，来源不明的包不能直接解压进 nvm 目录。
