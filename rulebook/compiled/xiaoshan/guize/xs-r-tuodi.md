---
id: XS-R-TUODI
compiled_origin: variant
type: judgment
name: 拖底触发
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - XS-P-TUODI-KEPEIFEN
  - XS-C-TUODI-EDU
sources:
  - source: rulebook/sources/xiaoshan/xiaoshan-rules.md
    section: R-CAP
base_rule_ref: null
change_type: added
compares_to: []
---

# 拖底触发

- **差异**：新增
- **杭麻**：无拖底，打满 8 局结束
- **触发**：胡牌或流局的分数全部入账之后
- **条件**：任一玩家整场累计净分 ≤ −200
- **否则**：按杭麻小结算和局数。未满 8 局继续下一小局
- **结果**：结束本场，取消未开小局。达到条件的玩家大结算最终净分 = −200，即最终输分按 200 分计。本局净得分仍按实际分入账。分配见 `XS-P-TUODI-KEPEIFEN`
- **验收**：局前 −190，跟庄支付 24 后打完，局末仍 ≤ −200 → 触发。局末回到 −194，且其余玩家未触发、未满 8 局 → 继续
