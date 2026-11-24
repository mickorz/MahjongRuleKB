---
id: XS-M-PIAOCAI
origin: variant
type: record
name: 飘财限制
change_type: modified
base_rule_ref: HJ-M-PIAOCAI-JILU
compares_to: [HJ-M-PIAOCAI-JILU]
scope: four_player_friend_room
status: confirmed
release_blocker: false
depends_on: []
sources:
  - source: sources/xiaoshan/xiaoshan-rules.md
    section: "M-PIAO"
---

# 飘财限制

- **差异**：修改
- **杭麻**：写入条件是打出白板财神。其余结构相同
- **键**：发起者。每名发起者一条，作用于另外三家
- **写入**：该玩家合法打出本局实际财神
- **生效**：被限制的玩家按 `XS-R-PIAOCAI-XIANZHI` 行牌。一名发起者解除后，其他发起者的记录继续生效
- **清除**：该发起者常规摸牌，或吃、碰、杠成立并接回行牌。只清除这一名发起者对其他三家的限制
- **小局开始**：无跨局保留
