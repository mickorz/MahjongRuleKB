---
id: XS-R-BANK-01
origin: variant
type: judgment
name: 首局庄家
change_type: inherited
base_rule_ref: HJ-R-DINGZHUANG
compares_to: [HJ-R-DINGZHUANG]
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: []
sources:
  - source: sources/xiaoshan/xiaoshan-rules.md
    section: "R-BANK-01"
---

# 首局庄家

- **差异**：沿用
- **杭麻**：首局在四名参战玩家中随机确定庄家
- **触发**：首局开始，庄家尚未确定
- **条件**：四名参战玩家已在局内
- **否则**：不进入开局掷骰
- **结果**：庄家为四名之一。本文不另定随机算法
- **验收**：庄家确定先于 `XS-T-BANK`
