---
id: HJ-R-ZHUANGXIAN
compiled_origin: base
type: judgment
name: 庄闲放铳（庄三）
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - HJ-C-DISCARD-HU
  - HJ-N-BANK
  - HJ-R-PRIORITY
  - HJ-R-FANGCHONG
sources:
  - source: sources/hangzhou/hangzhou-core-flow.md
    section: 2.3.2.7
---

# 庄闲放铳（庄三）

- **触发**：三牢局中有玩家打出弃牌。
- **条件**：
  - `HJ-C-DISCARD-HU` 启用（本期固定启用，从首局起生效）。
  - 当局为三牢庄。
  - 出牌者和胡牌者一方为庄家、另一方为闲家。
  - 胡牌者牌型及其他胡牌条件均满足。
- **否则**：不提供点炮胡。闲家之间不开放点炮。
- **结果**：
  - 庄家出牌时，符合条件的闲家可点炮胡。
  - 闲家出牌时，仅庄家可按条件点炮胡。
  - 多人可胡同一张弃牌时按 `HJ-R-PRIORITY` 裁决，最多一人胡牌。结算按 `HJ-R-FANGCHONG` 处理。
- **验收**：
  - 庄家打牌，闲家 A 和闲家 B 都听：逆时针就近者先响应，最多一人胡。
  - 闲家 A 打牌，闲家 B 听：不可点炮胡。
  - 闲家打牌，庄家听：庄家可点炮胡。
