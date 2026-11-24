---
id: HJ-R-FANGCHONG
compiled_origin: base
type: judgment
name: 放铳（点炮胡）
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - HJ-C-ZHUANGXIAN-FANGCHONG
  - HJ-R-QIPAI-YOUXIANJI
  - HJ-R-ZHUANGXIAN-FANGCHONG
  - HJ-K-PINGHU
sources:
  - source: sources/hangzhou/hangzhou-core-flow.md
    section: 2.3.1.6
---

# 放铳（点炮胡）

- **触发**：玩家打出的牌被另一名玩家用于合法胡牌。出牌者称为放铳，胡牌者称为点炮胡（吃胡）。
- **条件**：
  - 弃牌不是白板财神。白板财神弃牌不得用于点炮胡。
  - `HJ-C-ZHUANGXIAN-FANGCHONG` 启用（本期启用「庄闲放铳（庄三）」）：当局为三牢庄，且出牌者与胡牌者一方为庄家、另一方为闲家时，才可点炮胡。
  - 牌型及其他胡牌条件均满足。
- **否则**：不提供点炮胡。未开启该选项时仅允许自摸。
- **结果**：
  - 同一张弃牌有多人符合胡牌条件时，从出牌者起按逆时针就近顺序裁决，优先者放弃后顺延，最多一人胡牌。
  - 按放铳方式结算时，仅由放铳者按 `HJ-P-DIANPAO-RUZHANG` 支付。
- **验收**：
  - 三牢局，庄家打九筒，闲家听九筒：闲家可点炮胡。
  - 三牢局，闲家 A 打九筒，闲家 B 听九筒：不可点炮胡（闲家之间不开放）。
  - 三牢局，闲家打白板（财神），庄家听白板：不可点炮胡。
