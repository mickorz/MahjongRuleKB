---
id: HJ-I-CHUPAI
origin: base
type: interaction
name: 出牌交互
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [HJ-R-CHI-JINSHOU, HJ-R-PENG-JINSHOU, HJ-R-PIAOCAI-XIANZHI, HJ-R-ZIMO, HJ-R-GANG-BUPAI]
sources:
  - source: rulebook/sources/hangzhou/hangzhou-core-flow.md
    section: 4.5
---

# 出牌交互

- **触发**：轮到本家且目标牌可打。
- **控件**：手牌。
- **允许**：
  - 双击出牌（默认）：第一次点击提起，第二次点击同一张提交。
  - 滑动出牌（默认开）：按住拖动，高于提牌高度线显示半透明虚影，松手提交。
  - 提牌时显示听牌标签（若有）。
- **禁止**：
  - 禁打牌（吃碰禁手）原位压暗，不可提起，双击和滑动均不能打出。
  - 受飘财限制时只能打出本次刚摸到的那张，原有手牌压暗。
  - 【自摸】待处理或新摸牌能组成杠且未点【过】时，双击或滑动被拦截。
  - 等待他家响应裁决、正在选择杠牌组合、杠后尚未补牌、小局已结束时不可提交。
- **同次其余操作**：有【自摸】【过】或【杠】【过】时须先点【过】才能出牌。
- **反馈文案**：被拦截时仅本端显示「点"过"才能出牌」。白字单行，半透明深色横条，方位盘附近横向居中。连续触发时已有提示上移一行，各条分别计时淡出。

**出牌后**：弃牌飞向本家牌河下一空位。分隔位牌若未打出则按牌序并回主体。出牌放大（仅出牌者以外可见）：出牌者方位牌河中段显示同牌面放大牌，带浅绿色描边。
