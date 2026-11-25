---
id: HJ-R-PENG-JINSHOU
compiled_origin: base
type: judgment
name: 碰禁手
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - HJ-C-CHI-PENG-JINSHOU
  - HJ-R-PENG
sources:
  - source: sources/hangzhou/hangzhou-core-flow.md
    section: 2.3.2.9
---

# 碰禁手

- **触发**：碰牌成立后。
- **条件**：`HJ-C-CHI-PENG-JINSHOU` 启用（本期启用）。
- **否则**：无禁手。
- **结果**：
  - 碰牌成立后，禁打与被碰牌同牌面的手牌。例：碰 2 筒后，手中若仍有一张 2 筒，该牌禁打。
  - 吃、碰共用出牌反馈：本家进入出牌阶段时，禁打牌原位压暗，牌面可辨认。点按或横滑经过禁打牌时，牌保持原位。禁打牌不可提起，也不能通过拖动或双击打出。
  - **解除**：本家完成合法出牌后，清除本次禁手的压暗效果。若吃或碰后在同一回合加杠或暗杠，尾墩补牌算本家的下一次摸牌，补牌完成时立即解除本次吃碰禁手。
- **验收**：
  - 手有 3 张 2 筒，碰他家的 2 筒：手里剩 1 张 2 筒禁打。
  - 碰后同回合暗杠另一组牌并补牌：禁手解除，可打出任何牌。
