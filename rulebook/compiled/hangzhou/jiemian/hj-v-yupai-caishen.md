---
id: HJ-V-YUPAI-CAISHEN
compiled_origin: base
type: static-ui
name: 余牌数与财神指示
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - HJ-C-CAISHEN
  - HJ-C-PAISHU
  - HJ-R-GANG-BUPAI
  - HJ-C-LIUJU-LIUDI-ZHANGSHU
sources:
  - source: rulebook/sources/hangzhou/hangzhou-core-flow.md
    section: 3.2.2
---

# 余牌数与财神指示

- **出现条件**：骰盘显示后。
- **位置**：余牌数在中央骰盘右侧。财神指示牌在骰盘左侧。
- **文案格式**：
  - **余牌数**：开局显示 136。首批起手牌背出现时一次更新为 83。常规摸 1 张减 1。开杠补 1 张、隔离 1 张，共减 2（如 30 → 28）。出牌、吃、碰不扣减。显示的余牌数包含尾部保留的 20 张。
  - **财神指示**：每小局掷骰动画开始时，在中央骰盘左侧显示竖向小牌，粉色牌面绘制白板边框。以最终尺寸出现。
- **不出现**：无。
- **保持到**：本小局结束。发牌、理牌、行牌期间持续显示。
