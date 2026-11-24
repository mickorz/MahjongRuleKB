---
id: XS-I-CHI
origin: variant
type: interaction
name: 吃禁手手牌
change_type: inherited
base_rule_ref: HJ-I-DISCARD
compares_to: [HJ-I-DISCARD]
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: []
sources:
  - source: sources/xiaoshan/xiaoshan-rules.md
    section: "I-CHI"
---

# 吃禁手手牌

- **挂**：`XS-R-CHI`
- **差异**：沿用
- **杭麻**：吃禁手的禁打表现和解除时点
- **触发**：`XS-R-CHI` 产生禁打牌面
- **控件**：本家禁打的手牌
- **允许**：非禁打牌按其他出牌规则
- **禁止**：禁打牌不可打出
- **同次其余操作**：原文未另定
- **反馈文案**：无。解除时点沿用杭麻
