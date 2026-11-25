---
id: XS-R-ZHUANGJIA-02
compiled_origin: variant
type: judgment
name: 连庄与换庄
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - XS-R-ZHUANGJIA-03
  - XS-N-LAOSHU
sources:
  - source: rulebook/sources/xiaoshan/xiaoshan-rules.md
    section: R-BANK-02
base_rule_ref: HJ-R-LUNZHUANG
change_type: modified
compares_to:
  - HJ-R-LUNZHUANG
---

# 连庄与换庄

- **差异**：修改
- **杭麻**：胡牌者坐庄。流局由原庄连庄。连庄后仍是三牢、8 倍，三牢封顶
- **触发**：一小局结束，且还会开下一小局
- **条件**：本局庄家自摸，或本局流局
- **否则**：闲家自摸时赢家接庄，下一局走 `XS-R-ZHUANGJIA-03`
- **结果**：庄家继续坐庄。掷骰前牢数 = 上一小局实际牢数 + 1。上一小局实际牢数含上一局掷骰加的那一牢。牢数无上限，每加一牢庄闲倍率翻倍
- **验收**：上局实际三牢且庄家连庄 → 本局掷骰前四牢、16 倍。闲家自摸 → 赢家成为新庄，掷骰前二牢
