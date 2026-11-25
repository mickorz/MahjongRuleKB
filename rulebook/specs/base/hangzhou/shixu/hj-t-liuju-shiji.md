---
id: HJ-T-LIUJU-SHIJI
origin: base
type: timing
name: 流局时机
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [HJ-C-LIUJU-LIUDI-ZHANGSHU, HJ-C-GANG-ZUIDI-YUPAI, HJ-R-GANG-BUPAI]
sources:
  - source: rulebook/sources/hangzhou/hangzhou-core-flow.md
    section: 2.2 名词「流局」/ 5.1
---

# 流局时机

- **起点**：牌墙剩余可摸牌数为 21 张。
- **步骤**：
  1. 允许当前玩家再摸 1 张，使剩余可摸牌数变为 20。
  2. 先处理该次摸牌（本人自摸判定）、出牌，以及其他玩家对弃牌的响应。
  3. 若无人胡牌且响应处理结束，在下一次应摸牌时停止摸牌，判定流局（黄庄）。
- **中断**：若有人胡牌，按胡牌流程结算，不流局。
- **结束**：确认黄庄后停止行牌，流局计 1 小局。四家亮牌，桌面中央显示橙色「黄庄」，余牌数保留显示 20。

**不在剩余牌数刚变为 20 时立即结束。** 剩 21 张时禁止杠（`HJ-C-GANG-ZUIDI-YUPAI` = 22），允许最后一次常规摸牌。
