---
id: HJ-F-ZHUANGXIAN-BEILV
origin: base
type: formula
name: 庄闲倍率
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [HJ-N-ZHUANGJIA-LAOSHU, HJ-C-ZHUANGJIA-BEILV]
sources:
  - source: rulebook/sources/hangzhou/hangzhou-core-flow.md
    section: "2.3.3"
---

# 庄闲倍率

- **输入**：赢家身份（庄 / 闲）、赔付者身份（庄 / 闲）。
- **公式**：赢家与赔付者之间有一方是庄家时，这一笔 × 8；双方都是闲家时，这一笔 × 1。本期笃三老庄，庄家倍率固定 8。
- **不计入**：不进入番型倍数的计算，只乘在每笔原应赔分上。
- **例子**：
  - 庄家自摸：三个闲家每笔都 × 8。
  - 闲家自摸：庄家那笔 × 8，另两个闲家每笔 × 1。
  - 闲家之间点炮（本期不开放）：若开放则 × 1。
