---
id: XS-R-HUPAI-03
compiled_origin: variant
type: judgment
name: 有财 2 番起胡
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - XS-C-YOUCAI-2FAN
sources:
  - source: sources/xiaoshan/xiaoshan-rules.md
    section: R-HU-03
base_rule_ref: null
change_type: added
compares_to: []
---

# 有财 2 番起胡

- **差异**：新增
- **杭麻**：好友房方案未把本规则列为固定项
- **触发**：判定是否给出自摸或点炮胡
- **条件**：先判断这次胡牌方式是否可用，再筛该方式下的合法番型。刚摸入或补入的财神计入本次手牌，牌河中的财神不计。无财神时，按本次合法番型判定，不套 2 倍门槛。有财神时，选档并叠加后的最高番型倍数 ≥ 2
- **否则**：不提供本次自摸或点炮胡
- **结果**：自摸和点炮都走本条。庄闲倍率、杠分不计入门槛
- **验收**：有财神且只有平胡 1 倍、庄闲倍率 8 倍 → 仍拦截
