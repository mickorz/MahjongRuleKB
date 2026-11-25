---
id: HJ-K-GANGKAI
origin: base
type: lookup
name: 杠上开花 / 二连杠 / 三连杠 / 四连杠
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [HJ-R-GANG-BUPAI]
sources:
  - source: rulebook/sources/hangzhou/hangzhou-core-flow.md
    section: 2.3.4.2 第 6-9 项
---

# 杠上开花 / 二连杠 / 三连杠 / 四连杠

- **取档键**：同一个行牌回合内连续完成的杠数。
- **表**：

| 番型 | 倍数 | 成立条件 |
| --- | --- | --- |
| 杠上开花 | 2 倍 | 1 杠。直杠、加杠或暗杠后用补牌立即自摸（普通自摸结构） |
| 二连杠 | 4 倍 | 同一行牌回合连续完成 2 杠，用第 2 次补牌自摸 |
| 三连杠 | 8 倍 | 连续 3 杠 |
| 四连杠 | 16 倍 | 连续 4 杠 |

- **表里没有的档**：补牌爆头自摸时按 `HJ-K-GANGBAO` 或 `HJ-K-PIAOGANG` 查档。补牌未胡并打出财神后，旧杠记录只可用于 `HJ-K-GANGPIAO`。
- **多档同时**：每一杠补牌后直接进入下一杠才算「连续」。与本次胡牌不相连的更早的杠不计入。
