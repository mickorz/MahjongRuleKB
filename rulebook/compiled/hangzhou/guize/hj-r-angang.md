---
id: HJ-R-ANGANG
compiled_origin: base
type: judgment
name: 暗杠
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - HJ-R-GANG-BUPAI
sources:
  - source: rulebook/sources/hangzhou/hangzhou-core-flow.md
    section: 2.3.1.4
---

# 暗杠

- **触发**：本人出牌阶段。
- **条件**：
  - 手中有 4 张相同牌面的非财神牌。
  - 吃或碰成功的当前回合也允许暗杠。
  - 余牌满足 `HJ-R-GANG-BUPAI`。
  - 受飘财限制时**仍可**暗杠。
- **否则**：不能暗杠。
- **结果**：
  - 暗杠成立后从手牌移出 4 张，组成 1 组杠牌放入碰杠区。
  - 暗杠以 3 张背面、顶部 1 张正面的方式展示，其他玩家可通过正面牌识别该暗杠的牌面。
  - 按 `HJ-R-GANG-BUPAI` 从牌墙尾部补牌。
- **验收**：
  - 手中有 4 张二万：可暗杠。
  - 手中有 3 张二万 + 1 张财神：不可暗杠（财神不能补成杠）。
  - 受飘财限制时：仍可暗杠。
  - 暗杠不提供抢杠胡响应。
