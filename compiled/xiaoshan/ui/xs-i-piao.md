---
id: XS-I-PIAO
compiled_origin: variant
type: interaction
name: 受限时能打哪张
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on:
  - XS-R-PIAO
  - XS-V-PIAO
sources:
  - source: sources/xiaoshan/xiaoshan-rules.md
    section: I-PIAO
base_rule_ref: null
change_type: added
compares_to: []
---

# 受限时能打哪张

- **挂**：`XS-R-PIAO`、`XS-V-PIAO`
- **差异**：新增
- **触发**：受限玩家要出牌
- **控件**：手牌
- **允许**：只有当前可打的那一张可提起、可打出。未开杠时是本次常规摸入的牌。开杠补牌后仍受限时，改为最新补入的牌
- **禁止**：其余手牌不可提起、不可打出。原手牌中的同牌面也不可打出
- **同次其余操作**：补杠、暗杠、自摸仍按 `XS-R-PIAO` 判断，不因压暗消失
- **反馈文案**：无
