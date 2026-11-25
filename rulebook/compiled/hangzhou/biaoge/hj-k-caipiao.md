---
id: HJ-K-CAIPIAO
compiled_origin: base
type: lookup
name: 财飘 / 双财飘 / 三财飘
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - HJ-N-LIANXU-PIAOCAI
  - HJ-K-BAOTOU
sources:
  - source: rulebook/sources/hangzhou/hangzhou-core-flow.md
    section: 2.3.4.2 第 3-5 项
---

# 财飘 / 双财飘 / 三财飘

- **取档键**：本人连续打出财神的实际次数（`HJ-N-LIANXU-PIAOCAI`）。
- **表**：

| 番型 | 倍数 | 成立条件 |
| --- | --- | --- |
| 财飘 | 4 倍 | 连续打出财神 1 次后，下一次摸牌时以手中保留的 1 张财神与胡入牌组成对子并爆头自摸 |
| 双财飘 | 8 倍 | 连续打出财神 2 次后同上 |
| 三财飘 | 16 倍 | 连续打出财神 3 次后同上 |

- **表里没有的档**：打出第 4 张财神时手里已无可配对的财神，不成立以爆头为前提的财飘。杠后飘财按 `HJ-K-GANGPIAO`，先飘后杠按 `HJ-K-PIAOGANG`。
- **多档同时**：胡牌结算时再判断该档番型是否成立。例：连续两个出牌回合各打出一张财神，随后下一摸爆头自摸，按双财飘 8 倍。
