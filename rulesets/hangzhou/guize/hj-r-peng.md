---
id: HJ-R-PENG
origin: base
type: judgment
name: 碰
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [HJ-R-QIPAI-YOUXIANJI, HJ-R-PIAOCAI-XIANZHI]
sources:
  - source: sources/hangzhou/hangzhou-core-flow.md
    section: "2.3.1.3"
---

# 碰

- **触发**：其他任意一名玩家刚打出 1 张牌。
- **条件**：
  - 弃牌是非财神牌。
  - 本家手中有至少 2 张相同牌面的非财神牌。即使手中有 3 张，也只用其中 2 张完成碰。
  - 本家未受尚未解除的飘财限制。
- **否则**：不能碰。包括：弃牌是财神、用财神替代、受飘财限制。
- **结果**：
  - 碰是否执行按 `HJ-R-QIPAI-YOUXIANJI` 裁决，点炮胡优先于碰，碰优先于吃。
  - 碰成功后，弃牌与 2 张手牌组成 1 组副露放入碰杠区，不进行常规摸牌，直接进入本人出牌阶段。
  - 当前回合满足条件时即可加杠或暗杠；未选择杠时打出 1 张牌。
- **验收**：
  - 任意一家打东风，本家有 2 张东风：可碰。
  - 任意一家打东风，本家有 3 张东风：可碰（只用 2 张），也可直杠（按优先级，直杠 > 碰，但两者同级由玩家选择）。
  - 任意一家打白板（财神）：不可碰。
