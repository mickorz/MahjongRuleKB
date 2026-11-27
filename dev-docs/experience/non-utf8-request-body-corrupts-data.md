# 非 UTF-8 请求体把乱码写进数据文件

## 现象

`documents/xiaoshan/editorial-overrides.yaml` 里出现一条内容为 `����̨д�Ĳ��ԸĶ�` 的覆盖条目。
文档正文本身没问题（`document.json` 干净），但这条覆盖一旦参与重建，就会把乱码带进正文。

## 排查过程

1. `grep -rlP '\xEF\xBF\xBD'` 扫全库，只有这一个文件命中。
2. 用 Python 按 UTF-8 解码，确认含 U+FFFD 替换字符 → 说明**字节在写入前就已经不是合法 UTF-8**。
3. 看写入方 `studio/edit/apply-batch.ts`：`writeFileSync(file, content, "utf8")`，编码没问题。
4. 唯一入口是 `POST /api/apply` → `readBody()`：`Buffer.concat(chunks).toString("utf8")`。
   非法字节在这里被**静默替换成 U+FFFD**，JSON 照样解析成功，于是乱码一路走到底。

根因：**服务端对请求体编码不做校验**，把"解码失败"当成"解码结果"。

## 解决方案

`readBody()` 解出字符串后先查 U+FFFD，命中就拒绝：

```ts
const raw = Buffer.concat(chunks).toString("utf8");
if (raw.includes("\uFFFD")) throw new Error("请求体不是合法 UTF-8，请以 UTF-8 编码发送");
```

调用方该分支返回 400 `bad_body`，不写盘。测试 `tests/server/app.test.ts`
「请求体含 U+FFFD（非 UTF-8）→ 400，不写盘」覆盖。
残留的乱码条目清成 `- overrides: []`。

## 谁会踩

Windows 控制台 `curl -d '{"text":"中文"}'`：控制台代码页是 GBK/CP936，
字节按 GBK 发出，服务端按 UTF-8 解码 → 全是 U+FFFD。
同理适用于任何"本地终端直接贴中文"的调试脚本。

## 预防

1. 校验边界上的"解码失败"，别让它变成数据。
2. 调试脚本要发中文，写成 `.mjs` 用 `fetch`（Node 内部统一 UTF-8），
   不要把中文塞进控制台命令行。
3. 写盘后抽查：新增产物里出现 `\uFFFD` 即视为数据损坏，不进下一步。
