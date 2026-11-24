---
id: HJ-T-XIAOJU-JIESUAN
origin: base
type: timing
name: 小局结算流程
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [HJ-P-ZIMO-RUZHANG, HJ-P-DIANPAO-RUZHANG, HJ-P-QIANGGANG-RUZHANG, HJ-P-HUANGZHUANG, HJ-R-ZIMO, HJ-R-FANGCHONG]
sources:
  - source: sources/hangzhou/hangzhou-core-flow.md
    section: 5.1 / 6.1.1
---

# 小局结算流程

- **起点**：服务端确认自摸、点炮、抢杠胡或黄庄。
- **步骤**：
  1. **胡牌场景**：停止行牌。操作按钮、胡牌预览、听牌提示、放大弃牌退场，方位盘停止倒计时。
  2. 各端亮出四家手牌，桌面中央显示橙金色「对局结束」。胡牌张单独摆在赢家手牌尾端。点炮和抢杠在放铳者方位显示「点炮」。
  3. 在胡牌者方位播放番型字效（颜色随番型变化）。
  4. 番型字效退场后，刷新头像旁累计积分，在本局得分非 0 的玩家座位内侧显示飘分。正分金黄色，负分浅蓝灰色带减号。
  5. 飘分淡出后展示小结算面板。
  6. **流局场景**：各端亮牌，显示橙色「黄庄」。跳过飘分。小结算标题蓝色「黄庄」，四家均显示金色「0」。
  7. **下一局**：非末局显示【继续游戏】，点击后本端回到准备状态，清除上一局桌面，保留累计分。四人准备后自动开始。末局显示【返回大厅】。
- **中断**：无。
- **结束**：小结算面板展示。以服务端下发的本局结算分数为准。
