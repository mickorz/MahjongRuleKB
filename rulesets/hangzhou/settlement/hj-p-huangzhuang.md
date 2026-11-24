---
id: HJ-P-HUANGZHUANG
origin: base
type: settlement
name: 黄庄与累计分
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [HJ-T-ROUND, HJ-C-ROUND-COUNT]
sources:
  - source: sources/hangzhou/hangzhou-core-flow.md
    section: "2.3.3"
---

# 黄庄与累计分

- **入账时点**：黄庄确认后 / 每小局结算后。
- **分配顺序**：本局净得分先确定，再加到累计分上。
- **一笔怎么分**：
  - 黄庄时四名玩家本局得分均为 0。
  - 胡牌时赢家加实际收到的合计，赔付者扣各自实际支付额。
  - 累计积分 = 上一小局累计 + 本局净得分。
- **余额用尽**：无封顶，累计分可为负，无下限。
- **展示用哪一份数**：小结算显示每人本局净得分（黄庄四行均金色「0」）；头像下方显示累计分。积分按绝对值判断位数：五位以内直接显示完整整数，达到六位换算成「万」保留 3 位小数（如 −100000 显示「−10.000万」）。
- **例子**：
  - 黄庄：四家本局均 0，累计分不变。
  - 庄家自摸平胡：庄家 +24，累计分从 0 变 24；闲家各 −8。
