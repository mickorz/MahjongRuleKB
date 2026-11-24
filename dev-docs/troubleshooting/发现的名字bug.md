可以先构建一个属于表，关于这个属于对应的中文拼音



发现一个问题

compiled下的文件和文件夹，一些使用英文命名 一些又用中文拼音命名，需要统一规范，都是用中文拼音命名（查询上面的术语表）。


## 处理结果（2026-11-24）

已修复。统一为中文拼音，文件名与目录名都改；规则见 `dev-docs/design/2026-11-24-规则命名规范与术语拼音表.md`（含 116 条术语映射与每张卡的中文语义）。

- 目录：`rules → guize`、`timing → shixu`、`state → zhuangtai`、`formulas → gongshi`、`tables → biaoge`、`settlement → jiesuan`、`ui → jiemian`
- 91 张卡的 ID 与文件名改拼音（17 张本来就是拼音，未动），如 `HJ-R-BANK-02 → HJ-R-ZHUANGJIA-02`、`HJ-R-GANG-ADD → HJ-R-JIAGANG`、`XS-T-DEAL → XS-T-FAIPAI`
- 26 条玩法参数 ID 改拼音，如 `HJ-C-BANKER-LEVEL → HJ-C-ZHUANGJIA-LAOSHU`、`HJ-C-DEAL-BATCH → HJ-C-FAIPAI-JIEZOU`
- `compiled/` 由编译器重新生成；杭州 `version` 1.0.0 → 1.1.0 并重算 `content_hash`，萧山 `0.1.0 → 0.2.0`、`base.version → 1.1.0`
- front matter 的 `type` 值（`judgment` / `timing` / …）保持英文：那是 Schema 枚举，不是文件名；目录与 type 的对应关系写在 `AGENTS.md` 与术语表里

验证：两个规则集校验通过，`npm test` 88 通过，`npm run typecheck` 通过。
