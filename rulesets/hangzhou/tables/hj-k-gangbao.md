---
id: HJ-K-GANGBAO
origin: base
type: lookup
name: 杠爆
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [HJ-K-BAOTOU, HJ-K-GANGKAI]
sources:
  - source: sources/hangzhou/hangzhou-core-flow.md
    section: 2.3.4.2 第 18-21 项 / 2.3.1.4
---

# 杠爆

- **取档键**：此前连续完成的杠数。
- **表**：

| 番型 | 倍数 | 成立条件 |
| --- | --- | --- |
| 杠爆 | 4 倍 | 1 杠。最后一杠成立后、补牌前已有 4 组完整面子 + 1 张财神，用这次补牌完成爆头自摸 |
| 二连杠爆 | 8 倍 | 连续 2 杠后同上 |
| 三连杠爆 | 16 倍 | 连续 3 杠后同上。小结算显示「杠爆（三连杠）」 |
| 四连杠爆 | 32 倍 | 连续 4 杠后同上 |

- **表里没有的档**：先飘财后杠的情况按 `HJ-K-PIAOGANG`。
- **多档同时**：手牌符合七对结构时仍可合法杠，但杠成立后不再按七对结算，因此不成立七对杠爆。
