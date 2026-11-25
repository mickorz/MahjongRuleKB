---
id: XS-A-JUMO-PIAOFEN
origin: variant
type: animation
name: 局末飘分
change_type: inherited
base_rule_ref: HJ-A-JUMO-PIAOFEN
compares_to: [HJ-A-JUMO-PIAOFEN]
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [XS-F-HUPAI-GANGFEN, XS-T-JIESUAN-HUAMIAN, XS-A-GENZHUANG]
sources:
  - source: sources/xiaoshan/xiaoshan-rules.md
    section: "A-FLOAT"
---

# 局末飘分

- **挂**：`XS-F-HUPAI-GANGFEN`、`XS-T-JIESUAN-HUAMIAN`
- **差异**：沿用
- **杭麻**：局末只飘本次胡牌结算分（`HJ-A-JUMO-PIAOFEN`）
- **起播**：本局胡牌结算完成
- **位置**：牌桌座位。正负样式沿用杭麻
- **画面**：本次胡牌分。跟庄分已在 `XS-A-GENZHUANG` 局中飘过，杠分不在局末再飘
- **顺序**：跟庄飘分只在 `XS-A-GENZHUANG` 播过一次
- **结束**：沿用杭麻
- **播完进入**：`XS-V-XIAO-JIESUAN`。拖底命中时，这里仍飘分配前的胡牌分
