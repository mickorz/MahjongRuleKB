---
id: HJ-A-JUMO-PIAOFEN
origin: base
type: animation
name: 局末飘分
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [HJ-A-HUPAI-ZIXIAO, HJ-P-ZIMO-RUZHANG, HJ-P-DIANPAO-RUZHANG, HJ-P-QIANGGANG-RUZHANG, HJ-P-CHENGBAO-RUZHANG]
sources:
  - source: sources/hangzhou/hangzhou-core-flow.md
    section: 5.1
---

# 局末飘分

- **起播**：番型字效退场后。黄庄局跳过飘分。
- **位置**：各玩家座位内侧。
- **画面**：本次胡牌结算分。正分金黄色纯数字（如 96），负分浅蓝灰色带减号（如 −32）。只在本局得分非 0 的玩家座位显示。
- **顺序**：先刷新头像旁的累计积分，再显示飘分。飘分逐渐淡出。
- **结束**：飘分淡出后短暂保留终局牌桌。
- **播完进入**：小结算面板。胡牌局按本端本局净得分切换主题（正分和 0 分金色「恭喜获胜」，负分蓝色「遗憾失败」）。黄庄统一蓝色「黄庄」。
