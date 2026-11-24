---
id: XS-F-NET
compiled_origin: variant
type: formula
name: 本局净得分
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - XS-F-GZ
  - XS-F-HU
sources:
  - source: sources/xiaoshan/xiaoshan-rules.md
    section: F-NET
base_rule_ref: null
change_type: added
compares_to: []
---

# 本局净得分

- **差异**：新增
- **杭麻**：本局得分只有胡牌结算，无跟庄分
- **输入**：本局跟庄净得分、本局胡牌结算净得分
- **公式**：本局净得分 = 本局跟庄净得分 + 本局胡牌结算净得分（含杠分）。流局时后项为 0，本局净得分等于已发生的跟庄净得分
- **不计入**：无
- **例子**：A 局前累计 −190，跟庄 −24，自摸结算 +20。本局净得分 = −4
