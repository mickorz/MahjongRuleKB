---
id: XS-I-LOUHU-ANNIU
compiled_origin: variant
type: interaction
name: 漏胡按钮
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - XS-M-LOUHU
sources:
  - source: rulebook/sources/xiaoshan/xiaoshan-rules.md
    section: I-LOU-HU
base_rule_ref: null
change_type: added
compares_to: []
---

# 漏胡按钮

- **挂**：`XS-M-LOUHU`
- **差异**：新增
- **触发**：同牌面漏胡记录挡住本次点炮胡
- **控件**：本端【胡】【过】
- **允许**：无这次吃胡
- **禁止**：不显示这次吃胡对应的【胡】【过】
- **同次其余操作**：其他合法操作照常显示
- **反馈文案**：「当前未过手，无法吃胡」。原文未写停留时间
