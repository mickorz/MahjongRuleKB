---
id: HJ-R-DUSAN
compiled_origin: base
type: judgment
name: 笃三老庄
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - HJ-C-LIANZHUANG-MOSHI
  - HJ-C-ZHUANGJIA-LAOSHU
  - HJ-C-ZHUANGJIA-BEILV
  - HJ-N-ZHUANGJIA-LAOSHU
sources:
  - source: sources/hangzhou/hangzhou-core-flow.md
    section: 2.3.2.6
---

# 笃三老庄

- **触发**：每小局确定庄家后。
- **条件**：`HJ-C-LIANZHUANG-MOSHI` = 笃三老庄（本期固定）。
- **否则**：无（本期无其他连庄模式）。
- **结果**：
  - 首局庄家及每次换庄后的新庄家均从三牢开始，庄家倍率为 8 倍。
  - 庄家胡牌或流局时继续坐庄，下一局保持三牢，倍率仍为 8 倍。
  - 闲家胡牌时按 `HJ-R-LUNZHUANG` 由胡牌者接任庄家，新庄家在下一局按三牢、8 倍结算。
  - 三牢为最高牢数。该选项下每局均按三牢的庄家倍率结算。
- **验收**：
  - 首局庄家牢数 = 3，倍率 = 8。
  - 连庄 3 次后牢数仍 = 3（不递增）。
  - 闲家胡牌后新庄牢数 = 3（不从头开始）。
