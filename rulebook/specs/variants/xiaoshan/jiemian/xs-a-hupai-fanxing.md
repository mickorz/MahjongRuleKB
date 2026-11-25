---
id: XS-A-HUPAI-FANXING
origin: variant
type: animation
name: 胡牌番型字
change_type: modified
base_rule_ref: HJ-A-HUPAI-ZIXIAO
compares_to: [HJ-A-HUPAI-ZIXIAO]
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [XS-K-DIEJIA-MINGCHENG, XS-A-JUMO-PIAOFEN]
sources:
  - source: sources/xiaoshan/xiaoshan-rules.md
    section: "A-HU"
---

# 胡牌番型字

- **挂**：`XS-K-DIEJIA-MINGCHENG`
- **差异**：修改
- **杭麻**：显示最终那一档番型名
- **起播**：胡牌成立后。各端亮出四家手牌，桌面中央显示「对局结束」。
- **位置**：番型字效在胡牌者方位。「点炮」在放铳者方位。小结算文字另见 `XS-V-XIAO-JIESUAN`。
- **画面**：
  - 有独立番型时只显示优先级选出的一项（天胡 / 地胡 > 正风 > 乱风 > 十风）。
  - 无独立番型且多项相乘时，只播倍数最高的一项。
  - 并列时的先后按 `XS-K-DIEJIA-MINGCHENG`：大对子、大吊车、清一色优先于同倍杠类；大吊车优先于同倍大对子；七对系列优先于同倍清一色。
  - 其余（胡牌张摆放、来源标记、颜色随番型变化）沿用 `HJ-A-HUPAI-ZIXIAO`。
- **顺序**：沿用杭麻——亮牌 + 「对局结束」→ 番型字效 → 退场后飘分。原文未单独写萧山的顺序。
- **结束**：番型字效退场。停留时长沿用杭麻。
- **播完进入**：`XS-A-JUMO-PIAOFEN` 局末飘分。
