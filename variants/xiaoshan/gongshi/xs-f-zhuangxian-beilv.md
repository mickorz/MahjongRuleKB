---
id: XS-F-ZHUANGXIAN-BEILV
origin: variant
type: formula
name: 庄闲倍率
change_type: modified
base_rule_ref: HJ-F-ZHUANGXIAN-BEILV
compares_to: [HJ-F-ZHUANGXIAN-BEILV]
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [XS-N-LAOSHU]
sources:
  - source: sources/xiaoshan/xiaoshan-rules.md
    section: "F-BANK"
---

# 庄闲倍率

- **差异**：修改
- **杭麻**：庄家倍率固定 8（笃三老庄），涉及庄家的赔付 × 8，闲家之间 × 1
- **输入**：本局实际牢数
- **公式**：庄闲倍率 = 2^本局实际牢数。涉及庄家的胡牌赔付用这个倍率。闲家之间 = 1
- **不计入**：不进入 `XS-R-HUPAI-03` 的起胡门槛
- **例子**：连庄时上局实际三牢 → 掷骰前四牢 = 16 倍。本局再加庄 → 五牢 = 32 倍
