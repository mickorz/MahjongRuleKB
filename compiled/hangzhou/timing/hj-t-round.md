---
id: HJ-T-ROUND
compiled_origin: base
type: timing
name: 一小局流程
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - HJ-R-DINGZHUANG
  - HJ-R-LUNZHUANG
  - HJ-T-DEAL
  - HJ-T-PLAY
  - HJ-T-SETTLE
  - HJ-C-ROUND-COUNT
sources:
  - source: sources/hangzhou/hangzhou-core-flow.md
    section: 4.1-5.1 / 2.3.2.1
---

# 一小局流程

- **起点**：本小局开始。首局由房主在四人准备后点【开始游戏】；后续小局四人准备后自动开始。
- **步骤**：
  1. 首局播放「对局开始」动画（仅首局，约 865 毫秒）。后续小局直接进入掷骰。
  2. 定庄（`HJ-R-DINGZHUANG` / `HJ-R-LUNZHUANG`）。掷骰前已确定庄家和牢数。
  3. 掷骰展示。骰盘左侧显示白板财神指示牌，庄家头像旁显示庄标「庄×3」。
  4. 发牌（`HJ-T-DEAL`）。136 → 余 83。
  5. 行牌（`HJ-T-PLAY`）。庄家用起手 14 张直接进入首轮行牌，不额外摸牌。
  6. 胡牌或流局（`HJ-T-WALL`）。
  7. 结算（`HJ-T-SETTLE`）。每小局只结算一次。流局也计 1 局。
  8. 小结算。未满 8 局显示【继续游戏】，第 8 局显示【返回大厅】。
- **中断**：菜单退出解散房间。先确认解散时进行中的小局结束，不计分不计局；先确认胡牌时照常计分计局。
- **结束**：满 8 局后本场结束。或任一玩家解散房间。
