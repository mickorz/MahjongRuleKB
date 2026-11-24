---
id: HJ-A-WIN
origin: base
type: animation
name: 胡牌番型字效与黄庄演出
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [HJ-T-SETTLE, HJ-K-STACK, HJ-A-FLOAT]
sources:
  - source: sources/hangzhou/hangzhou-core-flow.md
    section: 4.6 自摸 / 5.1
---

# 胡牌番型字效与黄庄演出

- **起播**：服务端确认胡牌（自摸 / 点炮 / 抢杠）或黄庄。
- **位置**：桌面中央字样；番型字效在胡牌者方位；「点炮」在放铳者方位。
- **画面**：
  - 胡牌：橙金色「对局结束」。番型字效颜色随番型变化（金色「财飘」、绿色「平胡」等）。点炮和抢杠在放铳者方位显示「点炮」。胡牌张单独摆在赢家手牌尾端，带浅绿描边和来源标记（本家手掌、上家←、对家↑、下家→）。十风专属字效。
  - 黄庄：橙色「黄庄」。不播番型字效。
- **顺序**：亮出四家手牌 + 显示「对局结束」→ 在胡牌者方位播番型字效。
- **结束**：番型字效退场。
- **播完进入**：`HJ-A-FLOAT` 飘分。
