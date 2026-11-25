---
id: HJ-R-ZHIGANG
compiled_origin: base
type: judgment
name: 直杠
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - XS-R-MOPAI-GANGBU
  - HJ-R-QIPAI-YOUXIANJI
  - XS-R-PIAOCAI-XIANZHI
sources:
  - source: sources/hangzhou/hangzhou-core-flow.md
    section: 2.3.1.4
---

# 直杠（明杠）

- **触发**：其他玩家刚打出 1 张牌。
- **条件**：
  - 弃牌是非财神牌。
  - 本家手中有 3 张相同牌面的非财神牌，可与弃牌组成杠子。
  - 本家未受尚未解除的飘财限制。
- **否则**：不能直杠。
- **结果**：
  - 直杠与碰同级，按 `HJ-R-QIPAI-YOUXIANJI` 裁决（点炮胡 > 碰 / 直杠 > 吃）。
  - 直杠成立后从手牌移出 3 张，与被杠的弃牌组成 1 组杠牌放入碰杠区。
  - 按 `XS-R-MOPAI-GANGBU` 从牌墙尾部补牌。
- **验收**：
  - 任意一家打一万，本家有 3 张一万：可直杠。
  - 任意一家打白板（财神），本家有 3 张白板：不可直杠。
  - 受飘财限制时：不可直杠，仍可暗杠。
