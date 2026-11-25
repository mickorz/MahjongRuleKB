---
id: XS-R-PIAOCAI-XIANZHI
origin: variant
type: judgment
name: 飘财摸打限制
change_type: modified
base_rule_ref: HJ-R-PIAOCAI-XIANZHI
compares_to: [HJ-R-PIAOCAI-XIANZHI]
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [XS-M-PIAOCAI, HJ-N-LIANXU-PIAOCAI]
sources:
  - source: rulebook/sources/xiaoshan/xiaoshan-rules.md
    section: "R-PIAO"
---

# 飘财摸打限制

- **差异**：修改
- **杭麻**：受限时禁止吃、碰、直杠、加杠，可以暗杠
- **触发**：玩家 A 在自己的出牌阶段打出一张财神（本局实际财神）。另外三家被限制。
- **条件**：被限制的玩家仍受 `XS-M-PIAOCAI` 中至少一名发起者限制，轮到本人行牌。
- **否则**：不受限制时按常规行牌。
- **结果**：
  - **受限时禁止**：吃、碰、直杠。
  - **受限时允许**：按合法条件补杠、暗杠、自摸。补杠和暗杠仍须满足余牌和杠牌条件（`XS-R-MOPAI-GANGBU`）。
  - **出牌限制**：只能打本次常规摸入的那一张实际牌。开杠并补牌后仍受限时，只能打最新补入的那一张。原摸牌未用于杠时，按手牌顺序并回主体。原手牌里即使有同牌面，也不能打出。
  - **限制记录**：每名发起者的限制独立记录（`XS-M-PIAOCAI`）。玩家只要仍受至少一名其他发起者的限制，就继续摸打。
  - **解除**：行牌回到发起者 A 时，A 常规摸牌，或通过吃、碰、杠成立取得行牌权，即解除 A 对另外三家的限制。
  - **与杭州的差异**：萧山受限时**可以补杠**（杭州禁止加杠）。
- **验收**：
  - 受限时可以补杠、暗杠，不可以直杠、碰、吃。
  - 补牌后可打的只有最新补入的那一张。
  - 原手牌里有同牌面的摸入牌，也不能打原手牌那张。
