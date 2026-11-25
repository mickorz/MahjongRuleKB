---
id: XS-N-LAOSHU
compiled_origin: variant
type: counter
name: 牢数
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - XS-R-ZHUANGJIA-04
sources:
  - source: rulebook/sources/xiaoshan/xiaoshan-rules.md
    section: N-BANK
base_rule_ref: HJ-N-ZHUANGJIA-LAOSHU
change_type: modified
compares_to:
  - HJ-N-ZHUANGJIA-LAOSHU
---

# 牢数

- **差异**：修改
- **杭麻**：每小局定庄后固定为 3，不递增，本小局内不变
- **键**：本小局的掷骰前牢数、本局实际牢数
- **初值**：新庄的掷骰前牢数 = 2。连庄的掷骰前牢数 = 上一小局实际牢数 + 1
- **加一**：只在 `XS-R-ZHUANGJIA-04` 条件成立时，实际牢数相对掷骰前牢数加 1
- **重置**：下一小局按上一条重写。不沿用上一位庄家的牢数。本小局停稳后不再改
- **读取**：`XS-F-ZHUANGXIAN-BEILV`、`XS-R-HUPAI-01`、`XS-V-ZHUANGJIA-LAOSHU-BIAOQIAN`
