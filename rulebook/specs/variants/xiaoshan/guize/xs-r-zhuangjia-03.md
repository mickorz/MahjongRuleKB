---
id: XS-R-ZHUANGJIA-03
origin: variant
type: judgment
name: 新庄起手二牢
change_type: modified
base_rule_ref: HJ-R-DUSAN
compares_to: [HJ-R-DUSAN]
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [XS-R-ZHUANGJIA-02, XS-N-LAOSHU, XS-R-ZHUANGJIA-04]
sources:
  - source: sources/xiaoshan/xiaoshan-rules.md
    section: "R-BANK-03"
---

# 新庄起手二牢

- **差异**：修改
- **杭麻**：新庄从三牢、8 倍起。首局、换庄、连庄均三牢，三牢封顶
- **触发**：每小局确定庄家后，尚未开局掷骰。
- **条件**：
  - 首局，或换庄后新庄接手（闲家胡牌，赢家接庄）。
  - 本次不是连庄。
- **否则**：庄家连庄时走 `XS-R-ZHUANGJIA-02`，掷骰前牢数 = 上一小局实际牢数 + 1。
- **结果**：
  - 掷骰前牢数 = 2，对应庄闲倍率 = 4。
  - 不沿用上一位庄家的牢数。
  - 之后按 `XS-R-ZHUANGJIA-04` 掷骰，可能再加 1 牢成为本局实际牢数。
  - 牢数无上限，每加一牢庄闲倍率翻倍（`XS-F-ZHUANGXIAN-BEILV`）。
- **验收**：
  - 首局新庄，掷骰前牢数为 2。
  - 闲家胡牌后新庄，掷骰前牢数为 2。
  - 上局庄家连庄：不走本卡，走 `XS-R-ZHUANGJIA-02`。
