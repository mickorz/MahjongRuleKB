---
id: XS-I-YOUCAI-QIHU
compiled_origin: variant
type: interaction
name: 有财起胡按钮
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - XS-R-HUPAI-03
sources:
  - source: rulebook/sources/xiaoshan/xiaoshan-rules.md
    section: I-HU
base_rule_ref: null
change_type: added
compares_to: []
---

# 有财起胡按钮

- **挂**：`XS-R-HUPAI-03`
- **差异**：新增
- **触发**：有财 2 番门槛拦住本次自摸或点炮
- **控件**：本端【自摸】【过】或【胡】【过】
- **允许**：无这次被拦住的胡
- **禁止**：自摸被拦时不显示本次【自摸】【过】。点炮被拦时不显示本次【胡】【过】
- **同次其余操作**：原文未写被拦时其他操作是否保留
- **反馈文案**：Toast「有财2番起胡」。原文未写停留时间
