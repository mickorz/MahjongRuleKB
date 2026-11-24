---
id: XS-F-GENZHUANG-PEIFU
compiled_origin: variant
type: formula
name: 跟庄赔付
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: []
sources:
  - source: sources/xiaoshan/xiaoshan-rules.md
    section: F-GZ
base_rule_ref: null
change_type: added
compares_to: []
---

# 跟庄赔付

- **差异**：新增
- **杭麻**：无
- **输入**：跟庄成立后重掷的两颗骰子。这次骰子只用于这笔赔付
- **公式**：`S = d1 + d2`。该圈首出者 −3S，其余三家各 +S
- **不计入**：不改胡牌番型。不进局末胡牌飘分
- **例子**：5 和 3，S = 8。首出 −24，其余每家 +8。同一小局多次成立则逐笔累加
