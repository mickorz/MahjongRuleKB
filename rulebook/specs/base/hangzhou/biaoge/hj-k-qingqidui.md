---
id: HJ-K-QINGQIDUI
origin: base
type: lookup
name: 清七对及豪华清七对
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [HJ-K-QIDUI]
sources:
  - source: sources/hangzhou/hangzhou-core-flow.md
    section: 2.3.4.2 第 14-17 项
---

# 清七对及豪华清七对

- **取档键**：七组对子中的豪华组数。
- **表**：

| 番型 | 倍数 | 成立条件 |
| --- | --- | --- |
| 清七对 | 4 倍 | 没有已完成的吃、碰或任何杠牌组，14 张手牌组成 7 组对子，**没有财神** |
| 豪华清七对 | 8 倍 | 同上，含 1 组豪华 |
| 双豪华清七对 | 16 倍 | 同上，含 2 组豪华 |
| 三豪华清七对 | 32 倍 | 同上，含 3 组豪华 |

- **表里没有的档**：有财神时按 `HJ-K-QIDUI`。
- **多档同时**：每种牌面有 4 张实际同牌计 1 组豪华。例：14 张均为非财神，其中两种牌面各有 4 张，按双豪华清七对 16 倍。
