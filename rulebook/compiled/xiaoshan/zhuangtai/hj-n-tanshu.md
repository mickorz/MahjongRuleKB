---
id: HJ-N-TANSHU
compiled_origin: base
type: counter
name: 摊数
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - HJ-R-CHENGBAO
  - HJ-R-CHI
  - HJ-C-SANTAN-CHENGBAO
sources:
  - source: rulebook/sources/hangzhou/hangzhou-core-flow.md
    section: 2.2 名词「摊」
---

# 摊数

- **键**：取牌玩家 → 供牌玩家的有向对。A 每次成功吃 B 的牌，记 A 对 B 一摊。A 对 B 与 B 对 A 互相独立。
- **初值**：每小局从 0 起。
- **加一**：吃牌裁决成立时 +1。碰、直杠、加杠、暗杠均不加。
- **重置**：下一小局全部清零。
- **读取**：`HJ-R-CHENGBAO`。庄闲之间达到 3 成立承包；闲闲之间达到 2 后不再显示【吃】入口。
