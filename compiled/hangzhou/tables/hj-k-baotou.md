---
id: HJ-K-BAOTOU
compiled_origin: base
type: lookup
name: 爆头
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - HJ-R-ZIMO
sources:
  - source: sources/hangzhou/hangzhou-core-flow.md
    section: 2.3.4.2 第 2 项
---

# 爆头

- **取档键**：摸牌前手牌结构。
- **表**：

| 番型 | 倍数 | 成立条件 |
| --- | --- | --- |
| 爆头 | 2 倍 | 摸牌前已有 4 组完整面子 + 1 张财神。下一次摸入任意一张牌，与这张财神组成对子并自摸。只能自摸 |

- **表里没有的档**：七对爆头按 `HJ-K-QIKE` 查档；补牌爆头按 `HJ-K-GANGBAO` 查档。
- **多档同时**：同一手牌同时满足普通爆头和七客时，按七客结算（见 `HJ-K-STACK`）。
