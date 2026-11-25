---
id: XS-R-MOPAI-GANGBU
compiled_origin: variant
type: judgment
name: 摸牌与杠补
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - XS-T-ZUIHOU-LIUJU
  - XS-R-PIAOCAI-XIANZHI
sources:
  - source: rulebook/sources/xiaoshan/xiaoshan-rules.md
    section: R-WALL
base_rule_ref: HJ-R-GANG-BUPAI
change_type: modified
compares_to:
  - HJ-R-GANG-BUPAI
---

# 摸牌与杠补

- **差异**：修改
- **杭麻**：每杠余牌 −2，上张补入、下张隔离。剩 21 张禁杠。留底 20 张后流局
- **触发**：常规摸牌，或直杠、补杠、暗杠成立。
- **条件**：
  - **常规摸牌**：从牌墙头取 1 张，使用全部剩余可摸牌。余 20 张仍可摸，不预留留底。
  - **杠补**：从牌墙尾补 1 张给杠牌者，余牌 − 1。同一墩先上张、再下张，然后向内下一墩。无隔离张。
  - 开杠前同时检查余牌和该杠的合法条件（直杠 / 补杠 / 暗杠各自的条件见 `HJ-R-ZHIGANG` / `XS-R-HUPAI-02` / `HJ-R-ANGANG`）。
  - 杠牌用牌是非财神牌。七对结构下仍可合法杠，但杠成立后不再按七对结算。
  - 受飘财限制时禁止直杠和补杠，仍可暗杠（`XS-R-PIAOCAI-XIANZHI`）。
- **否则**：余 0 张不提供任何杠选项。余牌不足或手牌不满足时不生成该杠候选。
- **结果**：
  - 余 1 张时，合法杠可以补走这张。
  - 连续开杠每次补牌后重新检查余牌和杠牌条件。允许连续杠。
  - 杠后补牌可按规则胡牌；未胡时可继续杠或打出 1 张牌。
  - 流局时机见 `XS-T-ZUIHOU-LIUJU`。
- **验收**：
  - 余 1 张时开杠：可以杠并补走这 1 张，余 0。
  - 余 0 张：没有杠选项。
  - 余 25 张时开杠：余 24（只减 1，不像杭州减 2）。
