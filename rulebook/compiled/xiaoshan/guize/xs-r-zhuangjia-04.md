---
id: XS-R-ZHUANGJIA-04
compiled_origin: variant
type: judgment
name: 掷骰加庄
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - XS-N-LAOSHU
  - XS-F-ZHUANGXIAN-BEILV
sources:
  - source: sources/xiaoshan/xiaoshan-rules.md
    section: R-BANK-04
base_rule_ref: null
change_type: added
compares_to: []
---

# 掷骰加庄

- **差异**：新增
- **杭麻**：无开局掷骰加牢
- **触发**：每小局开局，掷骰前牢数已由 `XS-N-LAOSHU` 写好
- **条件**：两颗骰子 `d1 == d2`，或 `d1 + d2 > 8`
- **否则**：本局实际牢数 = 掷骰前牢数
- **结果**：本局实际牢数 = 掷骰前牢数 + 1。两个条件同时成立也只加 1。停稳后的牢数用于本小局庄闲算分，见 `XS-F-ZHUANGXIAN-BEILV`
- **验收**：

| d1 | d2 | 加牢 | 原因 |
| --- | --- | --- | --- |
| 4 | 4 | +1 | 豹子 |
| 4 | 5 | +1 | 和为 9 |
| 3 | 5 | 0 | 和为 8 且点数不同 |
| 5 | 5 | +1 | 两条件同时成立，只加一牢 |
