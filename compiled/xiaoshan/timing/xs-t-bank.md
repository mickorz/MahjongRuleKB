---
id: XS-T-BANK
compiled_origin: variant
type: timing
name: 定牢之后才掷骰
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - XS-R-BANK-04
sources:
  - source: sources/xiaoshan/xiaoshan-rules.md
    section: T-BANK
base_rule_ref: null
change_type: added
compares_to: []
---

# 定牢之后才掷骰

- **差异**：新增
- **杭麻**：无
- **起点**：庄家已确定
- **步骤**：1. 写入掷骰前牢数。2. 掷两颗骰子。3. `XS-R-BANK-04` 定格本局实际牢数
- **中断**：无
- **结束**：骰子停稳。本小局不再改牢数
