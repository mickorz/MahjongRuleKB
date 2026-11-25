---
id: XS-I-LOUPENG-ANNIU
origin: variant
type: interaction
name: 漏碰按钮
change_type: added
compares_to: []
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: [XS-M-LOUPENG]
sources:
  - source: rulebook/sources/xiaoshan/xiaoshan-rules.md
    section: "I-LOU-PENG"
---

# 漏碰按钮

- **挂**：`XS-M-LOUPENG`
- **差异**：新增
- **触发**：这张弃牌本来满足碰的其他条件，但被同牌面的漏碰记录挡住
- **控件**：本端【碰】【过】
- **允许**：无这次碰
- **禁止**：不显示这次碰对应的【碰】【过】
- **同次其余操作**：其他合法操作及其【过】照常显示
- **反馈文案**：Toast「当前未过手，无法碰牌」。原文未写停留时间
