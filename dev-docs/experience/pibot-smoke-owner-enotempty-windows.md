# pnpm smoke:owner 在 Windows 上稳定失败（ENOTEMPTY 清理竞争）

## 现象

`pnpm build` 之后跑 `pnpm smoke`：

- `smoke:renderer` → `renderer smoke: ok`
- `smoke:owner` → 抛未捕获异常，连 `owner smoke: FAILED` 都没打印出来：

```
[Error: ENOTEMPTY: directory not empty, rmdir
 'C:\Users\<用户>\AppData\Local\Temp\pb-owner-mJf5QX\compile-cache\4622...\v24.21.0-x64-8c6a5e03']
```

重跑两次，同一位置、稳定复现（只有临时目录名不同）。

## 排查过程

1. 读 `tools/dev/owner-smoke.mjs`：它 `mkdtemp(tmpdir(), "pb-owner-")` 建临时数据目录，`spawn(electron, [app, "--pibot-background"])` 起 owner，轮询日志等 `host_rpc_ready`，最后在 `finally` 里 `rm(data, { recursive: true, force: true })`。
2. 异常来自那句 `rm`。`force: true` 只忽略 `ENOENT`，`ENOTEMPTY` 照样抛。
3. 看残留目录：`compile-cache/<hash>/v24.21.0-x64-<hash>/` 里全是 V8 compile cache 文件（`0e21c53e`、`1d777559`…），没有日志目录 —— 说明 owner 进程在写 compile cache 阶段就被 kill 了，句柄释放滞后。
4. 退出流程里只 `child.kill("SIGTERM")` 杀 Electron 本体，不杀它的进程树；Windows 上子进程/文件句柄释放比 POSIX 慢，`rm` 就撞上 `ENOTEMPTY`。

## 根因

上游工具的清理逻辑在 Windows 上有竞态：Electron 退出后 compile-cache 目录的文件句柄未及时释放，`rm` 递归删除时目录非空。**与应用功能无关**——同一份构建用 `pnpm dev` 启动正常（`gui_first_screen_ready` 18.7 秒，owner 连接成功）。

## 解决方案

不改上游工具，记录为基线失败。验证应用能否启动改用 `pnpm dev`：

```sh
cd thirdparties/PiBot
PIBOT_DATA_DIR=E:/WorkProjects/MahjongRuleKB/dev-examples/pibot-env/data pnpm dev
```

日志里看到 `gui_window_shown` → `gui_attached` → `gui_first_screen_ready` 即视为启动成功。

残留的 `%TEMP%\pb-owner-*` 目录可以直接删（可能要先等一下句柄释放）。

## 预防/注意事项

- `pnpm check` **不包含** `pnpm smoke`；`pnpm smoke` 需要先 `pnpm build` 生成 `apps/desktop/out`，否则先报 `ERR_FILE_NOT_FOUND ... out/renderer/index.html`。
- 看到 `smoke:owner` 报错时，先区分「应用起不来」还是「清理失败」：报错栈里只有 `rm` / `ENOTEMPTY` 就是清理问题，应用其实是好的。
- 若上游后来修了这个问题（改成杀进程树 + `rm` 重试），可以删掉本文档并在进度文档登记。

## 参考

- `tools/dev/owner-smoke.mjs`（上游脚本）
- Node `fs.rm` 选项语义（`force` 只忽略 ENOENT）：<https://nodejs.org/api/fs.html#fspromisesrmpath-options>
