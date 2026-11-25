---
id: HJ-T-XINGPAI
compiled_origin: base
type: timing
name: 行牌回合
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - HJ-R-QIPAI-YOUXIANJI
  - HJ-R-CHI
  - HJ-R-PENG
  - HJ-R-GANG-BUPAI
  - HJ-R-ZIMO
  - HJ-R-FANGCHONG
  - HJ-R-PIAOCAI-XIANZHI
sources:
  - source: rulebook/sources/hangzhou/hangzhou-core-flow.md
    section: 4.5 / 4.6
---

# 行牌回合

- **起点**：上一张弃牌完成响应裁决且对局可继续摸牌；或吃、碰、杠成立后操作者接手行牌。
- **步骤**：
  1. 常规摸牌。按行牌顺序轮到的玩家从牌墙头部取 1 张，放入右侧分隔位。刷新各视角牌墙与余牌数。
  2. 判定本人操作：自摸、暗杠、加杠、出牌。有【自摸】或新摸牌能组成杠时须先点【过】才能出牌。
  3. 出牌。双击或滑动。出牌后理牌，分隔位牌并回主体。
  4. 弃牌响应。有资格的玩家收到按钮，按 `HJ-R-QIPAI-YOUXIANJI` 裁决。无人响应则下家摸牌；有人吃碰杠则操作者接手行牌。
- **中断**：
  - 杠成立后补牌，补牌后重新判定操作。
  - 飘财限制期间只能打摸入的那张（`HJ-R-PIAOCAI-XIANZHI`）。
  - 胡牌成立进入结算。
- **结束**：余牌按 `HJ-T-LIUJU-SHIJI` 触发流局，或胡牌成立。

**摸牌与弃牌响应的顺序**：若无玩家可响应上一张弃牌，下一家可在该弃牌飞向牌河时开始展示新摸牌。若有玩家可响应，先裁决。只有裁决结果要求常规摸牌时才取牌。
