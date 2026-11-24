---
id: HJ-N-LIANXU-PIAOCAI
compiled_origin: base
type: counter
name: 连续飘财次数
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - XS-R-PIAOCAI-XIANZHI
  - HJ-K-CAIPIAO
  - HJ-K-GANGPIAO
  - HJ-K-PIAOGANG
sources:
  - source: sources/hangzhou/hangzhou-core-flow.md
    section: 2.2 名词「飘」
---

# 连续飘财次数

- **键**：玩家座位。每名玩家独立计数。
- **初值**：每小局从 0 次。
- **加一**：该玩家在自己的出牌阶段打出财神时 +1。
- **重置**：打出普通牌时清零。胡牌结算时按当前次数查番型档，结算后随小局结束清零。
- **读取**：`HJ-K-CAIPIAO`（财飘 / 双财飘 / 三财飘按 1 / 2 / 3 次定档）、`HJ-K-GANGPIAO`、`HJ-K-PIAOGANG`。打出第 4 张财神时手里已无可配对的财神，不成立以爆头为前提的财飘。
