# content_hash 把换行符算进指纹，新检出上编译失败

> 日期：2026-11-24
> 涉及：`compiler/compile.ts` 的 `rulesetContentHash`、`rulesets/hangzhou/manifest.yaml` 的 `content_hash`

## 问题现象

合并 `main`（`b6e06d4` 引入基础内容指纹 `content_hash`）后，在本 worktree 上执行 `npm run compile` 与 `npm test` 报错：

```text
杭州基础规则内容已变化但 manifest.version 未更新：content_hash 8e9bf676... != df6a872f...
```

同样的代码在提交 `b6e06d4` 的工作区上能通过。知识库文件在两个工作区内容完全一致。

## 排查过程

1. `git ls-files --eol rulesets/hangzhou/config.yaml` 显示 `i/lf w/crlf`：仓库内是 LF，工作区是 CRLF（`core.autocrlf=true`，Git for Windows 的默认值）。
2. 逐项排除指纹的输入：`config`、`meta` 都经 YAML 解析，不含换行符；只有规则卡正文 `body` 是磁盘原文。
3. 把 61 张卡正文的 `\r\n` 统一成 `\n` 后重算，指纹正好等于 manifest 里记录的 `8e9bf676...`。

## 根因

`rulesetContentHash` 对 `body` 原文做 `JSON.stringify` 再取 sha256，原文带着检出时的换行符。指纹依赖了检出环境，而不是规则内容本身。提交者的工作区里正文是 LF，所以提交的指纹只在「正文恰好是 LF」的工作区有效。

## 解决方案

计算指纹前把正文统一成 LF：

```ts
body: r.body.replace(/\r\n/g, "\n")
```

manifest 里已提交的指纹值不用改：它本来就是按 LF 正文算出来的。

## 预防与注意事项

- 凡是对文件文本做哈希、比较、序列化的地方，先归一化换行符。
- 回归测试：`tests/compiler/compile-purity.test.ts` 中「正文为 CRLF 与为 LF 的同一规则集，指纹相同，且等于 manifest 记录的值」。
- 修改这个函数的输入构成（例如把别的字段算进指纹）时，必须同步重算并提交 `rulesets/hangzhou/manifest.yaml` 的 `content_hash`，否则所有变种的编译都会失败。
