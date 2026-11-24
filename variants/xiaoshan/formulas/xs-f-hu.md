---
id: XS-F-HU
origin: variant
type: formula
name: 胡牌分与杠分
change_type: modified
base_rule_ref: HJ-F-ORIGINAL
compares_to: [HJ-F-ORIGINAL]
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [XS-F-BANK]
sources:
  - source: sources/xiaoshan/xiaoshan-rules.md
    section: "F-HU"
---

# 胡牌分与杠分

- **差异**：修改
- **杭麻**：胡牌分按底分 × 番型倍数 × 庄闲倍率计算，笃三老庄下庄闲倍率为 8。不另按每杠 1 分计杠分
- **输入**：底分 1、本次合法番型倍数、本局实际庄闲倍率、赢家本小局杠的组数
- **公式**：点炮应付 = 1 × 本次合法点炮番型倍数 × 本局实际庄闲倍率。只由放铳者付给赢家，另两家这笔胡牌分得失为 0。自摸胡牌分的赔付算法沿用杭麻，番型倍数和庄闲倍率用萧山本局取值。杠：每组成立的直杠、补杠、暗杠计 1 杠，碰后补成的杠只计 1 组。自摸时每名赔付者在胡牌分之外，每杠另付 1 分。点炮的杠分按这句自摸条款计算。流局杠分 = 0
- **不计入**：杠分不进起胡门槛，不进局末胡牌飘分
- **例子**：4 杠且自摸 → 其余三家各另付 4，赢家杠分 +12
