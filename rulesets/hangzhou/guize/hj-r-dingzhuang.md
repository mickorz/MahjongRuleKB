---
id: HJ-R-DINGZHUANG
origin: base
type: judgment
name: 定庄
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [HJ-N-ZHUANGJIA-LAOSHU]
sources:
  - source: sources/hangzhou/hangzhou-core-flow.md
    section: "2.3.2.3"
---

# 定庄

- **触发**：每场首小局开始，庄家尚未确定。
- **条件**：四名参战玩家已在局内。
- **否则**：不进入开局掷骰。
- **结果**：
  - 首局从四名参战玩家中随机确定庄家。掷骰开始前已确定庄家及其牢数。
  - 同一场内从第二个小局起，按 `HJ-R-LUNZHUANG` 确定庄家。
  - 本期采用笃三老庄，首庄牢数为 3，倍率 8。
- **验收**：
  - 首局开局前庄家已确定，掷骰只是展示。
  - 第 2 局起不再随机，按轮庄规则。
