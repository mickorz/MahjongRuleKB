---
id: XS-T-CAP
origin: variant
type: timing
name: 结算画面顺序
change_type: added
compares_to: []
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [XS-R-CAP, XS-P-CAP]
sources:
  - source: sources/xiaoshan/xiaoshan-rules.md
    section: "T-CAP"
---

# 结算画面顺序

- **差异**：新增
- **杭麻**：无
- **起点**：本局分数已全部入账，且 `XS-R-CAP` 命中
- **步骤**：1. 胡牌局按正常胡牌分播 `XS-A-FLOAT`。2. 显示本局小结算，用拖底调整前的实际分。3. 按杭麻进入大结算，展示 `XS-P-CAP` 的实赔和最终净分
- **中断**：无。未触发拖底时不进入本条，小结算和局数按杭麻
- **结束**：本场结束，未开小局取消
