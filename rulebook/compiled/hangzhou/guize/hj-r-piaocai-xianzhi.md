---
id: HJ-R-PIAOCAI-XIANZHI
compiled_origin: base
type: judgment
name: 飘财摸打限制
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - HJ-R-CAISHEN
  - HJ-M-PIAOCAI-JILU
  - HJ-N-LIANXU-PIAOCAI
sources:
  - source: rulebook/sources/hangzhou/hangzhou-core-flow.md
    section: 2.2 名词「飘」
---

# 飘财摸打限制

- **触发**：玩家 A 在自己的出牌阶段打出一张财神（白板）。
- **条件**：打出的确实是财神牌。
- **否则**：打出普通牌，不触发限制，A 本人连续飘财次数清零。
- **结果**：
  - A 对另外三家施加摸打限制。受限制的玩家：仍可按规则胡牌、暗杠；**禁止吃、碰、直杠、加杠**；出牌时只能打出本次常规摸入的牌。若已暗杠并补牌，则只能打最新补入的牌。
  - 暗杠没用到原摸牌时，将原摸牌并回手牌排序，最新补牌占据分隔位。
  - 每名发起者的限制独立记录。玩家只要仍受至少一名其他发起者的限制，就继续摸打。例：A 发起的限制未解除时 B 又飘，A 受 B 限制，B 仍受 A 限制。
  - **解除**：行牌回到 A 时，A 常规摸牌，或通过吃、碰、杠成立取得行牌权，即解除 A 对另外三家的限制。A 随后打出普通牌，另外三家可按当时牌局条件操作。其他发起者尚未解除的限制继续生效。A 若再次打出财神，则开启新一轮限制。
  - 连续打出财神的次数按 `HJ-N-LIANXU-PIAOCAI` 累计，用于查番型档；杠飘记录按 `HJ-K-GANGPIAO` 处理。
- **验收**：
  - A 打财神，B 受限：B 可胡牌、可暗杠，不可碰、不可直杠、不可加杠、不可吃。
  - B 受限时只能打本次摸入的牌，即使原手牌有同牌面。
  - A 打财神后，B 也打财神：A 和 B 互相受限，C 和 D 同时受两人限制。
  - A 再次摸牌后打出普通牌：A 对三家的限制解除，B 的限制若仍在则继续。
