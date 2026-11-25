---
id: XS-V-DAJIESUAN-SHIPEI
origin: variant
type: static-ui
name: 大结算实赔
change_type: added
compares_to: []
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [XS-P-TUODI-KEPEIFEN]
sources:
  - source: rulebook/sources/xiaoshan/xiaoshan-rules.md
    section: "V-CAP"
---

# 大结算实赔

- **挂**：`XS-P-TUODI-KEPEIFEN`
- **差异**：新增
- **出现条件**：`XS-R-TUODI` 命中并进入大结算
- **位置**：大结算
- **文案格式**：达到拖底的玩家最终净分 −200。各笔显示分配后的实赔
- **不出现**：未触发拖底时不改杭麻大结算
- **保持到**：本场结算结束。原文未写从局末原应付到这份实赔之间有没有过渡画面
