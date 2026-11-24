# 失效的 corepack 垫片挡住 pnpm 的全局安装

> 日期：2026-11-24
> 涉及：npm 全局目录、corepack、pnpm 12.14.0

## 问题现象

- 执行 `pnpm --version` 不输出版本号，而是报
  `Cannot find module 'C:\Program Files\nodejs\node_modules\corepack\dist\pnpm.js'`
- 执行 `npm i -g pnpm@12.14.0` 报 `EEXIST: file already exists`，先是 `pnpm`，移走后又轮到 `pnpx.cmd`。

## 排查过程

1. 看 npm 全局目录（`npm config get prefix`）：有 `pnpm`、`pnpm.CMD`、`pnpm.ps1`、`pnpx`、`pnpx.CMD`、`pnpx.ps1` 六个文件，但没有 `node_modules\pnpm`。六个文件的时间都是同一天，比其他全局工具旧。
2. 打开垫片看内容：它们是 corepack 生成的，指向 `C:\Program Files\nodejs\node_modules\corepack\dist\pnpm.js` 与 `pnpx.js`。这台机器上 `C:\Program Files\nodejs` 是另一个系统级 Node，它的 corepack 已经不在了，于是垫片全部失效。
3. `EEXIST` 是 npm 的保护：目标位置的文件不是自己装的，不覆盖。

## 根因

`corepack enable` 会把垫片写进 npm 的全局目录，而垫片绑定的是「当时那一个 Node 安装」里的 corepack。那份 corepack 被升级或移除后，垫片还在，变成只会报错的死链，并阻止后续用 `npm i -g` 安装同名工具。

## 解决方案

1. 把六个失效垫片移到备份目录（`%TEMP%\pnpm-broken-shims-<时间>`），不直接删。
2. 重新执行 `npm i -g pnpm@12.14.0`。
3. 验证：在 Node 24.18 与 Node 26.11.1 下 `pnpm --version` 都是 12.14.0（垫片调用 PATH 里的 `node`，与 Node 版本无关）。

npm 提示 pnpm 的 `preinstall` / `postinstall` 未运行（`allow-scripts` 策略），实际使用不受影响。

## 预防与注意事项

- `EEXIST` 不要用 `--force` 硬盖：先看旧文件是什么、还有没有用。这次旧文件是死链，移走是安全的；如果是别的工具装的同名命令，硬盖会把它弄坏。
- corepack 生成的垫片随 Node 安装走。卸载或升级某个 Node 之后，记得检查 npm 全局目录里有没有它留下的垫片。
- Node 25 起不再捆绑 Corepack，以后装 pnpm 用 `npm i -g pnpm@<版本>`，不要再走 corepack。
