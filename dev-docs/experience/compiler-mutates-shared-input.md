# 编译器修改了输入对象：浅拷贝后就地改写 meta

> 日期：2026-11-24
> 涉及：`compiler/compile.ts`、`tests/compiler/compile-purity.test.ts`

## 问题现象

- 同一个杭州规则集对象，在同一进程里连续编译两次萧山，第二次报「杭州基础规则内容已变化但 manifest.version 未更新：content_hash 不一致」，而磁盘上的文件没有任何改动。
- 先编译萧山，再编译另一个变种，后者拿到的是 `depends_on` 已被改写成萧山 ID 的杭州规则，报「编译后依赖悬空」或产出错误结果。
- 命令行里看不出来：CLI 先写杭州产物，再只编译一个变种，被污染的 `base` 没有被再次使用。

## 排查过程

1. 对评审意见指出的位置做代码核对：`out.push({ ...r, origin })` 是浅拷贝，随后的 `meta.depends_on = ...` 改写的是共享对象。
2. 给输入做深冻结后调用 `compileVariant`，立刻抛 `TypeError: Cannot assign to read only property 'depends_on'`，确认改写点。
3. 分别收集输入与输出可达的全部对象并求交集，共享对象有 408 个。
4. 合并 `main` 后问题加重：`content_hash` 按内存内容计算，第一次编译改写 `base`，第二次编译的指纹校验直接失败。

## 根因

浅拷贝只复制了顶层字段，`meta` 仍是输入里的同一个对象；编译器对输出做的「重写依赖引用」实际写进了输入。多个变种共用同一个 `base` 时，后编译者读到被污染的数据。

## 解决方案

1. 改写处生成新的 `meta`：`r.meta = { ...meta, depends_on: ... }`。
2. `compileBase` 与 `compileVariant` 在返回前对结果做 `structuredClone`，输出与输入不共享任何引用。
3. 主流程包进 `main()` 并加入口守卫（与 `validator.ts` 同一写法），编译函数可以被测试 import；此前测试只能经 `execSync` 跑 CLI，抓不到这类问题。

## 预防与注意事项

- 回归测试 `tests/compiler/compile-purity.test.ts`（6 个）：输入深冻结后可编译且前后深比较一致、重复编译一致、编译萧山后杭州结果与指纹不被污染、编译萧山后另一个变种结果不变、输出不与输入共享引用、指纹与换行符无关。
- 之后把编译器拆成纯函数 `kernel.ts` 时保留这些约束：领域函数不得修改输入，返回值不得引用输入中的对象。
- 对返回「新对象」的函数保持警惕：`{ ...obj }` 只复制顶层，嵌套对象仍是共享的。
