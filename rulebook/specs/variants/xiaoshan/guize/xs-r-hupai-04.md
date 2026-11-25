---
id: XS-R-HUPAI-04
origin: variant
type: judgment
name: 点炮番型的胡入来源
change_type: inherited
base_rule_ref: HJ-R-FANGCHONG
compares_to: [HJ-R-FANGCHONG]
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: []
sources:
  - source: sources/xiaoshan/xiaoshan-rules.md
    section: "R-HU-04"
---

# 点炮番型的胡入来源

- **差异**：沿用
- **杭麻**：要求本人常规摸牌或杠后补牌才成立的番型，按胡入来源核对
- **触发**：点炮胡取番
- **条件**：用的是他家本次打出的弃牌，并已满足 `XS-R-HUPAI-01`、`XS-R-HUPAI-03` 和该番型自身条件
- **否则**：不能把不符合胡入来源的番型算进这次点炮
- **结果**：更早、未与这次胡牌相连的杠，不算杠开，也不算豪杠开
- **验收**：A 杠后补牌未胡并出牌，B 再打出 A 能点炮的牌 → 按这次点炮番型取档。A 此前那次杠不是杠开，也不是豪杠开
