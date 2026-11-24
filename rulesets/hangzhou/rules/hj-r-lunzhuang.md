---
id: HJ-R-LUNZHUANG
origin: base
type: judgment
name: 轮庄
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [HJ-R-DINGZHUANG, HJ-N-BANK, HJ-R-DUSAN]
sources:
  - source: sources/hangzhou/hangzhou-core-flow.md
    section: "2.3.2.4"
---

# 轮庄

- **触发**：同一场内，当前小局结束且继续下一小局。
- **条件**：当前小局有人胡牌。
- **否则**：当前小局流局时，由当局庄家连庄。
- **结果**：
  - 胡牌者担任下一小局庄家。当局庄家胡牌时视为连庄。
  - 连庄后的牢数按 `HJ-N-BANK` 和 `HJ-R-DUSAN` 处理：本期固定三牢，不递增。
  - 每场首局的庄家按 `HJ-R-DINGZHUANG` 确定。
- **验收**：
  - 第 1 局闲家 B 胡牌：第 2 局 B 坐庄，三牢 8 倍。
  - 第 1 局庄家 A 胡牌：第 2 局 A 连庄，仍三牢 8 倍。
  - 第 1 局流局：第 2 局 A 连庄，三牢 8 倍。
