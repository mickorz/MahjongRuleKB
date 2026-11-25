---
id: XS-R-CHI-JINSHOU
origin: variant
type: judgment
name: 吃禁手
change_type: modified
base_rule_ref: HJ-R-CHI-JINSHOU
compares_to: [HJ-R-CHI-JINSHOU]
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [XS-N-CHIPAI-CISHU, XS-I-CHI-JINSHOU]
sources:
  - source: rulebook/sources/xiaoshan/xiaoshan-rules.md
    section: "R-CHI"
---

# 吃禁手

- **差异**：修改
- **杭麻**：每次吃成立就按本次顺子禁打
- **触发**：吃牌候选生成时，以及吃牌成立并接回行牌后。
- **条件**：
  - **产生禁手的条件**：`XS-N-CHIPAI-CISHU`（对同一上家的吃牌次数）加 1 后的次数 ≥ 3。第 1、2 次吃不产生吃禁手。
  - **候选过滤**（每次吃都适用，不管次数）：吃牌候选须先模拟吃成后的禁打名单。若移除参与吃牌的两张手牌后，剩余手牌全部属于禁打牌，则过滤该吃法。若所有吃法均被过滤，不显示【吃】，本家提示「吃禁手规则生效中」。禁张不含财神。
- **否则**：第 1、2 次按其他出牌规则出牌，不产生吃禁手。
- **结果**：
  - 第 3 次及以后的吃牌成立后，按本次实际用于吃牌的两张手牌确定禁打牌面。手中同牌面全部受限。
  - **禁打牌面规则**（沿用杭麻）：
    - 两张点数差 2：禁被吃的中间张。
    - 两张点数差 1：禁能接在两端组成顺子、且点数在 1–9 的同花色牌。
  - 禁打表现和解除时点见 `XS-I-CHI-JINSHOU`。

| 次数 | 用手牌 | 吃进 | 禁打 |
| --- | --- | --- | --- |
| 1 或 2 | 任意合法吃 | — | 无吃禁手 |
| ≥ 3 | 1 条、3 条 | 2 条 | 2 条 |
| ≥ 3 | 2 条、3 条 | 4 条 | 1 条、4 条 |

- **验收**：
  - 第 1 次用 1 条、3 条吃 2 条：无禁手，2 条可打。
  - 第 3 次用 1 条、3 条吃 2 条：禁打 2 条。
  - 任何次数，手牌只剩 1 条、3 条（无财神）：该吃法被过滤，不显示【吃】。
