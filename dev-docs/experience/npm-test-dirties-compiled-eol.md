# npm test 后 compiled/ 下全部文件显示已修改

> 日期：2026-11-24
> 涉及：`compiled/`、Git 的 `core.autocrlf`

## 问题现象

执行 `npm test`（`tests/compiler/compile.test.ts` 里有一步会实际运行编译器重写 `compiled/`）之后，`git status` 显示 `compiled/` 下 150 多个文件为已修改，但 `git diff` 没有任何输出。

## 排查过程

1. `git diff --quiet -- compiled` 退出码为 0：内容没有差异。
2. `git ls-files --eol` 显示这些文件 `i/lf w/lf`，而正常检出的文件是 `i/lf w/crlf`。
3. `core.autocrlf=true`（系统级与用户级配置都是 true）。

## 根因

检出时 Git 把换行转成 CRLF，编译器写出的文件是 LF。Git 比较内容时会把工作区文件归一化，所以内容一致；但工作区文件的大小与索引里记录的不同，`git status` 把它们列为已修改。这是换行符造成的假阳性，不是产物变化。

## 解决方案

确认无内容差异后还原工作区：

```sh
git diff --quiet -- compiled   # 退出码 0 表示内容一致
git checkout -- compiled/
```

不要把这些文件提交：提交不会产生内容变化，只会让状态暂时变干净，下次运行测试又会出现。

## 预防与注意事项

- 判断编译产物是否变化，看 `git diff`，不要只看 `git status`。
- 需要对比「修改前后的产物是否一致」时，比较两次编译器的输出，或用 `git diff --quiet -- compiled`，不要依赖 `git status` 的文件数。
- 根治办法是加 `.gitattributes` 规定 `compiled/** text eol=lf`（生成物统一 LF 检出）。这属于仓库级的换行策略，会影响所有人的检出结果，本次没有擅自改动，留待决定。
