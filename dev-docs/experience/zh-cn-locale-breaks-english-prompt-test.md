# zh-CN 机器上 brain.test.ts T8 必然失败（提示词被翻译）

## 现象

`pnpm check` 的测试阶段：

```
 FAIL  |@pibot/brain| src/brain.test.ts > T8 brain > streams, checkpoints at 500 ms, ...
AssertionError: expected '你是 Pi，Pi Bot 的主 Bot。你帮助用户思考、解答问题…' to contain 'Commands: ask'
 ❯ src/brain.test.ts:288:37
```

同一份代码在别处（上游 CI）通过。

## 排查过程

1. 断言在 `packages/brain/src/brain.test.ts:288`，只此一处出现 `Commands: ask`（`grep -rn "Commands: ask" packages/brain/src` 只命中测试本身），说明生产代码按 locale 输出中英文两套提示词。
2. 找 locale 来源：`grep -rn "resolvedOptions().locale" packages/` 大量命中，例如 `packages/brain/src/conversations/chat/chat.ts:120`、`packages/acp/src/messages.ts:9`（`startsWith("zh")`）。
3. 验证能否用环境变量统一到英文：

   ```sh
   node -e "console.log(Intl.DateTimeFormat().resolvedOptions().locale)"          # zh-CN
   LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8 node -e "..."                              # zh-CN（无效）
   LC_ALL=C node -e "..."                                                         # zh-CN（无效）
   ```

   Node 在 Windows 上取 ICU 默认 locale 时读系统区域设置，不吃 `LANG` / `LC_ALL`。

## 根因

上游测试断言的是英文提示词文本，而提示词语言由 `Intl.DateTimeFormat().resolvedOptions().locale` 决定；本机系统 locale 是 `zh-CN`，于是断言拿到中文。上游 CI 是英文环境，所以这个失败在上游不可见。

## 解决方案

不动上游测试、不改系统区域设置（改系统 locale 会污染整台机器）。**记录为基线失败**：

- 基线：`3347 passed / 1 failed / 1 skipped`，唯一失败就是这条。
- 后续只对「基线之外的新失败」负责，Phase 0 风险表里已有对应约定。

## 预防/注意事项

- 读到 `pnpm check` 报 T8 时不要怀疑自己的改动；先看断言内容是不是中文 vs 英文。
- 不要试图用 `LANG` / `LC_ALL` / `NODE_OPTIONS` 绕过：Windows 上无效，白花时间。
- 若将来必须在 CI 上跑全绿，正经做法是给该测试注入 locale 或在测试里按 locale 选择期望值——那属于改上游代码，需在 fork 里单独评估。

## 参考

- `packages/brain/src/brain.test.ts:288`
- `packages/brain/src/conversations/chat/chat.ts:120`（locale 传入点）
- Node `Intl` 默认 locale 说明：<https://nodejs.org/api/intl.html>
