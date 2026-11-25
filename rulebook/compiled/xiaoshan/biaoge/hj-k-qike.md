---
id: HJ-K-QIKE
compiled_origin: base
type: lookup
name: 七客（七对爆头）及飘财各档
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - HJ-N-LIANXU-PIAOCAI
  - HJ-K-QIDUI
  - HJ-K-BAOTOU
sources:
  - source: rulebook/sources/hangzhou/hangzhou-core-flow.md
    section: 2.3.4.2 第 35-50 项
---

# 七客及飘财各档

- **取档键**：飘财次数（行）× 七对的豪华组数（列）。
- **表**：

| 飘财次数 | 普通 | 豪华 | 双豪华 | 三豪华 |
| --- | --- | --- | --- | --- |
| 爆头（0 次飘） | 4 倍 | 8 倍 | 16 倍 | 32 倍 |
| 财飘 1 次 | 8 倍 | 16 倍 | 32 倍 | 64 倍 |
| 双财飘 2 次 | 16 倍 | 32 倍 | 64 倍 | 128 倍 |
| 三财飘 3 次 | 32 倍 | 64 倍 | 128 倍 | 256 倍 |

- **表里没有的档**：无。
- **多档同时**：
  - 没有已完成的吃、碰或任何杠牌组。摸牌前有 6 组对子 + 1 张财神，摸入任意牌与财神组成第 7 对并自摸，即七对爆头（七客）。
  - 只有 4 张实际同牌的非财神牌才能计 1 组豪华。
  - 与普通爆头重叠时按七客结算（见 `XS-K-FANXING`）。
  - 例：豪华七对 + 双财飘，取「双财飘」行「豪华」列，为 32 倍。
