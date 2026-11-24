---
id: XS-T-GZ
origin: variant
type: timing
name: 跟庄先于弃牌响应
change_type: added
compares_to: []
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [XS-R-GZ, XS-A-GZ, XS-F-GZ]
sources:
  - source: sources/xiaoshan/xiaoshan-rules.md
    section: "T-GZ"
---

# 跟庄先于弃牌响应

- **差异**：新增
- **杭麻**：无
- **起点**：第四张弃牌确认
- **步骤**：1. 按 `XS-R-GZ` 判断。2. 不成立则直接进入该弃牌的响应。3. 成立则先播 `XS-A-GZ`，并按 `XS-F-GZ` 一次性入账、刷新四家累计分。4. 再按杭麻优先级开放这张弃牌的吃、碰、杠、胡
- **中断**：第四张打出前，吃、碰、直杠、补杠或暗杠成立。本圈作废，从操作玩家随后实际打出的第一张另起一圈，不赔付
- **结束**：已入账的跟庄分保留。这张牌之后被合法吃、碰、直杠或点炮，不退回。点炮仍走 `XS-R-HU-01`、`XS-R-HU-03`
