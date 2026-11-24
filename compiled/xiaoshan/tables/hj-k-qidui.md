---
id: HJ-K-QIDUI
compiled_origin: base
type: lookup
name: 七对及豪华七对
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: []
sources:
  - source: sources/hangzhou/hangzhou-core-flow.md
    section: 2.3.4.2 第 10-13 项
---

# 七对及豪华七对

- **取档键**：七组对子中的豪华组数（每种非财神牌面有 4 张实际同牌计 1 组豪华）。
- **表**：

| 番型 | 倍数 | 成立条件 |
| --- | --- | --- |
| 七对 | 2 倍 | 没有已完成的吃、碰或任何杠牌组，14 张手牌能组成 7 组对子，且**至少有 1 张财神** |
| 豪华七对 | 4 倍 | 同上，含 1 组豪华 |
| 双豪华七对 | 8 倍 | 同上，含 2 组豪华 |
| 三豪华七对 | 16 倍 | 同上，含 3 组豪华 |

- **表里没有的档**：没有财神时按 `HJ-K-QINGQIDUI`。
- **多档同时**：财神可用于组成对子。四张白板财神不计豪华，也不能用财神补足豪华所需的四张。
