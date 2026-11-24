---
id: HJ-R-CHI
compiled_origin: base
type: judgment
name: 吃
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - HJ-R-PRIORITY
  - HJ-R-CHI-JINSHOU
  - HJ-R-PIAO
sources:
  - source: sources/hangzhou/hangzhou-core-flow.md
    section: 2.3.1.2
---

# 吃

- **触发**：上家刚打出 1 张牌。
- **条件**：
  - 弃牌是非财神牌。
  - 本家手中有 2 张非财神牌，与弃牌组成同花色、点数连续的顺子。1 与 9 不可首尾相连。
  - 本家未受尚未解除的飘财限制。
  - 存在多种合法组合时，选择其中 1 组。
- **否则**：不能吃。包括：弃牌是财神、用财神替代、不是上家打的、受飘财限制、吃完后无合法出牌（见 `HJ-R-CHI-JINSHOU`）。
- **结果**：
  - 吃是否执行按 `HJ-R-PRIORITY` 裁决，不能因先点击吃而越过点炮胡、碰或直杠。
  - 吃成功后，弃牌与选定的 2 张手牌组成 1 组副露放入碰杠区，不进行常规摸牌，直接进入本人出牌阶段。
  - 当前回合满足条件时即可加杠或暗杠；未选择杠时打出 1 张牌。
- **验收**：
  - 上家打 2 筒，本家有 1 筒、3 筒：可吃，组成 1-2-3 筒。
  - 上家打 2 筒，本家有 1 筒、财神：不可吃（财神不能用于吃）。
  - 下家打 2 筒，本家有 1 筒、3 筒：不可吃（只能吃上家）。
  - 上家打 1 条，本家有 2 条、3 条、也有 2 筒、3 筒：只有 2-3 条能吃，2-3 筒花色不同不成立。
